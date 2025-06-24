const express = require('express');
const router = express.Router();
console.log('Games route file loaded'); // DEBUG LOG
const { protect } = require('../middleware/auth');
const {
  getGameHistory,
  saveGameResult,
  getGameStats,
  getRecentGames
} = require('../controllers/gameController');

// Middleware to log all /api/games requests
router.use((req, res, next) => {
  console.log(`[GAMES ROUTE] ${req.method} ${req.originalUrl}`);
  next();
});

// Test endpoint (no auth required)
router.get('/test', (req, res) => {
  res.json({ message: 'Games API is working!' });
});

// Ping endpoint for connectivity testing
router.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Get user's game history
router.get('/history', protect, getGameHistory);

// Save game result
router.post('/save', protect, saveGameResult);

// Get game statistics
router.get('/stats', protect, getGameStats);

// Get recent games
router.get('/recent', protect, (req, res, next) => {
  console.log('GET /api/games/recent route hit'); // DEBUG LOG
  getRecentGames(req, res, next);
});

module.exports = router; 