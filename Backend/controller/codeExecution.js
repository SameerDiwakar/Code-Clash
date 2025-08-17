const axios = require('axios');
const TestCase = require('../models/testCase');
const Submission = require('../models/submission');
const User = require('../models/user');

// Piston API configuration
const PISTON_API_URL = 'http://localhost:2000/api/v2/execute';

// Language version mapping for Piston API (restricted to four languages)
const LANGUAGE_VERSIONS = {
  python3: '3.10.0',
  javascript: '18.15.0',
  cpp: '10.2.0',
  java: '15.0.2'
};

// Boilerplate code templates (restricted)
const BOILERPLATE = {
  python3: `# Python 3
def solve():
    data = input().strip()
    # TODO: implement
    print(data)

if __name__ == "__main__":
    solve()
`,
  javascript: `// Node.js (JavaScript)
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  input = input.trim();
  // TODO: implement
  console.log(input);
});
`,
  cpp: `// C++17
#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s; if(!getline(cin, s)) return 0;
    // TODO: implement
    cout << s << "\n";
    return 0;
}
`,
  java: `// Java
import java.io.*;
public class Main {
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    String s = br.readLine();
    // TODO: implement
    System.out.println(s);
  }
}
`
};

// Security limits for code execution
const EXECUTION_LIMITS = {
  timeout: 10000,      // 10 seconds max execution time
  memory: 128 * 1024,  // 128 MB memory limit
  processes: 64,       // Max processes
  files: 32           // Max files
};

/**
 * Run user code with custom input (no DB storage)
 * POST /api/run
 */
const runCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    // Validation
    if (!code || !language) {
      return res.status(400).json({
        error: 'Code and language are required'
      });
    }

    if (!LANGUAGE_VERSIONS[language]) {
      return res.status(400).json({
        error: `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_VERSIONS).join(', ')}`
      });
    }

    // Prepare Piston API request
    const pistonRequest = {
      language: language,
      version: LANGUAGE_VERSIONS[language],
      files: [{
        name: getFileName(language),
        content: code
      }],
      stdin: '',
      compile_timeout: EXECUTION_LIMITS.timeout,
      run_timeout: EXECUTION_LIMITS.timeout,
      compile_memory_limit: EXECUTION_LIMITS.memory,
      run_memory_limit: EXECUTION_LIMITS.memory
    };

    // Execute code via Piston API
    const response = await axios.post(PISTON_API_URL, pistonRequest, {
      timeout: EXECUTION_LIMITS.timeout + 5000 // Add buffer for network
    });

    const result = response.data;

    // Format response for frontend
    const output = {
      stdout: result.run?.stdout || '',
      stderr: result.run?.stderr || '',
      compile_output: result.compile?.stdout || '',
      compile_error: result.compile?.stderr || '',
      success: !result.run?.stderr && !result.compile?.stderr,
      execution_time: result.run?.code === 0 ? 'Success' : 'Error'
    };

    res.json({
      success: true,
      output
    });

  } catch (error) {
    console.error('Run code error:', error);
    
    // Handle timeout errors
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

    // Handle Piston API errors
    if (error.response?.data) {
      return res.status(400).json({
        error: 'Code execution failed',
        output: {
          stdout: '',
          stderr: error.response.data.message || 'Unknown execution error',
          success: false
        }
      });
    }

    res.status(500).json({
      error: 'Internal server error during code execution'
    });
  }
};

/**
 * Submit solution and run against hidden test cases
 * POST /api/submit
 */
