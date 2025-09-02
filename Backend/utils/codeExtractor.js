const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google's Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

/**
 * Extracts the core logic function from user's code
 * @param {string} code - The user's submitted code
 * @param {string} language - Programming language of the code
 * @returns {Promise<{functionCode: string, functionName: string, error: string}>}
 */
async function extractCoreLogic(code, language) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const prompt = `Extract just the core logic function from the following ${language} code that solves the programming problem. 
        The function should take input parameters and return a result without any print statements or hardcoded input/output.
        Only return the function code, nothing else. The function should be named 'solve'.
        
        Example for Python:
        Input:
        nums = [2,7,11,15]
        target = 9
        def twoSum(nums, target):
            seen = {}
            for i, num in enumerate(nums):
                if target - num in seen:
                    return [seen[target - num], i]
                seen[num] = i
        print(twoSum(nums, target))
        
        Output:
        def solve(nums, target):
            seen = {}
            for i, num in enumerate(nums):
                if target - num in seen:
                    return [seen[target - num], i]
                seen[num] = i
        
        Here's the code to process:
        ${code}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const extractedCode = response.text().trim();

        // Basic validation
        if (!extractedCode) {
            throw new Error('Failed to extract function from code');
        }

        return {
            functionCode: extractedCode,
            functionName: 'solve',
            error: null
        };
    } catch (error) {
        console.error('Error extracting core logic:', error);
        return {
            functionCode: '',
            functionName: '',
            error: `Failed to extract core logic: ${error.message}`
        };
    }
}

/**
 * Wraps the extracted function in a complete program for execution
 * @param {string} functionCode - The extracted function code
 * @param {string} language - Programming language
 * @param {Array} testCases - Array of test case inputs
 * @returns {string} - Complete executable code
 */
function createExecutionWrapper(functionCode, language, testCases) {
    switch (language.toLowerCase()) {
        case 'python':
            return `${functionCode}

# Test cases execution
if __name__ == '__main__':
    test_cases = ${JSON.stringify(testCases, null, 2)}
    for i, test in enumerate(test_cases):
        try:
            result = solve(**test.input)
            print(f"TEST_CASE:{i}:{JSON.stringify(result)}")
        except Exception as e:
            print(f"TEST_CASE:{i}:ERROR:{e}")
`;

        case 'javascript':
            return `${functionCode}

// Test cases execution
const testCases = ${JSON.stringify(testCases, null, 2)};
testCases.forEach((test, i) => {
    try {
        const result = solve(...Object.values(test.input));
        console.log(\`TEST_CASE:\${i}:\${JSON.stringify(result)}\`);
    } catch (e) {
        console.error(\`TEST_CASE:\${i}:ERROR:\${e.message}\`);
    }
});
`;

        case 'java':
            return `import java.util.*;

public class Solution {
    ${functionCode}
    
    public static void main(String[] args) {
        // Test cases
        List<Map<String, Object>> testCases = ${JSON.stringify(testCases, null, 8)};
        
        for (int i = 0; i < testCases.size(); i++) {
            try {
                Object result = solve(testCases.get(i).get("input"));
                System.out.println("TEST_CASE:" + i + ":" + result.toString());
            } catch (Exception e) {
                System.out.println("TEST_CASE:" + i + ":ERROR:" + e.getMessage());
            }
        }
    }
}
`;

        case 'cpp':
            return `#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <sstream>

${functionCode}

int main() {
    // Test cases would be processed here
    // This is a simplified version - actual implementation would need proper parsing
    std::cout << "TEST_CASE:0:{\"error\":\"C++ test case execution not fully implemented\"}" << std::endl;
    return 0;
}
`;

        default:
            throw new Error(`Unsupported language: ${language}`);
    }
}

module.exports = {
    extractCoreLogic,
    createExecutionWrapper
};
