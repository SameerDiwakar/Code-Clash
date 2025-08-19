// Import all auth functions from focused files
const { testRoute } = require('./auth/test');
const { register, login, logout } = require('./auth/authentication');
const { profile, deleteAccount, updateProfile } = require('./auth/profile');
const { forgotPassword, validateResetToken, resetPassword } = require('./auth/passwordReset');
const { googleLogin } = require('./auth/google');



module.exports = { 
  testRoute,
  register,
  login,
  profile,
  logout,
  deleteAccount,
  updateProfile,
  forgotPassword,
  validateResetToken,
  resetPassword,
  googleLogin,
};
