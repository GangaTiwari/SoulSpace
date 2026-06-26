const AIService = require('../utils/aiService');
const ChatHistory = require('../models/ChatHistory');
const Mood = require('../models/Mood');
const Journal = require('../models/Journal');

// @desc    Send message to AI chat
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    console.log('Received message:', message);
    console.log('Conversation history length:', conversationHistory.length);

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get user's current mood and context
    const [recentMood, recentJournal] = await Promise.all([
      Mood.findOne({ user: req.user.id }).sort({ timestamp: -1 }).select('mood intensity'),
      Journal.findOne({ user: req.user.id }).sort({ timestamp: -1 }).select('content'),
    ]);

    const userMood = recentMood ? recentMood.mood : 'neutral';
    const moodIntensity = recentMood ? recentMood.intensity : 5;

    // Get user's chat history for context
    const chatHistory = await ChatHistory.getUserHistory(req.user.id, 20);
    
    // Prepare user context for AI
    const userContext = {
      currentMood: userMood,
      moodIntensity: moodIntensity,
      recentMood: recentMood ? recentMood.mood : 'unknown',
      journalStreak: 0,
      moodStreak: 0,
      level: 1,
      experience: 0,
      lastActivity: new Date()
    };

    // Combine conversation history with stored chat history
    const fullConversationHistory = [
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      ...conversationHistory
    ];

    // Generate AI response with personalized context
    const aiResponse = await AIService.generateChatResponse(
      message,
      userMood,
      fullConversationHistory,
      userContext
    );

    // Save both user message and AI response to chat history
    await Promise.all([
      ChatHistory.addMessage(req.user.id, 'user', message, userContext),
      ChatHistory.addMessage(req.user.id, 'assistant', aiResponse, userContext)
    ]);

    res.json({
      success: true,
      data: {
        message: aiResponse,
        timestamp: new Date(),
        userMood,
        userContext
      }
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
};

// @desc    Get user's chat history
// @route   GET /api/chat/history
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const chatHistory = await ChatHistory.getUserHistory(req.user.id, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        messages: chatHistory,
        totalMessages: chatHistory.length
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting chat history'
    });
  }
};

// @desc    Get user context for AI
// @route   GET /api/chat/context
// @access  Private
const getUserContext = async (req, res) => {
  try {
    const [recentMood, recentJournal] = await Promise.all([
      Mood.findOne({ user: req.user.id }).sort({ timestamp: -1 }).select('mood intensity'),
      Journal.findOne({ user: req.user.id }).sort({ timestamp: -1 }).select('content'),
    ]);

    const userContext = {
      currentMood: recentMood ? recentMood.mood : 'neutral',
      moodIntensity: recentMood ? recentMood.intensity : 5,
      recentMood: recentMood ? recentMood.mood : 'unknown',
      journalStreak: 0,
      moodStreak: 0,
      level: 1,
      experience: 0,
      lastActivity: new Date()
    };

    res.json({
      success: true,
      data: {
        userContext
      }
    });
  } catch (error) {
    console.error('Get user context error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user context'
    });
  }
};

// @desc    Get self-care suggestions
// @route   GET /api/chat/suggestions
// @access  Private
const getSelfCareSuggestions = async (req, res) => {
  try {
    // Get user's recent data for personalized suggestions
    const recentMood = await Mood.findOne({
      user: req.user.id
    })
    .sort({ timestamp: -1 })
    .select('mood');

   const userData = {
  recentMood: recentMood ? recentMood.mood : 'neutral',
};

    // Generate personalized suggestions
    const suggestions = await AIService.generateSelfCareSuggestions(
      userData.recentMood,
      userData
    );

    res.json({
      success: true,
      data: {
        suggestions,
        userData
      }
    });
  } catch (error) {
    console.error('Get self-care suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting suggestions'
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getUserContext,
  getSelfCareSuggestions
}; 