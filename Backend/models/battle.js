const mongoose = require('mongoose');
const { Schema } = mongoose;

// Problem schema for individual problems within a battle
const problemSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  // Normalized title used for case-insensitive uniqueness
  normalizedTitle: {
    type: String,
    required: true,
    lowercase: true,
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
    max: 720 // Max 12 hours
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
    enum: ['waiting', 'Draft', 'Scheduled', 'Active', 'Completed', 'Cancelled'],
    default: 'waiting'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  accessCode: {
    type: String,
    minlength: 4,
    maxlength: 10,
    trim: true,
    validate: {
      validator: function(v) {
        // Access code is required if battle is not public
        return this.isPublic || (v && v.length >= 4);
      },
      message: 'Access code must be 4-10 characters long for private battles'
    }
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
battleSchema.index({ endTime: 1 });
// TTL index to automatically delete battles 1 day after they end
battleSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Unique index on normalizedTitle ensures case-insensitive uniqueness for new/updated docs
// Use partial index so legacy documents without normalizedTitle don't block index creation
battleSchema.index(
  { normalizedTitle: 1 },
  { unique: true, partialFilterExpression: { normalizedTitle: { $exists: true } } }
);

// Pre-save middleware to calculate end time
battleSchema.pre('validate', function(next) {
  if (typeof this.title === 'string') {
    this.normalizedTitle = this.title.trim().toLowerCase();
  }
  next();
});

// Pre-save middleware to calculate end time
battleSchema.pre('save', function(next) {
  if (this.startTime && this.duration) {
    this.endTime = new Date(this.startTime.getTime() + (this.duration * 60 * 1000));
  }
  // Set the expiration time to 24 hours after endTime so MongoDB TTL index can remove it
  if (this.endTime) {
    this.expiresAt = new Date(this.endTime.getTime() + (24 * 60 * 60 * 1000));
  }
  next();
});

// Method to check if battle is active (time-window based)
battleSchema.methods.isActive = function() {
  const now = new Date();
  return this.startTime && this.endTime && now >= this.startTime && now <= this.endTime;
};

// Method to check if user can join
battleSchema.methods.canUserJoin = function(userId) {
  const now = new Date();
  
  // Can't join if battle is completed or cancelled
  if (this.status === 'Completed' || this.status === 'Cancelled') return false;
  
  // Must have endTime and startTime to evaluate time window
  if (!this.startTime || !this.endTime) return false;

  // Can't join if battle has ended
  if (now >= this.endTime) return false;
  
  // Can't join if at max capacity
  if (this.participants.length >= this.maxParticipants) return false;
  
  // Can't join if already joined
  const alreadyJoined = this.participants.some(p => p.user.toString() === userId.toString());
  if (alreadyJoined) return false;
  
  // Allow join from 15 minutes before start until end time
  const fifteenMinutes = 15 * 60 * 1000;
  const joinOpensAt = new Date(this.startTime.getTime() - fifteenMinutes);
  return now >= joinOpensAt && now < this.endTime;
};

// Static method to get active battles
battleSchema.statics.getActiveBattles = function() {
  const now = new Date();
  return this.find({
    startTime: { $lte: now },
    endTime: { $gte: now },
    isPublic: true
  }).populate('creator', 'username email');
};

const battleModel = mongoose.model('Battle', battleSchema);

module.exports = battleModel;
