const Journal = require('../models/Journal');
const AIService = require('../utils/aiService');

// @desc    Get journal prompt
// @route   GET /api/journal/prompt
// @access  Private
const getJournalPrompt = async (req, res) => {
  try {
    // Get user's recent mood history for context
    const recentMoods = await require('../models/Mood').find({
      user: req.user.id
    })
    .sort({ timestamp: -1 })
    .limit(5)
    .select('mood');

    const userMood = recentMoods.length > 0 ? recentMoods[0].mood : 'neutral';
    const moodHistory = recentMoods.map(m => m.mood);

    // Generate AI prompt with fallback
    let prompt;
    try {
      prompt = await AIService.generateJournalPrompt(userMood, moodHistory);
    } catch (aiError) {
      console.error('AI prompt generation failed:', aiError);
      // Fallback prompts based on mood
      const fallbackPrompts = {
        'very_happy': "What made today so wonderful? Describe the moments that brought you joy.",
        'happy': "What's been going well for you lately? Share something positive from your day.",
        'neutral': "How are you feeling today? What's on your mind?",
        'sad': "What's been challenging for you? It's okay to share difficult feelings.",
        'very_sad': "I'm here to listen. What's been weighing on your mind?",
        'anxious': "What's causing you worry? Let's explore these feelings together.",
        'angry': "What's been frustrating you? It's okay to express these emotions.",
        'excited': "What are you looking forward to? Share your enthusiasm!",
        'calm': "How are you feeling in this peaceful moment? What's bringing you tranquility?"
      };
      prompt = fallbackPrompts[userMood] || "How are you feeling today? What's on your mind?";
    }

    res.json({
      success: true,
      data: { prompt }
    });
  } catch (error) {
    console.error('Get journal prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting journal prompt'
    });
  }
};

// @desc    Create journal entry
// @route   POST /api/journal
// @access  Private
const createJournalEntry = async (req, res) => {
  try {
    const { prompt, content, isPrivate = true } = req.body;

    if (!prompt || !content) {
      return res.status(400).json({
        success: false,
        message: 'Prompt and content are required'
      });
    }

    // Analyze emotions and sentiment with fallback handling
    let emotions = [];
    let sentiment = { score: 0, label: 'neutral' };
    
    try {
      emotions = await AIService.analyzeEmotions(content);
    } catch (aiError) {
      console.error('AI emotion analysis failed:', aiError);
      // Fallback: provide basic emotion detection
      emotions = [{ emotion: 'neutral', confidence: 1.0 }];
    }
    
    try {
      sentiment = await AIService.analyzeSentiment(content);
    } catch (aiError) {
      console.error('AI sentiment analysis failed:', aiError);
      // Fallback: neutral sentiment
      sentiment = { score: 0, label: 'neutral' };
    }

    // Create journal entry
    const journalEntry = await Journal.create({
      user: req.user.id,
      prompt,
      content,
      emotions,
      sentiment,
      isPrivate,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: journalEntry
    });
  } catch (error) {
    console.error('Create journal entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating journal entry'
    });
  }
};

// @desc    Get journal entries
// @route   GET /api/journal
// @access  Private
const getJournalEntries = async (req, res) => {
  try {
    const { limit = 20, skip = 0, days, emotions, tags } = req.query;

    let query = { user: req.user.id };

    // Filter by days if specified
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      query.timestamp = { $gte: startDate };
    }

    // Filter by emotions if specified
    if (emotions) {
      query['emotions.emotion'] = { $in: emotions.split(',') };
    }

    // Filter by tags if specified
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const total = await Journal.countDocuments(query);
    const journalEntries = await Journal.find(query)
      .sort({ timestamp: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: journalEntries,
      total
    });
  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting journal entries'
    });
  }
};

// @desc    Get journal statistics
// @route   GET /api/journal/stats
// @access  Private
const getJournalStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const stats = await Journal.getJournalStats(req.user.id, parseInt(days));
    const emotionTrends = await Journal.getEmotionTrends(req.user.id, parseInt(days));

    // Calculate writing consistency
    const entriesPerDay = stats.length > 0 ? stats[0].totalEntries / parseInt(days) : 0;

    // Get most common emotions
    const topEmotions = emotionTrends.slice(0, 5);

    res.json({
      success: true,
      data: {
        totalEntries: stats.length > 0 ? stats[0].totalEntries : 0,
        totalWords: stats.length > 0 ? stats[0].totalWords : 0,
        avgWordsPerEntry: stats.length > 0 ? Math.round(stats[0].avgWordsPerEntry) : 0,
        avgReadingTime: stats.length > 0 ? Math.round(stats[0].avgReadingTime) : 0,
        entriesPerDay: Math.round(entriesPerDay * 10) / 10,
        topEmotions,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get journal stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting journal statistics'
    });
  }
};

// @desc    Get journal entry by ID
// @route   GET /api/journal/:id
// @access  Private
const getJournalById = async (req, res) => {
  try {
    const journalEntry = await Journal.findById(req.params.id);

    if (!journalEntry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    // Check if user owns this journal entry
    if (journalEntry.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this journal entry'
      });
    }

    res.json({
      success: true,
      data: journalEntry
    });
  } catch (error) {
    console.error('Get journal by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting journal entry'
    });
  }
};

// @desc    Update journal entry
// @route   PUT /api/journal/:id
// @access  Private
const updateJournalEntry = async (req, res) => {
  try {
    const { content, isPrivate } = req.body;

    let journalEntry = await Journal.findById(req.params.id);

    if (!journalEntry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    // Check if user owns this journal entry
    if (journalEntry.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this journal entry'
      });
    }

    // Re-analyze emotions and sentiment if content changed
    let emotions = journalEntry.emotions;
    let sentiment = journalEntry.sentiment;

    if (content && content !== journalEntry.content) {
      try {
        emotions = await AIService.analyzeEmotions(content);
      } catch (aiError) {
        console.error('AI emotion analysis failed during update:', aiError);
        emotions = [{ emotion: 'neutral', confidence: 1.0 }];
      }
      
      try {
        sentiment = await AIService.analyzeSentiment(content);
      } catch (aiError) {
        console.error('AI sentiment analysis failed during update:', aiError);
        sentiment = { score: 0, label: 'neutral' };
      }
    }

    // Update journal entry
    journalEntry.content = content || journalEntry.content;
    journalEntry.emotions = emotions;
    journalEntry.sentiment = sentiment;
    journalEntry.isPrivate = isPrivate !== undefined ? isPrivate : journalEntry.isPrivate;

    await journalEntry.save();

    res.json({
      success: true,
      data: journalEntry
    });
  } catch (error) {
    console.error('Update journal entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating journal entry'
    });
  }
};

// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
// @access  Private
const deleteJournalEntry = async (req, res) => {
  try {
    const journalEntry = await Journal.findById(req.params.id);

    if (!journalEntry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    // Check if user owns this journal entry
    if (journalEntry.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this journal entry'
      });
    }

    await Journal.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting journal entry'
    });
  }
};

module.exports = {
  getJournalPrompt,
  createJournalEntry,
  getJournalEntries,
  getJournalStats,
  getJournalById,
  updateJournalEntry,
  deleteJournalEntry
}; 