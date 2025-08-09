const router = require("express").Router();
const {
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
} = require("../controller/authController");

const {
  createBattle,
  getBattles,
  getBattleById,
  joinBattle,
  startBattle,
  getUserBattles,
  submitSolution,
  debugBattle,
  leaveBattle
} = require("../controller/battleController");

const {
  verifyToken,
  upload,
  getProfile: getDetailedProfile,
  updateProfile: updateDetailedProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  deleteUserAccount
} = require("../controller/profileController");

router.get("/test", testRoute);
router.post("/register", register);
router.post("/login", login);
router.get("/profile", profile);
router.post("/logout", logout);
router.put("/profile", updateProfile);
router.delete("/account", deleteAccount);
// Forgot/reset password routes
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/validate", validateResetToken);
router.post("/reset-password", resetPassword);

// Profile routes (detailed profile management)
router.get("/user-profile", verifyToken, getDetailedProfile);
router.put("/user-profile", verifyToken, updateDetailedProfile);
router.post("/user-profile/picture", verifyToken, upload.single('profilePicture'), uploadProfilePicture);
router.delete("/user-profile/picture", verifyToken, deleteProfilePicture);
router.delete("/user-profile/account", verifyToken, deleteUserAccount);

// Battle routes
router.post("/battles", verifyToken, createBattle);
router.get("/battles", getBattles);
router.get("/battles/user", verifyToken, getUserBattles);
router.get("/battles/:id", getBattleById);
router.get("/battles/:id/debug", verifyToken, debugBattle);
router.post("/battles/:id/join", verifyToken, joinBattle);
router.post("/battles/:id/leave", verifyToken, leaveBattle);
router.post("/battles/:id/start", verifyToken, startBattle);
router.post("/battles/:battleId/problems/:problemId/submit", verifyToken, submitSolution);

module.exports = router;
