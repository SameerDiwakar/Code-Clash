const Battle = require('../../models/battle');
const User = require('../../models/user');
const { executeCodeWithPiston } = require('./piston');

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
    if (battle.status !== 'active') {
      return res.status(400).json({ error: 'Battle is not active' });
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
    let passed = 0;
    let totalTime = 0;
    let peakMem = 0;
    const details = [];

    // Run code against all test cases
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const exec = await executeCodeWithPiston({
        language,
        code,
        stdin: String(testCase.input || '')
      });

      if (exec.error) {
        details.push({
          testCase: i + 1,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: exec.error,
          passed: false,
          error: exec.error,
          time: 0,
          memory: 0
        });
        continue;
      }

      const actualOutput = (exec.stdout || '').trim();
      const expectedOutput = String(testCase.expectedOutput || '').trim();
      const testPassed = actualOutput === expectedOutput;

      if (testPassed) passed++;

      totalTime += exec.time || 0;
      peakMem = Math.max(peakMem, exec.memory || 0);

      details.push({
        testCase: i + 1,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: actualOutput,
        passed: testPassed,
        time: exec.time || 0,
        memory: exec.memory || 0,
        stderr: exec.stderr || ''
      });
    }

    const allPassed = passed === testCases.length;

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
      executionTime: Math.round(totalTime * 1000) / 1000,
      memory: peakMem,
      details
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
