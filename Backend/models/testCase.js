const mongoose = require('mongoose');
const { Schema } = mongoose;

// Test Case schema for storing hidden test cases for challenges
const testCaseSchema = new Schema({
  challengeId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: true // Most test cases should be hidden from users
  },
  timeLimit: {
    type: Number,
    default: 5000 // Time limit in milliseconds
  },
  memoryLimit: {
    type: Number,
    default: 128 // Memory limit in MB
  }
}, {
  timestamps: true
});

// Index for efficient queries
testCaseSchema.index({ challengeId: 1, isHidden: 1 });

const TestCase = mongoose.model('TestCase', testCaseSchema);

module.exports = TestCase;
