const mongoose = require('mongoose');

const wearableDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Data source
  source: {
    type: String,
    enum: ['google-fit', 'fitbit'],
    required: true
  },
  
  // Date of the data
  date: {
    type: Date,
    required: true
  },
  
  // Step count
  steps: {
    count: {
      type: Number,
      min: 0,
      default: 0
    },
    goal: {
      type: Number,
      default: 10000
    }
  },
  
  // Calories
  calories: {
    burned: {
      type: Number,
      min: 0,
      default: 0
    },
    goal: {
      type: Number,
      default: 2000
    }
  },
  
  // Sleep data
  sleep: {
    duration: {
      type: Number, // in minutes
      min: 0,
      default: 0
    },
    quality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      default: 'fair'
    },
    deepSleep: {
      type: Number, // in minutes
      min: 0,
      default: 0
    },
    lightSleep: {
      type: Number, // in minutes
      min: 0,
      default: 0
    },
    remSleep: {
      type: Number, // in minutes
      min: 0,
      default: 0
    },
    awake: {
      type: Number, // in minutes
      min: 0,
      default: 0
    },
    bedtime: Date,
    wakeTime: Date
  },
  
  // Heart rate data
  heartRate: {
    resting: {
      type: Number,
      min: 30,
      max: 200
    },
    average: {
      type: Number,
      min: 30,
      max: 200
    },
    max: {
      type: Number,
      min: 30,
      max: 200
    },
    min: {
      type: Number,
      min: 30,
      max: 200
    }
  },
  
  // Activity data
  activity: {
    activeMinutes: {
      type: Number,
      min: 0,
      default: 0
    },
    exerciseMinutes: {
      type: Number,
      min: 0,
      default: 0
    },
    distance: {
      type: Number, // in meters
      min: 0,
      default: 0
    },
    floors: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  // Weight (if available)
  weight: {
    value: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg'
    }
  },
  
  // Water intake
  water: {
    amount: {
      type: Number, // in ml
      min: 0,
      default: 0
    },
    goal: {
      type: Number,
      default: 2000
    }
  },
  
  // Weather data (for correlation analysis)
  weather: {
    condition: String,
    temperature: Number,
    humidity: Number,
    pressure: Number
  },
  
  // Data quality indicators
  dataQuality: {
    steps: { type: Boolean, default: true },
    sleep: { type: Boolean, default: true },
    heartRate: { type: Boolean, default: true },
    calories: { type: Boolean, default: true }
  },
  
  // Last sync timestamp
  lastSync: {
    type: Date,
    default: Date.now
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
wearableDataSchema.index({ user: 1, date: -1 });
wearableDataSchema.index({ user: 1, source: 1 });
wearableDataSchema.index({ user: 1, weekday: 1 });
wearableDataSchema.index({ user: 1, month: 1, year: 1 });

// Compound index for date range queries
wearableDataSchema.index({ user: 1, date: 1 });

// Pre-save middleware to set derived fields
wearableDataSchema.pre('save', function(next) {
  const date = new Date(this.date);
  
  // Set weekday
  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  this.weekday = weekdays[date.getDay()];
  
  // Set month and year
  this.month = date.getMonth() + 1;
  this.year = date.getFullYear();
  
  next();
});

// Virtual for step goal percentage
wearableDataSchema.virtual('steps.goalPercentage').get(function() {
  if (!this.steps.goal) return 0;
  return Math.min(100, (this.steps.count / this.steps.goal) * 100);
});

// Virtual for sleep quality score
wearableDataSchema.virtual('sleep.qualityScore').get(function() {
  const qualityScores = {
    'poor': 1,
    'fair': 2,
    'good': 3,
    'excellent': 4
  };
  return qualityScores[this.sleep.quality] || 2;
});

// Virtual for activity score
wearableDataSchema.virtual('activity.score').get(function() {
  let score = 0;
  
  // Steps contribution (40% of score)
  if (this.steps.count >= 10000) score += 40;
  else score += (this.steps.count / 10000) * 40;
  
  // Active minutes contribution (30% of score)
  if (this.activity.activeMinutes >= 30) score += 30;
  else score += (this.activity.activeMinutes / 30) * 30;
  
  // Sleep contribution (30% of score)
  const sleepHours = this.sleep.duration / 60;
  if (sleepHours >= 7 && sleepHours <= 9) score += 30;
  else if (sleepHours >= 6 && sleepHours <= 10) score += 20;
  else score += Math.max(0, (sleepHours / 8) * 30);
  
  return Math.round(score);
});

// Ensure virtuals are serialized
wearableDataSchema.set('toJSON', { virtuals: true });
wearableDataSchema.set('toObject', { virtuals: true });

// Static method to get health statistics
wearableDataSchema.statics.getHealthStats = async function(userId, days = 7) {
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
        avgHeartRate: { $avg: '$heartRate' },
        avgSteps: { $avg: '$steps' },
        avgSleepHours: { $avg: '$sleepHours' },
        avgStressLevel: { $avg: '$stressLevel' }
      }
    }
  ]);
};

// Static method to get health trends
wearableDataSchema.statics.getHealthTrends = async function(userId, days = 30) {
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
        avgHeartRate: { $avg: '$heartRate' },
        totalSteps: { $sum: '$steps' },
        avgSleepHours: { $avg: '$sleepHours' },
        avgStressLevel: { $avg: '$stressLevel' }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);
};

module.exports = mongoose.model('WearableData', wearableDataSchema); 