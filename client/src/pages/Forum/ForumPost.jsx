import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ForumPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [commentError, setCommentError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPostAndReplies = async () => {
    try {
      setLoading(true);
      setError(null);
      const [postRes, repliesRes] = await Promise.all([
        API.get(`/forum/${id}`),
        API.get(`/forum/${id}/comments`)
      ]);
      setPost(postRes.data.data);
      setReplies(repliesRes.data.data);
    } catch (err) {
      setError('Failed to load post. It might not exist.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only increment view if not already viewed in this session
    const viewedKey = `forum_viewed_${id}`;
    if (!sessionStorage.getItem(viewedKey)) {
      fetchPostAndReplies();
      sessionStorage.setItem(viewedKey, 'true');
    } else {
      // Fetch post and replies, but don't increment view (use a new API endpoint or skip increment logic in backend)
      API.get(`/forum/${id}`).then(postRes => setPost(postRes.data.data)).catch(err => setError('Failed to load post. It might not exist.'));
      API.get(`/forum/${id}/comments`).then(repliesRes => setReplies(repliesRes.data.data)).catch(() => {});
    }
    // eslint-disable-next-line
  }, [id]);

  const handleDelete = async () => {
    setDeleteError(null);
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const response = await API.delete(`/forum/${id}`);
      console.log('Delete response:', response.data);
      navigate('/forum');
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setDeleteError('You are not authorized to delete this post or your session has expired.');
      } else if (err.response?.status === 404) {
        setDeleteError('Post not found or already deleted.');
      } else {
        setDeleteError('Failed to delete post. Please try again.');
      }
      setDeleting(false);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    setCommentError(null);
    if (!newReply.trim()) return;
    setSubmittingReply(true);
    try {
      const { data } = await API.post(`/forum/${id}/comments`, {
        content: newReply
      });
      setReplies(prev => [data.data, ...prev]);
      setNewReply('');
      // Refetch post to update views and comment count
      fetchPostAndReplies();
    } catch (error) {
      setCommentError('Failed to post comment. Are you logged in?');
      console.error('Error submitting reply:', error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return postTime.toLocaleDateString();
  };

  // Helper: check if current user is author
  const isAuthor = user && post && (
    (post.user && typeof post.user === 'object' && user._id === post.user._id) ||
    (post.user && typeof post.user === 'string' && user._id === post.user) ||
    (post.user && user._id === post.user.toString())
  );

  // Debug logging
  useEffect(() => {
    if (post && user) {
      console.log('Debug - User:', user);
      console.log('Debug - Post user:', post.user);
      console.log('Debug - Is author:', isAuthor);
    }
  }, [post, user, isAuthor]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Post not found</h3>
          <p className="text-gray-600 mb-4">{error || "The post you're looking for doesn't exist or has been removed."}</p>
          <Link
            to="/forum"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/forum" className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            <span>←</span>
            <span>Back to Forum</span>
          </Link>
        </div>

        {/* Main Post */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
              {post.type}
            </span>
            <span className="text-sm text-gray-500">
              {post.isAnonymous ? 'Anonymous' : post.user.name}
            </span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">{formatTime(post.createdAt)}</span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">{post.views} views</span>
            {/* Visually improved delete button for post author */}
            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                title="Delete Post"
                className="ml-auto flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-full transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                style={{ marginLeft: 'auto' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="sr-only">Delete</span>
                {deleting && <span className="ml-1 text-xs">Deleting...</span>}
              </button>
            )}
          </div>
          {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{post.title}</h1>
          <div className="prose max-w-none text-gray-700 dark:text-gray-200 leading-relaxed mb-6">
            {post.content}
          </div>
        </div>

        {/* Replies */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Replies ({replies.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {replies.map((reply) => (
              <div key={reply._id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {reply.isAnonymous ? 'Anonymous' : reply.user.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{formatTime(reply.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Reply Form */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add a Reply</h3>
            {commentError && <div className="text-red-600 text-sm mb-2">{commentError}</div>}
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Share your thoughts, advice, or support..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newReply.trim() || submittingReply}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingReply ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Community Guidelines</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>• Be supportive and respectful in your replies</p>
            <p>• Avoid giving medical advice - encourage professional help when needed</p>
            <p>• Share personal experiences to help others feel less alone</p>
            <p>• Remember that everyone's journey is different</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPost; 