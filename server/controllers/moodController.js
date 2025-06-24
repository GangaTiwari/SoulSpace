const Mood = require('../models/Mood');
const AIService = require('../utils/aiService');

// @desc    Create mood check-in
// @route   POST /api/mood
// @access  Private
const createMoodCheckIn = async (req, res) => {
  try {
    const { mood, intensity, notes, tags, location, weather } = req.body;

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: 'Mood is required'
      });
    }

    // Analyze emotions from notes if provided
    let emotions = [];
    // Temporarily disabled AI analysis to prevent API key issues
    // if (notes) {
    //   emotions = await AIService.analyzeEmotions(notes);
    // }

    // Create mood entry
    const moodEntry = await Mood.create({
      user: req.user.id,
      mood,
      intensity: intensity || 5,
      notes,
      emotions,
      tags,
      location,
      weather,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: moodEntry
    });
  } catch (error) {
    console.error('Create mood check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating mood check-in'
    });
  }
};

// @desc    Get mood history
// @route   GET /api/mood
// @access  Private
const getMoodHistory = async (req, res) => {
  try {
    const { limit = 20, days, mood } = req.query;

    let query = { user: req.user.id };

    // Filter by days if specified
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      query.timestamp = { $gte: startDate };
    }

    // Filter by specific mood if specified
    if (mood) {
      query.mood = mood;
    }

    const moodEntries = await Mood.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: moodEntries
    });
  } catch (error) {
    console.error('Get mood history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting mood history'
    });
  }
};

// @desc    Get mood statistics
// @route   GET /api/mood/stats
// @access  Private
const getMoodStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const stats = await Mood.getMoodStats(req.user.id, parseInt(days));
    const trends = await Mood.getMoodTrends(req.user.id, parseInt(days));

    // Calculate mood distribution
    const moodDistribution = stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        avgIntensity: stat.avgIntensity
      };
      return acc;
    }, {});

    // Calculate most common mood
    const mostCommonMood = stats.length > 0 ? stats[0]._id : null;

    // Calculate average mood intensity
    const totalEntries = stats.reduce((sum, stat) => sum + stat.count, 0);
    const avgIntensity = totalEntries > 0 
      ? stats.reduce((sum, stat) => sum + (stat.avgIntensity * stat.count), 0) / totalEntries
      : 0;

    res.json({
      success: true,
      data: {
        moodDistribution,
        mostCommonMood,
        avgIntensity: Math.round(avgIntensity * 10) / 10,
        totalEntries,
        trends,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get mood stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting mood statistics'
    });
  }
};

// @desc    Get mood by ID
// @route   GET /api/mood/:id
// @access  Private
const getMoodById = async (req, res) => {
  try {
    const moodEntry = await Mood.findById(req.params.id);

    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found'
      });
    }

    // Check if user owns this mood entry
    if (moodEntry.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this mood entry'
      });
    }

    res.json({
      success: true,
      data: moodEntry
    });
  } catch (error) {
    console.error('Get mood by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting mood entry'
    });
  }
};

// @desc    Update mood entry
// @route   PUT /api/mood/:id
// @access  Private
const updateMoodEntry = async (req, res) => {
  try {
    const { mood, intensity, notes, tags } = req.body;

    let moodEntry = await Mood.findById(req.params.id);

    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found'
      });
    }

    // Check if user owns this mood entry
    if (moodEntry.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this mood entry'
      });
    }

    // Analyze emotions from notes if provided
    let emotions = moodEntry.emotions;
    if (notes && notes !== moodEntry.notes) {
      emotions = await AIService.analyzeEmotions(notes);
    }

    // Update mood entry
    moodEntry.mood = mood || moodEntry.mood;
    moodEntry.intensity = intensity || moodEntry.intensity;
    moodEntry.notes = notes || moodEntry.notes;
    moodEntry.emotions = emotions;
    moodEntry.tags = tags || moodEntry.tags;

    await moodEntry.save();

    res.json({
      success: true,
      data: moodEntry
    });
  } catch (error) {
    console.error('Update mood entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating mood entry'
    });
  }
};

// @desc    Delete mood entry
// @route   DELETE /api/mood/:id
// @access  Private
const deleteMoodEntry = async (req, res) => {
  try {
    const moodEntry = await Mood.findById(req.params.id);

    if (!moodEntry) {
      return res.status(404).json({
        success: false,
        message: 'Mood entry not found'
      });
    }

    // Check if user owns this mood entry
    if (moodEntry.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this mood entry'
      });
    }

    await Mood.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Mood entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete mood entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting mood entry'
    });
  }
};

module.exports = {
  createMoodCheckIn,
  getMoodHistory,
  getMoodStats,
  getMoodById,
  updateMoodEntry,
  deleteMoodEntry
}; 