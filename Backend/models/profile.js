const mongoose = require('mongoose');
const { Schema } = mongoose;

const profileSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  displayName: { 
    type: String, 
    default: '' 
  },
  bio: { 
    type: String, 
    default: '' 
  },
  experienceLevel: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], 
    default: 'Beginner' 
  },
  githubProfile: { 
    type: String, 
    default: '' 
  },
  preferredLanguages: [{ 
    type: String 
  }],
  codingSkills: [{ 
    type: String 
  }],
  profilePicture: { 
    type: String, 
    default: '' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
