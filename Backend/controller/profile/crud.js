const Profile = require('../../models/profile');
const User = require('../../models/user');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const [profile, user] = await Promise.all([
      Profile.findOne({ userId: req.userId }),
      User.findById(req.userId).select('username')
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!profile) {
      // Create and persist a new profile with displayName prefilled from username
      const created = await Profile.findOneAndUpdate(
        { userId: req.userId },
        {
          $setOnInsert: {
            userId: req.userId,
            displayName: user.username,
            bio: '',
            experienceLevel: 'Beginner',
            githubProfile: '',
            preferredLanguages: [],
            codingSkills: [],
            profilePicture: ''
          }
        },
        { new: true, upsert: true }
      );
      return res.json(created);
    }

    // If profile exists but displayName not set, persist username as displayName
    if (!profile.displayName) {
      profile.displayName = user.username;
      await profile.save();
      return res.json(profile);
    }

    return res.json(profile);
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

    // Basic input validation/sanitization
    const allowedLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    if (experienceLevel && !allowedLevels.includes(experienceLevel)) {
      return res.status(400).json({ message: 'Invalid experience level' });
    }
    if (preferredLanguages && !Array.isArray(preferredLanguages)) {
      return res.status(400).json({ message: 'preferredLanguages must be an array of strings' });
    }
    if (codingSkills && !Array.isArray(codingSkills)) {
      return res.status(400).json({ message: 'codingSkills must be an array of strings' });
    }

    const user = await User.findById(req.userId).select('username');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const desiredName = typeof displayName === 'string' ? displayName.trim() : undefined;

    // If a displayName was provided, enforce uniqueness across profiles and against other users' usernames
    if (desiredName) {
      const [conflictProfile, conflictUser] = await Promise.all([
        Profile.findOne({ displayName: desiredName, userId: { $ne: req.userId } }).select('_id'),
        User.findOne({ username: desiredName, _id: { $ne: req.userId } }).select('_id')
      ]);
      if (conflictProfile || conflictUser) {
        return res.status(409).json({ message: 'Display name is already in use' });
      }
    }

    // Build base update document
    const update = {
      $set: {
        bio: bio || '',
        experienceLevel: experienceLevel || 'Beginner',
        githubProfile: githubProfile || '',
        preferredLanguages: Array.isArray(preferredLanguages) ? preferredLanguages : [],
        codingSkills: Array.isArray(codingSkills) ? codingSkills : [],
      }
    };

    // Ensure new docs have userId on upsert
    update.$setOnInsert = { ...(update.$setOnInsert || {}), userId: req.userId };

    // Handle displayName updates without conflicting operators
    if (displayName === undefined) {
      // Not provided: do not touch displayName here to avoid conflicts
    } else if (desiredName) {
      // Provided non-empty: set it
      update.$set.displayName = desiredName;
    } else {
      // Provided empty: unset it to avoid unique collisions
      update.$unset = { ...(update.$unset || {}), displayName: '' };
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      update,
      { new: true, upsert: true }
    );

    res.json({ success: true, profile });
  } catch (error) {
    console.error('Update profile error:', error && (error.stack || error));
    if (error && (error.code === 11000 || (error.name === 'MongoServerError' && error.code === 11000))) {
      return res.status(409).json({ message: 'Display name is already in use' });
    }
    res.status(500).json({ message: 'Failed to update profile', details: error?.message || 'Unknown error' });
  }
};

module.exports = { getProfile, updateProfile };
