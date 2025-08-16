const axios = require('axios');
const mongoose = require('mongoose');
const TestCase = require('../models/testCase');
const Submission = require('../models/submission');
const User = require('../models/user');
const { generateLeetCodeExecution, parseLeetCodeTestCase, generateLeetCodeBoilerplate } = require('./leetcodeTemplates');

// Piston API configuration
// Prefer env override; fallback to public EMKC Piston execute endpoint
const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston/execute';

// Language version mapping for Piston API (restricted to cpp, javascript, java, python3)
const LANGUAGE_VERSIONS = {
  python3: '3.10.0',
  javascript: '18.15.0',
  cpp: '10.2.0',
  java: '15.0.2'
};

/**
 * Verify solution against ALL test cases (hidden + public) without saving
 * POST /api/verify
 * Supports LeetCode-style function execution
 */
const verifySolution = async (req, res) => {
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

    // Validate challengeId format
    if (!mongoose.Types.ObjectId.isValid(challengeId)) {
      return res.status(400).json({ error: 'Invalid challengeId. Expected a 24-character hex ObjectId.' });
    }

    // Fetch all test cases for this challenge (hidden and public)
    const testCases = await TestCase.find({ challengeId });
    if (testCases.length === 0) {
      return res.status(404).json({ error: 'No test cases found for this challenge' });
    }

    const results = [];
    let passedCount = 0;
    let totalExecutionTime = 0;
    let peakMemoryUsage = 0;
    let overallStatus = 'Accepted';

    // Execute code against all test cases
    let finalCode = code;
    
    if (isLeetCodeStyle) {
      try {
        const inputs = testCases.map(tc => tc.input || '');
        const expectedOutputs = testCases.map(tc => tc.expectedOutput || '');
        
        finalCode = generateLeetCodeExecution(language, code, functionName, inputs, expectedOutputs);
      } catch (templateError) {
        return res.status(400).json({
          error: `LeetCode template generation failed: ${templateError.message}`
        });
      }
    }

    try {
      const pistonRequest = {
        language,
        version: LANGUAGE_VERSIONS[language],
        files: [{ name: getFileName(language), content: finalCode }],
        stdin: '', // No stdin for LeetCode style
        compile_timeout: EXECUTION_LIMITS.timeout,
        run_timeout: EXECUTION_LIMITS.timeout,
        compile_memory_limit: EXECUTION_LIMITS.memory,
        run_memory_limit: EXECUTION_LIMITS.memory
      };

      const response = await axios.post(PISTON_API_URL, pistonRequest, {
        timeout: EXECUTION_LIMITS.timeout + 5000
      });

      const result = response.data;
      
      if (result.compile?.stderr) {
        overallStatus = 'Compilation Error';
        // Return compilation error for all test cases
        testCases.forEach((testCase, index) => {
          results.push({
            testCaseId: testCase._id,
            isHidden: !!testCase.isHidden,
            passed: false,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            status: 'Compilation Error',
            executionTime: 0,
            memoryUsed: 0,
            error: result.compile.stderr
          });
        });
      } else if (isLeetCodeStyle) {
        // Parse LeetCode-style output
        const stdout = result.run?.stdout || '';
        const lines = stdout.split('\n').filter(line => line.trim());
        
        testCases.forEach((testCase, index) => {
          const testLine = lines.find(line => line.includes(`Test ${index + 1}:`));
          let passed = false;
          let actualOutput = '';
          let error = '';
          let testStatus = 'Wrong Answer';
          
          if (testLine) {
            const match = testLine.match(/Test \d+: (.+)/);
            if (match) {
              const output = match[1];
              if (output.startsWith('ERROR')) {
                error = output.replace('ERROR - ', '');
                testStatus = 'Runtime Error';
                if (overallStatus === 'Accepted') overallStatus = 'Runtime Error';
              } else {
                actualOutput = output;
                const expectedOutput = testCase.expectedOutput.trim();
                passed = actualOutput === expectedOutput;
                if (passed) {
                  passedCount++;
                  testStatus = 'Accepted';
                } else {
                  if (overallStatus === 'Accepted') overallStatus = 'Wrong Answer';
                }
              }
            }
          } else {
            error = 'No output for this test case';
            testStatus = 'Runtime Error';
            if (overallStatus === 'Accepted') overallStatus = 'Runtime Error';
          }

          results.push({
            testCaseId: testCase._id,
            isHidden: !!testCase.isHidden,
            passed,
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput,
            status: testStatus,
            executionTime: result.run?.time || 0,
            memoryUsed: result.run?.memory || 0,
            error
          });
        });
        
        totalExecutionTime = result.run?.time || 0;
        peakMemoryUsage = result.run?.memory || 0;
      }
      
    } catch (executionError) {
      console.error('Execution error:', executionError);
      overallStatus = 'Runtime Error';
      
      testCases.forEach(testCase => {
        results.push({
          testCaseId: testCase._id,
          isHidden: !!testCase.isHidden,
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          status: 'Runtime Error',
          executionTime: 0,
          memoryUsed: 0,
          error: executionError.message || 'Execution failed'
        });
      });
    }

    return res.json({
      success: true,
      verification: {
        status: overallStatus,
        totalTestCases: testCases.length,
        passedTestCases: passedCount,
        results: results.map(r => ({
          testCaseId: r.testCaseId,
          isHidden: r.isHidden,
          passed: r.passed,
          input: r.input,
          expectedOutput: r.expectedOutput,
          actualOutput: r.actualOutput,
          status: r.status,
          error: r.error
        })),
        executionTime: totalExecutionTime,
        memoryUsed: peakMemoryUsage
      }
    });
  } catch (error) {
    console.error('Verify solution error:', error);
    return res.status(500).json({ error: 'Internal server error during verification' });
  }
};

