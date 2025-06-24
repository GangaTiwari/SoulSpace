const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['mood-lifting', 'stress-relief', 'cognitive', 'creative', 'social']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  score: {
    type: Number,
    default: 0
  },
  time: {
    type: Number,
    default: 0 // in seconds
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Index for efficient queries
gameSchema.index({ user: 1, completedAt: -1 });
gameSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Game', gameSchema);
