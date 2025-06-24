const Mood = require('../models/Mood');
const Journal = require('../models/Journal');
const Forum = require('../models/Forum');
const WearableData = require('../models/WearableData');
const AIService = require('../utils/aiService');

// @desc    Get dashboard overview
// @route   GET /api/dashboard
// @access  Private
const getDashboardOverview = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    // Get all data for the specified period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Parallel data fetching
    const [
      moodStats,
      journalStats,
      forumStats,
      wearableStats,
      recentMoods,
      recentJournalEntries
    ] = await Promise.all([
      Mood.getMoodStats(req.user.id, parseInt(days)),
      Journal.getJournalStats(req.user.id, parseInt(days)),
      Forum.getForumStats(parseInt(days)),
      WearableData.getHealthStats(req.user.id, parseInt(days)),
      Mood.find({ user: req.user.id })
        .sort({ timestamp: -1 })
        .limit(5),
      Journal.find({ user: req.user.id })
        .sort({ timestamp: -1 })
        .limit(3)
    ]);

    // Generate AI insights
    const insights = await AIService.generateWeeklyInsights(
      moodStats,
      journalStats,
      wearableStats
    );

    // Calculate mood trends
    const moodTrends = recentMoods.map(mood => ({
      mood: mood.mood,
      intensity: mood.intensity,
      timestamp: mood.timestamp
    }));

    // Calculate overall wellness score
    const wellnessScore = calculateWellnessScore(
      moodStats,
      journalStats,
      wearableStats
    );

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        wellnessScore,
        insights,
        moodTrends,
        recentActivity: {
          moods: recentMoods.length,
          journalEntries: recentJournalEntries.length
        },
        stats: {
          mood: moodStats.length > 0 ? moodStats[0] : {},
          journal: journalStats.length > 0 ? journalStats[0] : {},
          forum: forumStats,
          wearable: wearableStats.length > 0 ? wearableStats[0] : {}
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting dashboard overview'
    });
  }
};

// @desc    Get mood analytics
// @route   GET /api/dashboard/mood-analytics
// @access  Private
const getMoodAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const moodStats = await Mood.getMoodStats(req.user.id, parseInt(days));
    const moodTrends = await Mood.getMoodTrends(req.user.id, parseInt(days));

    // Get mood by time of day
    const moodByTime = await Mood.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          avgIntensity: { $avg: '$intensity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get mood by day of week
    const moodByDay = await Mood.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: { $dayOfWeek: '$timestamp' },
          avgIntensity: { $avg: '$intensity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        moodDistribution: moodStats,
        trends: moodTrends,
        moodByTime,
        moodByDay
      }
    });
  } catch (error) {
    console.error('Get mood analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting mood analytics'
    });
  }
};

// @desc    Get journal analytics
// @route   GET /api/dashboard/journal-analytics
// @access  Private
const getJournalAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const journalStats = await Journal.getJournalStats(req.user.id, parseInt(days));
    const emotionTrends = await Journal.getEmotionTrends(req.user.id, parseInt(days));

    // Get writing patterns by time
    const writingByTime = await Journal.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          avgWords: { $avg: { $strLenCP: '$content' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get sentiment trends
    const sentimentTrends = await Journal.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          avgSentiment: { $avg: '$sentiment.score' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } },
      { $limit: parseInt(days) }
    ]);

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        stats: journalStats.length > 0 ? journalStats[0] : {},
        emotionTrends,
        writingByTime,
        sentimentTrends
      }
    });
  } catch (error) {
    console.error('Get journal analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting journal analytics'
    });
  }
};

// @desc    Get health analytics
// @route   GET /api/dashboard/health-analytics
// @access  Private
const getHealthAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const healthStats = await WearableData.getHealthStats(req.user.id, parseInt(days));
    const moodCorrelation = await WearableData.getMoodCorrelation(req.user.id, parseInt(days));

    // Get sleep patterns
    const sleepPatterns = await WearableData.aggregate([
      { $match: { user: req.user.id } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          avgSleep: { $avg: '$sleep.duration' },
          avgSteps: { $avg: '$steps.count' },
          avgHeartRate: { $avg: '$heartRate.average' }
        }
      },
      { $sort: { '_id': 1 } },
      { $limit: parseInt(days) }
    ]);

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        stats: healthStats.length > 0 ? healthStats[0] : {},
        moodCorrelation,
        sleepPatterns
      }
    });
  } catch (error) {
    console.error('Get health analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting health analytics'
    });
  }
};

// @desc    Get user's recent activities
// @route   GET /api/dashboard/activities
// @access  Private
const getRecentActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const activities = [];

    // Get last 10 mood check-ins
    const recentMoods = await Mood.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('mood intensity timestamp');

    recentMoods.forEach(mood => {
      activities.push({
        type: 'mood_check',
        description: `Recorded mood: ${mood.mood} (${mood.intensity}/10)`,
        time: getTimeAgo(mood.timestamp),
        timestamp: mood.timestamp
      });
    });

    // Get last 10 journal entries
    const recentJournals = await Journal.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('title timestamp');

    recentJournals.forEach(journal => {
      activities.push({
        type: 'journal',
        description: `Wrote journal entry: ${journal.title}`,
        time: getTimeAgo(journal.timestamp),
        timestamp: journal.timestamp
      });
    });

    // (Optional) Add more activity types here in the future
    // e.g., forum posts, comments, etc.

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: activities.slice(0, 10) // Return top 10 most recent
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting activities'
    });
  }
};

