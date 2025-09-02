/**
 * Simple code execution templates that return user code as-is
 * No additional boilerplate or wrapping is added
 */

// Template generators for each language
const LEETCODE_TEMPLATES = {
  python: (userCode) => userCode,
  javascript: (userCode) => userCode,
  java: (userCode) => userCode,
  cpp: (userCode) => userCode
};

// Empty boilerplate generators
const LEETCODE_BOILERPLATE = {
  python: () => '',
  javascript: () => '',
  java: () => '',
  cpp: () => ''
};

/**
 * Generate code execution wrapper
 */
const generateLeetCodeExecution = (language, userCode) => {
  const templateKey = language === 'c++' ? 'cpp' : language;
  const template = LEETCODE_TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`Unsupported language for code execution: ${language}`);
  }
  return template(userCode);
};

/**
 * Generate code boilerplate (returns empty string for all languages)
 */
const generateLeetCodeBoilerplate = (language) => {
  const templateKey = language === 'c++' ? 'cpp' : language;
  const template = LEETCODE_BOILERPLATE[templateKey];
  if (!template) {
    throw new Error(`Unsupported language for code boilerplate: ${language}`);
  }
  return template();
};

/**
 * Parse test case input/output
 */
function parseLeetCodeTestCase(input, output) {
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

// Empty boilerplate code for each language
const SIMPLE_BOILERPLATES = {
  'python': '',
  'javascript': '',
  'java': '',
  'cpp': '',
  'c': '',
  'csharp': '',
  'php': '',
  'ruby': '',
  'swift': '',
  'go': '',
  'scala': '',
  'kotlin': '',
  'rust': '',
  'typescript': ''
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
