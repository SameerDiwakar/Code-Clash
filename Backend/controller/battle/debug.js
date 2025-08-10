const Battle = require('../../models/battle');
const User = require('../../models/user');

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

module.exports = {
  debugBattle
};
