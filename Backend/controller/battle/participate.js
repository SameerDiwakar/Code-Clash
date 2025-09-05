const Battle = require('../../models/battle');
const User = require('../../models/user');

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
      return res.status(404).json({ error: 'Battle not found' });
    }

    // Check if battle is private and validate access code if user is not the creator
    if (!battle.isPublic) {
      const { accessCode } = req.body;
      const isCreator = battle.creator.toString() === user._id.toString();
      
      // Allow creator to join without access code
      if (!isCreator) {
        // If no access code provided, return error
        if (!accessCode) {
          return res.status(403).json({ error: 'Access code is required to join this private battle' });
        }
        
        // If access code doesn't match, return error
        if (accessCode !== battle.accessCode) {
          return res.status(403).json({ error: 'Invalid access code' });
        }
      }
    }

    // Check if battle hasn't started yet
    if (battle.status !== 'waiting') {
      return res.status(400).json({ error: 'Cannot join battle that has already started or ended' });
    }

    // Check if battle is full
    if (battle.participants.length >= battle.maxParticipants) {
      return res.status(400).json({ error: 'Battle is full' });
    }

    // Check if user is already a participant
    const isAlreadyParticipant = battle.participants.some(
      participant => participant.user.toString() === user._id.toString()
    );

    if (isAlreadyParticipant) {
      return res.status(400).json({ error: 'You are already a participant in this battle' });
    }

    // Add user to participants
    battle.participants.push({
      user: user._id,
      joinedAt: new Date()
    });

    await battle.save();

    // Populate for response
    await battle.populate('creator', 'username email');
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
      return res.status(404).json({ error: 'Battle not found' });
    }

    // Check if user is the creator
    if (battle.creator.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Only the battle creator can start the battle' });
    }

    // Check if battle is in waiting status
    if (battle.status !== 'waiting') {
      return res.status(400).json({ error: 'Battle has already started or ended' });
    }

    // Check if there are participants
    if (battle.participants.length < 1) {
      return res.status(400).json({ error: 'Cannot start battle with no participants' });
    }

    // Update battle status and start time
    battle.status = 'Active';
    battle.startTime = new Date();
    battle.endTime = new Date(Date.now() + battle.duration * 60 * 1000);

    await battle.save();

    // Populate for response
    await battle.populate('creator', 'username email');
    await battle.populate('participants.user', 'username email');

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
  joinBattle,
  startBattle,
  leaveBattle
};
