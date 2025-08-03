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
  submitSolution
} = require("../controller/battleController");

const {
  verifyToken,
  upload,
  getProfile: getDetailedProfile,
  updateProfile: updateDetailedProfile,
  uploadProfilePicture,
  deleteProfilePicture
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

// Battle routes
router.post("/battles", createBattle);
router.get("/battles", getBattles);
router.get("/battles/user", getUserBattles);
router.get("/battles/:id", getBattleById);
router.post("/battles/:id/join", joinBattle);
router.post("/battles/:id/start", startBattle);
router.post("/battles/:battleId/problems/:problemId/submit", submitSolution);

module.exports = router;
