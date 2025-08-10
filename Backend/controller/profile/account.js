const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const User = require('../../models/user');
const Profile = require('../../models/profile');

// Delete entire user account from profile section
const deleteUserAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    // Get user data
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const passOk = bcrypt.compareSync(password, user.password);
    if (!passOk) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Find and delete associated profile
    const profile = await Profile.findOne({ userId: req.userId });
    if (profile) {
      // Delete profile picture file if it exists
      if (profile.profilePicture) {
        const filePath = path.join(__dirname, '..', profile.profilePicture);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      // Delete profile from database
      await Profile.findByIdAndDelete(profile._id);
    }

    // Delete user account
    await User.findByIdAndDelete(req.userId);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
};

module.exports = { deleteUserAccount };
