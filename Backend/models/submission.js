const mongoose = require('mongoose');
const { Schema } = mongoose;

// Submission schema for storing user code submissions and results
const submissionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  challengeId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['python3', 'javascript', 'typescript', 'cpp', 'c', 'java', 'go', 'rust', 'csharp', 'php', 'ruby', 'kotlin', 'swift']
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Memory Limit Exceeded'],
    required: true
  },
  results: [{
    testCaseId: Schema.Types.ObjectId,
    passed: Boolean,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    executionTime: Number, // in milliseconds
    memoryUsed: Number,    // in KB
    error: String          // compilation/runtime errors
  }],
  totalTestCases: {
    type: Number,
    required: true
  },
  passedTestCases: {
    type: Number,
    required: true
  },
  executionTime: {
    type: Number, // Total execution time in milliseconds
    default: 0
  },
  memoryUsed: {
    type: Number, // Peak memory usage in KB
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to prevent multiple submissions per user per challenge
submissionSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

// Index for leaderboard queries
submissionSchema.index({ challengeId: 1, status: 1, executionTime: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
