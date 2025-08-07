const Battle = require('../models/battle');
const User = require('../models/user');

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
    }

    const battleStartTime = startTime ? new Date(startTime) : new Date(Date.now() + 5 * 60 * 1000); // Default: 5 minutes from now

    const battle = new Battle({
      title,
      description,
      creator: user._id,
      problems,
      difficulty,
      duration,
      maxParticipants: maxParticipants || 100,
      startTime: battleStartTime,
      isPublic: isPublic !== false, // Default to true
      tags: tags || [],
      status: 'Scheduled'
    });

    await battle.save();
    await battle.populate('creator', 'username email');

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

// Get all battles (with filters)
const getBattles = async (req, res) => {
  try {
    const {
      status,
      difficulty,
      creator,
      isPublic,
      page = 1,
      limit = 10,
      search
    } = req.query;

    const filter = {};
    
    if (status) {
      // Handle comma-separated status values
      const statusArray = status.split(',').map(s => s.trim());
      filter.status = statusArray.length > 1 ? { $in: statusArray } : status;
    }
    if (difficulty) filter.difficulty = difficulty;
    if (creator) filter.creator = creator;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const battles = await Battle.find(filter)
      .populate('creator', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Battle.countDocuments(filter);

    res.json({
      battles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get battles error:', error);
    res.status(500).json({
      error: 'Failed to fetch battles'
    });
  }
};

// Get battle by ID
const getBattleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const battle = await Battle.findById(id)
      .populate('creator', 'username email')
      .populate('participants.user', 'username email')
      .populate('leaderboard.user', 'username email');

    if (!battle) {
      return res.status(404).json({
        error: 'Battle not found'
      });
    }

    res.json({ battle });

  } catch (error) {
    console.error('Get battle error:', error);
    res.status(500).json({
      error: 'Failed to fetch battle'
    });
  }
};

// Join a battle
const joinBattle = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { id } = req.params;

    const battle = await Battle.findById(id);
    if (!battle) {
      return res.status(404).json({
        error: 'Battle not found'
      });
    }

    if (!battle.canUserJoin(user._id)) {
      return res.status(400).json({
        error: 'Cannot join this battle'
      });
    }

    battle.participants.push({
      user: user._id,
      joinedAt: new Date()
    });

    await battle.save();
    await battle.populate('participants.user', 'name email');

    res.json({
      message: 'Successfully joined the battle',
      battle
    });

  } catch (error) {
    console.error('Join battle error:', error);
    res.status(500).json({
      error: error.message || 'Failed to join battle'
    });
  }
};

// Start a battle (for creators)
const startBattle = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { id } = req.params;

    const battle = await Battle.findById(id);
    if (!battle) {
      return res.status(404).json({
        error: 'Battle not found'
      });
    }

    if (battle.creator.toString() !== user._id.toString()) {
      return res.status(403).json({
        error: 'Only the battle creator can start the battle'
      });
    }

    if (battle.status !== 'Scheduled') {
      return res.status(400).json({
        error: 'Battle cannot be started'
      });
    }

    battle.status = 'Active';
    battle.startTime = new Date();
    await battle.save();

    res.json({
      message: 'Battle started successfully',
      battle
    });

  } catch (error) {
    console.error('Start battle error:', error);
    res.status(500).json({
      error: error.message || 'Failed to start battle'
    });
  }
};

// Get user's battles
const getUserBattles = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { type = 'all' } = req.query; // 'created', 'joined', 'all'

    let filter = {};
    
    if (type === 'created') {
      filter.creator = user._id;
    } else if (type === 'joined') {
      filter['participants.user'] = user._id;
    } else {
      filter.$or = [
        { creator: user._id },
        { 'participants.user': user._id }
      ];
    }

    const battles = await Battle.find(filter)
      .populate('creator', 'username email')
      .sort({ createdAt: -1 });

    res.json({ battles });

  } catch (error) {
    console.error('Get user battles error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch user battles'
    });
  }
};

// Submit solution for a problem
const submitSolution = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { battleId, problemId } = req.params;
    const { code, language } = req.body;

    const battle = await Battle.findById(battleId);
    if (!battle) {
      return res.status(404).json({
        error: 'Battle not found'
      });
    }

    if (!battle.isActive()) {
      return res.status(400).json({
        error: 'Battle is not active'
      });
    }

    const participant = battle.participants.find(p => p.user.toString() === user._id.toString());
    if (!participant) {
      return res.status(400).json({
        error: 'You are not a participant in this battle'
      });
    }

    const problem = battle.problems.id(problemId);
    if (!problem) {
      return res.status(404).json({
        error: 'Problem not found'
      });
    }

    // Add submission
    participant.submissions.push({
      problemId,
      code,
      language,
      submittedAt: new Date(),
      result: {
        status: 'Pending',
        score: 0
      }
    });

    await battle.save();

    // TODO: Implement code execution and testing logic here
    // For now, we'll just mark it as accepted with a random score
    const submission = participant.submissions[participant.submissions.length - 1];
    submission.result = {
      status: 'Accepted',
      score: Math.floor(Math.random() * 100) + 1,
      executionTime: Math.floor(Math.random() * 1000),
      memory: Math.floor(Math.random() * 10000)
    };

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

module.exports = {
  createBattle,
  getBattles,
  getBattleById,
  joinBattle,
  startBattle,
  getUserBattles,
  submitSolution
};
