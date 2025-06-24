const Game = require('../models/Game');
const mongoose = require('mongoose');

// Get user's game history
const getGameHistory = async (req, res) => {
  try {
    const games = await Game.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(games);
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ message: 'Error fetching game history' });
  }
};

// Save game result
const saveGameResult = async (req, res) => {
  try {
    const { gameName, score, time, category, difficulty } = req.body;
    
    const game = new Game({
      user: req.user.id,
      gameName,
      score,
      time,
      category,
      difficulty,
      completedAt: new Date()
    });
    
    await game.save();
    
    res.status(201).json(game);
  } catch (error) {
    console.error('Error saving game result:', error);
    res.status(500).json({ message: 'Error saving game result' });
  }
};

// Get game statistics
const getGameStats = async (req, res) => {
  try {
    const stats = await Game.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$category',
          totalGames: { $sum: 1 },
          totalScore: { $sum: '$score' },
          totalTime: { $sum: '$time' },
          averageScore: { $avg: '$score' },
          averageTime: { $avg: '$time' }
        }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({ message: 'Error fetching game statistics' });
  }
};

// Get recent games
const getRecentGames = async (req, res) => {
  try {
    console.log('Getting recent games for user:', req.user.id);
    console.log('User ID type:', typeof req.user.id);
    
    const games = await Game.find({ user: req.user.id })
      .sort({ completedAt: -1 })
      .limit(10);
    
    console.log('Found games:', games.length);
    console.log('Games:', games);
    res.json(games);
  } catch (error) {
    console.error('Error fetching recent games:', error);
    res.status(500).json({ message: 'Error fetching recent games' });
  }
};

module.exports = {
  getGameHistory,
  saveGameResult,
  getGameStats,
  getRecentGames
}; 