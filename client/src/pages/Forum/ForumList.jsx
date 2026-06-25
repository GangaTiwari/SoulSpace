import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { FileText, Heart, Plus, Search, Trash2 } from 'lucide-react';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'support', label: 'Support' },
  { id: 'struggle', label: 'Struggles' },
  { id: 'victory', label: 'Victories' },
  { id: 'question', label: 'Questions' },
  { id: 'advice', label: 'Tips' },
];

const categoryColors = {
  support: 'bg-green-50 text-green-700',
  struggle: 'bg-rose-50 text-rose-700',
  victory: 'bg-amber-50 text-amber-700',
  question: 'bg-sky-50 text-sky-700',
  advice: 'bg-violet-50 text-violet-700',
};

const formatTime = (ts) => {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const ForumList = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [deletingId, setDeletingId] = useState(null);

  const fetchPosts = async () => {
    try {
      let url = `/forum?sort=${sortBy}&search=${searchTerm}`;
      if (filter !== 'all') url += `&type=${filter}`;
      const res = await API.get(url);
      setPosts(res.data.data || []);
    } catch { setPosts([]); }
  };

  useEffect(() => { fetchPosts(); }, [filter, sortBy, searchTerm]);

  const handleVote = async (postId) => {
    try { await API.post(`/forum/${postId}/reactions`, { reactionType: 'heart' }); fetchPosts(); } catch {}
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    setDeletingId(postId);
    try { await API.delete(`/forum/${postId}`); fetchPosts(); } catch {}
    finally { setDeletingId(null); }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Community</h1>
          <p className="text-gray-400 text-sm">Share, support, and connect</p>
        </div>
        <Link to="/forum/create"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
          <Plus size={16} /> New Post
        </Link>
      </div>

      {/* Search + sort */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-400 focus:outline-none transition"
            />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:border-indigo-400 focus:outline-none">
            <option value="recent">Recent</option>
            <option value="popular">Popular</option>
            <option value="trending">Trending</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button key={c.id} onClick={() => setFilter(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === c.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <FileText size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 mb-4">No posts yet. Be the first!</p>
          <Link to="/forum/create" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <Plus size={16} /> Create Post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => {
            const isAuthor = user && post.user && (String(user._id) === (typeof post.user === 'object' ? String(post.user._id) : String(post.user)));
            return (
              <div key={post._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Heart */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                    <button onClick={() => handleVote(post._id)}
                      className="w-8 h-8 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center justify-center transition-colors">
                      <Heart size={15} className="text-rose-400" />
                    </button>
                    <span className="text-xs font-semibold text-gray-400">{post.reactions?.heart || 0}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColors[post.type] || 'bg-gray-100 text-gray-600'}`}>
                        {post.type}
                      </span>
                      <span className="text-xs text-gray-400">{post.isAnonymous ? 'Anonymous' : post.user?.name}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatTime(post.createdAt)}</span>
                    </div>
                    <Link to={`/forum/${post._id}`} className="block text-base font-semibold text-gray-800 hover:text-indigo-600 transition-colors mb-1">
                      {post.title}
                    </Link>
                    <p className="text-sm text-gray-500 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-gray-400">{post.commentsCount || 0} replies</span>
                      <span className="text-xs text-gray-400">{post.views || 0} views</span>
                      {isAuthor && (
                        <button onClick={() => handleDelete(post._id)} disabled={deletingId === post._id}
                          className="text-xs text-gray-400 hover:text-rose-500 transition-colors flex items-center gap-1 ml-auto">
                          <Trash2 size={12} />
                          {deletingId === post._id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ForumList;