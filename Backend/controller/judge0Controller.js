const axios = require('axios');
const mongoose = require('mongoose');
const TestCase = require('../models/testCase');
const Boilerplate = require('../models/boilerplate');
const { SUPPORTED_LANGUAGES } = require('../models/boilerplate');
const { createSubmission, waitForResult, toStructuredResult } = require('../services/judge0Client');

function pick(arr, fn) { return Array.isArray(arr) ? arr.filter(Boolean).map(fn) : []; }

// Merge user's function/body into stored boilerplate.
// Strategy: replace the first occurrence of a placeholder marker like
// 'Your code here' or a region comment with the user's source.
function mergeIntoBoilerplate(boilerplateCode, userSource) {
  if (!boilerplateCode || typeof boilerplateCode !== 'string') return userSource;
  const markers = [
    /\bYour code here\b[\s\S]*/,
    /\/\*\s*USER_CODE\s*\*\/[\s\S]*/,
    /#\s*USER_CODE[\s\S]*/,
  ];
  for (const m of markers) {
    if (m.test(boilerplateCode)) {
      return boilerplateCode.replace(m, userSource);
    }
  }
  // Fallback: try to inject directly after function signature lines commonly used
  const tryPoints = [
    /(class\s+Solution[\s\S]*?\{[\s\S]*?solve\([^)]*\)\s*\{)/, // C++/JS
    /(def\s+solve\([^)]*\)\s*:\s*\n)/, // Python
    /(public\s+[^\s]+\s+solve\([^)]*\)\s*\{)/, // Java
  ];
  for (const p of tryPoints) {
    const m = boilerplateCode.match(p);
    if (m) {
      const idx = m.index + m[0].length;
      return boilerplateCode.slice(0, idx) + '\n' + userSource + '\n' + boilerplateCode.slice(idx);
    }
  }
  // Last resort: return user's source as-is
  return userSource;
}

function languageIdToKey(language_id) {
  const entries = Object.entries(SUPPORTED_LANGUAGES);
  const found = entries.find(([k, v]) => Number(v) === Number(language_id));
  return found ? found[0] : null;
}

function toOverallVerdict(results) {
  // Precedence: Compilation/Runtime errors -> "Runtime Error", any TLE -> "TLE", any WA -> "Wrong Answer", else Accepted
  const hasRE = results.some(r => r.status === 'RE' || /compile/i.test(r.error || ''));
  if (hasRE) return 'Runtime Error';
  const hasTLE = results.some(r => r.status === 'TLE');
  if (hasTLE) return 'TLE';
  const hasWA = results.some(r => r.status === 'WA');
  if (hasWA) return 'Wrong Answer';
  return 'Accepted';
}

// Evaluate code against all test cases (sample + hidden) for a problem
// Body: { source_code, language_id, problem_id }
async function submit(req, res) {
  try {
    const { source_code, language_id, problem_id } = req.body || {};
    if (!source_code || !language_id || !problem_id) {
      return res.status(400).json({ error: 'source_code, language_id, and problem_id are required' });
    }

    const tests = await TestCase.find({ challengeId: problem_id }).sort({ isHidden: 1, createdAt: 1 });
    if (!tests.length) return res.status(404).json({ error: 'No test cases found for this problem' });

    // Try to fetch boilerplate for the language/problem and merge
    let mergedSource = source_code;
    try {
      const langKey = languageIdToKey(language_id);
      if (langKey) {
        const bp = await Boilerplate.findOne({ challengeId: problem_id, language: langKey });
        if (bp?.code) mergedSource = mergeIntoBoilerplate(bp.code, source_code);
      }
    } catch {}

    const results = [];
    for (const tc of tests) {
      try {
        const sub = await createSubmission({
          source_code: mergedSource,
          language_id,
          stdin: tc.input || '',
          expected_output: (tc.expectedOutput || ''),
          cpu_time_limit: Math.ceil((tc.timeLimit || 5000) / 1000),
          memory_limit: (tc.memoryLimit || 128) * 1024 // MB -> KB
        });
        const token = sub?.token;
        const out = await waitForResult(token, { maxWaitMs: 30000 });
        const structured = toStructuredResult(out, tc.input, tc.expectedOutput);
        structured.hidden = !!tc.isHidden;
        results.push(structured);
      } catch (e) {
        const message = e?.response?.data || e?.message || 'Judge0 submission failed';
        results.push({
          input: tc.input,
          expected: tc.expectedOutput,
          output: '',
          status: 'RE',
          time: null,
          memory: null,
          error: typeof message === 'string' ? message : JSON.stringify(message),
          hidden: !!tc.isHidden
        });
      }
    }

    const verdict = toOverallVerdict(results);
    return res.json({
      verdict,
      results: results.map(r => ({
        input: r.input,
        expected: r.expected,
        output: r.output,
        status: r.status, // AC/WA/TLE/RE
        time: r.time,     // seconds
        memory: r.memory, // KB
        hidden: r.hidden,
        error: r.error || ''
      }))
    });
  } catch (err) {
    const status = err?.response?.status;
    if (status === 429) {
      return res.status(503).json({ error: 'Judge0 rate limit reached. Please retry shortly.' });
    }
    console.error('Judge0 submit error:', err?.response?.data || err?.message || err);
    return res.status(500).json({ error: 'Failed to evaluate submission via Judge0' });
  }
}

