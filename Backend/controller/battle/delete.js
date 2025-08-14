const Battle = require('../../models/battle');

// Delete a battle (creator only)
const deleteBattle = async (req, res) => {
  try {
    const { id } = req.params;

    const battle = await Battle.findById(id);
    if (!battle) {
      return res.status(404).json({ error: 'Battle not found' });
    }

    // Only creator can delete
    if (battle.creator.toString() !== req.userId) {
      return res.status(403).json({ error: 'You are not allowed to delete this battle' });
    }

    await Battle.findByIdAndDelete(id);

    return res.json({ message: 'Battle deleted successfully' });
  } catch (error) {
    console.error('Delete battle error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete battle' });
  }
};

module.exports = { deleteBattle };
