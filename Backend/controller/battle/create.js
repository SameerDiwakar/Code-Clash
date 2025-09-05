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

    // Normalize problem titles to satisfy schema requirement problems[].normalizedTitle
    const normalizedProblems = Array.isArray(problems)
      ? problems.map((p) => {
          const t = (p?.title ?? '').toString();
          return {
            ...p,
            title: t,
            normalizedTitle: t.trim().toLowerCase(),
          };
        })
      : [];

    // Validation
    if (!title || !description || !problems || !Array.isArray(problems) || problems.length === 0) {
      return res.status(400).json({
        error: 'Title, description, and at least one problem are required'
      });
    }

    // Validate each problem has at least 2 test cases
    for (const [index, problem] of problems.entries()) {
      if (!problem.testCases || !Array.isArray(problem.testCases) || problem.testCases.length < 2) {
        return res.status(400).json({
          error: `Problem ${index + 1} must have at least 2 test cases`
        });
      }
    }

    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({
        error: 'Valid difficulty (Easy, Medium, Hard) is required'
      });
    }

    if (!duration || duration < 15 || duration > 720) {
      return res.status(400).json({
        error: 'Duration must be between 15 and 720 minutes'
      });
    }

    // Early duplicate check (robust): try normalizedTitle and collation fallback
    const norm = String(title).trim().toLowerCase();
    let existing = await Battle.findOne({ normalizedTitle: norm });
    if (!existing) {
      existing = await Battle.findOne({ title: String(title).trim() })
        .collation({ locale: 'en', strength: 2 });
    }
    if (existing) {
      return res.status(409).json({ error: 'A battle with this title already exists. Please choose a different title.' });
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
    const localIssues = validateProblemsLocally(normalizedProblems);
    if (localIssues.length) {
      return res.status(400).json({ error: 'Problem validation failed (local)', issues: localIssues });
    }

    // Gemini validation (only blocking when GEMINI_VALIDATION_MODE === 'block')
    try {
      const result = await validateProblemsWithGemini(normalizedProblems);
      if (result.skipped) {
        if (GEMINI_VALIDATION_MODE === 'block') {
          return res.status(400).json({ error: 'Gemini validation is required but unavailable.' });
        }
      } else if (Array.isArray(result.results)) {
        const issues = [];
        result.results.forEach((r, idx) => {
          if (!r || r.skipped) return;
          if (r.isValid === false) {
            issues.push({ index: idx, reason: r.reason || 'Invalid per Gemini' });
          }
        });
        if (issues.length) {
          if (GEMINI_VALIDATION_MODE === 'block') {
            return res.status(400).json({ error: 'One or more problems failed validation (gemini)', issues });
          }
          console.warn('Gemini reported issues (non-blocking):', issues);
        }
      }
    } catch (gemErr) {
      if (GEMINI_VALIDATION_MODE === 'block') {
        return res.status(400).json({ error: 'Gemini validation error', detail: gemErr?.message || String(gemErr) });
      }
      console.warn('Gemini validation warning:', gemErr?.message || gemErr);
    }

    const battleStartTime = startTime ? new Date(startTime) : new Date(Date.now() + 5 * 60 * 1000); // Default: 5 minutes from now

    // Prepare battle data
    const battleData = {
      title: title.trim(),
      description: description.trim(),
      problems: normalizedProblems,
      difficulty,
      duration,
      maxParticipants: maxParticipants || 100,
      startTime: battleStartTime,
      isPublic: isPublic !== false, // Default to true
      tags: tags || [],
      creator: user._id,
      participants: [{
        user: user._id,
        joinedAt: new Date(),
        isCreator: true
      }],
      status: 'waiting'
    };

    // Add access code if battle is private
    if (!battleData.isPublic) {
      const { accessCode } = req.body;
      if (!accessCode || accessCode.length < 4) {
        return res.status(400).json({
          error: 'Access code is required and must be at least 4 characters long for private battles'
        });
      }
      battleData.accessCode = accessCode;
    }

    const battle = new Battle(battleData);

    await battle.save();

    // Populate creator info for response
    await battle.populate('creator', 'username email');
    await battle.populate('participants.user', 'username email');

    res.status(201).json({
      message: 'Battle created successfully',
      battle
    });

  } catch (error) {
    // Handle duplicate title error from unique index
    if (error && error.code === 11000 && (error.keyPattern?.title || (error.keyValue && Object.prototype.hasOwnProperty.call(error.keyValue, 'title')))) {
      return res.status(409).json({ error: 'A battle with this title already exists. Please choose a different title.' });
    }
    console.error('Create battle error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create battle'
    });
  }
};

module.exports = {
  createBattle
};
