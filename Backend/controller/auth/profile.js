require('dotenv').config();
const User = require("../../models/user");
const Profile = require('../../models/profile');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { sendProfileUpdateEmail, sendAccountDeletionEmail } = require('../emailController');
const util = require('util');
const path = require('path');
const fs = require('fs');

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET || 'ndwsd93er932rh02';

// Profile route function
const profile = (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) return res.status(401).json({ message: 'Invalid token' });

      const user = await User.findById(userData.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const { username, email, _id } = user;
      res.json({ username, email, _id });
    });
  } else {
    res.json(null);
  }
};

// Delete account route function
const verifyJwt = util.promisify(jwt.verify);

const deleteAccount = async (req, res) => {
  const { token } = req.cookies;
  const { password } = req.body;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    // This will throw if token is invalid
    const userData = await verifyJwt(token, jwtSecret);

    if (!password) {
      return res.status(400).json({ message: "Password is required to delete account" });
    }

    const user = await User.findById(userData.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const passOk = await bcrypt.compare(password, user.password);
    if (!passOk) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Find and delete associated profile
    const profileDoc = await Profile.findOne({ userId: userData.id });
    if (profileDoc) {
      // Delete profile picture file if it exists
      if (profileDoc.profilePicture) {
        const filePath = path.join(__dirname, '..', '..', profileDoc.profilePicture);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      // Delete profile from database
      await Profile.findByIdAndDelete(profileDoc._id);
    }

    // Send account deletion email (async, don't block response)
    sendAccountDeletionEmail(user.email, user.username).catch(e => console.error('Account deletion email error:', e));

    // Delete user account
    await User.findByIdAndDelete(userData.id);

    res.clearCookie('token').json({ message: "Account deleted successfully" });

  } catch (err) {
    console.error('Delete account error:', err);
    return res.status(500).json({ message: "Failed to delete account" });
  }
};

// Update profile route function
const updateProfile = async (req, res) => {
  const { username, email, oldPassword, newPassword } = req.body;
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) return res.status(401).json({ success: false, message: "Unauthorized" });
    try {
      const user = await User.findById(userData.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      // If changing email or password, require oldPassword and verify
      if ((email && email !== user.email) || newPassword) {
        if (!oldPassword) {
          return res.status(400).json({ success: false, message: "Current password required to change email or password" });
        }
        const passOk = bcrypt.compareSync(oldPassword, user.password);
        if (!passOk) {
          return res.status(401).json({ success: false, message: "Incorrect current password" });
        }
        // Prevent new password from being the same as old password
        if (newPassword && bcrypt.compareSync(newPassword, user.password)) {
          return res.status(400).json({ success: false, message: "New password cannot be the same as the old password" });
        }
      }

      // Update fields
      const updatedFields = {};
      if (username && username !== user.username) {
        user.username = username;
        updatedFields.username = username;
      }
      if (email && email !== user.email) {
        user.email = email;
        updatedFields.email = email;
      }
      if (newPassword) {
        user.password = bcrypt.hashSync(newPassword, bcryptSalt);
        updatedFields.password = true;
      }
      await user.save();

      // Send profile update email if any field changed
      if (Object.keys(updatedFields).length > 0) {
        sendProfileUpdateEmail(user.email, user.username, updatedFields).catch(e => console.error('Profile update email error:', e));
      }

      res.json({ success: true });
    } catch (e) {
      console.error('Update profile error:', e);
      res.status(500).json({ success: false, message: "Failed to update profile" });
    }
  });
};

module.exports = {
  profile,
  deleteAccount,
  updateProfile
};
