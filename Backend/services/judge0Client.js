const axios = require('axios');

// Judge0 configuration
// You can run a local instance or use a hosted one. Public instances may throttle.
// Env vars:
// - JUDGE0_BASE_URL e.g. "https://judge0-ce.p.rapidapi.com" or "https://ce.judge0.com"
// - JUDGE0_RAPIDAPI_KEY when using RapidAPI
// - JUDGE0_POLL_INTERVAL_MS optional (default 600ms)
// - JUDGE0_MAX_WAIT_MS optional (default 25000ms)

const BASE_URL = process.env.JUDGE0_BASE_URL || 'https://ce.judge0.com';
const USE_RAPID = /rapidapi/i.test(BASE_URL);

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: USE_RAPID
    ? {
        'X-RapidAPI-Host': new URL(BASE_URL).host,
        'X-RapidAPI-Key': process.env.JUDGE0_RAPIDAPI_KEY || '',
      }
    : {},
});

// Create a submission on Judge0
// payload: { source_code, language_id, stdin, expected_output?, cpu_time_limit?, memory_limit? }
async function createSubmission(payload) {
  // Judge0 expects fields in JSON; we request base64=false for readability
  const resp = await axiosClient.post('/submissions?base64_encoded=false&wait=false', payload);
  return resp.data; // contains token
}

// Poll until the submission is finished
async function waitForResult(token, opts = {}) {
  const pollInterval = Number(process.env.JUDGE0_POLL_INTERVAL_MS || 600);
  const maxWait = Number(opts.maxWaitMs || process.env.JUDGE0_MAX_WAIT_MS || 25000);
  const start = Date.now();
  while (true) {
    const resp = await axiosClient.get(`/submissions/${token}?base64_encoded=false`);
    const data = resp.data;
    const statusId = data?.status?.id;
    // 1..2: In Queue / Processing; >=3 finished
    if (statusId >= 3) return data;
    if (Date.now() - start > maxWait) {
      const err = new Error('Judge0 polling timeout');
      err.code = 'JUDGE0_TIMEOUT';
      throw err;
    }
    await new Promise(r => setTimeout(r, pollInterval));
  }
}

// Map Judge0 result to a compact structure
function toStructuredResult(result, input, expected) {
  const statusId = result?.status?.id;
  const statusDesc = result?.status?.description || '';
  let status = 'WA';
  if (statusId === 3) status = 'AC'; // Accepted
  else if (statusId === 4) status = 'WA'; // Wrong Answer
  else if (statusId === 5) status = 'TLE'; // Time Limit Exceeded
  else if (statusId === 6) status = 'RE'; // Compilation Error (CE in some variations)
  else if (statusId === 7) status = 'RE'; // Runtime Error (SIGSEGV etc.)
  else if (statusId === 8) status = 'RE'; // RE (NZEC)
  else if (statusId > 8) status = 'RE';

  const stdout = (result.stdout || '').trim();
  const stderr = (result.stderr || '').trim();
  const compileErr = (result.compile_output || '').trim();

  // Exact match on trimmed output when status is 3 (Judge0 already did compare if expected provided)
  const output = stdout;

  return {
    input,
    expected: (expected || '').trim(),
    output,
    status,
    status_text: statusDesc,
    time: result.time != null ? Number(result.time) : null, // seconds
    memory: result.memory != null ? Number(result.memory) : null, // KB
    error: compileErr || stderr || '',
  };
}

module.exports = {
  createSubmission,
  waitForResult,
  toStructuredResult,
};