// Quick run: evaluate only public/sample tests
// Body: { source_code, language_id, problem_id }
async function run(req, res) {
  try {
    const { source_code, language_id, problem_id } = req.body || {};
    if (!source_code || !language_id || !problem_id) {
      return res.status(400).json({ error: 'source_code, language_id, and problem_id are required' });
    }
    const tests = await TestCase.find({ challengeId: problem_id, isHidden: false }).sort({ createdAt: 1 });
    if (!tests.length) return res.status(404).json({ error: 'No sample test cases found for this problem' });

    // Merge user source into boilerplate if available
    let mergedSource = source_code;
    try {
      const langKey = languageIdToKey(language_id);
      if (langKey) {
        const bp = await Boilerplate.findOne({ challengeId: problem_id, language: langKey });
        if (bp?.code) mergedSource = mergeIntoBoilerplate(bp.code, source_code);
      }
    } catch {}

    const results = [];
    for (const tc of tests) {
      try {
        const sub = await createSubmission({
          source_code: mergedSource,
          language_id,
          stdin: tc.input || '',
          expected_output: (tc.expectedOutput || ''),
          cpu_time_limit: Math.ceil((tc.timeLimit || 5000) / 1000),
          memory_limit: (tc.memoryLimit || 128) * 1024
        });
        const out = await waitForResult(sub?.token, { maxWaitMs: 20000 });
        const structured = toStructuredResult(out, tc.input, tc.expectedOutput);
        structured.hidden = false;
        results.push(structured);
      } catch (e) {
        const message = e?.response?.data || e?.message || 'Judge0 submission failed';
        results.push({ input: tc.input, expected: tc.expectedOutput, output: '', status: 'RE', time: null, memory: null, error: typeof message === 'string' ? message : JSON.stringify(message), hidden: false });
      }
    }

    const verdict = toOverallVerdict(results);
    return res.json({ verdict, results });
  } catch (err) {
    const status = err?.response?.status;
    if (status === 429) return res.status(503).json({ error: 'Judge0 rate limit reached. Please retry shortly.' });
    console.error('Judge0 run error:', err?.response?.data || err?.message || err);
    return res.status(500).json({ error: 'Failed to run code via Judge0' });
  }
}

// Fetch boilerplate by problem and language
// GET /boilerplates/:problemId?language_id=71
async function getBoilerplate(req, res) {
  try {
    const { problemId } = req.params;
    const { language_id } = req.query;
    if (!problemId || !language_id) return res.status(400).json({ error: 'problemId and language_id are required' });
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ error: 'Invalid problemId. Expected a Mongo ObjectId.' });
    }

    // Map language_id -> language key used in our Boilerplate model
    const langKey = languageIdToKey(language_id);
    if (!langKey) return res.status(400).json({ error: 'Unsupported language_id' });

    // Try DB first; if found but low-quality (e.g., echo stubs), regenerate
    const bp = await Boilerplate.findOne({ challengeId: problemId, language: langKey });
    if (bp?.code && !isLowQualityBoilerplate(bp.code, langKey)) {
      return res.json({ language_id: Number(language_id), code: bp.code });
    }

    // Not found: deterministically infer signature from tests and generate boilerplate (persist it)
    const tests = await TestCase.find({ challengeId: problemId, isHidden: false }).limit(10);
    const allTests = tests.length ? tests : await TestCase.find({ challengeId: problemId }).limit(10);
    if (!allTests.length) {
      // No tests: create a safe minimal default signature and persist a language template
      const functionSignature = buildDefaultSignature(langKey);
      const created = await Boilerplate.generateBoilerplate({
        challengeId: problemId,
        language: langKey,
        problemType: 'math',
        functionSignature,
        exampleTestCases: []
      });
      return res.json({ language_id: Number(language_id), code: created.code });
    }

    const inference = inferSignatureFromTests(allTests.map(t => ({ input: (t.input||'').toString(), output: (t.expectedOutput||'').toString() })));
    const functionSignature = buildFunctionSignature(langKey, inference);
    const problemType = pickProblemType(inference);

    // Persist and return
    const created = await Boilerplate.generateBoilerplate({
      challengeId: problemId,
      language: langKey,
      problemType,
      functionSignature,
      exampleTestCases: allTests.slice(0, 3).map(t => ({ input: (t.input||'').toString(), output: (t.expectedOutput||'').toString(), explanation: '' }))
    });
    return res.json({ language_id: Number(language_id), code: created.code });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch boilerplate' });
  }
}

