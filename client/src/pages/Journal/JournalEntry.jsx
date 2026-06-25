import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { BookOpen, Save } from 'lucide-react';

const prompts = [
  "How are you feeling today?",
  "What's on your mind?",
  "Describe a moment that made you smile",
  "What challenges did you face today?",
  "What are you grateful for?",
  "What would you like to improve?",
  "What did you learn today?",
  "What are you looking forward to?",
];

const JournalEntry = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePromptClick = (p) => setContent(prev => prev + (prev ? '\n\n' : '') + p + '\n');

  const handleSave = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await API.post('/journal', { prompt: 'How are you feeling today?', content, isPrivate: true });
      navigate('/journal/history');
    } catch {
      alert('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Write Your Journal</h1>
        <p className="text-gray-400 text-sm">Express your thoughts in a safe, private space</p>
      </div>

      {/* Prompts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Writing Prompts</p>
        <div className="flex flex-wrap gap-2">
          {prompts.map((p, i) => (
            <button key={i} onClick={() => handlePromptClick(p)}
              className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors font-medium">
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-indigo-400" />
          <p className="text-sm font-semibold text-gray-700">Today's Entry</p>
          <span className="ml-auto text-xs text-gray-400">{content.length} characters</span>
        </div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Start writing here... Your thoughts are private and safe."
          className="w-full h-72 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none text-sm leading-relaxed"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => navigate('/journal/history')}
          className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm">
          Cancel
        </button>
        <button onClick={handleSave} disabled={!content.trim() || loading}
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
          <Save size={16} />
          {loading ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
};

export default JournalEntry;