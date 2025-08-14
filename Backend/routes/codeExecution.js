const express = require('express');
const router = express.Router();
const { runCode, submitSolution, getSubmissionStatus } = require('../controller/codeExecution');
const { verifyToken } = require('../middleware/auth');

// Run code with custom input (no authentication required for testing)
router.post('/run', runCode);

// Submit solution (requires authentication)
router.post('/submit', verifyToken, submitSolution);

// Check submission status for a challenge (requires authentication)
router.get('/submission-status/:challengeId', verifyToken, getSubmissionStatus);

module.exports = router;
