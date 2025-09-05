const Battle = require('../../models/battle');
const User = require('../../models/user');
const { executeCodeWithPiston } = require('./piston');
const { judgeSubmissionWithPiston } = require('./pistonJudge');
const { generateLeetCodeExecution } = require('../leetcodeTemplates');

// Allowed languages for battle feature
// Accept common aliases from frontend/backend and map internally via piston helper
const ALLOWED_BATTLE_LANGS = new Set([
  'python', 'python3',
  'javascript',
  'java',
  'cpp', 'c++'
]);

function isAllowedBattleLanguage(lang) {
  if (!lang) return false;
  return ALLOWED_BATTLE_LANGS.has(String(lang).toLowerCase());
}

// Submit solution for a problem
const submitSolution = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { battleId, problemId } = req.params;
    const { code, language, isLeetCodeStyle = true, functionName = 'solve' } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const battle = await Battle.findById(battleId);
    if (!battle) return res.status(404).json({ error: 'Battle not found' });

    // Check if battle is active
    const timeWindowActive = typeof battle.isActive === 'function' ? battle.isActive() : false;
    if (battle.status !== 'Active' && !timeWindowActive) {
      return res.status(400).json({ error: `Battle is not active (status=${battle.status}).` });
    }
    // Auto-correct status if time window indicates it should be active
    if (battle.status !== 'Active' && timeWindowActive) {
      battle.status = 'Active';
    }

    // Check if battle has ended
    if (new Date() > battle.endTime) {
      return res.status(400).json({ error: 'Battle has ended' });
    }

    const problem = battle.problems.id(problemId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Ensure user is a participant
    const participant = battle.participants.find(p => p.user.toString() === user._id.toString());
    if (!participant) return res.status(400).json({ error: 'You are not a participant in this battle' });

    const testCases = problem.testCases;

    // Validate test cases have proper JSON input/expectedOutput
    const invalidCases = [];
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      let inputError = null;
      let outputError = null;
      
      // Validate input
      if (typeof tc.input !== 'string' || !tc.input.trim()) {
        inputError = 'Input must be a non-empty string';
      } else {
        try {
          JSON.parse(tc.input);
        } catch (e) {
          inputError = `Invalid JSON input: ${e.message}`;
        }
      }
      
      // Validate expected output
      if (typeof tc.expectedOutput !== 'string' || !tc.expectedOutput.trim()) {
        outputError = 'Expected output must be a non-empty string';
      } else {
        try {
          JSON.parse(tc.expectedOutput);
        } catch (e) {
          outputError = `Invalid JSON in expected output: ${e.message}`;
        }
      }
      
      if (inputError || outputError) {
        invalidCases.push({
          testCase: i + 1,
          input: tc.input,
          inputError,
          expectedOutput: tc.expectedOutput,
          outputError
        });
      }
    }
    
    if (invalidCases.length > 0) {
      return res.status(400).json({
        error: 'Invalid test cases found',
        invalidCases,
        message: 'Please ensure all test cases have valid JSON input and expected output.'
      });
    }

    // Validate language for battle before execution
    if (!isAllowedBattleLanguage(language)) {
      return res.status(400).json({ error: `Unsupported language for battle: ${language}. Allowed: Python, JavaScript, Java, C++` });
    }

    let allPassed = false;
    let passed = 0;
    let totalTime = 0;
    let peakMem = 0;
    let details = [];
    let verdict = 'Accepted';
    let compilationError = false;
    let firstFailedCase = null;

    if (isLeetCodeStyle) {
      // Consolidated LeetCode-style execution
      const inputs = testCases.map(tc => tc.input || '');
      const expected = testCases.map(tc => tc.expectedOutput || '');
      const wrapped = generateLeetCodeExecution(language, code, functionName, inputs, expected);
      const exec = await executeCodeWithPiston({ language, code: wrapped, stdin: '' });
      const stdout = (exec.stdout || '').split('\n').filter(l => l.trim());
      const time = typeof exec.time === 'number' ? exec.time : 0;
      const memory = typeof exec.memory === 'number' ? exec.memory : 0;
      totalTime = time;
      peakMem = memory;

      for (let i = 0; i < testCases.length; i++) {
        const line = stdout.find(l => l.includes(`Test ${i + 1}:`)) || '';
        let actualOutput = '';
        let status = 'Wrong Answer';
        let passedCase = false;
        let stderr = '';
        if (line) {
          const m = line.match(/Test \d+: (.+)/);
          if (m) {
            const out = m[1];
            if (out.startsWith('ERROR')) {
              status = 'Runtime Error';
              stderr = out.replace('ERROR - ', '');
              if (verdict === 'Accepted') verdict = 'Runtime Error';
            } else {
              actualOutput = out;
              const expectedOut = (testCases[i].expectedOutput || '').trim();
              passedCase = actualOutput === expectedOut;
              status = passedCase ? 'Accepted' : 'Wrong Answer';
              if (!passedCase && verdict === 'Accepted') verdict = 'Wrong Answer';
            }
          }
        } else {
          status = 'Runtime Error';
          stderr = 'No output for this test case';
          if (verdict === 'Accepted') verdict = 'Runtime Error';
        }
        if (passedCase) passed++; else if (!firstFailedCase) {
          firstFailedCase = {
            caseNumber: i + 1,
            input: testCases[i].input,
            expectedOutput: testCases[i].expectedOutput,
            actualOutput: actualOutput || stderr,
            status
          };
        }
        details.push({
          testCase: i + 1,
          input: testCases[i].input,
          expectedOutput: testCases[i].expectedOutput,
          actualOutput: actualOutput || stderr,
          passed: passedCase,
          status,
          time,
          memory,
          stderr,
          isHidden: !!testCases[i].isHidden
        });
      }
      allPassed = passed === testCases.length;
    } else {
      // Legacy stdin/stdout per-case judging
      console.log(`Judging (Piston) submission for problem ${problemId} with ${testCases.length} test cases...`);
      const judgingResult = await judgeSubmissionWithPiston({
        sourceCode: code,
        language,
        testCases
      });
      passed = judgingResult.passed;
      allPassed = passed === testCases.length;
      totalTime = judgingResult.totalTime;
      peakMem = judgingResult.peakMemory;
      details = judgingResult.testCaseResults.map(result => ({
        testCase: result.caseNumber,
        input: result.input,
        expectedOutput: result.expectedOutput,
        actualOutput: result.actualOutput,
        passed: result.passed,
        status: result.status,
        time: result.time,
        memory: result.memory,
        stderr: result.stderr || '',
        isHidden: result.isHidden
      }));
      verdict = judgingResult.verdict;
      compilationError = judgingResult.compilationError;
      firstFailedCase = judgingResult.firstFailedCase;
    }

    // Find existing submission or create new one
    let participantIndex = battle.participants.findIndex(p => p.user.toString() === user._id.toString());
    if (!battle.participants[participantIndex].submissions) {
      battle.participants[participantIndex].submissions = [];
    }

    const existingSubmissionIndex = battle.participants[participantIndex].submissions.findIndex(
      sub => sub.problemId.toString() === problemId
    );

    // Map details to the structure expected by the frontend UI
    const resultDetails = details.map(d => ({
      input: d.input,
      expected: String(d.expectedOutput ?? ''),
      stdout: String(d.actualOutput ?? ''),
      stderr: d.stderr || (d.error || ''),
      passed: !!d.passed,
      time: d.time,
      memory: d.memory
    }));

    // Aggregate result for frontend consumption (legacy shape)
    const result = {
      status: allPassed ? 'Accepted' : 'Wrong Answer',
      details: resultDetails,
      executionTime: Math.round(totalTime * 1000) / 1000,
      memory: peakMem
    };

    const submission = {
      problemId: problem._id,
      code,
      language,
      submittedAt: new Date(),
      passed: allPassed,
      testCasesPassed: passed,
      totalTestCases: testCases.length,
      score: allPassed ? (problem.points || 100) : Math.round(((passed / Math.max(1, testCases.length)) * (problem.points || 100))),
      executionTime: totalTime,
      memory: peakMem,
      verdict,
      compilationError,
      firstFailedCase,
      details,
      result: {
        status: verdict,
        details: details,
        executionTime: totalTime,
        memory: peakMem,
        totalCases: testCases.length,
        passedCases: passed,
        failedCases: testCases.length - passed
      }
    };

    if (existingSubmissionIndex >= 0) {
      // Update existing submission
      battle.participants[participantIndex].submissions[existingSubmissionIndex] = submission;
    } else {
      // Add new submission
      battle.participants[participantIndex].submissions.push(submission);
    }

    // Update participant's total score
    const totalScore = battle.participants[participantIndex].submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
    battle.participants[participantIndex].score = totalScore;

    await battle.save();

    res.json({
      message: 'Solution submitted successfully',
      submission
    });

  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({
      error: error.message || 'Failed to submit solution'
    });
  }
};

