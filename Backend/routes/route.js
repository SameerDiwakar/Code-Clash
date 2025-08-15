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
  runCode,
  debugBattle,
  leaveBattle,
  deleteBattle
} = require("../controller/battleController");

const {
  runCode: runCodeGeneral,
  submitSolution: submitSolutionGeneral,
  getSubmissionStatus,
  getSupportedLanguages
} = require("../controller/codeExecution");

const { generateHiddenTests } = require("../controller/testGeneration");

const {
  verifyToken,
  upload,
  getProfile: getDetailedProfile,
  updateProfile: updateDetailedProfile,
  uploadProfilePicture,
  getProfilePicture,
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
router.get("/user-profile/picture", verifyToken, getProfilePicture);
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
router.post("/battles/:battleId/problems/:problemId/run", verifyToken, runCode);
router.post("/battles/:battleId/problems/:problemId/submit", verifyToken, submitSolution);
router.delete("/battles/:id", verifyToken, deleteBattle);

// General code execution endpoints (Piston-backed)
router.post("/run", runCodeGeneral);
router.post("/submit", verifyToken, submitSolutionGeneral);
router.get("/submission-status/:challengeId", verifyToken, getSubmissionStatus);
router.get("/languages", getSupportedLanguages);

// Hidden test generation (LLM-backed)
router.post("/tests/generate", verifyToken, generateHiddenTests);

module.exports = router;
