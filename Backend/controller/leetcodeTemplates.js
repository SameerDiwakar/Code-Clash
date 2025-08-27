/**
 * LeetCode-style execution templates that wrap user functions
 * and handle input/output conversion automatically
 */

// Template generators for each language
const LEETCODE_TEMPLATES = {
  python: (userCode, functionName, inputs, expectedOutputs) => {
    return `
import json
import sys
from typing import List, Dict, Any, Union, Optional

# User's solution code
${userCode}

def safe_parse_json(s: str) -> Any:
    """Safely parse JSON string, falling back to string if parsing fails."""
    if not isinstance(s, str):
        return s
    try:
        return json.loads(s)
    except (json.JSONDecodeError, TypeError):
        return s

def format_result(result: Any) -> str:
    """Format the result for consistent comparison."""
    if result is None:
        return 'null'
    if isinstance(result, (list, dict)):
        return json.dumps(result, separators=(',', ':'))
    return str(result)

# Test execution wrapper
def run_tests():
    inputs = ${JSON.stringify(inputs, null, 2)}
    expected = ${JSON.stringify(expectedOutputs, null, 2)}
    
    for i, (test_input, exp) in enumerate(zip(inputs, expected)):
        try:
            # Parse input arguments
            args = safe_parse_json(test_input)
            if not isinstance(args, list):
                args = [args]
            
            # Create solution instance and call function
            solution = Solution()
            result = getattr(solution, '${functionName}')(*args)
            
            # Convert result to string for comparison
            output = format_result(result)
            print(f"Test {i+1}: {output}")
            
        except Exception as e:
            error_msg = str(e).replace('\n', ' ').strip()
            print(f"Test {i+1}: ERROR - {error_msg}")

if __name__ == "__main__":
    run_tests()
`;
  },

  javascript: (userCode, functionName, inputs, expectedOutputs) => {
    return `
// User's solution code
${userCode}

/**
 * Safely parse JSON string, falling back to string if parsing fails
 * @param {string} str - The string to parse
 * @returns {any} The parsed value or original string
 */
function safeParseJson(str) {
    if (typeof str !== 'string') return str;
    try {
        return JSON.parse(str);
    } catch (e) {
        return str;
    }
}

/**
 * Format the result for consistent comparison
 * @param {any} result - The result to format
 * @returns {string} Formatted result string
 */
function formatResult(result) {
    if (result === null || result === undefined) return 'null';
    if (typeof result === 'object') {
        try {
            return JSON.stringify(result);
        } catch (e) {
            return String(result);
        }
    }
    return String(result);
}

// Test execution wrapper
function runTests() {
    const inputs = ${JSON.stringify(inputs, null, 2)};
    const expected = ${JSON.stringify(expectedOutputs, null, 2)};
    
    for (let i = 0; i < inputs.length; i++) {
        try {
            // Parse input arguments
            const testInput = safeParseJson(inputs[i]);
            const args = Array.isArray(testInput) ? testInput : [testInput];
            
            // Create solution instance and call function
            const solution = new Solution();
            const result = solution.${functionName}(...args);
            
            // Convert result to string for comparison
            const output = formatResult(result);
            console.log(\`Test \${i+1}: \${output.replace(/\\n/g, ' ').trim()}\`);
            
        } catch (e) {
            const errorMsg = (e.message || String(e)).replace(/\\n/g, ' ').trim();
            console.log(\`Test \${i+1}: ERROR - \${errorMsg}\`);
        }
    }
}

// Run the tests
runTests();
`;
  },

  java: (userCode, functionName, inputs, expectedOutputs) => {
    return `
import java.util.*;
import com.google.gson.*;

// User's solution code
${userCode}

public class Main {
    public static void main(String[] args) {
        String[] inputs = ${JSON.stringify(inputs)};
        String[] expected = ${JSON.stringify(expectedOutputs)};
        
        Gson gson = new Gson();
        Solution solution = new Solution();
        
        for (int i = 0; i < inputs.length; i++) {
            try {
                // Parse input arguments - this is simplified, real implementation would need type inference
                Object[] argsArray = gson.fromJson(inputs[i], Object[].class);
                
                // Call function via reflection (simplified - would need proper type handling)
                Object result = solution.getClass().getMethod("${functionName}", getParameterTypes(argsArray))
                    .invoke(solution, argsArray);
                
                String output = gson.toJson(result);
                System.out.println("Test " + (i+1) + ": " + output);
                
            } catch (Exception e) {
                System.out.println("Test " + (i+1) + ": ERROR - " + e.getMessage());
            }
        }
    }
    
    private static Class<?>[] getParameterTypes(Object[] args) {
        // Simplified type inference - would need more robust implementation
        Class<?>[] types = new Class<?>[args.length];
        for (int i = 0; i < args.length; i++) {
            types[i] = args[i].getClass();
        }
        return types;
    }
}
`;
  },

  cpp: (userCode, functionName, inputs, expectedOutputs) => {
    // Convert inputs to C++ vector initialization
    const formatTestCases = (arr) => {
      return arr.map(testCase => `{${testCase.join(',')}}`).join(',');
    };

    return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

class Solution {
public:
    // Your solution function
    // Example: int functionName(vector<int>& nums) {
    //     // Your code here
    //     return 0;
    // }
    ${userCode}
};

// Helper function to print test case results
void printTestCase(int testNum, const vector<int>& input, int result, int expected) {
    cout << "Test Case " << testNum + 1 << ":" << endl;
    cout << "Input: [";
    for (int i = 0; i < input.size(); i++) {
        if (i > 0) cout << ", ";
        cout << input[i];
    }
    cout << "]" << endl;
    cout << "Output: " << result << endl;
    cout << "Expected: " << expected << endl;
    cout << (result == expected ? "✓ Passed" : "✗ Failed") << "\n\n";
}

int main() {
    Solution sol;
    
    // Test cases
    vector<vector<int>> testCases = {
        ${formatTestCases(inputs.map(JSON.parse))}
    };
    
    // Expected results
    vector<int> expected = {${expectedOutputs.join(',')}};
    
    // Run test cases
    for (int i = 0; i < testCases.size(); i++) {
        int result = sol.${functionName}(testCases[i]);
        printTestCase(i, testCases[i], result, expected[i]);
    }
    
    return 0;
}`;
  }
};

// LeetCode-style boilerplate for each language
const LEETCODE_BOILERPLATE = {
  python: (functionName = 'twoSum', returnType = 'List[int]', params = 'nums: List[int], target: int') => {
    return `class Solution:
    def ${functionName}(self, ${params}) -> ${returnType}:
        # TODO: Implement your solution here
        pass
`;
  },

  javascript: (functionName = 'twoSum', params = 'nums, target') => {
    return `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var Solution = function() {};

Solution.prototype.${functionName} = function(${params}) {
    // TODO: Implement your solution here
    
};
`;
  },

  java: (functionName = 'twoSum', returnType = 'int[]', params = 'int[] nums, int target') => {
    return `class Solution {
    public ${returnType} ${functionName}(${params}) {
        // TODO: Implement your solution here
        
    }
}
`;
  },

  cpp: () => {
    return ''; // Completely blank editor
  }
};

/**
 * Generate executable code by wrapping user's function-based solution
 * with input/output handling template
 */
const generateLeetCodeExecution = (language, userCode, functionName, inputs, expectedOutputs) => {
  // Map language to the correct template key
  const templateKey = language === 'c++' ? 'cpp' : language;
  const template = LEETCODE_TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`Unsupported language for LeetCode execution: ${language}`);
  }
  return template(userCode, functionName, inputs, expectedOutputs);
};

/**
 * Generate LeetCode-style boilerplate for a given problem
 */
const generateLeetCodeBoilerplate = (language, problemConfig = {}) => {
  const {
    functionName = 'solve',
    params = 'n',
    returnType = 'any',
    className = 'Solution'
  } = problemConfig;

  // Map language to the correct template key
  const templateKey = language === 'c++' ? 'cpp' : language;
  const template = LEETCODE_BOILERPLATE[templateKey];
  if (!template) {
    throw new Error(`Unsupported language for LeetCode boilerplate: ${language}`);
  }
  return template(functionName, returnType, params, className);
};

/**
 * Parse test case input/output for LeetCode-style execution
 * Converts string-based test cases to structured arguments
 */
function parseLeetCodeTestCase(input, output) {
  // Ensure input is a string
  const inputStr = typeof input === 'string' ? input.trim() : JSON.stringify(input);
  const outputStr = typeof output === 'string' ? output.trim() : JSON.stringify(output);
  
  try {
    // Parse input and output as JSON
    let parsedInput, parsedOutput;
    
    try {
      parsedInput = JSON.parse(inputStr);
    } catch (e) {
      // If parsing fails, treat as a string
      parsedInput = inputStr;
    }
    
    try {
      parsedOutput = JSON.parse(outputStr);
    } catch (e) {
      // If parsing fails, treat as a string
      parsedOutput = outputStr;
    }
    
    // Convert to array if not already
    const inputArray = Array.isArray(parsedInput) ? parsedInput : [parsedInput];
    
    return {
      input: inputArray,
      output: parsedOutput,
      inputString: inputStr,
      outputString: outputStr
    };
  } catch (e) {
    console.error('Error parsing test case:', e);
    // Fallback to raw values
    return {
      input: [inputStr],
      output: outputStr,
      inputString: inputStr,
      outputString: outputStr,
      error: e.message
    };
  }
}

// Simple boilerplate code for each language
const SIMPLE_BOILERPLATES = {
  'python': `def solve():
    # Write your code here
    pass`,
  
  'javascript': `function solve() {
    // Write your code here
}`,
  
  'java': `public class Solution {
    public void solve() {
        // Write your code here
    }
}`,
  
  'cpp': `#include <iostream>
using namespace std;

void solve() {
    // Write your code here
}`,
  
  'c': `#include <stdio.h>

void solve() {
    // Write your code here
}`
};

// Language versions
const LANGUAGE_VERSIONS = {
  'python': '3.10.0',
  'javascript': '18.15.0',
  'java': '15.0.2',
  'cpp': '10.2.0',
  'c': '10.2.0',
  'csharp': '6.12.0',
  'php': '8.2.3',
  'ruby': '3.2.2',
  'swift': '5.3.3',
  'go': '1.18.0',
  'scala': '3.2.2',
  'kotlin': '1.8.0',
  'rust': '1.68.2',
  'typescript': '5.0.3'
};

module.exports = {
  generateLeetCodeExecution,
  generateLeetCodeBoilerplate,
  parseLeetCodeTestCase,
  LEETCODE_TEMPLATES,
  LEETCODE_BOILERPLATE,
  SIMPLE_BOILERPLATES,
  LANGUAGE_VERSIONS
};
