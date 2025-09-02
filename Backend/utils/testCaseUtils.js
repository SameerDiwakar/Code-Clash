/**
 * Utility functions for handling test cases
 */

/**
 * Normalizes test case input to ensure consistent format
 * @param {Object|string} testCase - The test case to normalize
 * @returns {Object} Normalized test case with input and expectedOutput
 */
function normalizeTestCase(testCase) {
  if (!testCase) {
    return { input: '', expectedOutput: '' };
  }

  // If it's a string, try to parse it as JSON
  if (typeof testCase === 'string') {
    try {
      testCase = JSON.parse(testCase);
    } catch (e) {
      // If not valid JSON, treat as raw input
      return { input: testCase, expectedOutput: '' };
    }
  }

  // Handle different property names
  const input = testCase.input ?? testCase.Input ?? testCase.in ?? testCase.testInput ?? '';
  const expectedOutput = testCase.expectedOutput ?? testCase.ExpectedOutput ?? 
                        testCase.output ?? testCase.Output ?? testCase.out ?? testCase.expected ?? '';

  // Ensure input and output are strings
  return {
    input: typeof input === 'object' ? JSON.stringify(input) : String(input || ''),
    expectedOutput: typeof expectedOutput === 'object' ? JSON.stringify(expectedOutput) : String(expectedOutput || '')
  };
}

/**
 * Validates test cases and ensures they're in the correct format
 * @param {Array<Object|string>} testCases - Array of test cases to validate
 * @returns {Array<Object>} Array of normalized test cases
 */
function validateAndNormalizeTestCases(testCases) {
  if (!Array.isArray(testCases)) {
    throw new Error('Test cases must be provided as an array');
  }

  if (testCases.length === 0) {
    throw new Error('At least one test case is required');
  }

  return testCases.map(normalizeTestCase);
}

/**
 * Prepares test cases for execution
 * @param {Array<Object>} testCases - Array of test cases
 * @returns {Object} Object containing inputs and expectedOutputs arrays
 */
function prepareTestCasesForExecution(testCases) {
  const normalizedTestCases = validateAndNormalizeTestCases(testCases);
  
  return {
    inputs: normalizedTestCases.map(tc => tc.input),
    expectedOutputs: normalizedTestCases.map(tc => tc.expectedOutput),
    normalizedTestCases
  };
}

module.exports = {
  normalizeTestCase,
  validateAndNormalizeTestCases,
  prepareTestCasesForExecution
};
