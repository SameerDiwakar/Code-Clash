const express = require('express');
const router = express.Router();
const {
  verifyToken,
  upload,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  deleteProfilePicture
} = require('../controller/profileController');

// Get user profile
router.get('/profile', verifyToken, getProfile);

// Update user profile
router.put('/profile', verifyToken, updateProfile);

// Upload profile picture
router.post('/profile/picture', verifyToken, upload.single('profilePicture'), uploadProfilePicture);

// Delete profile picture
router.delete('/profile/picture', verifyToken, deleteProfilePicture);

module.exports = router;
