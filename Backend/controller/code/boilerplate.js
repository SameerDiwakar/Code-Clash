const axios = require('axios');
const mongoose = require('mongoose');
const TestCase = require('../../models/testCase');

// Keep language versions aligned with main controller
const LANGUAGE_VERSIONS = {
  python3: '3.10.0',
  javascript: '18.15.0',
  cpp: '10.2.0',
  java: '15.0.2'
};

/**
 * Generate AI-based problem boilerplate tailored to the challenge
 * POST /api/boilerplate
 * Body: { language, challengeId, problemDescription? }
 */
// Lightweight heuristics to hint input/output shapes from sample tests
function detectIOHints(samples) {
  const first = samples.find(t => (t.input || '').trim().length > 0);
  const firstOut = samples.find(t => (t.output || '').trim().length > 0);
  const hint = { inputHint: 'unknown', outputHint: 'unknown' };

  const looksJsonArray = (s) => /^\s*\[([\s\S]*)\]\s*$/.test(s || '');
  const looksJsonObject = (s) => /^\s*\{[\s\S]*\}\s*$/.test(s || '');
  const looksIntsSpaced = (s) => /^\s*-?\d+(\s+-?\d+)+\s*$/.test(s || '');
  const looksIntsCommaOrSpace = (s) => /^\s*-?\d+(\s*,\s*|-\s*|\s+)-?\d+(\s*,\s*|\s+|-?\d+)*\s*$/.test(s || '');
  const looksSingleInt = (s) => /^\s*-?\d+\s*$/.test(s || '');

  if (first) {
    const s = (first.input || '').trim();
    if (looksJsonArray(s)) hint.inputHint = 'array/list';
    else if (looksJsonObject(s)) hint.inputHint = 'object/json';
    else if (looksIntsSpaced(s)) hint.inputHint = 'multiple scalars (likely ints)';
    else if (looksSingleInt(s)) hint.inputHint = 'single int';
    else hint.inputHint = 'string or mixed';
  }
  if (firstOut) {
    const s = (firstOut.output || '').trim();
    if (looksJsonArray(s) || looksIntsCommaOrSpace(s)) hint.outputHint = 'array/list';
    else if (looksJsonObject(s)) hint.outputHint = 'object/json';
    else if (looksSingleInt(s)) hint.outputHint = 'single int';
    else hint.outputHint = 'string or other scalar';
  }
  return hint;
}

