const express = require('express');
const router = express.Router();
const {
  createMoodCheckIn,
  getMoodHistory,
  getMoodStats,
  getMoodById,
  updateMoodEntry,
  deleteMoodEntry
} = require('../controllers/moodController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Specific routes must come before parameterized routes
router.get('/history', getMoodHistory);
router.get('/stats', getMoodStats);

// General routes
router.post('/', createMoodCheckIn);
router.get('/', getMoodHistory);

// Parameterized routes must come last
router.get('/:id', getMoodById);
router.put('/:id', updateMoodEntry);
router.delete('/:id', deleteMoodEntry);

module.exports = router; 