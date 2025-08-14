const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Modes: 'off' | 'warn' | 'block'
const GEMINI_VALIDATION_MODE = (process.env.GEMINI_VALIDATION_MODE || 'warn').toLowerCase();

function normalizeGeminiModel(input) {
  const raw = (input || '').trim().toLowerCase();
  const aliases = new Map([
    ['2.5', 'gemini-2.5-flash'],
    ['gemini-2.5', 'gemini-2.5-flash'],
    ['2.5-pro', 'gemini-2.5-pro'],
    ['2.5 pro', 'gemini-2.5-pro'],
    ['gemini-2.5-pro', 'gemini-2.5-pro'],
    ['2.5-flash', 'gemini-2.5-flash'],
    ['2.5 flash', 'gemini-2.5-flash'],
    ['gemini-2.5-flash', 'gemini-2.5-flash']
  ]);
  if (aliases.has(raw)) return aliases.get(raw);
  if (raw.startsWith('gemini-')) return raw;
  return 'gemini-2.5-flash';
}
const GEMINI_MODEL = normalizeGeminiModel(process.env.GEMINI_MODEL || 'gemini-2.5-flash');

async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  try {
    // eslint-disable-next-line global-require
    const nodeFetch = require('node-fetch');
    return nodeFetch;
  } catch (e) {
    throw new Error('Fetch API not available. Install node-fetch or use Node 18+.');
  }
}

async function validateSingleProblemWithGemini(problem) {
  if (!GEMINI_API_KEY || GEMINI_VALIDATION_MODE === 'off') return { skipped: true };
  const _fetch = await getFetch();
  const model = normalizeGeminiModel(GEMINI_MODEL);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const prompt = `You are a permissive validator for programming problems on a coding battle platform.
Your job is to ACCEPT any problem that is sufficiently specified for users to solve and for automatic judging to evaluate deterministically.
Only mark a problem invalid for FATAL issues that block solvability or judging:
 - No clear goal or description is incoherent/contradictory
 - No test cases at all, or test cases are unusable (missing input/expectedOutput)
 - Output cannot be deterministically evaluated from the input (e.g., inherently subjective)
Missing minor constraints (like value ranges) should NOT cause invalidation. Provide them as suggestions in flags.
If valid but improvable, set isValid=true and list suggestions inside flags.
Return ONLY strict JSON on a single line: {"isValid": boolean, "reason": string, "flags": string[]} with concise reason.

Problem:
Title: ${problem.title || ''}
Description: ${problem.description || ''}
Difficulty: ${problem.difficulty || ''}
Constraints: ${Array.isArray(problem.constraints) ? problem.constraints.join(' | ') : (problem.constraints || '')}
Examples: ${Array.isArray(problem.examples) ? problem.examples.map(e => `{in:${e.input||''}, out:${e.output||''}}`).join(' | ') : ''}
TestCases: ${Array.isArray(problem.testCases) ? problem.testCases.map(t => `{in:${t.input||''}, exp:${t.expectedOutput||''}}`).join(' | ') : ''}
`;
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  const resp = await _fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!resp.ok) return { skipped: true, error: `Gemini API error ${resp.status}` };
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  try {
    const parsed = JSON.parse(text);
    return { skipped: false, isValid: parsed.isValid !== false, reason: typeof parsed.reason === 'string' ? parsed.reason : '', flags: Array.isArray(parsed.flags) ? parsed.flags : [] };
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        return { skipped: false, isValid: !!parsed.isValid, reason: typeof parsed.reason === 'string' ? parsed.reason : '', flags: Array.isArray(parsed.flags) ? parsed.flags : [] };
      } catch {}
    }
    return { skipped: true };
  }
}

async function validateProblemsWithGemini(problems) {
  if (GEMINI_VALIDATION_MODE === 'off') {
    return { skipped: true, results: [] };
  }
  const results = [];
  for (const p of problems) {
    // eslint-disable-next-line no-await-in-loop
    results.push(await validateSingleProblemWithGemini(p));
  }
  return { skipped: !GEMINI_API_KEY, results };
}

function validateProblemsLocally(problems) {
  const issues = [];
  for (let i = 0; i < problems.length; i++) {
    const p = problems[i] || {};
    const probIssues = [];
    const titleOk = typeof p.title === 'string' && p.title.trim().length >= 5;
    // Only require a non-empty description; no hard length limit
    const descOk = typeof p.description === 'string' && p.description.trim().length > 0;
    const diffOk = ['Easy', 'Medium', 'Hard'].includes(p.difficulty);
    // Examples are optional; if present ensure inputs/outputs are non-empty
    const examples = Array.isArray(p.examples) ? p.examples : [];
    const examplesOk = examples.length === 0 || examples.every(e => (e && typeof e.input === 'string' && e.input.trim() !== '' && typeof e.output === 'string' && e.output.trim() !== ''));
    const tcs = Array.isArray(p.testCases) ? p.testCases : [];
    // Require at least 1 concrete test case
    const tcsOk = tcs.length >= 1 && tcs.every(t => (t && typeof t.input === 'string' && t.input.trim() !== '' && typeof t.expectedOutput === 'string' && t.expectedOutput.trim() !== ''));

    if (!titleOk) probIssues.push('Title too short or missing');
    if (!descOk) probIssues.push('Description is required');
    if (!diffOk) probIssues.push('Invalid difficulty');
    if (!examplesOk) probIssues.push('Examples provided must have non-empty input/output');
    if (!tcsOk) probIssues.push('At least 1 test case with non-empty input/expectedOutput required');

    if (probIssues.length) issues.push({ index: i, reason: probIssues.join('; ') });
  }
  return issues;
}

module.exports = {
  GEMINI_VALIDATION_MODE,
  normalizeGeminiModel,
  validateSingleProblemWithGemini,
  validateProblemsWithGemini,
  validateProblemsLocally
};
