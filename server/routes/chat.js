const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  getUserContext,
  getSelfCareSuggestions
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Send message to AI
router.post('/', sendMessage);

// Get user's chat history
router.get('/history', getChatHistory);

// Get user context for AI
router.get('/context', getUserContext);

// Get self-care suggestions
router.get('/suggestions', getSelfCareSuggestions);

module.exports = router; 