const submitSolution = async (req, res) => {
  try {
    const { code, language, challengeId } = req.body;
    const userId = req.userId; // From auth middleware

    // Validation
    if (!code || !language || !challengeId) {
      return res.status(400).json({
        error: 'Code, language, and challengeId are required'
      });
    }

    if (!LANGUAGE_VERSIONS[language]) {
      return res.status(400).json({
        error: `Unsupported language: ${language}`
      });
    }

    // Check if user already submitted for this challenge
    const existingSubmission = await Submission.findOne({ userId, challengeId });
    if (existingSubmission) {
      return res.status(400).json({
        error: 'You have already submitted a solution for this challenge',
        submission: existingSubmission
      });
    }

    // Fetch hidden test cases for this challenge
    const testCases = await TestCase.find({ challengeId, isHidden: true });
    if (testCases.length === 0) {
      return res.status(404).json({
        error: 'No test cases found for this challenge'
      });
    }

    // Run code against each test case
    const results = [];
    let passedCount = 0;
    let totalExecutionTime = 0;
    let peakMemoryUsage = 0;
    let overallStatus = 'Accepted';

    for (const testCase of testCases) {
      try {
        const pistonRequest = {
          language: language,
          version: LANGUAGE_VERSIONS[language],
          files: [{
            name: getFileName(language),
            content: code
          }],
          stdin: testCase.input,
          compile_timeout: testCase.timeLimit || EXECUTION_LIMITS.timeout,
          run_timeout: testCase.timeLimit || EXECUTION_LIMITS.timeout,
          compile_memory_limit: (testCase.memoryLimit || 128) * 1024,
          run_memory_limit: (testCase.memoryLimit || 128) * 1024
        };

        const response = await axios.post(PISTON_API_URL, pistonRequest, {
          timeout: (testCase.timeLimit || EXECUTION_LIMITS.timeout) + 5000
        });

        const result = response.data;
        const actualOutput = (result.run?.stdout || '').trim();
        const expectedOutput = testCase.expectedOutput.trim();
        const passed = actualOutput === expectedOutput;

        if (passed) passedCount++;

        // Determine status for this test case
        let testStatus = 'Accepted';
        if (result.compile?.stderr) {
          testStatus = 'Compilation Error';
          overallStatus = 'Compilation Error';
        } else if (result.run?.stderr) {
          testStatus = 'Runtime Error';
          if (overallStatus === 'Accepted') overallStatus = 'Runtime Error';
        } else if (!passed) {
          testStatus = 'Wrong Answer';
          if (overallStatus === 'Accepted') overallStatus = 'Wrong Answer';
        }

        // Track execution metrics
        const executionTime = result.run?.time || 0;
        totalExecutionTime += executionTime;
        peakMemoryUsage = Math.max(peakMemoryUsage, result.run?.memory || 0);

        results.push({
          testCaseId: testCase._id,
          passed,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput,
          executionTime,
          memoryUsed: result.run?.memory || 0,
          error: result.compile?.stderr || result.run?.stderr || ''
        });

      } catch (testError) {
        console.error(`Test case execution error:`, testError);
        
        let errorStatus = 'Runtime Error';
        let errorMessage = 'Unknown execution error';

        if (testError.code === 'ECONNABORTED') {
          errorStatus = 'Time Limit Exceeded';
          errorMessage = 'Code execution timed out';
        }

        results.push({
          testCaseId: testCase._id,
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          executionTime: testCase.timeLimit || EXECUTION_LIMITS.timeout,
          memoryUsed: 0,
          error: errorMessage
        });

        overallStatus = errorStatus;
      }
    }

    // Create submission record
    const submission = new Submission({
      userId,
      challengeId,
      code,
      language,
      status: overallStatus,
      results,
      totalTestCases: testCases.length,
      passedTestCases: passedCount,
      executionTime: totalExecutionTime,
      memoryUsed: peakMemoryUsage
    });

    await submission.save();

    // Return results to frontend
    res.json({
      success: true,
      submission: {
        status: overallStatus,
        totalTestCases: testCases.length,
        passedTestCases: passedCount,
        results: results.map(r => ({
          passed: r.passed,
          input: r.input,
          expectedOutput: r.expectedOutput,
          actualOutput: r.actualOutput,
          error: r.error
        })),
        executionTime: totalExecutionTime,
        memoryUsed: peakMemoryUsage
      }
    });

  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({
      error: 'Internal server error during submission'
    });
  }
};

/**
 * Get appropriate filename for the language
 */
function getFileName(language) {
  const extensions = {
    python3: 'main.py',
    javascript: 'main.js',
    cpp: 'main.cpp',
    java: 'Main.java'
  };
  return extensions[language] || 'main.txt';
}

/**
 * List supported languages with versions and boilerplate
 * GET /api/languages
 */
const getSupportedLanguages = async (_req, res) => {
  const languages = Object.keys(LANGUAGE_VERSIONS).map((key) => ({
    id: key,
    version: LANGUAGE_VERSIONS[key],
    boilerplate: BOILERPLATE[key] || ''
  }));
  res.json({ languages });
};

/**
 * Check if user has already submitted for a challenge
 * GET /api/submission-status/:challengeId
 */
const getSubmissionStatus = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.userId;

    const submission = await Submission.findOne({ userId, challengeId });
    
    res.json({
      hasSubmitted: !!submission,
      submission: submission || null
    });

  } catch (error) {
    console.error('Get submission status error:', error);
    res.status(500).json({
      error: 'Failed to check submission status'
    });
  }
};

module.exports = {
  runCode,
  submitSolution,
  getSubmissionStatus,
  getSupportedLanguages
};
