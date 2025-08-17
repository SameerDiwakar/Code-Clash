const mongoose = require('mongoose');
const { Schema } = mongoose;

// Supported programming languages and their Judge0 language IDs
const SUPPORTED_LANGUAGES = {
  'cpp': 54,        // C++ (GCC 9.2.0)
  'java': 62,       // Java (OpenJDK 13.0.1)
  'python3': 71,    // Python (3.8.1)
  'javascript': 63, // JavaScript (Node.js 12.14.0)
};

// Common problem types
const PROBLEM_TYPES = [
  'array', 'string', 'linked_list', 'tree', 'graph',
  'dynamic_programming', 'sorting', 'searching', 'math', 'greedy'
];

// Base template structure for each language
const LANGUAGE_TEMPLATES = {
  cpp: {
    imports: '#include <bits/stdc++.h>\nusing namespace std;\n\n',
    function: 'class Solution {\npublic:\n    // Function signature will be inserted here\n    // Example: vector<int> solve(vector<int>& nums, int target) {\n    //     // Your code here\n    // }\n};\n\n',
    main: 'int main() {\n    Solution sol;\n    // Test cases will be inserted here\n    // Example usage:\n    // vector<int> nums = {2, 7, 11, 15};\n    // int target = 9;\n    // auto result = sol.solve(nums, target);\n    // cout << "Result: ";\n    // for (int num : result) {\n    //     cout << num << " ";\n    // }\n    // cout << endl;\n    return 0;\n}'
  },
  java: {
    imports: 'import java.util.*;\n\n',
    class: 'class Solution {\n    // Function signature will be inserted here\n    // Example: public int[] solve(int[] nums, int target) {\n    //     // Your code here\n    // }\n}\n\n',
    main: 'public class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        // Test cases will be inserted here\n        // Example usage:\n        // int[] nums = {2, 7, 11, 15};\n        // int target = 9;\n        // int[] result = sol.solve(nums, target);\n        // System.out.print("Result: ");\n        // System.out.println(Arrays.toString(result));\n    }\n}'
  },
  python3: {
    imports: 'from typing import List, Optional\n\n',
    class: 'class Solution:\n    def solve(self, nums: List[int], target: int) -> List[int]:\n        """\n        :type nums: List[int]\n        :type target: int\n        :rtype: List[int]\n        """\n        pass  # Your code here\n\n',
    main: 'if __name__ == "__main__":\n    sol = Solution()\n    # Test cases will be inserted here\n    # Example usage:\n    # nums = [2, 7, 11, 15]\n    # target = 9\n    # print(f"Result: {sol.solve(nums, target)}")'
  },
  javascript: {
    imports: '/**\n * @param {Array} nums\n * @param {number} target\n * @return {Array}\n */\n',
    function: 'function solve(nums, target) {\n    // Your code here\n}\n\n',
    main: '// Test cases will be inserted here\n// Example usage:\n// const nums = [2, 7, 11, 15];\n// const target = 9;\n// console.log("Result:", solve(nums, target));'
  }
};

// Schema for boilerplate code templates
const boilerplateSchema = new Schema({
  // Reference to the challenge/problem
  challengeId: { 
    type: Schema.Types.ObjectId, 
    required: true, 
    ref: 'Challenge',
    index: true 
  },
  
  // Programming language
  language: {
    type: String,
    required: true,
    enum: Object.keys(SUPPORTED_LANGUAGES),
    index: true
  },
  
  // Problem type for categorization
  problemType: {
    type: String,
    enum: PROBLEM_TYPES,
    required: true
  },
  
  // The actual boilerplate code
  code: { 
    type: String, 
    required: true 
  },
  
  // Function signature (for reference)
  functionSignature: {
    type: String,
    required: true
  },
  
  // Example test cases (array of {input, output, explanation})
  exampleTestCases: [{
    input: String,
    output: String,
    explanation: String
  }],
  
  // Metadata
  isDefault: {
    type: Boolean,
    default: false
  },
  
  // Version tracking
  version: {
    type: Number,
    default: 1
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for Judge0 language ID
boilerplateSchema.virtual('language_id').get(function() {
  return SUPPORTED_LANGUAGES[this.language];
});

// Index for faster lookups
boilerplateSchema.index({ 
  challengeId: 1, 
  language: 1,
  problemType: 1,
  isDefault: 1 
}, { unique: true });

// Static method to generate a new boilerplate
boilerplateSchema.statics.generateBoilerplate = async function({
  challengeId,
  language,
  problemType,
  functionSignature,
  exampleTestCases = []
}) {
  if (!SUPPORTED_LANGUAGES[language]) {
    throw new Error(`Unsupported language: ${language}`);
  }
  
  if (!PROBLEM_TYPES.includes(problemType)) {
    throw new Error(`Unsupported problem type: ${problemType}`);
  }
  
  const template = LANGUAGE_TEMPLATES[language];
  if (!template) {
    throw new Error(`No template found for language: ${language}`);
  }
  
  // Generate the boilerplate code by combining template parts
  let code = '';
  
  // Add imports
  if (template.imports) code += template.imports + '\n';
  
  // Add class/function definition
  if (template.class) {
    code += template.class.replace('// Function signature will be inserted here', functionSignature);
  } else if (template.function) {
    code += functionSignature + ' {\n    // Your code here\n}\n\n';
  }
  
  // Add main/test section
  if (template.main) {
    code += template.main;
  }
  
  // Upsert and return the boilerplate document
  const filter = { challengeId, language, problemType };
  const update = {
    $set: {
      functionSignature,
      exampleTestCases,
      code,
      isDefault: true
    }
  };
  const opts = { new: true, upsert: true, setDefaultsOnInsert: true };
  return this.findOneAndUpdate(filter, update, opts);
};

// Pre-save hook to ensure only one default per challenge/language/problemType
boilerplateSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { 
        challengeId: this.challengeId,
        language: this.language,
        problemType: this.problemType,
        _id: { $ne: this._id }
      },
      { $set: { isDefault: false } }
    );
  }
  next();
});

module.exports = mongoose.model('Boilerplate', boilerplateSchema);
module.exports.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
module.exports.PROBLEM_TYPES = PROBLEM_TYPES;
module.exports.LANGUAGE_TEMPLATES = LANGUAGE_TEMPLATES;
