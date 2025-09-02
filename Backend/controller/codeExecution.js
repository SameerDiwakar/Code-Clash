const axios = require('axios');
const mongoose = require('mongoose');
const TestCase = require('../models/testCase');
const Submission = require('../models/submission');
const User = require('../models/user');
const { 
  SIMPLE_BOILERPLATES, 
  LANGUAGE_VERSIONS 
} = require('./leetcodeTemplates');
const { prepareTestCasesForExecution } = require('../utils/testCaseUtils');

// Piston API configuration
const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston/execute';

// Security limits
const EXECUTION_LIMITS = {
  timeout: 10000,      // 10 seconds
  memory: 128 * 1024,  // 128 MB
  processes: 64,
  files: 32
};

/**
 * Get appropriate filename for the language
 */
function getFileName(language) {
  const extensions = {
    'python': 'main.py',
    'javascript': 'main.js',
    'c++': 'main.cpp',
    'java': 'Main.java'
  };
  return extensions[language] || 'main.txt';
}

/**
 * Get simple boilerplate with warning message
 * GET /api/languages/:language/boilerplate
 */
const getSimpleBoilerplate = async (req, res) => {
  try {
    const { language } = req.params;
    
    if (!SIMPLE_BOILERPLATES[language]) {
      return res.status(400).json({ 
        error: `Unsupported language: ${language}. Supported: ${Object.keys(SIMPLE_BOILERPLATES).join(', ')}` 
      });
    }
    
    res.json({
      language,
      version: LANGUAGE_VERSIONS[language] || 'latest',
      boilerplate: SIMPLE_BOILERPLATES[language],
      warning: "⚠️ IMPORTANT: Modify the function signature according to your problem requirements"
    });
    
  } catch (error) {
    console.error('Get boilerplate error:', error);
    res.status(500).json({ error: 'Failed to fetch boilerplate' });
  }
};

/**
 * Run code with test cases
 * POST /api/run
 */
