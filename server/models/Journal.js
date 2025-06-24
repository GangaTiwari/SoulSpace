const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // AI-generated prompt that inspired this entry
  prompt: {
    type: String,
    required: true,
    trim: true
  },
  
  // User's journal entry
  content: {
    type: String,
    required: true,
    maxlength: 5000,
    trim: true
  },
  
  // AI-detected emotions from the entry
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
  
  // AI-generated tags/themes
  tags: [{
    type: String,
    enum: [
      'relationships', 'work', 'health', 'personal-growth',
      'stress', 'achievement', 'challenge', 'reflection',
      'gratitude', 'goals', 'fears', 'dreams', 'memories',
      'self-care', 'family', 'friends', 'career', 'spirituality'
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
  
  // Word count for analytics
  wordCount: {
    type: Number,
    default: 0
  },
  
  // Reading time estimate
  readingTime: {
    type: Number, // in minutes
    default: 0
  },
  
  // Privacy settings
  isPrivate: {
    type: Boolean,
    default: true
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Time of day
  timeOfDay: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
    default: 'morning'
  },
  
  // Weekday for pattern analysis
  weekday: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  },
  
  // Month and year for seasonal analysis
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
journalSchema.index({ user: 1, timestamp: -1 });
journalSchema.index({ user: 1, emotions: 1 });
journalSchema.index({ user: 1, tags: 1 });
journalSchema.index({ user: 1, weekday: 1 });
journalSchema.index({ user: 1, month: 1, year: 1 });

// Pre-save middleware to set derived fields
journalSchema.pre('save', function(next) {
  const date = new Date(this.timestamp);
  
  // Set weekday
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  this.weekday = weekdays[date.getDay()];
  
  // Set month and year
  this.month = date.getMonth() + 1;
  this.year = date.getFullYear();
  
  // Set time of day based on hour
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) this.timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) this.timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) this.timeOfDay = 'evening';
  else this.timeOfDay = 'night';
  
  // Calculate word count
  this.wordCount = this.content.split(/\s+/).length;
  
  // Calculate reading time (average 200 words per minute)
  this.readingTime = Math.ceil(this.wordCount / 200);
  
  next();
});

// Static method to get journal statistics
journalSchema.statics.getJournalStats = async function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        avgWords: { $avg: { $strLenCP: '$content' } },
        avgSentiment: { $avg: '$sentiment.score' }
      }
    }
  ]);
};

// Static method to get emotion trends
journalSchema.statics.getEmotionTrends = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
        },
        avgSentiment: { $avg: '$sentiment.score' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

module.exports = mongoose.model('Journal', journalSchema); 