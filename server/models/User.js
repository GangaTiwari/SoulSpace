const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Email authentication (optional for anonymous users)
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  
  // Password (optional for anonymous users)
  password: {
    type: String,
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  
  // User profile
  name: {
    type: String,
    trim: true,
    maxlength: 50
  },
  
  // Anonymous user identifier
  anonymousId: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // User type: 'email' or 'anonymous'
  userType: {
    type: String,
    enum: ['email', 'anonymous'],
    required: true
  },
  
  // Profile settings
  avatar: {
    type: String,
    default: 'default-avatar'
  },
  
  bio: {
    type: String,
    maxlength: 500
  },
  
  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      moodReminders: { type: Boolean, default: true },
      journalPrompts: { type: Boolean, default: true },
      weeklyInsights: { type: Boolean, default: true },
      communityUpdates: { type: Boolean, default: false }
    },
    privacy: {
      anonymousJournaling: { type: Boolean, default: true },
      shareProgress: { type: Boolean, default: false },
      allowAnalytics: { type: Boolean, default: true }
    }
  },
  
  // Wearable integrations
  wearables: {
    googleFit: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      refreshToken: String,
      lastSync: Date
    },
    fitbit: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      refreshToken: String,
      lastSync: Date
    }
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ anonymousId: 1 });
userSchema.index({ userType: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and user is email type
  if (!this.isModified('password') || this.userType !== 'email') return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate anonymous ID
userSchema.methods.generateAnonymousId = function() {
  return 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Virtual for user display name
userSchema.virtual('displayName').get(function() {
  return this.name || this.email || 'Anonymous User';
});

// Ensure virtuals are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema); 