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
    const { page = 1, limit = 10, status, difficulty, search, creator, isPublic } = req.query;

    const filter = {};
    
    // Build dynamic status filtering with time-window awareness for 'Active'
    const now = new Date();
    let statusOrConditions = [];
    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      const otherStatuses = statusArray.filter(s => s !== 'Active');
      // If 'Active' requested, include ONLY time-window active condition
      if (statusArray.includes('Active')) {
        statusOrConditions.push({ $and: [ { startTime: { $lte: now } }, { endTime: { $gte: now } } ] });
      }
      // If 'Scheduled' requested, include only future scheduled (start in future)
      if (statusArray.includes('Scheduled')) {
        statusOrConditions.push({ $and: [ { status: 'Scheduled' }, { startTime: { $gt: now } } ] });
      }
      if (otherStatuses.length > 0) {
        statusOrConditions.push({ status: { $in: otherStatuses } });
      }

      // If 'Completed' is NOT included, exclude ended battles globally
      if (!statusArray.includes('Completed')) {
        // Apply as an additional $and filter later; we'll append to query
        filter.endTime = { $gt: now };
      }
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

    // Combine filters. If we have statusOrConditions, wrap everything in $and to preserve search $or
    let query = { ...filter };
    if (statusOrConditions.length > 0) {
      // Convert simple time-window object into $or group properly
      const normalizedStatusOr = statusOrConditions; // already normalized above
      const andClauses = [];
      // Move existing search $or into $and as well
      if (query.$or) {
        andClauses.push({ $or: query.$or });
        delete query.$or;
      }
      // Any remaining simple key filters
      const remainingKeys = Object.keys(query);
      if (remainingKeys.length > 0) {
        andClauses.push(query);
      }
      andClauses.push({ $or: normalizedStatusOr });
      query = { $and: andClauses };
    }

    const battles = await Battle.find(query)
      .populate('creator', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Battle.countDocuments(query);

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
    
    console.log('Debug - Battle found:', {
      id: battle._id,
      title: battle.title,
      creator: battle.creator,
      participantCount: battle.participants.length
    });

    // Check if user can join and provide specific error messages
    const now = new Date();
    
    // Check if battle is completed or cancelled
    if (battle.status === 'Completed' || battle.status === 'Cancelled') {
      return res.status(400).json({
        error: `Cannot join a ${battle.status.toLowerCase()} battle`
      });
    }
    
    // Check if battle has ended
    if (battle.endTime && now > battle.endTime) {
      return res.status(400).json({
        error: 'This battle has already ended'
      });
    }
    
    // Check if at max capacity
    if (battle.participants.length >= battle.maxParticipants) {
      return res.status(400).json({
        error: 'Battle is full - maximum participants reached'
      });
    }
    
    // Check if already joined - this is the main fix
    console.log('Debug - Battle ID:', id);
    console.log('Debug - Battle Creator:', battle.creator.toString());
    console.log('Debug - Current User ID:', user._id.toString());
    console.log('Debug - User from req.userId:', req.userId);
    console.log('Debug - User object:', { id: user._id, username: user.username, email: user.email });
    console.log('Debug - Current participants:', battle.participants.map(p => ({
      userId: p.user.toString(),
      joinedAt: p.joinedAt,
      matchesCurrentUser: p.user.toString() === user._id.toString()
    })));
    
    // More robust participant check with multiple comparison methods
    const userIdString = user._id.toString();
    const alreadyJoined = battle.participants.some(p => {
      const participantIdString = p.user.toString();
      const match = participantIdString === userIdString;
      console.log('Debug - Comparing participant:', participantIdString, 'with user:', userIdString, 'match:', match);
      return match;
    });
    
    console.log('Debug - Already joined check result:', alreadyJoined);
    console.log('Debug - Is creator trying to join own battle:', battle.creator.toString() === user._id.toString());
    
    // Additional debug info about participants
    console.log('Debug - Total participants in battle:', battle.participants.length);
    console.log('Debug - Participant user IDs:', battle.participants.map(p => p.user.toString()));
    
    if (alreadyJoined) {
      return res.status(400).json({
        error: 'You have already joined this battle'
      });
    }
    
    // For scheduled battles, check if within joining window
    if (battle.status === 'Scheduled') {
      const timeUntilStart = battle.startTime.getTime() - now.getTime();
      const fifteenMinutes = 15 * 60 * 1000;
      if (timeUntilStart > fifteenMinutes) {
        const minutesUntilJoin = Math.ceil((timeUntilStart - fifteenMinutes) / (60 * 1000));
        return res.status(400).json({
          error: `Battle opens for joining ${minutesUntilJoin} minutes before start time`
        });
      }
    }

    // Add user to participants
    battle.participants.push({
      user: user._id,
      joinedAt: new Date()
    });

    await battle.save();
    await battle.populate('participants.user', 'username email');

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

// Debug endpoint to check battle participants
const debugBattle = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { id } = req.params;
    const battle = await Battle.findById(id).populate('participants.user', 'username email');
    
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }
    
    res.json({
      battleId: battle._id,
      battleTitle: battle.title,
      currentUserId: user._id,
      currentUsername: user.username,
      participants: battle.participants.map(p => ({
        userId: p.user._id,
        username: p.user.username,
        joinedAt: p.joinedAt,
        isCurrentUser: p.user._id.toString() === user._id.toString()
      })),
      participantCount: battle.participants.length,
      maxParticipants: battle.maxParticipants
    });
  } catch (error) {
    console.error('Debug battle error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Leave battle endpoint (for debugging and cleanup)
const leaveBattle = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { id } = req.params;
    const battle = await Battle.findById(id);
    
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }
    
    // Remove user from participants
    const initialCount = battle.participants.length;
    battle.participants = battle.participants.filter(p => p.user.toString() !== user._id.toString());
    const finalCount = battle.participants.length;
    
    await battle.save();
    
    res.json({
      message: 'Successfully left the battle',
      removed: initialCount - finalCount,
      remainingParticipants: finalCount
    });
  } catch (error) {
    console.error('Leave battle error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBattle,
  getBattles,
  getBattleById,
  joinBattle,
  startBattle,
  getUserBattles,
  submitSolution,
  debugBattle,
  leaveBattle
};
