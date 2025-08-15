const Battle = require('../../models/battle');
const User = require('../../models/user');
const { executeCodeWithPiston } = require('./piston');
const { judgeSubmissionWithPiston } = require('./pistonJudge');

// Submit solution for a problem
const submitSolution = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { battleId, problemId } = req.params;
    const { code, language } = req.body;

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

    // Validate test cases have proper string input/expectedOutput
    const invalidCases = [];
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const inOk = typeof tc.input === 'string' && tc.input.trim() !== '';
      const outOk = typeof tc.expectedOutput === 'string' && tc.expectedOutput.trim() !== '';
      if (!inOk || !outOk) {
        invalidCases.push({ index: i + 1, input: tc.input, expectedOutput: tc.expectedOutput });
      }
    }
    if (invalidCases.length > 0) {
      return res.status(400).json({
        error: 'Invalid test cases: input/expectedOutput must be non-empty strings',
        invalidCases
      });
    }

    // Use Piston for judging to avoid external API limits
    console.log(`Judging (Piston) submission for problem ${problemId} with ${testCases.length} test cases...`);
    const judgingResult = await judgeSubmissionWithPiston({
      sourceCode: code,
      language,
      testCases
    });

    const passed = judgingResult.passed;
    const allPassed = passed === testCases.length;
    const totalTime = judgingResult.totalTime;
    const peakMem = judgingResult.peakMemory;
    const details = judgingResult.testCaseResults.map(result => ({
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

    // Find existing submission or create new one
    let participantIndex = battle.participants.findIndex(p => p.user.toString() === user._id.toString());
    if (!battle.participants[participantIndex].submissions) {
      battle.participants[participantIndex].submissions = [];
    }

    const existingSubmissionIndex = battle.participants[participantIndex].submissions.findIndex(
      sub => sub.problemId.toString() === problemId
    );

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
      verdict: judgingResult.verdict,
      compilationError: judgingResult.compilationError,
      firstFailedCase: judgingResult.firstFailedCase,
      details,
      result: {
        status: judgingResult.verdict,
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

// Run code with custom input (without judging)
const runCode = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { battleId, problemId } = req.params;
    const { code, language, stdin } = req.body;

    const battle = await Battle.findById(battleId);
    if (!battle) return res.status(404).json({ error: 'Battle not found' });
    const problem = battle.problems.id(problemId);
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Optional: ensure user is a participant
    const participant = battle.participants.find(p => p.user.toString() === user._id.toString());
    if (!participant) return res.status(400).json({ error: 'You are not a participant in this battle' });

    const exec = await executeCodeWithPiston({ language, code, stdin });
    if (exec.error) return res.status(400).json({ error: exec.error });
    res.json({
      stdout: exec.stdout,
      stderr: exec.stderr,
      code: exec.code,
      time: exec.time,
      memory: exec.memory,
      output: exec.output
    });
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({ error: error.message || 'Failed to run code' });
  }
};

module.exports = {
  submitSolution,
  runCode
};
