import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Loader, Send, Trash2 } from 'lucide-react';

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

const ForumPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [postRes, repliesRes] = await Promise.all([API.get(`/forum/${id}`), API.get(`/forum/${id}/comments`)]);
        setPost(postRes.data.data);
        setReplies(repliesRes.data.data || []);
      } catch { setError('Post not found or removed.'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    setDeleting(true);
    try { await API.delete(`/forum/${id}`); navigate('/forum'); }
    catch { setDeleting(false); }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    setSubmitting(true);
    try {
      await API.post(`/forum/${id}/comments`, { content: newReply });
      setNewReply('');
      const res = await API.get(`/forum/${id}/comments`);
      setReplies(res.data.data || []);
    } catch {}
    finally { setSubmitting(false); }
  };

  const isAuthor = user && post && (String(user._id) === (typeof post.user === 'object' ? String(post.user._id) : String(post.user)));

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader size={32} className="animate-spin text-indigo-400" />
    </div>
  );

  if (!post) return (
    <div className="max-w-3xl mx-auto py-8 text-center">
      <p className="text-gray-500 mb-4">{error || 'Post not found.'}</p>
      <Link to="/forum" className="text-indigo-600 hover:text-indigo-500 text-sm font-semibold">← Back to Community</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-5">
      {/* Back */}
      <Link to="/forum" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors">
        <ArrowLeft size={16} /> Back to Community
      </Link>

      {/* Post */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.type] || 'bg-gray-100 text-gray-600'}`}>
            {post.type}
          </span>
          <span className="text-xs text-gray-400">{post.isAnonymous ? 'Anonymous' : post.user?.name}</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-400">{formatTime(post.createdAt)}</span>
          <span className="text-xs text-gray-400 ml-auto">{post.views || 0} views</span>
          {isAuthor && (
            <button onClick={handleDelete} disabled={deleting}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-rose-500 transition-colors disabled:opacity-50">
              <Trash2 size={13} /> {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>
        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">{post.content}</p>
      </div>

      {/* Replies */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">
          Replies <span className="text-gray-400 font-normal">({replies.length})</span>
        </h2>

        {replies.length > 0 ? (
          <div className="space-y-4 mb-6">
            {replies.map(reply => (
              <div key={reply._id} className="flex gap-3">
                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-indigo-600">
                    {(reply.isAnonymous ? 'A' : reply.user?.name?.charAt(0) || 'U').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">{reply.isAnonymous ? 'Anonymous' : reply.user?.name}</span>
                    <span className="text-xs text-gray-400">{formatTime(reply.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-6">No replies yet. Be the first to respond!</p>
        )}

        {/* Reply form */}
        <div className="border-t border-gray-100 pt-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Add a reply</p>
          <form onSubmit={handleReply} className="space-y-3">
            <textarea
              value={newReply}
              onChange={e => setNewReply(e.target.value)}
              placeholder="Share your thoughts or support..."
              className="w-full h-24 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none transition"
            />
            <div className="flex justify-end">
              <button type="submit" disabled={!newReply.trim() || submitting}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                <Send size={15} /> {submitting ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-indigo-50 rounded-2xl p-5">
        <p className="text-xs font-semibold text-indigo-700 mb-2">Community Guidelines</p>
        <p className="text-xs text-indigo-600 leading-relaxed">Be respectful and supportive. Avoid medical advice. Share your experiences to help others feel less alone. Remember everyone's journey is different.</p>
      </div>
    </div>
  );
};

export default ForumPost;