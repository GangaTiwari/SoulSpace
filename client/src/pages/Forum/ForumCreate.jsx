import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { ArrowLeft, Send } from 'lucide-react';

const categories = [
  { id: 'support', label: 'Support & Encouragement', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'struggle', label: 'Sharing Struggles', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'victory', label: 'Celebrating Victories', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'question', label: 'Questions & Advice', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'advice', label: 'Tips & Strategies', color: 'bg-violet-50 text-violet-700 border-violet-200' },
];

const ForumCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', type: 'support', isAnonymous: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await API.post('/forum', form);
      navigate('/forum');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div>
        <button onClick={() => navigate('/forum')} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-4">
          <ArrowLeft size={16} /> Back to Community
        </button>
        <h1 className="ss-section-title mb-1">Create a Post</h1>
        <p className="ss-subtitle">Start a supportive conversation</p>
      </div>

      {/* Category picker */}
      <div className="ss-card p-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">Choose a category</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map(c => (
            <button key={c.id} type="button" onClick={() => setForm(p => ({ ...p, type: c.id }))}
              className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${form.type === c.id ? c.color + ' border-current' : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="ss-card p-5 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required
            placeholder="What would you like to discuss?"
            className="ss-input bg-gray-50" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <span className="text-xs text-gray-400">{form.content.length}/5000</span>
          </div>
          <textarea name="content" value={form.content} onChange={handleChange} required
            placeholder="Share your thoughts, experiences, or questions..."
            className="ss-textarea h-40 bg-gray-50" />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => setForm(p => ({ ...p, isAnonymous: !p.isAnonymous }))}
            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.isAnonymous ? 'bg-indigo-600' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isAnonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm text-gray-600">Post anonymously</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button type="button" onClick={() => navigate('/forum')}
          className="ss-btn-secondary flex-1 py-3 text-sm">
          Cancel
        </button>
        <button onClick={handleSubmit} disabled={!form.title.trim() || !form.content.trim() || loading}
          className="ss-btn-primary flex-1 py-3 text-sm">
          <Send size={16} /> {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
};

export default ForumCreate;