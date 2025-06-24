import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

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
      const postData = {
        title: form.title,
        content: form.content,
        type: form.type,
        isAnonymous: form.isAnonymous
      };
      
      await API.post('/forum', postData);
      
      navigate('/forum');
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-8">Create New Post <span className="text-blue-600 dark:text-blue-400">💬</span></h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Post Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="What would you like to discuss?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Category
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Post Content *
              </label>
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Share your thoughts, experiences, or questions..."
                className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
                required
              />
              <div className="text-sm text-gray-500 mt-2">
                {form.content.length} characters
              </div>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isAnonymous"
                name="isAnonymous"
                checked={form.isAnonymous}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
              />
              <label htmlFor="isAnonymous" className="text-gray-700 dark:text-gray-200">
                Post anonymously
              </label>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/forum')}
                className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!form.title.trim() || !form.content.trim() || loading}
                className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700"
              >
                {loading ? 'Creating Post...' : 'Create Post'}
              </button>
            </div>
          </form>

          {/* Guidelines */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">📝 Posting Guidelines</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Be respectful and supportive of others</li>
              <li>• Share your experiences to help others</li>
              <li>• Avoid giving medical advice</li>
              <li>• Use anonymous posting if you prefer privacy</li>
              <li>• Keep discussions constructive and helpful</li>
            </ul>
          </div>

          {/* Safety Notice */}
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-gray-900 rounded-lg border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-600 text-lg">⚠️</div>
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">Important:</p>
                <p>This is a supportive community, but it's not a substitute for professional mental health care. If you're in crisis, please contact a mental health professional or crisis hotline.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumCreate; 