// Run code (supports LeetCode-style or legacy stdin, without judging)
const runCode = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { battleId, problemId } = req.params;
    const { code, language, stdin, isLeetCodeStyle = false, functionName = 'solve', useProblemTests = true, testCases: providedTests = [] } = req.body;

    const battle = await Battle.findById(battleId);
    if (!battle) return res.status(404).json({ error: 'Battle not found' });
    const problem = battle.problems.id(problemId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Optional: ensure user is a participant
    const participant = battle.participants.find(p => p.user.toString() === user._id.toString());
    if (!participant) return res.status(400).json({ error: 'You are not a participant in this battle' });

    if (isLeetCodeStyle) {
      // Choose which test cases to run: provided or problem's public tests
      const tcList = useProblemTests ? problem.testCases.filter(tc => !tc.isHidden) : providedTests;
      const inputs = tcList.map(tc => tc.input || '');
      const expected = tcList.map(tc => tc.expectedOutput || '');
      const wrapped = generateLeetCodeExecution(language, code, functionName, inputs, expected);
      const exec = await executeCodeWithPiston({ language, code: wrapped, stdin: '' });
      const lines = (exec.stdout || '').split('\n').filter(l => l.trim());
      const testResults = lines.map((line, idx) => {
        const m = line.match(/Test (\d+): (.+)/);
        if (!m) return null;
        const out = m[2];
        const isErr = out.startsWith('ERROR');
        return {
          testNumber: parseInt(m[1], 10),
          passed: !isErr,
          output: isErr ? out.replace('ERROR - ', '') : out,
          expected: expected[idx] || '',
          error: isErr ? out.replace('ERROR - ', '') : null
        };
      }).filter(Boolean);
      return res.json({
        stdout: exec.stdout || '',
        stderr: exec.stderr || '',
        code: exec.code,
        time: exec.time,
        memory: exec.memory,
        isLeetCodeStyle: true,
        testResults
      });
    } else {
      const exec = await executeCodeWithPiston({ language, code, stdin });
      if (exec.error) return res.status(400).json({ error: exec.error });
      return res.json({
        stdout: exec.stdout,
        stderr: exec.stderr,
        code: exec.code,
        time: exec.time,
        memory: exec.memory,
        output: exec.output,
        isLeetCodeStyle: false
      });
    }
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({ error: error.message || 'Failed to run code' });
  }
};

module.exports = {
  submitSolution,
  runCode
};
