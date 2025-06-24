import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ForumList = () => {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, trending
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [filter, sortBy, searchTerm]);

  const fetchPosts = async () => {
    try {
      setDeleteError(null);
      let url = `/forum?sort=${sortBy}&search=${searchTerm}`;
      if (filter !== 'all') {
        url += `&type=${filter}`;
      }
      const response = await API.get(url);
      setPosts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      // No-op: loading handled by AuthContext
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleVote = async (postId, reactionType) => {
    try {
      await API.post(`/forum/${postId}/reactions`, { reactionType });
      // Optimistically update the UI or refetch posts
      fetchPosts();
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const handleDelete = async (postId) => {
    setDeleteError(null);
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    setDeletingId(postId);
    try {
      const response = await API.delete(`/forum/${postId}`);
      console.log('Delete response:', response.data);
      fetchPosts();
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setDeleteError('You are not authorized to delete this post or your session has expired.');
      } else if (err.response?.status === 404) {
        setDeleteError('Post not found or already deleted.');
      } else {
        setDeleteError('Failed to delete post. Please try again.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const categories = [
    { id: 'all', label: 'All Posts', color: 'bg-gray-500' },
    { id: 'support', label: 'Support & Encouragement', color: 'bg-green-500' },
    { id: 'struggle', label: 'Sharing Struggles', color: 'bg-blue-500' },
    { id: 'victory', label: 'Celebrating Victories', color: 'bg-yellow-500' },
    { id: 'question', label: 'Questions & Advice', color: 'bg-purple-500' },
    { id: 'advice', label: 'Tips & Strategies', color: 'bg-orange-500' }
  ];

  const sortOptions = [
    { id: 'recent', label: 'Recent' },
    { id: 'popular', label: 'Popular' },
    { id: 'trending', label: 'Trending' },
  ];

  const formatTime = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postTime) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return postTime.toLocaleDateString();
  };

  const getVoteColor = (userVote, voteType) => {
    if (userVote === voteType) {
      return voteType === 'up' ? 'text-green-600' : 'text-red-600';
    }
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading user...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Community Forum <span className="text-blue-600 dark:text-blue-400">💬</span></h1>
          <Link to="/forum/create" className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold shadow">+ New Post</Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-6 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </form>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {deleteError && <div className="text-red-600 text-sm mb-2 dark:text-red-400">{deleteError}</div>}
          {posts.map((post) => {
            let isAuthor = false;
            if (user && post && post.user) {
              const userId = String(user._id);
              const postUserId = typeof post.user === 'object' ? String(post.user._id) : String(post.user);
              isAuthor = userId === postUserId;
            }
            return (
              <div key={post._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 hover:shadow-2xl transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="flex">
                  <div className="flex flex-col items-center mr-4 space-y-1">
                    <button
                      onClick={() => handleVote(post._id, 'heart')}
                      className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 dark:text-gray-300`}
                    >
                      ❤️
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{post.reactions?.heart || 0}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold dark:bg-blue-700">{post.type}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{post.isAnonymous ? 'Anonymous' : post.user.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{formatTime(post.createdAt)}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{post.views} views</span>
                      {isAuthor && (
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs font-semibold"
                          disabled={deletingId === post._id}
                        >
                          {deletingId === post._id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                    <Link to={`/forum/${post._id}`} className="block text-lg font-bold text-gray-900 dark:text-white hover:underline mb-2">
                      {post.title}
                    </Link>
                    <p className="text-gray-700 dark:text-gray-200 mb-2 line-clamp-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Replies: {post.commentsCount || 0}</span>
                      <span>Hearts: {post.reactions?.heart || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {posts.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No posts yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Be the first to start a conversation!</p>
              <Link to="/forum/create" className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold shadow">Create a Post</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumList; 