// @desc    Get personalized insights
// @route   GET /api/dashboard/insights
// @access  Private
const getInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const insights = [];

    // Get mood data for the last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentMoods = await Mood.find({
      user: userId,
      timestamp: { $gte: weekAgo }
    }).sort({ timestamp: -1 });

    const journalCount = await Journal.countDocuments({
      user: userId,
      timestamp: { $gte: weekAgo }
    });

    // Calculate mood trend
    if (recentMoods.length >= 2) {
      const firstHalf = recentMoods.slice(0, Math.ceil(recentMoods.length / 2));
      const secondHalf = recentMoods.slice(Math.ceil(recentMoods.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, m) => sum + m.intensity, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, m) => sum + m.intensity, 0) / secondHalf.length;
      
      const trend = secondAvg > firstAvg ? 'up' : secondAvg < firstAvg ? 'down' : 'neutral';
      const avgMood = (firstAvg + secondAvg) / 2;
      
      insights.push({
        title: 'Mood Trend',
        value: trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable',
        trend: trend,
        color: trend === 'up' ? 'green' : trend === 'down' ? 'red' : 'gray'
      });
    } else {
      insights.push({
        title: 'Mood Trend',
        value: 'Not enough data',
        trend: 'neutral',
        color: 'gray'
      });
    }

    // Journal streak
    const journalStreak = await calculateJournalStreak(userId);
    insights.push({
      title: 'Journal Streak',
      value: `${journalStreak} days`,
      trend: journalStreak > 0 ? 'up' : 'neutral',
      color: journalStreak > 0 ? 'blue' : 'gray'
    });

    // Weekly activity
    insights.push({
      title: 'Weekly Activity',
      value: `${recentMoods.length} mood checks, ${journalCount} journal entries`,
      trend: recentMoods.length > 3 ? 'up' : 'neutral',
      color: recentMoods.length > 3 ? 'green' : 'gray'
    });

    // Sleep quality (placeholder - would come from wearable data)
    insights.push({
      title: 'Sleep Quality',
      value: 'Not tracked',
      trend: 'neutral',
      color: 'gray'
    });

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting insights'
    });
  }
};

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get mood statistics
    const totalMoods = await Mood.countDocuments({ user: userId });
    const recentMoods = await Mood.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(7);

    const averageMood = recentMoods.length > 0 
      ? recentMoods.reduce((sum, mood) => sum + mood.intensity, 0) / recentMoods.length 
      : 0;

    // Get journal statistics
    const totalJournals = await Journal.countDocuments({ user: userId });
    const journalStreak = await calculateJournalStreak(userId);

    const summary = {
      mood: {
        total: totalMoods,
        average: Math.round(averageMood * 10) / 10,
        streak: calculateMoodStreak(recentMoods),
        recent: recentMoods.length
      },
      journal: {
        total: totalJournals,
        streak: journalStreak,
        weekly: await Journal.countDocuments({
          user: userId,
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
      }
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting summary'
    });
  }
};

// Helper function to calculate journal streak using MongoDB aggregation
const calculateJournalStreak = async (userId) => {
  // Get all unique days with a journal entry, sorted descending
  const days = await Journal.aggregate([
    { $match: { user: userId } },
    { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp", timezone: "UTC" } } } },
    { $group: { _id: "$day" } },
    { $sort: { _id: -1 } }
  ]);
  if (days.length === 0) return 0;
  let streak = 0;
  let current = new Date();
  current.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < days.length; i++) {
    const entryDate = new Date(days[i]._id + 'T00:00:00Z');
    const diff = Math.floor((current - entryDate) / (1000 * 60 * 60 * 24));
    if (diff === streak) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

// Helper function to calculate mood streak using MongoDB aggregation
const calculateMoodStreak = async (userId) => {
  const days = await Mood.aggregate([
    { $match: { user: userId } },
    { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp", timezone: "UTC" } } } },
    { $group: { _id: "$day" } },
    { $sort: { _id: -1 } }
  ]);
  if (days.length === 0) return 0;
  let streak = 0;
  let current = new Date();
  current.setUTCHours(0, 0, 0, 0);
  for (let i = 0; i < days.length; i++) {
    const entryDate = new Date(days[i]._id + 'T00:00:00Z');
    const diff = Math.floor((current - entryDate) / (1000 * 60 * 60 * 24));
    if (diff === streak) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

// Helper function to get time ago string
const getTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

// Helper function to calculate wellness score
const calculateWellnessScore = (moodStats, journalStats, wearableStats) => {
  let score = 50; // Base score

  // Mood factor (30%)
  if (moodStats.length > 0) {
    const avgMoodIntensity = moodStats.reduce((sum, stat) => sum + stat.avgIntensity, 0) / moodStats.length;
    score += (avgMoodIntensity / 10) * 30;
  }

  // Journal factor (20%)
  if (journalStats.length > 0) {
    const avgSentiment = journalStats[0].avgSentiment || 0;
    score += ((avgSentiment + 1) / 2) * 20;
  }

  // Activity factor (25%)
  if (wearableStats.length > 0) {
    const avgSteps = wearableStats[0].avgSteps || 0;
    const avgSleep = wearableStats[0].avgSleep || 0;
    
    // Steps contribution (0-10 points)
    score += Math.min(10, (avgSteps / 10000) * 10);
    
    // Sleep contribution (0-15 points)
    const sleepScore = Math.max(0, 15 - Math.abs(avgSleep - 8) * 2);
    score += sleepScore;
  }

  return Math.round(Math.min(100, Math.max(0, score)));
};

module.exports = {
  getDashboardOverview,
  getMoodAnalytics,
  getJournalAnalytics,
  getHealthAnalytics,
  getRecentActivities,
  getInsights,
  getDashboardSummary
}; 