// --- Deterministic inference helpers ---
function safeParse(str) {
  if (typeof str !== 'string') return { ok: false, val: str };
  try {
    const v = JSON.parse(str);
    return { ok: true, val: v };
  } catch {
    return { ok: false, val: str };
  }
}

function detectType(val) {
  const t = typeof val;
  if (val === null || val === undefined) return 'any';
  if (Array.isArray(val)) {
    if (val.length && Array.isArray(val[0])) return detectType(val[0][0]) + '[][]';
    const inner = val.length ? detectType(val[0]) : 'any';
    return inner + '[]';
  }
  if (t === 'number') return Number.isInteger(val) ? 'int' : 'float';
  if (t === 'boolean') return 'bool';
  if (t === 'string') return 'string';
  if (t === 'object') return 'object';
  return 'any';
}

function parseInputShape(inputStr, expectedStr) {
  const parsed = safeParse(inputStr);
  if (parsed.ok) {
    const v = parsed.val;
    if (Array.isArray(v)) {
      // Multiple positional params
      return v.map((item, idx) => ({ name: `p${idx+1}`, type: detectType(item) }));
    }
    if (typeof v === 'object' && v !== null) {
      // Named params from object keys
      return Object.keys(v).map(k => ({ name: sanitizeName(k), type: detectType(v[k]) }));
    }
    // Single param
    return [{ name: 'input', type: detectType(v) }];
  }
  // Heuristic fallbacks guided by expected output type
  const expectedType = parseReturnType(expectedStr);
  if (/^-?\d+(\.\d+)?$/.test(inputStr.trim())) return [{ name: 'input', type: inputStr.includes('.') ? 'float' : 'int' }];
  if (/^\[.*\]$/.test(inputStr.trim())) return [{ name: 'input', type: 'any[]' }];
  // If we cannot parse input, bias param type towards expected output type instead of 'string'
  if (/(int|float|bool|any\[\]|int\[\]|float\[\]|string\[\])/.test(expectedType)) {
    return [{ name: 'input', type: expectedType.endsWith('[]') ? expectedType : expectedType }];
  }
  return [{ name: 'input', type: 'int' }]; // last resort: assume numeric input, not string
}

function parseReturnType(outputStr) {
  const parsed = safeParse(outputStr);
  if (parsed.ok) return detectType(parsed.val);
  if (/^-?\d+(\.\d+)?$/.test(outputStr.trim())) return outputStr.includes('.') ? 'float' : 'int';
  if (/^\[.*\]$/.test(outputStr.trim())) return 'any[]';
  return 'string';
}

function inferSignatureFromTests(examples) {
  // Use up to 3 examples to stabilize inference
  const sample = examples.slice(0, 3);
  // Infer return type as the most specific common type across samples
  const returnTypes = sample.map(e => parseReturnType(e.output));
  const returnType = pickDominantType(returnTypes);
  // Infer params from first sample, but guided by return type if input is ambiguous
  const params = parseInputShape(sample[0].input, sample[0].output);
  return { params, returnType };
}

function pickProblemType(inf) {
  const hasArray = inf.params.some(p => /\[\]$/.test(p.type));
  if (hasArray || /\[\]$/.test(inf.returnType)) return 'array';
  if (inf.params.some(p => p.type === 'string') || inf.returnType === 'string') return 'string';
  return 'math';
}

function sanitizeName(name) {
  return String(name).replace(/[^a-zA-Z0-9_]/g, '_');
}

