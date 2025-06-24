const express = require('express');
const router = express.Router();
const {
  getJournalPrompt,
  createJournalEntry,
  getJournalEntries,
  getJournalStats,
  getJournalById,
  updateJournalEntry,
  deleteJournalEntry
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Journal entries
router.get('/prompt', getJournalPrompt);
router.post('/', createJournalEntry);
router.get('/', getJournalEntries);
router.get('/stats', getJournalStats);
router.get('/:id', getJournalById);
router.put('/:id', updateJournalEntry);
router.delete('/:id', deleteJournalEntry);

module.exports = router; 