const Battle = require('../../models/battle');
const User = require('../../models/user');
const {
  GEMINI_VALIDATION_MODE,
  validateProblemsWithGemini,
  validateProblemsLocally
} = require('./validation');

// Create a new battle
const createBattle = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const {
      title,
      description,
      problems,
      difficulty,
      duration,
      maxParticipants,
      startTime,
      isPublic,
      tags
    } = req.body;

    // Validation
    if (!title || !description || !problems || !Array.isArray(problems) || problems.length === 0) {
      return res.status(400).json({
        error: 'Title, description, and at least one problem are required'
      });
    }

    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({
        error: 'Valid difficulty (Easy, Medium, Hard) is required'
      });
    }

    if (!duration || duration < 15 || duration > 480) {
      return res.status(400).json({
        error: 'Duration must be between 15 and 480 minutes'
      });
    }

    // Validate problems
    for (let i = 0; i < problems.length; i++) {
      const problem = problems[i];
      if (!problem.title || !problem.description || !problem.difficulty) {
        return res.status(400).json({
          error: `Problem ${i + 1} is missing required fields (title, description, difficulty)`
        });
      }
      if (!['Easy', 'Medium', 'Hard'].includes(problem.difficulty)) {
        return res.status(400).json({
          error: `Problem ${i + 1} has invalid difficulty. Must be Easy, Medium, or Hard`
        });
      }
      if (!problem.testCases || !Array.isArray(problem.testCases) || problem.testCases.length === 0) {
        return res.status(400).json({
          error: `Problem ${i + 1} must have at least one test case`
        });
      }
      // Validate test cases
      for (let j = 0; j < problem.testCases.length; j++) {
        const testCase = problem.testCases[j];
        if (testCase.input === undefined || testCase.expectedOutput === undefined) {
          return res.status(400).json({
            error: `Problem ${i + 1}, test case ${j + 1} is missing input or expectedOutput`
          });
        }
      }
    }

    // Validate problems locally
    const localIssues = validateProblemsLocally(problems);
    if (localIssues.length) {
      return res.status(400).json({ error: 'Problem validation failed (local)', issues: localIssues });
    }

    // Gemini validation
    try {
      const validation = await validateProblemsWithGemini(problems);
      if (validation.skipped) {
        if (GEMINI_VALIDATION_MODE === 'block') {
          return res.status(400).json({ error: 'Gemini validation is required but unavailable.' });
        }
      } else {
        const issues = validation.issues || [];
        if (issues.length > 0) {
          return res.status(400).json({ error: 'One or more problems failed validation (gemini)', issues });
        }
      }
    } catch (gemErr) {
      if (GEMINI_VALIDATION_MODE === 'block') {
        return res.status(400).json({ error: 'Gemini validation error', detail: gemErr?.message || String(gemErr) });
      }
      console.warn('Gemini validation warning:', gemErr?.message || gemErr);
    }

    const battleStartTime = startTime ? new Date(startTime) : new Date(Date.now() + 5 * 60 * 1000); // Default: 5 minutes from now

    const battle = new Battle({
      title,
      description,
      problems,
      difficulty,
      duration,
      maxParticipants: maxParticipants || 10,
      startTime: battleStartTime,
      isPublic: isPublic !== false, // Default to true
      tags: tags || [],
      creator: user._id,
      participants: [{
        user: user._id,
        joinedAt: new Date()
      }],
      status: 'waiting'
    });

    await battle.save();

    // Populate creator info for response
    await battle.populate('creator', 'username email');
    await battle.populate('participants.user', 'username email');

    res.status(201).json({
      message: 'Battle created successfully',
      battle
    });

  } catch (error) {
    console.error('Create battle error:', error);
    res.status(500).json({
      error: error.message || 'Failed to create battle'
    });
  }
};

module.exports = {
  createBattle
};
