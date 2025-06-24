const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Mood selection (emoji-based)
  mood: {
    type: String,
    enum: [
      'very_happy', 'happy', 'calm', 'neutral', 'sad', 'stressed', 'tired', 
      'grateful', 'anxious', 'confident', 'excited', 'frustrated', 'peaceful', 'overwhelmed', 'angry'
    ],
    required: true
  },
  
  // Mood intensity (1-10 scale)
  intensity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Optional notes/journal entry
  notes: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  
  // AI-detected emotions from notes
  emotions: [{
    emotion: {
      type: String,
      enum: [
        'joy', 'sadness', 'anger', 'fear', 'surprise', 
        'disgust', 'trust', 'anticipation', 'love', 
        'optimism', 'pessimism', 'confidence', 'anxiety'
      ]
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  
  // Context tags
  tags: [{
    type: String,
    enum: [
      'work', 'family', 'health', 'relationships', 'finances',
      'weather', 'sleep', 'exercise', 'social', 'alone',
      'stress', 'achievement', 'loss', 'celebration'
    ]
  }],
  
  // Location (optional)
  location: {
    type: String,
    trim: true
  },
  
  // Weather (optional - for correlation analysis)
  weather: {
    condition: String,
    temperature: Number
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
  
  // Month for seasonal analysis
  month: {
    type: Number,
    min: 1,
    max: 12
  },
  
  // Year
  year: {
    type: Number
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
moodSchema.index({ user: 1, timestamp: -1 });
moodSchema.index({ user: 1, mood: 1 });
moodSchema.index({ user: 1, weekday: 1 });
moodSchema.index({ user: 1, month: 1, year: 1 });

// Pre-save middleware to set derived fields
moodSchema.pre('save', function(next) {
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
  
  next();
});

// Static method to get mood statistics
moodSchema.statics.getMoodStats = async function(userId, days = 7) {
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
        _id: '$mood',
        count: { $sum: 1 },
        avgIntensity: { $avg: '$intensity' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to get mood trends
moodSchema.statics.getMoodTrends = async function(userId, days = 30) {
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
          date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          mood: '$mood'
        },
        count: { $sum: 1 },
        avgIntensity: { $avg: '$intensity' }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

module.exports = mongoose.model('Mood', moodSchema); 