// Aggregate controller exports for code execution domain

// Legacy functions still in codeExecution.js
const {
  runCode,
  submitSolution,
  getSubmissionStatus,
  getSupportedLanguages,
  verifySolution,
} = require('../codeExecution');

// New modular controllers
const { generateProblemBoilerplate } = require('./boilerplate');

module.exports = {
  runCode,
  submitSolution,
  getSubmissionStatus,
  getSupportedLanguages,
  verifySolution,
  generateProblemBoilerplate,
};