function mapType(langKey, t) {
  // Normalize compound
  const isArray2D = /\[\]\[\]$/.test(t);
  const isArray = /\[\]$/.test(t) && !isArray2D;
  const base = t.replace(/\[\]|\[\]\[\]/g, '');
  switch (langKey) {
    case 'python3': {
      const baseMap = { int: 'int', float: 'float', bool: 'bool', string: 'str', any: 'Any', object: 'dict' };
      if (isArray2D) return `List[List[${baseMap[base] || 'Any'}]]`;
      if (isArray) return `List[${baseMap[base] || 'Any'}]`;
      return baseMap[base] || 'Any';
    }
    case 'javascript':
      return ''; // JS untyped
    case 'java': {
      const baseMap = { int: 'int', float: 'double', bool: 'boolean', string: 'String', any: 'Object', object: 'Map<String,Object>' };
      if (isArray2D) return (base === 'string') ? 'String[][]' : 'int[][]';
      if (isArray) return (base === 'string') ? 'String[]' : 'int[]';
      return baseMap[base] || 'Object';
    }
    case 'cpp': {
      const baseMap = { int: 'int', float: 'double', bool: 'bool', string: 'string', any: 'int', object: 'int' };
      if (isArray2D) return `vector<vector<${baseMap[base] || 'int'}>>`;
      if (isArray) return `vector<${baseMap[base] || 'int'}>`;
      return baseMap[base] || 'int';
    }
    default:
      return '';
  }
}

function buildFunctionSignature(langKey, inf) {
  const name = 'solve';
  if (langKey === 'python3') {
    const args = inf.params.map(p => `${p.name}: ${mapType('python3', p.type)}`).join(', ');
    const ret = mapType('python3', inf.returnType);
    return `class Solution:\n    def ${name}(self${args ? ', ' + args : ''}) -> ${ret}:\n        pass`;
  }
  if (langKey === 'javascript') {
    const args = inf.params.map(p => p.name).join(', ');
    return `function ${name}(${args}) {\n    // TODO: implement\n}\n`;
  }
  if (langKey === 'java') {
    const args = inf.params.map(p => `${mapType('java', p.type)} ${p.name}`).join(', ');
    const ret = mapType('java', inf.returnType);
    return `public ${ret} ${name}(${args}) {\n    // TODO: implement\n}`;
  }
  if (langKey === 'cpp') {
    const args = inf.params.map(p => `${mapType('cpp', p.type)} ${p.name}`).join(', ');
    const ret = mapType('cpp', inf.returnType);
    return `${ret} ${name}(${args}) {\n    // TODO: implement\n}`;
  }
  // default JS
  const args = inf.params.map(p => p.name).join(', ');
  return `function ${name}(${args}) {\n    // TODO: implement\n}\n`;
}

// Minimal, safe fallback when no tests are available to infer from
function buildDefaultSignature(langKey) {
  if (langKey === 'python3') return 'class Solution:\n    def solve(self) -> int:\n        pass';
  if (langKey === 'javascript') return 'function solve() {\n    // TODO: implement\n}\n';
  if (langKey === 'java') return 'public int solve() {\n    // TODO: implement\n}';
  if (langKey === 'cpp') return 'int solve() {\n    // TODO: implement\n}';
  return 'function solve() {\n    // TODO: implement\n}\n';
}

function isLowQualityBoilerplate(code, langKey) {
  const trimmed = String(code || '').toLowerCase();
  // Detect simple echo implementations
  if (langKey === 'cpp' && /return\s+input\s*;/.test(trimmed)) return true;
  if (langKey === 'javascript' && /return\s+input\s*;/.test(trimmed)) return true;
  if (langKey === 'python3' && /return\s+input\b/.test(trimmed)) return true;
  if (langKey === 'java' && /return\s+input\s*;/.test(trimmed)) return true;
  // Detect signatures that force raw string input only
  if (langKey === 'cpp' && /string\s+solve\s*\(\s*(const\s+)?(std::)?string/.test(trimmed)) return true;
  return false;
}

function pickDominantType(types) {
  // Prefer arrays > numeric > string > any
  const score = (t) => (/\[\]$/.test(t) ? 4 : (t === 'int' || t === 'float' ? 3 : (t === 'string' ? 2 : 1)));
  return types.reduce((best, cur) => (score(cur) > score(best) ? cur : best), types[0] || 'int');
}

module.exports = { submit, run, getBoilerplate };
