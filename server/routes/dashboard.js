const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getMoodAnalytics,
  getJournalAnalytics,
  getHealthAnalytics,
  getRecentActivities,
  getInsights,
  getDashboardSummary
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Dashboard overview
router.get('/', getDashboardOverview);

// Analytics
router.get('/mood-analytics', getMoodAnalytics);
router.get('/journal-analytics', getJournalAnalytics);
router.get('/health-analytics', getHealthAnalytics);

// Dashboard data
router.get('/activities', getRecentActivities);
router.get('/insights', getInsights);
router.get('/summary', getDashboardSummary);

module.exports = router; 