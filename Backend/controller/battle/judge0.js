// Judge0 API integration for LeetCode-style judging
// Docs: https://ce.judge0.com/
// Default to public CE instance (no API key required). Support RapidAPI if configured.
const JUDGE0_BASE_URL = process.env.JUDGE0_BASE_URL || 'https://ce.judge0.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || '';

// Language ID mapping for Judge0
const LANGUAGE_MAP = {
  'python': 71,      // Python 3.8.1
  'python3': 71,
  'javascript': 63,  // JavaScript (Node.js 12.14.0)
  'nodejs': 63,
  'js': 63,
  'typescript': 74,  // TypeScript 3.7.4
  'ts': 74,
  'cpp': 54,         // C++ (GCC 9.2.0)
  'c++': 54,
  'c': 50,           // C (GCC 9.2.0)
  'java': 62,        // Java (OpenJDK 13.0.1)
  'go': 60,          // Go (1.13.5)
  'golang': 60,
  'rust': 73,        // Rust (1.40.0)
  'php': 68,         // PHP (7.4.1)
  'ruby': 72,        // Ruby (2.7.0)
  'csharp': 51,      // C# (Mono 6.6.0.161)
  'c#': 51
};

// Get fetch helper
async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch;
  try {
    const nodeFetch = require('node-fetch');
    return nodeFetch;
  } catch (e) {
    throw new Error('Fetch API not available. Install node-fetch or use Node 18+.');
  }
}

// Map language string to Judge0 language ID
function getLanguageId(language) {
  const lang = String(language).toLowerCase();
  return LANGUAGE_MAP[lang] || LANGUAGE_MAP['python']; // Default to Python
}

