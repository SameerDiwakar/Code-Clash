const mongoose = require('mongoose');
const { Schema } = mongoose;

// Problem schema for individual problems within a battle
const problemSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }],
  constraints: String,
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  points: {
    type: Number,
    default: 100
  }
});

// Battle schema
const battleSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problems: [problemSchema],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  duration: {
    type: Number,
    required: true, // Duration in minutes
    min: 15,
    max: 480 // Max 8 hours
  },
  maxParticipants: {
    type: Number,
    default: 100,
    min: 2
  },
  participants: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    submissions: [{
      problemId: Schema.Types.ObjectId,
      code: String,
      language: String,
      submittedAt: {
        type: Date,
        default: Date.now
      },
      result: {
        status: {
          type: String,
          enum: ['Pending', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error']
        },
        score: Number,
        executionTime: Number,
        memory: Number
      }
    }]
  }],
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Active', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [String],
  leaderboard: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    totalScore: {
      type: Number,
      default: 0
    },
    totalTime: {
      type: Number,
      default: 0
    },
    problemsSolved: {
      type: Number,
      default: 0
    },
    rank: Number
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
battleSchema.index({ creator: 1 });
battleSchema.index({ status: 1 });
battleSchema.index({ startTime: 1 });
battleSchema.index({ difficulty: 1 });
battleSchema.index({ isPublic: 1 });

// Pre-save middleware to calculate end time
battleSchema.pre('save', function(next) {
  if (this.startTime && this.duration) {
    this.endTime = new Date(this.startTime.getTime() + (this.duration * 60 * 1000));
  }
  next();
});

// Method to check if battle is active
battleSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'Active' && now >= this.startTime && now <= this.endTime;
};

// Method to check if user can join
battleSchema.methods.canUserJoin = function(userId) {
  if (this.status !== 'Scheduled' && this.status !== 'Active') return false;
  if (this.participants.length >= this.maxParticipants) return false;
  
  const alreadyJoined = this.participants.some(p => p.user.toString() === userId.toString());
  return !alreadyJoined;
};

// Static method to get active battles
battleSchema.statics.getActiveBattles = function() {
  const now = new Date();
  return this.find({
    status: 'Active',
    startTime: { $lte: now },
    endTime: { $gte: now },
    isPublic: true
  }).populate('creator', 'name email');
};

const battleModel = mongoose.model('Battle', battleSchema);

module.exports = battleModel;
