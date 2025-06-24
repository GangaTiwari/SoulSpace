const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user (email or anonymous)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, userType = 'email' } = req.body;

    // Validate user type
    if (!['email', 'anonymous'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be "email" or "anonymous"'
      });
    }

    let user;

    if (userType === 'email') {
      // Email registration
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Please provide name, email, and password for email registration'
        });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create user
      user = await User.create({
        name,
        email,
        password,
        userType: 'email'
      });
    } else {
      // Anonymous registration
      const anonymousId = `anon_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      
      user = await User.create({
        name: name || 'Anonymous User',
        anonymousId,
        userType: 'anonymous'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          anonymousId: user.anonymousId
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, anonymousId } = req.body;

    let user;

    if (anonymousId) {
      // Anonymous login
      user = await User.findOne({ anonymousId });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid anonymous credentials'
        });
      }
    } else {
      // Email login
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }

      // Check for user
      user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          anonymousId: user.anonymousId,
          preferences: user.preferences
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          anonymousId: user.anonymousId,
          preferences: user.preferences,
          wearables: user.wearables
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, bio, preferences } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (email && user.userType === 'email') user.email = email;
    if (bio) user.bio = bio;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          anonymousId: user.anonymousId,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting account'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  deleteAccount
}; 