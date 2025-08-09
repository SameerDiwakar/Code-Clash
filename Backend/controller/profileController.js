const Profile = require('../models/profile');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const jwtSecret = process.env.JWT_SECRET || 'ndwsd93er932rh02';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and user ID
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.userId}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Middleware to verify JWT and extract user ID
const verifyToken = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, jwtSecret, {}, (err, userData) => {
    if (err) {
      console.log('JWT verification error:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.userId = userData.id;
    console.log('Debug - verifyToken middleware - extracted userId:', req.userId);
    console.log('Debug - verifyToken middleware - full userData:', userData);
    next();
  });
};

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
        profilePicture: ''
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
      codingSkills
    } = req.body;

    const profileData = {
      userId: req.userId,
      displayName: displayName || '',
      bio: bio || '',
      experienceLevel: experienceLevel || 'Beginner',
      githubProfile: githubProfile || '',
      preferredLanguages: Array.isArray(preferredLanguages) ? preferredLanguages : [],
      codingSkills: Array.isArray(codingSkills) ? codingSkills : []
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

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get the relative path for storing in database
    const relativePath = `/uploads/profiles/${req.file.filename}`;

    // Find existing profile and delete old profile picture if exists
    const existingProfile = await Profile.findOne({ userId: req.userId });
    if (existingProfile && existingProfile.profilePicture) {
      const oldFilePath = path.join(__dirname, '..', existingProfile.profilePicture);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update profile with new picture path
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { profilePicture: relativePath },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      profilePicture: relativePath,
      message: 'Profile picture uploaded successfully'
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ message: 'Failed to upload profile picture' });
  }
};

// Delete profile picture
const deleteProfilePicture = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile || !profile.profilePicture) {
      return res.status(404).json({ message: 'No profile picture found' });
    }

    // Delete the file from filesystem
    const filePath = path.join(__dirname, '..', profile.profilePicture);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update profile to remove picture reference
    await Profile.findOneAndUpdate(
      { userId: req.userId },
      { profilePicture: '' }
    );

    res.json({ success: true, message: 'Profile picture deleted successfully' });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ message: 'Failed to delete profile picture' });
  }
};

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

module.exports = {
  verifyToken,
  upload,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  deleteUserAccount
};
