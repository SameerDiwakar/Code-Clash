const Battle = require('../../models/battle');
const User = require('../../models/user');

// Get all battles (with filters)
const getBattles = async (req, res) => {
  try {
    const {
      status,
      difficulty,
      isPublic,
      creator,
      tags,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    if (isPublic !== undefined) {
      filter.isPublic = isPublic === 'true';
    }
    
    if (creator) {
      filter.creator = creator;
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const battles = await Battle.find(filter)
      .populate('creator', 'username email')
      .populate('participants.user', 'username email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination info
    const totalBattles = await Battle.countDocuments(filter);
    const totalPages = Math.ceil(totalBattles / limitNum);

    res.json({
      battles,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBattles,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get battles error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch battles'
    });
  }
};

// Get battle by ID
const getBattleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const battle = await Battle.findById(id)
      .populate('creator', 'username email')
      .populate('participants.user', 'username email');
    
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }
    
    res.json(battle);
  } catch (error) {
    console.error('Get battle by ID error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch battle'
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

    // Find battles where user is creator or participant
    const battles = await Battle.find({
      $or: [
        { creator: user._id },
        { 'participants.user': user._id }
      ]
    })
    .populate('creator', 'username email')
    .populate('participants.user', 'username email')
    .sort({ createdAt: -1 });

    // Categorize battles
    const createdBattles = battles.filter(battle => 
      battle.creator._id.toString() === user._id.toString()
    );
    
    const joinedBattles = battles.filter(battle => 
      battle.creator._id.toString() !== user._id.toString()
    );

    res.json({
      created: createdBattles,
      joined: joinedBattles,
      total: battles.length
    });

  } catch (error) {
    console.error('Get user battles error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch user battles'
    });
  }
};

module.exports = {
  getBattles,
  getBattleById,
  getUserBattles
};
