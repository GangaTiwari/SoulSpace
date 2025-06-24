const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Forum',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  reactions: {
    heart: { type: Number, default: 0 },
    hug: { type: Number, default: 0 },
  },
  userReactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: {
      type: String,
      enum: ['heart', 'hug']
    }
  }],
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema); 