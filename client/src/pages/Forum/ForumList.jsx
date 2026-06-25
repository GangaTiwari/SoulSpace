import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FileText, Heart, Loader, Plus, Search } from 'lucide-react';

const ForumList = () => {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
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
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleVote = async (postId, reactionType) => {
    try {
      await API.post(`/forum/${postId}/reactions`, { reactionType });
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
      await API.delete(`/forum/${postId}`);
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
    { id: 'all', label: 'All Posts' },
    { id: 'support', label: 'Support & Encouragement' },
    { id: 'struggle', label: 'Sharing Struggles' },
    { id: 'victory', label: 'Celebrating Victories' },
    { id: 'question', label: 'Questions & Advice' },
    { id: 'advice', label: 'Tips & Strategies' }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">Community Forum</h1>
          <Link to="/forum/create" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition-colors font-semibold">
            <Plus size={18} />
            New Post
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 focus:border-indigo-500 text-white placeholder-gray-500 rounded-lg focus:outline-none"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 focus:border-indigo-500 text-white rounded-lg focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </form>

          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {deleteError && <p className="text-xs text-gray-600 text-center mt-6">{deleteError}</p>}
          {posts.map((post) => {
            let isAuthor = false;
            if (user && post && post.user) {
              const userId = String(user._id);
              const postUserId = typeof post.user === 'object' ? String(post.user._id) : String(post.user);
              isAuthor = userId === postUserId;
            }
            return (
              <div key={post._id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center space-y-1">
                    <button
                      onClick={() => handleVote(post._id, 'heart')}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300"
                      aria-label="React with heart"
                    >
                      <Heart size={16} />
                    </button>
                    <span className="text-sm font-medium text-gray-300">{post.reactions?.heart || 0}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
                      <span className="px-3 py-1 bg-indigo-600/10 text-indigo-400 border border-indigo-500 rounded-full text-xs font-semibold">{post.type}</span>
                      <span className="text-sm text-gray-500">{post.isAnonymous ? 'Anonymous' : post.user.name}</span>
                      <span className="text-sm text-gray-500">/</span>
                      <span className="text-sm text-gray-500">{formatTime(post.createdAt)}</span>
                      <span className="text-sm text-gray-500">/</span>
                      <span className="text-sm text-gray-500">{post.views} views</span>
                      {isAuthor && (
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="text-gray-500 hover:text-gray-300 text-xs font-semibold"
                          disabled={deletingId === post._id}
                        >
                          {deletingId === post._id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                    <Link to={`/forum/${post._id}`} className="block text-lg font-bold text-white hover:text-indigo-400 mb-2">
                      {post.title}
                    </Link>
                    <p className="text-gray-300 mb-2 line-clamp-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
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
              <FileText size={48} className="mx-auto mb-4 text-gray-700" />
              <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
              <p className="text-gray-300 mb-4">Be the first to start a conversation.</p>
              <Link to="/forum/create" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition-colors font-semibold">
                <Plus size={18} />
                Create a Post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumList;
