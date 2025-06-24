const WearableData = require('../models/WearableData');
const User = require('../models/User');

// @desc    Sync wearable data
// @route   POST /api/wearable/sync
// @access  Private
const syncWearableData = async (req, res) => {
  try {
    const { source, data, date } = req.body;

    if (!source || !data || !date) {
      return res.status(400).json({
        success: false,
        message: 'Source, data, and date are required'
      });
    }

    if (!['google-fit', 'fitbit'].includes(source)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid source. Must be "google-fit" or "fitbit"'
      });
    }

    // Check if data already exists for this date
    const existingData = await WearableData.findOne({
      user: req.user.id,
      source,
      date: new Date(date)
    });

    if (existingData) {
      // Update existing data
      Object.assign(existingData, data);
      existingData.lastSync = new Date();
      await existingData.save();

      res.json({
        success: true,
        data: existingData,
        message: 'Wearable data updated successfully'
      });
    } else {
      // Create new data
      const wearableData = await WearableData.create({
        user: req.user.id,
        source,
        date: new Date(date),
        ...data,
        lastSync: new Date()
      });

      res.status(201).json({
        success: true,
        data: wearableData,
        message: 'Wearable data synced successfully'
      });
    }
  } catch (error) {
    console.error('Sync wearable data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error syncing wearable data'
    });
  }
};

// @desc    Get wearable data
// @route   GET /api/wearable
// @access  Private
const getWearableData = async (req, res) => {
  try {
    const { source, days = 7, date } = req.query;

    let query = { user: req.user.id };

    if (source) {
      query.source = source;
    }

    if (date) {
      query.date = new Date(date);
    } else if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      query.date = { $gte: startDate };
    }

    const wearableData = await WearableData.find(query)
      .sort({ date: -1 })
      .limit(parseInt(days) || 7);

    res.json({
      success: true,
      data: wearableData
    });
  } catch (error) {
    console.error('Get wearable data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting wearable data'
    });
  }
};

// @desc    Get health statistics
// @route   GET /api/wearable/stats
// @access  Private
const getHealthStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const stats = await WearableData.getHealthStats(req.user.id, parseInt(days));
    const moodCorrelation = await WearableData.getMoodCorrelation(req.user.id, parseInt(days));

    res.json({
      success: true,
      data: {
        stats: stats.length > 0 ? stats[0] : {},
        moodCorrelation,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get health stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting health statistics'
    });
  }
};

// @desc    Connect wearable account
// @route   POST /api/wearable/connect
// @access  Private
const connectWearable = async (req, res) => {
  try {
    const { source, accessToken, refreshToken } = req.body;

    if (!source || !accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Source and access token are required'
      });
    }

    if (!['google-fit', 'fitbit'].includes(source)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid source. Must be "google-fit" or "fitbit"'
      });
    }

    const user = await User.findById(req.user.id);

    // Update wearable connection
    user.wearables[source] = {
      connected: true,
      accessToken,
      refreshToken,
      lastSync: new Date()
    };

    await user.save();

    res.json({
      success: true,
      data: {
        source,
        connected: true,
        lastSync: new Date()
      },
      message: `${source} connected successfully`
    });
  } catch (error) {
    console.error('Connect wearable error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error connecting wearable'
    });
  }
};

// @desc    Disconnect wearable account
// @route   DELETE /api/wearable/connect/:source
// @access  Private
const disconnectWearable = async (req, res) => {
  try {
    const { source } = req.params;

    if (!['google-fit', 'fitbit'].includes(source)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid source. Must be "google-fit" or "fitbit"'
      });
    }

    const user = await User.findById(req.user.id);

    // Disconnect wearable
    user.wearables[source] = {
      connected: false,
      accessToken: null,
      refreshToken: null,
      lastSync: null
    };

    await user.save();

    res.json({
      success: true,
      message: `${source} disconnected successfully`
    });
  } catch (error) {
    console.error('Disconnect wearable error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error disconnecting wearable'
    });
  }
};

// @desc    Get wearable connection status
// @route   GET /api/wearable/status
// @access  Private
const getWearableStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        googleFit: user.wearables.googleFit,
        fitbit: user.wearables.fitbit
      }
    });
  } catch (error) {
    console.error('Get wearable status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting wearable status'
    });
  }
};

// @desc    Google Fit OAuth initiation
// @route   GET /api/wearable/auth/google
// @access  Private
const googleFitAuth = async (req, res) => {
  try {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read')}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `state=${req.user.id}`;

    res.json({
      success: true,
      data: {
        authUrl: googleAuthUrl
      }
    });
  } catch (error) {
    console.error('Google Fit auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error initiating Google Fit auth'
    });
  }
};

// @desc    Google Fit OAuth callback
// @route   GET /api/wearable/auth/google/callback
// @access  Private
const googleFitCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code and state are required'
      });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get access token'
      });
    }

    // Update user's Google Fit connection
    const user = await User.findById(state);
    user.wearables.googleFit = {
      connected: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      lastSync: new Date()
    };

    await user.save();

    // Redirect to frontend with success
    res.redirect(`${process.env.CLIENT_URL}/settings?googleFit=success`);
  } catch (error) {
    console.error('Google Fit callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/settings?googleFit=error`);
  }
};

// @desc    Fitbit OAuth initiation
// @route   GET /api/wearable/auth/fitbit
// @access  Private
const fitbitAuth = async (req, res) => {
  try {
    const fitbitAuthUrl = `https://www.fitbit.com/oauth2/authorize?` +
      `client_id=${process.env.FITBIT_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.FITBIT_REDIRECT_URI)}&` +
      `scope=${encodeURIComponent('activity heartrate location nutrition profile settings sleep social weight')}&` +
      `response_type=code&` +
      `state=${req.user.id}`;

    res.json({
      success: true,
      data: {
        authUrl: fitbitAuthUrl
      }
    });
  } catch (error) {
    console.error('Fitbit auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error initiating Fitbit auth'
    });
  }
};

// @desc    Fitbit OAuth callback
// @route   GET /api/wearable/auth/fitbit/callback
// @access  Private
const fitbitCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code and state are required'
      });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.FITBIT_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get access token'
      });
    }

    // Update user's Fitbit connection
    const user = await User.findById(state);
    user.wearables.fitbit = {
      connected: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      lastSync: new Date()
    };

    await user.save();

    // Redirect to frontend with success
    res.redirect(`${process.env.CLIENT_URL}/settings?fitbit=success`);
  } catch (error) {
    console.error('Fitbit callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/settings?fitbit=error`);
  }
};

module.exports = {
  syncWearableData,
  getWearableData,
  getHealthStats,
  connectWearable,
  disconnectWearable,
  getWearableStatus,
  googleFitAuth,
  googleFitCallback,
  fitbitAuth,
  fitbitCallback
}; 