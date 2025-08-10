// Import modularized profile handlers
const { verifyToken } = require('./profile/middleware');
const { upload } = require('./profile/upload');
const { getProfile, updateProfile } = require('./profile/crud');
const { uploadProfilePicture, deleteProfilePicture, getProfilePicture } = require('./profile/picture');
const { deleteUserAccount } = require('./profile/account');


module.exports = {
  verifyToken,
  upload,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  getProfilePicture,
  deleteUserAccount
};
