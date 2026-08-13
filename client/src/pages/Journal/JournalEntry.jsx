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
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="ss-section-title mb-1">Write Your Journal</h1>
        <p className="ss-subtitle">A focused, private space for your thoughts</p>
      </div>

      {/* Prompts */}
      <div className="ss-card p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Writing Prompts</p>
        <div className="flex flex-wrap gap-2">
          {prompts.map((p, i) => (
            <button key={i} onClick={() => handlePromptClick(p)}
              className="ss-chip text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100">
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="ss-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-indigo-400" />
          <p className="text-sm font-semibold text-gray-700">Today's Entry</p>
          <span className="ml-auto text-xs text-gray-400">{content.length} characters</span>
        </div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Start writing here... Your thoughts are private and safe."
          className="ss-textarea h-80 bg-gray-50 leading-relaxed"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => navigate('/journal/history')}
          className="ss-btn-secondary flex-1 py-3 text-sm">
          Cancel
        </button>
        <button onClick={handleSave} disabled={!content.trim() || loading}
          className="ss-btn-primary flex-1 py-3 text-sm">
          <Save size={16} />
          {loading ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
};

export default JournalEntry;