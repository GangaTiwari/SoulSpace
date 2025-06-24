const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  addReaction,
  getForumStats,
  updatePost,
  deletePost,
  addComment,
  getCommentsForPost
} = require('../controllers/forumController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes (with optional auth)
router.get('/', optionalAuth, getPosts);
router.get('/stats', getForumStats);
router.get('/:id', optionalAuth, getPostById);
router.get('/:id/comments', optionalAuth, getCommentsForPost);

// Protected routes
router.post('/', protect, createPost);
router.post('/:id/reactions', protect, addReaction);
router.post('/:id/comments', protect, addComment);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;