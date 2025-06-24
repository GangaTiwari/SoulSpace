const express = require('express');
const router = express.Router();
const {
  syncWearableData,
  getWearableData,
  getHealthStats,
  connectWearable,
  disconnectWearable,
  getWearableStatus,
  // Add OAuth routes
  googleFitAuth,
  googleFitCallback,
  fitbitAuth,
  fitbitCallback
} = require('../controllers/wearableController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Wearable data
router.post('/sync', syncWearableData);
router.get('/', getWearableData);
router.get('/stats', getHealthStats);

// Wearable connections
router.get('/status', getWearableStatus);
router.post('/connect', connectWearable);
router.delete('/connect/:source', disconnectWearable);

// OAuth routes
router.get('/auth/google', googleFitAuth);
router.get('/auth/google/callback', googleFitCallback);
router.get('/auth/fitbit', fitbitAuth);
router.get('/auth/fitbit/callback', fitbitCallback);

module.exports = router; 