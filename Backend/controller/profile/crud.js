const Profile = require('../../models/profile');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) {
      // Return default profile structure if none exists
      return res.json({
        displayName: '',
        bio: '',
        experienceLevel: 'Beginner',
        githubProfile: '',
        preferredLanguages: [],
        codingSkills: [],
        profilePicture: '',
      });
    }
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// Create or update user profile
const updateProfile = async (req, res) => {
  try {
    const {
      displayName,
      bio,
      experienceLevel,
      githubProfile,
      preferredLanguages,
      codingSkills,
    } = req.body;

    const profileData = {
      userId: req.userId,
      displayName: displayName || '',
      bio: bio || '',
      experienceLevel: experienceLevel || 'Beginner',
      githubProfile: githubProfile || '',
      preferredLanguages: Array.isArray(preferredLanguages) ? preferredLanguages : [],
      codingSkills: Array.isArray(codingSkills) ? codingSkills : [],
    };

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      profileData,
      { new: true, upsert: true }
    );

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = { getProfile, updateProfile };
