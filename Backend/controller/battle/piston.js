// Lightweight code execution via Piston (free public API)
// Docs: https://github.com/engineer-man/piston
const PISTON_BASE_URL = process.env.PISTON_BASE_URL || 'https://emkc.org/api/v2/piston';
let cachedRuntimes = null;

// Local fetch helper used by Piston runtime calls
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

async function loadPistonRuntimes() {
  if (cachedRuntimes) return cachedRuntimes;
  const _fetch = await getFetch();
  const resp = await _fetch(`${PISTON_BASE_URL}/runtimes`);
  if (!resp.ok) throw new Error('Failed to load Piston runtimes');
  cachedRuntimes = await resp.json();
  return cachedRuntimes;
}

function mapLanguageToPiston(lang) {
  if (!lang) return 'python';
  const l = String(lang).toLowerCase();
  if (['py', 'python', 'python3'].includes(l)) return 'python';
  if (['js', 'javascript', 'node', 'nodejs'].includes(l)) return 'javascript';
  if (['ts', 'typescript'].includes(l)) return 'typescript';
  if (['cpp', 'c++'].includes(l)) return 'c++';
  if (['c'].includes(l)) return 'c';
  if (['java'].includes(l)) return 'java';
  if (['go', 'golang'].includes(l)) return 'go';
  if (['rb', 'ruby'].includes(l)) return 'ruby';
  if (['php'].includes(l)) return 'php';
  return l; // fallback
}

async function getLatestVersionFor(lang) {
  const runtimes = await loadPistonRuntimes();
  const matches = runtimes.filter(r => r.language === lang);
  if (matches.length === 0) return null;
  // Pick the highest version lexicographically (versions are strings like '3.10.0')
  matches.sort((a, b) => String(a.version).localeCompare(String(b.version)));
  return matches[matches.length - 1].version;
}

async function executeCodeWithPiston({ language, code, stdin }) {
  const _fetch = await getFetch();
  const lang = mapLanguageToPiston(language);
  const version = await getLatestVersionFor(lang);
  if (!version) {
    return { error: `Language not supported by runtime: ${language}` };
  }
  const body = {
    language: lang,
    version,
    files: [{ name: `main.${lang}`, content: code || '' }],
    stdin: stdin || ''
  };
  const resp = await _fetch(`${PISTON_BASE_URL}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const tx = await resp.text();
    return { error: `Execution failed: ${resp.status} ${tx}` };
  }
  const data = await resp.json();
  // data.run: { stdout, stderr, code, signal, output }
  return {
    stdout: data?.run?.stdout || '',
    stderr: data?.run?.stderr || '',
    code: data?.run?.code,
    time: data?.run?.time,
    memory: data?.run?.memory,
    output: data?.run?.output || (data?.run?.stdout || data?.run?.stderr || '')
  };
}

module.exports = {
  loadPistonRuntimes,
  mapLanguageToPiston,
  getLatestVersionFor,
  executeCodeWithPiston
};
