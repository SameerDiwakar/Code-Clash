/**
 * LeetCode-style execution templates that wrap user functions
 * and handle input/output conversion automatically
 */

// Template generators for each language
const LEETCODE_TEMPLATES = {
  python3: (userCode, functionName, inputs, expectedOutputs) => {
    return `
import json
import sys

# User's solution code
${userCode}

# Test execution wrapper
def run_tests():
    inputs = ${JSON.stringify(inputs)}
    expected = ${JSON.stringify(expectedOutputs)}
    
    for i, test_input in enumerate(inputs):
        try:
            # Parse input arguments
            args = json.loads(test_input) if isinstance(test_input, str) else test_input
            if not isinstance(args, list):
                args = [args]
            
            # Create solution instance and call function
            solution = Solution()
            result = getattr(solution, '${functionName}')(*args)
            
            # Convert result to string for comparison
            output = json.dumps(result, separators=(',', ':')) if result is not None else 'null'
            print(f"Test {i+1}: {output}")
            
        except Exception as e:
            print(f"Test {i+1}: ERROR - {str(e)}")

if __name__ == "__main__":
    run_tests()
`;
  },

  javascript: (userCode, functionName, inputs, expectedOutputs) => {
    return `
// User's solution code
${userCode}

// Test execution wrapper
function runTests() {
    const inputs = ${JSON.stringify(inputs)};
    const expected = ${JSON.stringify(expectedOutputs)};
    
    for (let i = 0; i < inputs.length; i++) {
        try {
            // Parse input arguments
            let args = typeof inputs[i] === 'string' ? JSON.parse(inputs[i]) : inputs[i];
            if (!Array.isArray(args)) {
                args = [args];
            }
            
            // Create solution instance and call function
            const solution = new Solution();
            const result = solution.${functionName}(...args);
            
            // Convert result to string for comparison
            const output = JSON.stringify(result);
            console.log(\`Test \${i+1}: \${output}\`);
            
        } catch (e) {
            console.log(\`Test \${i+1}: ERROR - \${e.message}\`);
        }
    }
}

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
    return `
#include <bits/stdc++.h>
#include <nlohmann/json.hpp>
using namespace std;
using json = nlohmann::json;

// User's solution code
${userCode}

int main() {
    vector<string> inputs = ${JSON.stringify(inputs)};
    vector<string> expected = ${JSON.stringify(expectedOutputs)};
    
    Solution solution;
    
    for (int i = 0; i < inputs.size(); i++) {
        try {
            // Parse JSON input
            json inputJson = json::parse(inputs[i]);
            
            // Call function - this would need template specialization for different signatures
            auto result = solution.${functionName}(inputJson);
            
            json outputJson = result;
            cout << "Test " << (i+1) << ": " << outputJson.dump() << endl;
            
        } catch (const exception& e) {
            cout << "Test " << (i+1) << ": ERROR - " << e.what() << endl;
        }
    }
    
    return 0;
}
`;
  }
};

// LeetCode-style boilerplate for each language
const LEETCODE_BOILERPLATE = {
  python3: (functionName = 'twoSum', returnType = 'List[int]', params = 'nums: List[int], target: int') => {
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

  cpp: (functionName = 'twoSum', returnType = 'vector<int>', params = 'vector<int>& nums, int target') => {
    return `class Solution {
public:
    ${returnType} ${functionName}(${params}) {
        // TODO: Implement your solution here
        
    }
};
`;
  }
};

/**
 * Generate executable code by wrapping user's function-based solution
 * with input/output handling template
 */
function generateLeetCodeExecution(language, userCode, functionName, inputs, expectedOutputs) {
  const template = LEETCODE_TEMPLATES[language];
  if (!template) {
    throw new Error(`LeetCode template not supported for language: ${language}`);
  }
  
  return template(userCode, functionName, inputs, expectedOutputs);
}

/**
 * Generate LeetCode-style boilerplate for a given problem
 */
function generateLeetCodeBoilerplate(language, problemConfig = {}) {
  const {
    functionName = 'solve',
    returnType = 'int',
    params = 'int n'
  } = problemConfig;
  
  const template = LEETCODE_BOILERPLATE[language];
  if (!template) {
    throw new Error(`LeetCode boilerplate not supported for language: ${language}`);
  }
  
  return template(functionName, returnType, params);
}

/**
 * Parse test case input/output for LeetCode-style execution
 * Converts string-based test cases to structured arguments
 */
function parseLeetCodeTestCase(input, output) {
  try {
    // Try to parse as JSON first
    const parsedInput = JSON.parse(input.trim());
    const parsedOutput = JSON.parse(output.trim());
    
    return {
      input: Array.isArray(parsedInput) ? parsedInput : [parsedInput],
      output: parsedOutput
    };
  } catch (e) {
    // Fallback to string parsing
    return {
      input: [input.trim()],
      output: output.trim()
    };
  }
}

module.exports = {
  generateLeetCodeExecution,
  generateLeetCodeBoilerplate,
  parseLeetCodeTestCase,
  LEETCODE_TEMPLATES,
  LEETCODE_BOILERPLATE
};