// Boilerplate code templates for each language
const BOILERPLATE = {
  python3: `# Python 3
def solve():
    # Read input
    data = input().strip()
    # TODO: implement
    print(data)

if __name__ == "__main__":
    solve()
`,
  javascript: `// Node.js (JavaScript)
// Read all stdin then process
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  input = input.trim();
  // TODO: implement
  console.log(input);
});
`,
  typescript: `// TypeScript (ts-node)
import * as fs from 'fs';
const input = fs.readFileSync(0, 'utf8').trim();
// TODO: implement
console.log(input);
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
  c: `// C (GCC)
#include <stdio.h>
int main(){
    char s[10005];
    if(!fgets(s, sizeof(s), stdin)) return 0;
    // TODO: implement
    printf("%s", s);
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
`,
  go: `// Go
package main
import (
  "bufio"
  "fmt"
  "os"
)
func main(){
  in := bufio.NewReader(os.Stdin)
  s, _ := in.ReadString('\n')
  // TODO: implement
  fmt.Print(s)
}
`,
  rust: `// Rust
use std::io::{self, Read};
fn main(){
  let mut input = String::new();
  io::stdin().read_to_string(&mut input).unwrap();
  // TODO: implement
  print!("{}", input);
}
`,
  csharp: `// C#
using System;
class Program { static void Main(){
  string s = Console.ReadLine();
  // TODO: implement
  Console.WriteLine(s);
}}
`,
  php: `<?php
// PHP
$input = trim(stream_get_contents(STDIN));
// TODO: implement
echo $input, "\n";
`,
  ruby: `# Ruby
input = STDIN.read.strip
# TODO: implement
puts input
`,
  kotlin: `// Kotlin
import java.io.BufferedReader
import java.io.InputStreamReader
fun main(){
  val br = BufferedReader(InputStreamReader(System.\`in\`))
  val s = br.readLine()
  // TODO: implement
  println(s)
}
`,
  swift: `// Swift
import Foundation
if let line = readLine(){
  // TODO: implement
  print(line)
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
 * Supports both LeetCode-style function execution and traditional stdin/stdout
 */
const runCode = async (req, res) => {
  try {
    const { 
      code, 
      language, 
      customInput = '', 
      testCases = [],
      functionName = 'solve',
      isLeetCodeStyle = false 
    } = req.body;

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

    let finalCode = code;
    let stdin = customInput;

    // Handle LeetCode-style execution
    if (isLeetCodeStyle && testCases.length > 0) {
      try {
        const inputs = testCases.map(tc => tc.input || '');
        const expectedOutputs = testCases.map(tc => tc.output || '');
        
        finalCode = generateLeetCodeExecution(language, code, functionName, inputs, expectedOutputs);
        stdin = ''; // No stdin needed for function-based execution
      } catch (templateError) {
        return res.status(400).json({
          error: `LeetCode template generation failed: ${templateError.message}`
        });
      }
    }

    // Prepare Piston API request
    const pistonRequest = {
      language: language,
      version: LANGUAGE_VERSIONS[language],
      files: [{
        name: getFileName(language),
        content: finalCode
      }],
      stdin: stdin,
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
      execution_time: result.run?.code === 0 ? 'Success' : 'Error',
      isLeetCodeStyle: isLeetCodeStyle
    };

    // Parse LeetCode-style output if applicable
    if (isLeetCodeStyle && output.success) {
      const lines = output.stdout.split('\n').filter(line => line.trim());
      output.testResults = lines.map((line, index) => {
        const match = line.match(/Test (\d+): (.+)/);
        if (match) {
          const testNum = parseInt(match[1]);
          const result = match[2];
          const isError = result.startsWith('ERROR');
          
          return {
            testNumber: testNum,
            passed: !isError,
            output: isError ? result.replace('ERROR - ', '') : result,
            expected: testCases[index]?.output || '',
            error: isError ? result.replace('ERROR - ', '') : null
          };
        }
        return null;
      }).filter(Boolean);
    }

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
 * Now supports LeetCode-style function execution (default)
 */
const submitSolution = async (req, res) => {
  try {
    const { code, language, challengeId, functionName = 'solve', isLeetCodeStyle = true } = req.body;
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

    // Validate challengeId format
    if (!mongoose.Types.ObjectId.isValid(challengeId)) {
      return res.status(400).json({
        error: 'Invalid challengeId. Expected a 24-character hex ObjectId.'
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

    const results = [];
    let passedCount = 0;
    let totalExecutionTime = 0;
    let peakMemoryUsage = 0;
    let overallStatus = 'Accepted';

    // Consolidated execution using LeetCode wrapper for performance and parity
    let finalCode = code;
    let consolidated = false;
    if (isLeetCodeStyle) {
      try {
        const inputs = testCases.map(tc => tc.input || '');
        const expectedOutputs = testCases.map(tc => tc.expectedOutput || '');
        finalCode = generateLeetCodeExecution(language, code, functionName, inputs, expectedOutputs);
        consolidated = true;
      } catch (templateError) {
        return res.status(400).json({ error: `LeetCode template generation failed: ${templateError.message}` });
      }
    }

    if (consolidated) {
      // Single run, then parse per-test results
      try {
        const pistonRequest = {
          language,
          version: LANGUAGE_VERSIONS[language],
          files: [{ name: getFileName(language), content: finalCode }],
          stdin: '',
          compile_timeout: EXECUTION_LIMITS.timeout,
          run_timeout: EXECUTION_LIMITS.timeout,
          compile_memory_limit: EXECUTION_LIMITS.memory,
          run_memory_limit: EXECUTION_LIMITS.memory
        };

        const response = await axios.post(PISTON_API_URL, pistonRequest, {
          timeout: EXECUTION_LIMITS.timeout + 5000
        });

        const result = response.data;
        if (result.compile?.stderr) {
          overallStatus = 'Compilation Error';
          testCases.forEach(tc => results.push({
            testCaseId: tc._id,
            passed: false,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            actualOutput: '',
            executionTime: 0,
            memoryUsed: 0,
            error: result.compile.stderr
          }));
        } else {
          const stdout = result.run?.stdout || '';
          const lines = stdout.split('\n').filter(line => line.trim());
          testCases.forEach((tc, index) => {
            const testLine = lines.find(line => line.includes(`Test ${index + 1}:`));
            let passed = false;
            let actualOutput = '';
            let error = '';
            if (testLine) {
              const m = testLine.match(/Test \d+: (.+)/);
              if (m) {
                const out = m[1];
                if (out.startsWith('ERROR')) {
                  error = out.replace('ERROR - ', '');
                } else {
                  actualOutput = out;
                  passed = actualOutput === tc.expectedOutput.trim();
                }
              }
            } else {
              error = 'No output for this test case';
            }
            if (passed) passedCount++; else if (overallStatus === 'Accepted') overallStatus = error ? 'Runtime Error' : 'Wrong Answer';
            results.push({
              testCaseId: tc._id,
              passed,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              actualOutput,
              executionTime: result.run?.time || 0,
              memoryUsed: result.run?.memory || 0,
              error
            });
          });
          totalExecutionTime = result.run?.time || 0;
          peakMemoryUsage = result.run?.memory || 0;
        }
      } catch (e) {
        overallStatus = 'Runtime Error';
        testCases.forEach(tc => results.push({
          testCaseId: tc._id,
          passed: false,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: '',
          executionTime: 0,
          memoryUsed: 0,
          error: e.message || 'Execution failed'
        }));
      }
    } else {
      // Fallback: legacy per-test stdin execution
      for (const testCase of testCases) {
        try {
          const pistonRequest = {
            language,
            version: LANGUAGE_VERSIONS[language],
            files: [{ name: getFileName(language), content: code }],
            stdin: testCase.input,
            compile_timeout: testCase.timeLimit || EXECUTION_LIMITS.timeout,
            run_timeout: testCase.timeLimit || EXECUTION_LIMITS.timeout,
            compile_memory_limit: (testCase.memoryLimit || 128) * 1024,
            run_memory_limit: (testCase.memoryLimit || 128) * 1024
          };
          const response = await axios.post(PISTON_API_URL, pistonRequest, { timeout: (testCase.timeLimit || EXECUTION_LIMITS.timeout) + 5000 });
          const result = response.data;
          const actualOutput = (result.run?.stdout || '').trim();
          const expectedOutput = testCase.expectedOutput.trim();
          const passed = actualOutput === expectedOutput;
          if (passed) passedCount++;
          let testStatus = 'Accepted';
          if (result.compile?.stderr) { testStatus = 'Compilation Error'; overallStatus = 'Compilation Error'; }
          else if (result.run?.stderr) { testStatus = 'Runtime Error'; if (overallStatus === 'Accepted') overallStatus = 'Runtime Error'; }
          else if (!passed) { testStatus = 'Wrong Answer'; if (overallStatus === 'Accepted') overallStatus = 'Wrong Answer'; }
          const executionTime = result.run?.time || 0;
          totalExecutionTime += executionTime;
          peakMemoryUsage = Math.max(peakMemoryUsage, result.run?.memory || 0);
          results.push({ testCaseId: testCase._id, passed, input: testCase.input, expectedOutput: testCase.expectedOutput, actualOutput, executionTime, memoryUsed: result.run?.memory || 0, error: result.compile?.stderr || result.run?.stderr || '' });
        } catch (testError) {
          let errorStatus = 'Runtime Error';
          let errorMessage = 'Unknown execution error';
          if (testError.code === 'ECONNABORTED') { errorStatus = 'Time Limit Exceeded'; errorMessage = 'Code execution timed out'; }
          results.push({ testCaseId: testCase._id, passed: false, input: testCase.input, expectedOutput: testCase.expectedOutput, actualOutput: '', executionTime: testCase.timeLimit || EXECUTION_LIMITS.timeout, memoryUsed: 0, error: errorMessage });
          overallStatus = errorStatus;
        }
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
    typescript: 'main.ts',
    cpp: 'main.cpp',
    c: 'main.c',
    java: 'Main.java',
    go: 'main.go',
    rust: 'main.rs',
    csharp: 'Main.cs',
    php: 'main.php',
    ruby: 'main.rb',
    kotlin: 'Main.kt',
    swift: 'main.swift'
  };
  return extensions[language] || 'main.txt';
}

/**
 * List supported languages with versions and boilerplate
 * GET /api/languages
 */
const getSupportedLanguages = async (_req, res) => {
  const languages = Object.keys(LANGUAGE_VERSIONS).map((key) => {
    // Try to generate LeetCode-style boilerplate for each language
    let lc = '';
    try {
      if (key === 'python3') lc = generateLeetCodeBoilerplate('python3', { functionName: 'solve', returnType: 'int', params: 'n: int' });
      else if (key === 'javascript') lc = generateLeetCodeBoilerplate('javascript', { functionName: 'solve', params: 'n' });
      else if (key === 'java') lc = generateLeetCodeBoilerplate('java', { functionName: 'solve', returnType: 'int', params: 'int n' });
      else if (key === 'cpp') lc = generateLeetCodeBoilerplate('cpp', { functionName: 'solve', returnType: 'int', params: 'int n' });
    } catch {}

    return {
      id: key,
      version: LANGUAGE_VERSIONS[key],
      // Only return LeetCode-style boilerplate; do not fallback to stdin templates
      boilerplate: lc,
      leetcodeBoilerplate: lc
    };
  });
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
    res.status(500).json({
      error: 'Failed to check submission status'
    });
  }
};

module.exports = {
  runCode,
  submitSolution,
  getSubmissionStatus,
  getSupportedLanguages,
  verifySolution
};