// Build soft signature hints from sample tests to bias the model
function buildSignatureHints(language, samples) {
  if (!samples || samples.length === 0) return '';
  const first = samples[0];
  const input = (first.input || '').trim();
  const output = (first.output || '').trim();

  const isJSON = (s) => {
    try { JSON.parse(s); return true; } catch { return false; }
  };

  const hints = [];

  if (isJSON(input)) {
    const val = JSON.parse(input);
    if (Array.isArray(val)) {
      // Single array input
      if (/^\s*\[/.test(output)) {
        hints.push('Return type should be an array/list, not string.');
      }
      if (language === 'cpp') hints.push('Suggested signature: vector<int> solve(const vector<int>& nums) or adjust element type.');
      if (language === 'javascript') hints.push('Suggested signature: solve(nums) -> number|array based on expected output.');
      if (language === 'python3') hints.push('Suggested signature: def solve(self, nums: List[int]) -> int | List[int]');
      if (language === 'java') hints.push('Suggested signature: public int[] solve(int[] nums) or appropriate type.');
    } else if (val && typeof val === 'object') {
      const keys = Object.keys(val);
      if (keys.length <= 3) {
        // Common pattern like {"nums":[...],"target":9}
        const argList = keys.map(k => k).join(', ');
        hints.push(`Inputs appear to be an object with keys: ${keys.join(', ')}. Do NOT accept a single string; accept these as separate arguments in order: ${argList}.`);
        if (language === 'cpp') hints.push('Example C++: vector<int> solve(const vector<int>& nums, int target)');
        if (language === 'javascript') hints.push('Example JS: solve(nums, target)');
        if (language === 'python3') hints.push('Example Python: def solve(self, nums: List[int], target: int) -> List[int]');
        if (language === 'java') hints.push('Example Java: public int[] solve(int[] nums, int target)');
      }
    }
  } else {
    // Non-JSON: check patterns like "1 2" or "[1,2,3] 9"
    const arrThenScalar = input.match(/^(\s*\[[\s\S]*\])\s+(-?\d+)\s*$/);
    if (arrThenScalar) {
      hints.push('Inputs look like <array> then <scalar>. Use two arguments: (nums, target).');
      if (language === 'cpp') hints.push('C++ signature hint: vector<int> solve(const vector<int>& nums, int target)');
      if (language === 'javascript') hints.push('JS signature hint: solve(nums, target)');
      if (language === 'python3') hints.push('Python signature hint: def solve(self, nums: List[int], target: int) -> List[int]');
      if (language === 'java') hints.push('Java signature hint: public int[] solve(int[] nums, int target)');
    }
    const spacedInts = input.match(/^\s*-?\d+(\s+-?\d+)+\s*$/);
    if (spacedInts) {
      hints.push('Inputs seem to be multiple integers separated by spaces. Use multiple numeric arguments, not a single string.');
    }
    if (/\bnums\b/.test(input) && /\btarget\b/.test(input)) {
      hints.push('Input string mentions keys nums and target; model them as separate arguments, not a single string.');
    }
  }

  // Output typing hint
  if (/^\s*\[/.test(output) || /^\s*-?\d+(\s*,\s*|-\s*|\s+)-?\d+/.test(output)) hints.push('The output is an array/list. Do NOT return a string; return a list/array type.');
  else if (/^-?\d+\s*$/.test(output)) hints.push('The output is an integer. Do NOT return a string; return a numeric type.');

  return hints.join('\n');
}

async function generateProblemBoilerplate(req, res) {
  try {
    const { language, challengeId, problemDescription = '', signatureHint: signatureHintFromClient = '', inputSchema = '', outputSchema = '' } = req.body || {};
    if (!language || !LANGUAGE_VERSIONS[language]) {
      return res.status(400).json({ error: `Unsupported or missing language. Supported: ${Object.keys(LANGUAGE_VERSIONS).join(', ')}` });
    }
    if (!challengeId || !mongoose.Types.ObjectId.isValid(challengeId)) {
      return res.status(400).json({ error: 'Valid challengeId is required' });
    }

    // Gather test cases for better prompting
    const tests = await TestCase.find({ challengeId }).limit(20);
    const sampleTests = tests.map(t => ({ input: (t.input || '').toString(), output: (t.expectedOutput || '').toString() }));
    const hints = detectIOHints(sampleTests);
    const signatureHintsAuto = buildSignatureHints(language, sampleTests);
    const signatureHints = [signatureHintsAuto, signatureHintFromClient].filter(Boolean).join('\n');

    // Build instructions for model per language
    const languageNotes = {
      python3: `Define class Solution with a PROBLEM-SPECIFIC signature, not generic. Infer argument list and return type from the problem and sample tests. Examples of valid signatures: def solve(self, nums: List[int]) -> int, def solve(self, s: str) -> str, def solve(self, a: int, b: int) -> int. Do NOT read from stdin inside solve; the runner prepares inputs and calls solve. Include a __main__ that iterates the provided sample tests, converts inputs to the right Python types, calls solve, and prints: Test <i>: <output>. Use only stdlib.`,
      javascript: `Define class Solution with a PROBLEM-SPECIFIC signature, not generic. Infer arguments and return shape from tests (e.g., solve(nums), solve(s), solve(a, b)). Avoid reading stdin inside solve. Provide a runner that converts string inputs to JS values (arrays, numbers, strings) as implied by tests and logs exactly: Test <i>: <output>.`,
      cpp: `Provide headers and a main function. Define class Solution with a PROBLEM-SPECIFIC signature, e.g., string solve(const string& s), int solve(const vector<int>& nums), long long solve(long long a, long long b), vector<int> solve(const vector<int>& nums). Prefer std types only; no external libs. main() must parse each provided sample input string into the appropriate C++ types, call the corresponding Solution::solve(...), and print exactly: Test <i>: <output>. For containers, print in a compact format like [1,2,3]. Do NOT read from stdin inside solve; only in main.`,
      java: `Provide class Solution with a PROBLEM-SPECIFIC method signature (e.g., public int solve(int[] nums), public String solve(String s), public long solve(long a,long b)). Also include a Main class with main() that parses sample inputs into Java types, calls solve, and prints: Test <i>: <output>. Avoid third-party libraries.`,
      default: `Define a problem-specific function signature inferred from tests and include a runner that parses inputs, calls the function, and prints: Test <i>: <output>.`
    };

    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GOOGLE_API_KEY in environment' });
    }

    // Few-shot exemplars to bias toward problem-specific signatures
    const exemplars = `Examples (do not copy blindly; infer from THIS problem):\n\n`
      + `Two Sum (JS): class Solution { solve(nums, target) { /* returns [i,j] */ } }\n`
      + `Two Sum (C++): class Solution { public: vector<int> solve(const vector<int>& nums, int target); };\n`
      + `Reverse String (Python): class Solution: def solve(self, s: str) -> str\n`
      + `Add Two Numbers (Java): class Solution { public long solve(long a, long b) }\n`;

    const prompt = `You are generating starter code (boilerplate) for an online judge.\n`
      + `Language: ${language}\n`
      + `Constraints: No external dependencies beyond standard library. Must compile/run on stock runtime.\n`
      + `Style: Include a user-editable Solution class/function where the user only writes problem logic. Also include a runner that iterates provided test inputs and prints exactly: Test <index>: <output> per test.\n`
      + `Critical Requirement: The function signature (name: solve) MUST be problem-specific. Infer the number/types of arguments and the return type from the problem statement and the sample tests. Do NOT default to (input: string) or similar generic signatures.\n`
      + `Signature Inference Rules: If tests show arrays (e.g., "[1,2,3]"), parse to arrays/vectors; if multiple scalars (e.g., "3 4"), use multiple numeric args; if a single line of text, use a string arg; if output is a list, return a list. Prefer int/long over floating unless decimals appear. Only return string when the output is textual, not for numeric or list outputs.\n`
      + `Detected input hint: ${hints.inputHint}; detected output hint: ${hints.outputHint}.\n`
      + (inputSchema ? `Input schema (client-provided): ${inputSchema}\n` : '')
      + (outputSchema ? `Output schema (client-provided): ${outputSchema}\n` : '')
      + (signatureHints ? `Signature hints (auto/client):\n${signatureHints}\n` : '')
      + exemplars + `\n`
      + `Problem Statement (may be brief):\n${problemDescription}\n\n`
      + `Sample Tests (string inputs and expected outputs):\n${JSON.stringify(sampleTests, null, 2)}\n\n`
      + `Additional language-specific instructions:\n${languageNotes[language] || languageNotes.default}\n`
      + `Return ONLY the code block for the specified language with no extra commentary.`;

    // Call Gemini REST API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const callGemini = async (textPrompt) => {
      const payload = {
        contents: [{ role: 'user', parts: [{ text: textPrompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
      };
      const aiResp = await axios.post(url, payload, { timeout: 20000 });
      const candidates = aiResp.data?.candidates || [];
      const text = candidates[0]?.content?.parts?.[0]?.text || '';
      return text.replace(/^```[a-zA-Z]*\n?|```$/g, '');
    };

    let code = await callGemini(prompt);
    if (!code) return res.status(502).json({ error: 'Boilerplate generation failed: empty response' });

    // Basic validation and one retry with stricter constraints
    const wantsArrayOut = /array\/list/.test(hints.outputHint);
    const wantsIntOut = /single int/.test(hints.outputHint);
    const smellsStringy = /std::string\s+solve\(|String\s+solve\(|def\s+solve\([^)]*\)\s*->\s*str|solve\([^)]*\)\s*{\s*return\s+"|console\.log\("/.test(code);
    const missingClass = language === 'cpp' && !code.includes('class Solution');
    const missingMain = language === 'cpp' && !code.includes('int main(');

    const arrayOutSatisfied = (
      (language === 'cpp' && (/vector<\s*int|vector<\s*long|vector<\s*string/.test(code))) ||
      (language === 'javascript' && /return\s*\[|Array\./.test(code)) ||
      (language === 'python3' && /->\s*List\[|return\s*\[/.test(code)) ||
      (language === 'java' && /(int\[\]|long\[\]|List<)/.test(code))
    );
    const intOutSatisfied = (
      (language === 'cpp' && /\bint\s+solve\(|\blong long\s+solve\(/.test(code)) ||
      (language === 'javascript' && /return\s+\d+|Number\(/.test(code)) ||
      (language === 'python3' && /->\s*int/.test(code)) ||
      (language === 'java' && /public\s+(int|long)\s+solve\(/.test(code))
    );

    let needsRetry = false;
    if (language === 'cpp' && (missingClass || missingMain)) needsRetry = true;
    if (wantsArrayOut && !arrayOutSatisfied) needsRetry = true;
    if (wantsIntOut && !intOutSatisfied) needsRetry = true;
    if ((wantsArrayOut || wantsIntOut) && smellsStringy) needsRetry = true;

    if (needsRetry) {
      const stricter = prompt + `\nHARD CONSTRAINTS:\n- Do NOT return string when output hint is ${hints.outputHint}.\n- Use problem-specific arguments (e.g., nums, target) instead of a single string.\n- Ensure class Solution and main/runner exist per language rules.\n` + (signatureHints ? `- Adopt a signature consistent with: \n${signatureHints}\n` : '') + (inputSchema ? `- Conform to input schema: ${inputSchema}\n` : '') + (outputSchema ? `- Conform to output schema: ${outputSchema}\n` : '');
      code = await callGemini(stricter);
      if (!code) return res.status(502).json({ error: 'Boilerplate generation retry failed: empty response' });
    }

    // Final structure validation for C++
    if (language === 'cpp' && (!code.includes('int main(') || !code.includes('class Solution'))) {
      return res.status(502).json({ error: 'Generated code missing required structure for C++' });
    }

    return res.json({ success: true, language, boilerplate: code });
  } catch (err) {
    console.error('generateProblemBoilerplate error:', err?.response?.data || err?.message || err);
    return res.status(500).json({ error: 'Failed to generate boilerplate' });
  }
}

module.exports = { generateProblemBoilerplate };
