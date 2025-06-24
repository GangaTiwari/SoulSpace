const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Post type
  type: {
    type: String,
    enum: ['support', 'struggle', 'victory', 'question', 'advice'],
    required: true
  },
  
  // Post content
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  
  content: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },
  
  // AI-detected emotions
  emotions: [{
    emotion: {
      type: String,
      enum: [
        'joy', 'sadness', 'anger', 'fear', 'surprise', 
        'disgust', 'trust', 'anticipation', 'love', 
        'optimism', 'pessimism', 'confidence', 'anxiety',
        'gratitude', 'hope', 'despair', 'excitement', 'calm'
      ]
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  
  // AI-generated tags
  tags: [{
    type: String,
    enum: [
      'mental-health', 'anxiety', 'depression', 'stress',
      'relationships', 'work', 'family', 'self-care',
      'therapy', 'medication', 'coping', 'recovery',
      'support', 'advice', 'celebration', 'struggle'
    ]
  }],
  
  // Sentiment analysis
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1
    },
    label: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    }
  },
  
  // AI moderation status
  moderation: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending'
    },
    toxicity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    flaggedReason: String,
    moderatedBy: String, // 'ai' or 'admin'
    moderatedAt: Date
  },
  
  // Reactions (❤️, 🌈, 💬, etc.)
  reactions: {
    heart: { type: Number, default: 0 },
    hug: { type: Number, default: 0 },
    strength: { type: Number, default: 0 },
    celebrate: { type: Number, default: 0 },
    support: { type: Number, default: 0 }
  },
  
  // User reactions (to prevent duplicate reactions)
  userReactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: {
      type: String,
      enum: ['heart', 'hug', 'strength', 'celebrate', 'support']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Comments count
  commentCount: {
    type: Number,
    default: 0
  },
  
  // Views count
  views: {
    type: Number,
    default: 0
  },
  
  // Anonymous posting
  isAnonymous: {
    type: Boolean,
    default: true
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Weekday for pattern analysis
  weekday: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  },
  
  // Month and year
  month: {
    type: Number,
    min: 1,
    max: 12
  },
  year: {
    type: Number
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
forumSchema.index({ user: 1, timestamp: -1 });
forumSchema.index({ type: 1, timestamp: -1 });
forumSchema.index({ 'moderation.status': 1 });
forumSchema.index({ tags: 1 });
forumSchema.index({ emotions: 1 });
forumSchema.index({ weekday: 1 });

// Pre-save middleware to set derived fields
forumSchema.pre('save', function(next) {
  const date = new Date(this.timestamp);
  
  // Set weekday
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  this.weekday = weekdays[date.getDay()];
  
  // Set month and year
  this.month = date.getMonth() + 1;
  this.year = date.getFullYear();
  
  next();
});

// Method to add reaction
forumSchema.methods.addReaction = async function(userId, reactionType) {
  // Check if user already reacted
  const existingReaction = this.userReactions.find(
    r => r.user.toString() === userId.toString() && r.reaction === reactionType
  );
  
  if (existingReaction) {
    // Remove existing reaction
    this.userReactions = this.userReactions.filter(
      r => !(r.user.toString() === userId.toString() && r.reaction === reactionType)
    );
    this.reactions[reactionType] = Math.max(0, this.reactions[reactionType] - 1);
  } else {
    // Add new reaction
    this.userReactions.push({
      user: userId,
      reaction: reactionType,
      timestamp: new Date()
    });
    this.reactions[reactionType] = (this.reactions[reactionType] || 0) + 1;
  }
  
  return await this.save();
};

// Static method to get forum statistics
forumSchema.statics.getForumStats = async function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate },
        'moderation.status': 'approved'
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalReactions: {
          $sum: {
            $add: [
              '$reactions.heart',
              '$reactions.hug',
              '$reactions.strength',
              '$reactions.celebrate',
              '$reactions.support'
            ]
          }
        },
        avgReactions: {
          $avg: {
            $add: [
              '$reactions.heart',
              '$reactions.hug',
              '$reactions.strength',
              '$reactions.celebrate',
              '$reactions.support'
            ]
          }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

module.exports = mongoose.model('Forum', forumSchema); 