// Submit code to Judge0 and get submission token
async function submitToJudge0({ sourceCode, languageId, stdin, expectedOutput, cpuTimeLimit = 2, memoryLimit = 128000 }) {
  const _fetch = await getFetch();
  
  const payload = {
    source_code: sourceCode,
    language_id: languageId,
    stdin: stdin || '',
    expected_output: expectedOutput || '',
    cpu_time_limit: cpuTimeLimit,
    memory_limit: memoryLimit
  };

  // Build headers conditionally for RapidAPI
  const isRapid = JUDGE0_BASE_URL.includes('rapidapi');
  const submitHeaders = isRapid
    ? {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    : { 'Content-Type': 'application/json' };

  const response = await _fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=false`, {
    method: 'POST',
    headers: submitHeaders,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge0 submission failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.token;
}

// Poll Judge0 for submission result
async function getSubmissionResult(token, maxAttempts = 20, delayMs = 1000) {
  const _fetch = await getFetch();
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const isRapid = JUDGE0_BASE_URL.includes('rapidapi');
    const getHeaders = isRapid
      ? {
          'X-RapidAPI-Key': JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      : undefined;

    const response = await _fetch(`${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=false`, {
      method: 'GET',
      headers: getHeaders
    });

    if (!response.ok) {
      throw new Error(`Failed to get submission result: ${response.status}`);
    }

    const result = await response.json();
    
    // Status IDs (common):
    // 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, 5=Time Limit Exceeded,
    // 6=Compilation Error, 7..12=Runtime Error variants, 13=Internal Error, 14=Exec Format Error
    if (result.status && result.status.id > 2) {
      return result;
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error('Submission timed out - Judge0 took too long to process');
}

// Execute single test case with Judge0
async function executeTestCase({ sourceCode, language, testCase, isHidden = false }) {
  try {
    const languageId = getLanguageId(language);
    const stdin = String(testCase.input || '');
    const expectedOutput = String(testCase.expectedOutput || '').trim();

    // Submit to Judge0
    const token = await submitToJudge0({
      sourceCode,
      languageId,
      stdin,
      expectedOutput,
      cpuTimeLimit: 2,
      memoryLimit: 128000
    });

    // Poll for result
    const result = await getSubmissionResult(token);

    const actualOutput = (result.stdout || '').trim();
    const stderr = result.stderr || '';
    const statusDescription = result.status?.description || 'Unknown';
    const time = parseFloat(result.time) || 0;
    const memory = parseInt(result.memory) || 0;

    // Check if compilation error
    if (result.status?.id === 6) { // Compilation Error
      return {
        passed: false,
        status: 'Compilation Error',
        stdout: actualOutput,
        stderr: stderr,
        time: time,
        memory: memory,
        compilationError: true,
        input: isHidden ? '[Hidden]' : stdin,
        expectedOutput: isHidden ? '[Hidden]' : expectedOutput,
        actualOutput: stderr || actualOutput
      };
    }

    // Check if time limit exceeded
    if (result.status?.id === 5) { // Time Limit Exceeded
      return {
        passed: false,
        status: 'Time Limit Exceeded',
        stdout: actualOutput,
        stderr: stderr,
        time: time,
        memory: memory,
        input: isHidden ? '[Hidden]' : stdin,
        expectedOutput: isHidden ? '[Hidden]' : expectedOutput,
        actualOutput: actualOutput
      };
    }

    // Check if runtime error (various IDs 7..12)
    if (result.status && result.status.id >= 7 && result.status.id <= 12) {
      return {
        passed: false,
        status: 'Runtime Error',
        stdout: actualOutput,
        stderr: stderr,
        time: time,
        memory: memory,
        input: isHidden ? '[Hidden]' : stdin,
        expectedOutput: isHidden ? '[Hidden]' : expectedOutput,
        actualOutput: stderr || actualOutput
      };
    }

    // Check correctness
    const passed = actualOutput === expectedOutput;
    const status = passed ? 'Accepted' : 'Wrong Answer';

    return {
      passed,
      status,
      stdout: actualOutput,
      stderr: stderr,
      time: time,
      memory: memory,
      input: isHidden ? '[Hidden]' : stdin,
      expectedOutput: isHidden ? '[Hidden]' : expectedOutput,
      actualOutput: isHidden && !passed ? '[Hidden]' : actualOutput
    };

  } catch (error) {
    return {
      passed: false,
      status: 'System Error',
      stdout: '',
      stderr: error.message,
      time: 0,
      memory: 0,
      input: isHidden ? '[Hidden]' : String(testCase.input || ''),
      expectedOutput: isHidden ? '[Hidden]' : String(testCase.expectedOutput || ''),
      actualOutput: error.message
    };
  }
}

// Execute all test cases for a problem with LeetCode-style judging
async function judgeSubmission({ sourceCode, language, testCases }) {
  const results = [];
  let totalPassed = 0;
  let totalTime = 0;
  let peakMemory = 0;
  let compilationError = false;
  let firstFailedCase = null;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const isHidden = testCase.isHidden || false;
    
    console.log(`Executing test case ${i + 1}/${testCases.length}...`);
    
    const result = await executeTestCase({
      sourceCode,
      language,
      testCase,
      isHidden
    });

    // Add case number
    result.caseNumber = i + 1;
    result.isHidden = isHidden;
    
    results.push(result);

    // Track statistics
    if (result.passed) {
      totalPassed++;
    } else if (!firstFailedCase) {
      firstFailedCase = result;
    }

    totalTime += result.time;
    peakMemory = Math.max(peakMemory, result.memory);

    // Stop on compilation error
    if (result.compilationError) {
      compilationError = true;
      break;
    }
  }

  // Determine overall verdict
  let verdict = 'Accepted';
  if (compilationError) {
    verdict = 'Compilation Error';
  } else if (totalPassed === 0) {
    verdict = 'Wrong Answer';
  } else if (totalPassed < testCases.length) {
    verdict = 'Wrong Answer';
  }

  return {
    verdict,
    totalCases: testCases.length,
    passed: totalPassed,
    failed: testCases.length - totalPassed,
    totalTime: Math.round(totalTime * 1000) / 1000, // Round to 3 decimal places
    peakMemory,
    compilationError,
    firstFailedCase,
    testCaseResults: results
  };
}

module.exports = {
  getLanguageId,
  executeTestCase,
  judgeSubmission
};
