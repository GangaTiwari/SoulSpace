const Forum = require('../models/Forum');
const Comment = require('../models/Comment');
const AIService = require('../utils/aiService');

// @desc    Create forum post
// @route   POST /api/forum
// @access  Private
const createPost = async (req, res) => {
  try {
    const { type, title, content, isAnonymous = true } = req.body;

    if (!type || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, and content are required'
      });
    }

    // AI moderation
    let moderation = { isAppropriate: true, toxicity: 0, reason: 'Auto-approved' };
    try {
      moderation = await AIService.moderateContent(`${title} ${content}`);
    } catch (error) {
      console.error('Error moderating content:', error);
      // Fallback: basic content check
      const inappropriateWords = ['spam', 'inappropriate', 'offensive'];
      const hasInappropriateContent = inappropriateWords.some(word => 
        content.toLowerCase().includes(word) || title.toLowerCase().includes(word)
      );
      if (hasInappropriateContent) {
        return res.status(400).json({
          success: false,
          message: 'Content contains inappropriate language'
        });
      }
    }
    
    if (!moderation.isAppropriate) {
      return res.status(400).json({
        success: false,
        message: `Content not approved: ${moderation.reason}`
      });
    }

    // Analyze emotions and sentiment
    let emotions = [];
    let sentiment = { score: 0, label: 'neutral' };
    
    try {
      emotions = await AIService.analyzeEmotions(content);
    } catch (error) {
      console.error('Error analyzing emotions:', error);
      // Fallback: basic emotion detection
      const emotionKeywords = {
        joy: ['happy', 'joy', 'excited', 'great', 'wonderful'],
        sadness: ['sad', 'depressed', 'down', 'unhappy'],
        anxiety: ['anxious', 'worried', 'stress', 'nervous'],
        anger: ['angry', 'mad', 'frustrated', 'upset']
      };
      
      for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
          emotions.push({ emotion, confidence: 0.7 });
        }
      }
    }
    
    try {
      sentiment = await AIService.analyzeSentiment(content);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      // Fallback: basic sentiment detection
      const positiveWords = ['good', 'great', 'happy', 'love', 'wonderful', 'amazing'];
      const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'horrible'];
      
      const positiveCount = positiveWords.filter(word => content.toLowerCase().includes(word)).length;
      const negativeCount = negativeWords.filter(word => content.toLowerCase().includes(word)).length;
      
      if (positiveCount > negativeCount) {
        sentiment = { score: 0.5, label: 'positive' };
      } else if (negativeCount > positiveCount) {
        sentiment = { score: -0.5, label: 'negative' };
      } else {
        sentiment = { score: 0, label: 'neutral' };
      }
    }

    // Create forum post
    const post = await Forum.create({
      user: req.user.id,
      type,
      title,
      content,
      emotions,
      sentiment,
      moderation: {
        status: moderation.toxicity > 0.7 ? 'flagged' : 'approved',
        toxicity: moderation.toxicity,
        moderatedBy: 'ai',
        moderatedAt: new Date()
      },
      isAnonymous,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Create forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating forum post'
    });
  }
};

// @desc    Get forum posts
// @route   GET /api/forum
// @access  Public (with optional auth)
const getPosts = async (req, res) => {
  try {
    const { limit = 20, type, emotions, sort = 'recent' } = req.query;

    // Auto-approve pending posts with low toxicity
    await Forum.updateMany(
      { 
        'moderation.status': 'pending',
        'moderation.toxicity': { $lt: 0.3 }
      },
      { 
        'moderation.status': 'approved',
        'moderation.moderatedBy': 'ai',
        'moderation.moderatedAt': new Date()
      }
    );

    // Show all posts except rejected ones
    let query = { 
      'moderation.status': { $in: ['approved', 'pending'] } 
    };

    // Filter by type if specified
    if (type) {
      query.type = type;
    }

    // Filter by emotions if specified
    if (emotions) {
      query['emotions.emotion'] = { $in: emotions.split(',') };
    }

    let sortOption = {};
    switch (sort) {
      case 'recent':
        sortOption = { timestamp: -1 };
        break;
      case 'popular':
        sortOption = { 'reactions.heart': -1, timestamp: -1 };
        break;
      case 'trending':
        // Sort by total reactions
        sortOption = { $expr: { $sum: ['$reactions.heart', '$reactions.hug', '$reactions.strength'] } };
        break;
      default:
        sortOption = { timestamp: -1 };
    }

    const posts = await Forum.find(query)
      .sort(sortOption)
      .limit(parseInt(limit))
      .populate('user', 'name _id anonymousId userType');

    // Anonymize user data if post is anonymous
    const anonymizedPosts = posts.map(post => {
      const postObj = post.toObject();
      if (post.isAnonymous) {
        postObj.user = { name: 'Anonymous', anonymousId: null, userType: 'anonymous' };
      }
      return postObj;
    });

    res.json({
      success: true,
      data: anonymizedPosts
    });
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting forum posts'
    });
  }
};

