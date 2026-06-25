import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, FileQuestion, Loader, Send, Trash2 } from 'lucide-react';

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
    const viewedKey = `forum_viewed_${id}`;
    if (!sessionStorage.getItem(viewedKey)) {
      fetchPostAndReplies();
      sessionStorage.setItem(viewedKey, 'true');
    } else {
      API.get(`/forum/${id}`).then(postRes => setPost(postRes.data.data)).catch(() => setError('Failed to load post. It might not exist.'));
      API.get(`/forum/${id}/comments`).then(repliesRes => setReplies(repliesRes.data.data)).catch(() => {});
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [id]);

  const handleDelete = async () => {
    setDeleteError(null);
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await API.delete(`/forum/${id}`);
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

  const isAuthor = user && post && (
    (post.user && typeof post.user === 'object' && user._id === post.user._id) ||
    (post.user && typeof post.user === 'string' && user._id === post.user) ||
    (post.user && user._id === post.user.toString())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post && !loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <FileQuestion size={56} className="mx-auto mb-4 text-gray-700" />
          <h3 className="text-xl font-semibold text-white mb-2">Post not found</h3>
          <p className="text-gray-300 mb-4">{error || "The post you're looking for doesn't exist or has been removed."}</p>
          <Link
            to="/forum"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/forum" className="inline-flex items-center gap-2 text-gray-300 hover:text-indigo-400 transition-colors">
            <ArrowLeft size={18} />
            Back to Forum
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
            <span className="px-3 py-1 bg-indigo-600/10 text-indigo-400 border border-indigo-500 rounded-full text-sm font-medium">
              {post.type}
            </span>
            <span className="text-sm text-gray-500">
              {post.isAnonymous ? 'Anonymous' : post.user.name}
            </span>
            <span className="text-sm text-gray-500">/</span>
            <span className="text-sm text-gray-500">{formatTime(post.createdAt)}</span>
            <span className="text-sm text-gray-500">/</span>
            <span className="text-sm text-gray-500">{post.views} views</span>
            {isAuthor && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                title="Delete Post"
                className="ml-auto inline-flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
          {deleteError && <p className="text-xs text-gray-600 text-center mt-6">{deleteError}</p>}
          <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
          <div className="text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
          <div className="pb-6 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">
              Replies ({replies.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-800">
            {replies.map((reply) => (
              <div key={reply._id} className="py-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-white">
                    {reply.isAnonymous ? 'Anonymous' : reply.user.name}
                  </span>
                  <span className="text-sm text-gray-500">{formatTime(reply.createdAt)}</span>
                </div>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Add a Reply</h3>
            {commentError && <p className="text-xs text-gray-600 text-center mt-6">{commentError}</p>}
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Share your thoughts, advice, or support..."
                className="w-full h-32 p-4 bg-gray-800 border border-gray-700 focus:border-indigo-500 text-white placeholder-gray-500 rounded-lg focus:outline-none resize-none mb-4"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newReply.trim() || submittingReply}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                  {submittingReply ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-3">Community Guidelines</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p>Be supportive and respectful in your replies.</p>
            <p>Avoid giving medical advice and encourage professional help when needed.</p>
            <p>Share personal experiences to help others feel less alone.</p>
            <p>Remember that everyone's journey is different.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPost;
