const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  userContext: {
    currentMood: String,
    recentMood: String,
    journalStreak: Number,
    moodStreak: Number,
    lastActivity: Date
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

// Update timestamp on save
chatHistorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Get chat history for a user (last N messages)
chatHistorySchema.statics.getUserHistory = async function(userId, limit = 20) {
  const history = await this.findOne({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(1);
  
  if (!history) return [];
  
  return history.messages.slice(-limit);
};

// Add message to user's chat history
chatHistorySchema.statics.addMessage = async function(userId, role, content, context = {}) {
  try {
    // First try to find existing history
    let history = await this.findOne({ user: userId });
    
    if (!history) {
      // Create new history if none exists
      history = new this({
        user: userId,
        messages: [],
        userContext: context
      });
    }

    // Add new message
    history.messages.push({
      role,
      content,
      timestamp: new Date()
    });

    // Keep only last 50 messages to prevent bloat
    if (history.messages.length > 50) {
      history.messages = history.messages.slice(-50);
    }

    // Update context
    history.userContext = context;
    history.updatedAt = new Date();

    // Save with version conflict handling
    try {
      await history.save();
    } catch (saveError) {
      if (saveError.name === 'VersionError') {
        // Handle version conflict by recreating the document
        console.log('Version conflict detected, recreating chat history');
        await this.deleteOne({ user: userId });
        
        const newHistory = new this({
          user: userId,
          messages: [{
            role,
            content,
            timestamp: new Date()
          }],
          userContext: context
        });
        await newHistory.save();
        return newHistory;
      } else {
        throw saveError;
      }
    }

    return history;
  } catch (error) {
    console.error('Error adding message to chat history:', error);
    
    // Final fallback: create new history
    try {
      const newHistory = new this({
        user: userId,
        messages: [{
          role,
          content,
          timestamp: new Date()
        }],
        userContext: context
      });
      return await newHistory.save();
    } catch (fallbackError) {
      console.error('Fallback chat history creation failed:', fallbackError);
      // Return a minimal response to prevent app crash
      return {
        user: userId,
        messages: [{
          role,
          content,
          timestamp: new Date()
        }],
        userContext: context
      };
    }
  }
};

// Get user context for AI
chatHistorySchema.statics.getUserContext = async function(userId) {
  const history = await this.findOne({ user: userId });
  return history ? history.userContext : {};
};

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