// @desc    Get forum post by ID
// @route   GET /api/forum/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id)
      .populate('user', 'name anonymousId userType');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views only if not author
    if (!req.user || post.user.toString() !== req.user.id) {
      post.views += 1;
      await post.save();
    }

    // Anonymize user data if post is anonymous
    const postObj = post.toObject();
    if (post.isAnonymous) {
      postObj.user = { name: 'Anonymous', anonymousId: null, userType: 'anonymous' };
    }

    res.json({
      success: true,
      data: postObj
    });
  } catch (error) {
    console.error('Get forum post by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting forum post'
    });
  }
};

// @desc    Add reaction to post
// @route   POST /api/forum/:id/reactions
// @access  Private
const addReaction = async (req, res) => {
  try {
    const { reactionType } = req.body;

    if (!reactionType || !['heart', 'hug', 'strength', 'celebrate', 'support'].includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid reaction type is required'
      });
    }

    const post = await Forum.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add reaction
    await post.addReaction(req.user.id, reactionType);

    res.json({
      success: true,
      data: {
        reactions: post.reactions,
        userReactions: post.userReactions
      }
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding reaction'
    });
  }
};

// @desc    Get forum statistics
// @route   GET /api/forum/stats
// @access  Public
const getForumStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const stats = await Forum.getForumStats(parseInt(days));

    res.json({
      success: true,
      data: {
        stats,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get forum stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting forum statistics'
    });
  }
};

// @desc    Update forum post
// @route   PUT /api/forum/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;

    let post = await Forum.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns this post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    // AI moderation for updated content
    const moderation = await AIService.moderateContent(`${title} ${content}`);
    
    if (!moderation.isAppropriate) {
      return res.status(400).json({
        success: false,
        message: `Content not approved: ${moderation.reason}`
      });
    }

    // Re-analyze emotions and sentiment
    const emotions = await AIService.analyzeEmotions(content);
    const sentiment = await AIService.analyzeSentiment(content);

    // Update post
    post.title = title || post.title;
    post.content = content || post.content;
    post.emotions = emotions;
    post.sentiment = sentiment;
    post.moderation = {
      status: moderation.toxicity > 0.7 ? 'flagged' : 'approved',
      toxicity: moderation.toxicity,
      moderatedBy: 'ai',
      moderatedAt: new Date()
    };

    await post.save();

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Update forum post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating forum post'
    });
  }
};

// @desc    Delete forum post
// @route   DELETE /api/forum/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    console.log('Delete request for post:', req.params.id);
    console.log('User ID:', req.user.id);
    
    const post = await Forum.findById(req.params.id);

    if (!post) {
      console.log('Post not found');
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    console.log('Post found, user ID:', post.user.toString());

    // Check if user owns this post
    if (post.user.toString() !== req.user.id) {
      console.log('User not authorized');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    console.log('User authorized, proceeding with deletion');

    // Delete the post directly (comments will be orphaned but that's okay for now)
    const postResult = await Forum.findByIdAndDelete(req.params.id);
    
    if (!postResult) {
      console.log('Post deletion returned null');
      return res.status(404).json({
        success: false,
        message: 'Post not found or already deleted'
      });
    }
    
    console.log('Post deleted successfully');

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete forum post error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error deleting forum post'
    });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/forum/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const { content, isAnonymous } = req.body;

    const comment = await Comment.create({
      post: req.params.id,
      user: req.user.id,
      content,
      isAnonymous
    });

    // Increment comment count on the post
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: 'Server error adding comment' });
  }
};

// @desc    Get comments for a post
// @route   GET /api/forum/:id/comments
// @access  Public
const getCommentsForPost = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
      
    const anonymizedComments = comments.map(comment => {
      const commentObj = comment.toObject();
      if (comment.isAnonymous) {
        commentObj.user = { name: 'Anonymous' };
      }
      return commentObj;
    });

    res.json({ success: true, data: anonymizedComments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ success: false, message: 'Server error getting comments' });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  addReaction,
  getForumStats,
  updatePost,
  deletePost,
  addComment,
  getCommentsForPost
};