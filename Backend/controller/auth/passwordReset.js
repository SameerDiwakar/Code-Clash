require('dotenv').config();
const User = require("../../models/user");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const PasswordResetToken = require('../../models/passwordResetToken');
const { sendPasswordResetEmail } = require('../emailController');

const bcryptSalt = bcrypt.genSaltSync(10);

// Forgot Password: Request reset link
const forgotPassword = async (req, res) => {
  const { email, local } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.json({ exists: false, message: 'The email is not registered.' });

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Invalidate previous tokens
  await PasswordResetToken.updateMany({ userId: user._id, used: false }, { used: true });

  // Store hashed token
  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt,
    used: false,
  });

  // Choose reset URL based on local param
  const baseUrl = local
    ? 'http://localhost:8080/forgot-password?token=' 
    : 'https://waran-ai.vercel.app/forgot-password?token=';
  const resetUrl = `${baseUrl}${token}`;
  await sendPasswordResetEmail(email, user.username, resetUrl);

  return res.json({ exists: true, message: 'Check your email, you\'ll receive a reset link shortly.' });
};

// Validate reset token
const validateResetToken = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ valid: false, message: 'Missing token' });
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const record = await PasswordResetToken.findOne({ tokenHash, used: false });
  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ valid: false, message: 'Reset link is invalid or expired.' });
  }
  return res.json({ valid: true });
};

// Reset password
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: 'Missing token or password' });
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const record = await PasswordResetToken.findOne({ tokenHash, used: false });
  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Reset link is invalid or expired.' });
  }
  // Update password
  const user = await User.findById(record.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.password = bcrypt.hashSync(newPassword, bcryptSalt);
  await user.save();
  // Invalidate token
  record.used = true;
  await record.save();
  // Optionally: log out all sessions (not implemented here)
  return res.json({ message: 'Password reset successful. Please log in.' });
};

module.exports = {
  forgotPassword,
  validateResetToken,
  resetPassword
};
