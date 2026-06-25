import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { FileText, Save, X } from 'lucide-react';

const ForumCreate = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'support',
    isAnonymous: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'support', label: 'Support & Encouragement' },
    { id: 'struggle', label: 'Sharing Struggles' },
    { id: 'victory', label: 'Celebrating Victories' },
    { id: 'question', label: 'Questions & Advice' },
    { id: 'advice', label: 'Tips & Strategies' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await API.post('/forum', {
        title: form.title,
        content: form.content,
        type: form.type,
        isAnonymous: form.isAnonymous
      });
      navigate('/forum');
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText size={30} className="text-indigo-500" />
            Create New Post
          </h1>
          <p className="text-gray-300">Start a supportive community conversation.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Post Title
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="What would you like to discuss?"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 focus:border-indigo-500 text-white placeholder-gray-500 rounded-lg focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 focus:border-indigo-500 text-white rounded-lg focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Post Content
              </label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Share your thoughts, experiences, or questions..."
                className="w-full h-48 p-4 bg-gray-800 border border-gray-700 focus:border-indigo-500 text-white placeholder-gray-500 rounded-lg focus:outline-none resize-none"
                required
              />
              <div className="text-xs text-gray-500 mt-2">
                {form.content.length} characters
              </div>
            </div>

            <label className="flex items-center gap-3 text-gray-300">
              <input
                type="checkbox"
                id="isAnonymous"
                name="isAnonymous"
                checked={form.isAnonymous}
                onChange={handleChange}
                className="w-4 h-4 accent-indigo-600 bg-gray-800 border-gray-700 rounded"
              />
              Post anonymously
            </label>

            {error && <p className="text-xs text-gray-600 text-center mt-6">{error}</p>}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/forum')}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                <X size={18} />
                Cancel
              </button>
              <button
                type="submit"
                disabled={!form.title.trim() || !form.content.trim() || loading}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={18} />
                {loading ? 'Creating Post...' : 'Create Post'}
              </button>
            </div>
          </form>

          <div className="mt-8 bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-3">Posting Guidelines</h2>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>Be respectful and supportive of others.</li>
              <li>Share your experiences to help others.</li>
              <li>Avoid giving medical advice.</li>
              <li>Use anonymous posting if you prefer privacy.</li>
              <li>Keep discussions constructive and helpful.</li>
            </ul>
          </div>

          <p className="text-xs text-gray-600 text-center mt-6">
            This community is not a substitute for professional mental health care. If you are in crisis, please contact a mental health professional or crisis hotline.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForumCreate;
