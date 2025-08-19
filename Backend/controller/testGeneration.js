const axios = require('axios');
const TestCase = require('../models/testCase');

/**
 * Generate comprehensive hidden test cases using Gemini (or other LLM)
 *
 * POST /api/tests/generate
 * Body: {
 *   challengeId: string (required),
 *   problemStatement: string (required),
 *   inputFormat?: string,
 *   outputFormat?: string,
 *   constraints?: string,
 *   examples?: Array<{ input: string, output: string }>,
 *   language?: string, // for hints; not used for generation
 *   desiredCount?: number // default 20
 * }
 *
 * Requires: process.env.GEMINI_API_KEY
 */
const generateHiddenTests = async (req, res) => {
  try {
    const {
      challengeId,
      problemStatement,
      inputFormat = '',
      outputFormat = '',
      constraints = '',
      examples = [],
      desiredCount = 20
    } = req.body || {};

    if (!challengeId || !problemStatement) {
      return res.status(400).json({ error: 'challengeId and problemStatement are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    // Build prompt for robust, adversarial, and edge-case-heavy coverage
    const prompt = buildPrompt({ problemStatement, inputFormat, outputFormat, constraints, examples, desiredCount });

    // Call Gemini 1.5 Pro via REST to avoid ESM/SDK friction
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [ { text: prompt } ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 4096
      }
    };

    const { data } = await axios.post(url, payload, { timeout: 30000 });

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      return res.status(502).json({ error: 'No content returned from model' });
    }

    // Extract JSON block; model is instructed to return pure JSON
    let parsed;
    try {
      parsed = JSON.parse(stripCodeFences(text));
    } catch (e) {
      return res.status(502).json({ error: 'Failed to parse model JSON', raw: text });
    }

    const items = Array.isArray(parsed?.testcases) ? parsed.testcases : Array.isArray(parsed) ? parsed : [];
    if (!items.length) {
      return res.status(502).json({ error: 'Model returned empty test set', raw: parsed });
    }

    // Normalize, dedupe, and validate
    const normalized = normalizeAndDedupe(items).slice(0, desiredCount);

    if (!normalized.length) {
      return res.status(502).json({ error: 'No valid testcases after normalization/deduplication' });
    }

    // Persist as hidden test cases for this challenge
    const docs = await TestCase.insertMany(
      normalized.map(tc => ({
        challengeId,
        input: tc.input,
        expectedOutput: tc.output,
        isHidden: true,
        timeLimit: tc.timeLimitMs ?? 5000,
        memoryLimit: tc.memoryLimitMB ?? 128
      })),
      { ordered: false }
    );

    return res.json({
      success: true,
      created: docs.length,
      testcases: docs.map(d => ({ id: d._id, inputPreview: preview(d.input), outputPreview: preview(d.expectedOutput) }))
    });
  } catch (err) {
    console.error('generateHiddenTests error:', err?.response?.data || err);
    // Handle duplicate key or validation errors gracefully
    return res.status(500).json({ error: 'Failed to generate/store test cases' });
  }
};

function buildPrompt({ problemStatement, inputFormat, outputFormat, constraints, examples, desiredCount }) {
  const exampleText = (examples || [])
    .map((e, i) => `Example ${i + 1}\nInput:\n${e.input}\nOutput:\n${e.output}`)
    .join('\n\n');

  return [
    'You are a strict coding judge. Generate comprehensive HIDDEN test cases for the following programming problem.',
    '',
    'Problem statement:',
    problemStatement,
    '',
    inputFormat ? `Input format:\n${inputFormat}` : '',
    outputFormat ? `Output format:\n${outputFormat}` : '',
    constraints ? `Constraints:\n${constraints}` : '',
    exampleText ? `Provided examples (do NOT duplicate, generate harder cases):\n${exampleText}` : '',
    '',
    'Requirements:',
    '- Produce diverse coverage: base, edge, boundary, large inputs, random, adversarial, tricky corner cases.',
    '- Respect input/output format exactly. Outputs must be deterministic and correct.',
    '- Include cases stressing time and memory within reasonable limits.',
    '- Avoid trivial duplicates and avoid repeating provided examples.',
    '',
    'Return ONLY valid JSON, no prose, in the schema:',
    '{"testcases": [ { "input": string, "output": string, "timeLimitMs": number (optional), "memoryLimitMB": number (optional) } ] }',
    '',
    `Aim for ${desiredCount} high-quality cases.`
  ].filter(Boolean).join('\n');
}

function stripCodeFences(s) {
  return String(s).replace(/^```(json)?\n|\n```$/g, '');
}

function normalizeAndDedupe(items) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const input = (it.input ?? '').toString();
    const output = (it.output ?? '').toString();
    if (!input.length || !output.length) continue;
    const key = input.trim() + '\u241E' + output.trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      input: input.endsWith('\n') ? input : input + '\n',
      output: output.endsWith('\n') ? output : output + '\n',
      timeLimitMs: Number.isFinite(it.timeLimitMs) ? Math.max(1000, Math.min(15000, Math.floor(it.timeLimitMs))) : undefined,
      memoryLimitMB: Number.isFinite(it.memoryLimitMB) ? Math.max(64, Math.min(512, Math.floor(it.memoryLimitMB))) : undefined,
    });
  }
  return out;
}

function preview(s, n = 60) {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 3) + '...' : t;
}

module.exports = { generateHiddenTests };
