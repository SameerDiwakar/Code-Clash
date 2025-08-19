const { executeCodeWithPiston } = require('./piston');

// Execute all test cases for a problem using Piston and simple stdout comparison
async function judgeSubmissionWithPiston({ sourceCode, language, testCases }) {
  const results = [];
  let totalPassed = 0;
  let totalTime = 0;
  let peakMemory = 0;
  let compilationError = false; // Piston won't classify compilation separately for some langs, but stderr non-empty can be treated as runtime/compilation error
  let firstFailedCase = null;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const isHidden = !!testCase.isHidden;
    
    // Debug logging to see what's in the test case
    console.log(`Test case ${i + 1}:`, {
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      inputType: typeof testCase.input,
      expectedType: typeof testCase.expectedOutput
    });
    
    try {
      // Handle undefined/null values properly
      const inputStr = testCase.input === undefined || testCase.input === null ? '' : String(testCase.input);
      const expectedStr = testCase.expectedOutput === undefined || testCase.expectedOutput === null ? '' : String(testCase.expectedOutput);
      
      const exec = await executeCodeWithPiston({ language, code: sourceCode, stdin: inputStr });
      const actualOutput = (exec.stdout || '').trim();
      const stderr = exec.stderr || '';
      const time = typeof exec.time === 'number' ? exec.time : 0;
      const memory = typeof exec.memory === 'number' ? exec.memory : 0;

      const passed = stderr ? false : (actualOutput === expectedStr);
      const status = stderr ? 'Runtime Error' : (passed ? 'Accepted' : 'Wrong Answer');

      const result = {
        caseNumber: i + 1,
        isHidden,
        passed,
        status,
        stdout: actualOutput,
        stderr,
        time,
        memory,
        // Show full contents even for hidden test cases, per product requirement
        input: inputStr,
        expectedOutput: expectedStr,
        actualOutput: stderr || actualOutput
      };

      results.push(result);
      if (passed) totalPassed++;
      else if (!firstFailedCase) firstFailedCase = result;
      totalTime += (typeof time === 'number' ? time : 0);
      peakMemory = Math.max(peakMemory, (typeof memory === 'number' ? memory : 0));
    } catch (error) {
      const result = {
        caseNumber: i + 1,
        isHidden,
        passed: false,
        status: 'System Error',
        stdout: '',
        stderr: error.message || String(error),
        time: 0,
        memory: 0,
        input: isHidden ? '[Hidden]' : String(testCase.input || ''),
        expectedOutput: isHidden ? '[Hidden]' : String(testCase.expectedOutput || ''),
        actualOutput: error.message || String(error)
      };
      results.push(result);
      if (!firstFailedCase) firstFailedCase = result;
    }
  }

  let verdict = 'Accepted';
  if (totalPassed === 0) verdict = 'Wrong Answer';
  else if (totalPassed < testCases.length) verdict = 'Wrong Answer';

  return {
    verdict,
    totalCases: testCases.length,
    passed: totalPassed,
    failed: testCases.length - totalPassed,
    totalTime: Math.round(totalTime * 1000) / 1000,
    peakMemory,
    compilationError,
    firstFailedCase,
    testCaseResults: results
  };
}

module.exports = {
  judgeSubmissionWithPiston
};