const runCode = async (req, res) => {
  try {
    const { code, language, testCases = [] } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    if (!LANGUAGE_VERSIONS[language]) {
      return res.status(400).json({ 
        error: `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_VERSIONS).join(', ')}` 
      });
    }
    
    // Prepare test inputs and expected outputs
    const inputs = testCases.map(tc => tc.input || '');
    const expectedOutputs = testCases.map(tc => tc.expectedOutput || tc.output || '');
    
    // Generate execution arguments
    const inputsArg = JSON.stringify(inputs);
    const expectedArg = JSON.stringify(expectedOutputs);
    
    // Prepare execution request
    const pistonRequest = {
      language: language === 'cpp' ? 'c++' : language,
      version: LANGUAGE_VERSIONS[language === 'cpp' ? 'cpp' : language],
      files: [{
        name: getFileName(language),
        content: code
      }],
      args: [inputsArg, expectedArg],
      stdin: '',
      compile_timeout: EXECUTION_LIMITS.timeout,
      run_timeout: EXECUTION_LIMITS.timeout,
      compile_memory_limit: EXECUTION_LIMITS.memory,
      run_memory_limit: EXECUTION_LIMITS.memory
    };
    
    // Execute via Piston
    const response = await axios.post(PISTON_API_URL, pistonRequest, {
      timeout: EXECUTION_LIMITS.timeout + 5000
    });
    
    const result = response.data;
    
    // Check for compilation errors
    if (result.compile?.stderr) {
      return res.json({
        success: false,
        output: {
          stdout: '',
          stderr: result.compile.stderr,
          compile_error: result.compile.stderr,
          success: false,
          testResults: testCases.map((tc, i) => ({
            testNumber: i + 1,
            passed: false,
            input: tc.input || '',
            expected: tc.expectedOutput || tc.output || '',
            output: '',
            error: 'Compilation Error'
          }))
        }
      });
    }
    
    // Parse execution results
    const stdout = result.run?.stdout || '';
    const stderr = result.run?.stderr || '';
    
    let testResults = [];
    
    if (stdout) {
      const lines = stdout.split('\n').filter(line => line.trim());
      
      testResults = lines.map((line, index) => {
        const match = line.match(/Test (\d+): (.+)/);
        if (match) {
          const testNum = parseInt(match[1]);
          const output = match[2];
          const isError = output.startsWith('ERROR');
          const actualOutput = isError ? '' : output;
          const error = isError ? output.replace('ERROR - ', '') : '';
          
          const expected = expectedOutputs[testNum - 1] || '';
          const passed = !isError && actualOutput.trim() === expected.trim();
          
          return {
            testNumber: testNum,
            passed,
            input: inputs[testNum - 1] || '',
            expected,
            output: actualOutput,
            error: error || (!passed && !isError ? 'Wrong Answer' : '')
          };
        }
        return null;
      }).filter(Boolean);
    }
    
    // Handle case where no test output was generated
    if (testResults.length === 0 && testCases.length > 0) {
      testResults = testCases.map((tc, i) => ({
        testNumber: i + 1,
        passed: false,
        input: tc.input || '',
        expected: tc.expectedOutput || tc.output || '',
        output: '',
        error: stderr || 'No output generated'
      }));
    }
    
    const hasErrors = testResults.some(t => !t.passed);
    
    res.json({
      success: !hasErrors && !stderr,
      output: {
        stdout,
        stderr,
        success: !hasErrors && !stderr,
        execution_time: result.run?.code === 0 ? 'Success' : 'Error',
        testResults
      }
    });
    
  } catch (error) {
    console.error('Run code error:', error);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'Code execution timed out',
        output: {
          stdout: '',
          stderr: 'Execution timed out after 10 seconds',
          success: false
        }
      });
    }
    
    res.status(500).json({
      error: 'Internal server error during code execution',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Submit solution against all test cases (including hidden ones)
 * POST /api/submit
 */
const submitSolution = async (req, res) => {
  try {
    const { 
      code, 
      language, 
      challengeId, 
      functionName = 'solve',
      isLeetCodeStyle = true 
    } = req.body;

    if (!code || !language || !challengeId) {
      return res.status(400).json({ error: 'Code, language, and challengeId are required' });
    }

    if (!LANGUAGE_VERSIONS[language]) {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    // Get test cases for this challenge
    const testCases = await TestCase.find({ challengeId });
    if (!testCases || testCases.length === 0) {
      return res.status(400).json({ 
        error: 'No test cases found for this challenge',
        details: 'Please ensure the challenge has valid test cases before submitting.'
      });
    }

    try {
      // Prepare test cases for execution
      const { inputs, expectedOutputs, normalizedTestCases } = prepareTestCasesForExecution(testCases);
      
      // Log processed test cases for debugging
      console.log('Processed test cases:', JSON.stringify(normalizedTestCases, null, 2));
      
      // Generate execution arguments
      const inputsArg = JSON.stringify(inputs);
      const expectedArg = JSON.stringify(expectedOutputs);
    
    // Prepare execution request
    const pistonRequest = {
      language: language === 'cpp' ? 'c++' : language,
      version: LANGUAGE_VERSIONS[language === 'cpp' ? 'cpp' : language],
      files: [{
        name: getFileName(language),
        content: code
      }],
      args: [inputsArg, expectedArg],
      stdin: '',
      compile_timeout: EXECUTION_LIMITS.timeout,
      run_timeout: EXECUTION_LIMITS.timeout,
      compile_memory_limit: EXECUTION_LIMITS.memory,
      run_memory_limit: EXECUTION_LIMITS.memory
    };
    
    // Execute via Piston
    const response = await axios.post(PISTON_API_URL, pistonRequest, {
      timeout: EXECUTION_LIMITS.timeout + 5000
    });
    
    const result = response.data;
    
    // Process results
    let passedCount = 0;
    let testResults = [];
    let executionTime = 0;
    let memoryUsed = 0;
    let status = 'Accepted';
    
    if (result.compile?.stderr) {
      // Compilation error
      status = 'Compilation Error';
      testResults = testCases.map((tc, i) => ({
        testCaseId: tc._id,
        passed: false,
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || '',
        actualOutput: '',
        executionTime: 0,
        memoryUsed: 0,
        error: result.compile.stderr
      }));
    } else {
      // Parse execution results
      const stdout = result.run?.stdout || '';
      const stderr = result.run?.stderr || '';
      executionTime = result.run?.time || 0;
      memoryUsed = result.run?.memory || 0;
      
      if (stderr) {
        status = 'Runtime Error';
      }
      
      // Parse test results from stdout
      const lines = stdout.split('\n').filter(line => line.trim());
      
      testResults = testCases.map((tc, i) => {
        const testLine = lines.find(line => line.includes(`Test ${i + 1}:`));
        let passed = false;
        let actualOutput = '';
        let error = '';
        
        if (testLine) {
          const match = testLine.match(/Test \d+: (.+)/);
          if (match) {
            const output = match[1];
            if (output.startsWith('ERROR')) {
              error = output.replace('ERROR - ', '');
              status = 'Runtime Error';
            } else {
              actualOutput = output;
              passed = actualOutput.trim() === (tc.expectedOutput || '').trim();
              if (!passed) status = 'Wrong Answer';
            }
          }
        } else {
          error = 'No output for this test case';
          status = 'Runtime Error';
        }
        
        if (passed) passedCount++;
        
        return {
          testCaseId: tc._id,
          passed,
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || '',
          actualOutput,
          executionTime: result.run?.time || 0,
          memoryUsed: result.run?.memory || 0,
          error
        };
      });
    }
    
    // Save submission to database
    const submission = new Submission({
      userId: req.userId,
      challengeId,
      code,
      language,
      status,
      results: testResults,
      totalTestCases: testCases.length,
      passedTestCases: passedCount,
      executionTime,
      memoryUsed
    });
    
    await submission.save();
    
    // Return results
    res.json({
      success: status === 'Accepted',
      submission: {
        _id: submission._id,
        status,
        totalTestCases: testCases.length,
        passedTestCases: passedCount,
        executionTime,
        memoryUsed,
        results: testResults.map(r => ({
          passed: r.passed,
          input: r.input,
          expectedOutput: r.expectedOutput,
          actualOutput: r.actualOutput,
          error: r.error
        }))
      }
    });
    
    } catch (innerError) {
      throw innerError;
    }
  } catch (error) {
    console.error('Submit solution error:', error);
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'Code execution timed out',
        details: 'The code took too long to execute'
      });
    }
    
    // Handle test case validation errors
    if (error.message.includes('Test cases must be provided') || 
        error.message.includes('At least one test case')) {
      return res.status(400).json({
        error: 'Invalid test cases',
        details: error.message
      });
    }
    
    res.status(500).json({
      error: 'Internal server error during submission',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
};

/**
 * List supported languages with versions
 * GET /api/languages
 */
const getSupportedLanguages = async (_req, res) => {
  try {
    const languages = Object.keys(LANGUAGE_VERSIONS).map(lang => ({
      id: lang,
      name: lang.charAt(0).toUpperCase() + lang.slice(1),
      version: LANGUAGE_VERSIONS[lang],
      defaultCode: SIMPLE_BOILERPLATES[lang] || ''
    }));
    
    res.json({ 
      success: true,
      data: {
        languages
      }
    });
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch supported languages',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Check submission status for a challenge
 * GET /api/submission-status/:challengeId
 */
const getSubmissionStatus = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(challengeId)) {
      return res.status(400).json({
        error: 'Invalid challengeId. Expected a 24-character hex ObjectId.'
      });
    }

    const submission = await Submission.findOne({ userId, challengeId });
    
    res.json({
      hasSubmitted: !!submission,
      submission: submission || null
    });

  } catch (error) {
    console.error('Get submission status error:', error);
    res.status(500).json({ error: 'Failed to check submission status' });
  }
};

// Verify solution against test cases (similar to submit but with different response format)
const verifySolution = async (req, res) => {
  try {
    const { code, language, testCases = [] } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({ error: 'At least one test case is required' });
    }
    
    // Use the existing submitSolution logic but format the response differently
    req.body = { ...req.body, challengeId: 'verification' };
    
    // Mock the response from submitSolution
    const mockRes = {
      json: (data) => {
        if (data.success) {
          return res.json({
            verified: true,
            results: data.submission.results.map(r => ({
              input: r.input,
              expected: r.expectedOutput,
              output: r.actualOutput,
              passed: r.passed
            }))
          });
        } else {
          return res.status(400).json({
            verified: false,
            error: data.error || 'Verification failed',
            results: data.submission?.results?.map(r => ({
              input: r.input,
              expected: r.expectedOutput,
              output: r.actualOutput,
              passed: r.passed,
              error: r.error
            })) || []
          });
        }
      },
      status: (code) => ({
        json: (data) => res.status(code).json(data)
      })
    };
    
    await submitSolution(req, mockRes);
    
  } catch (error) {
    console.error('Verify solution error:', error);
    res.status(500).json({
      verified: false,
      error: 'Internal server error during verification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  runCode,
  submitSolution,
  getSubmissionStatus,
  getSupportedLanguages,
  getSimpleBoilerplate,
  verifySolution
};
