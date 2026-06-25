import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { BookOpen, Wand2, Save, X } from 'lucide-react';

const JournalEntry = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [aiInsights, setAiInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const prompts = [
    "How are you feeling today?",
    "What's on your mind?",
    "Describe a moment that made you smile",
    "What challenges did you face today?",
    "What are you grateful for?",
    "What would you like to improve?",
    "Describe your dreams",
    "What did you learn today?"
  ];

  const handleGenerateInsights = async () => {
    if (!content.trim()) return;
    
    setGeneratingInsights(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockInsights = [
        "I notice you're feeling quite positive today. This is a great sign of emotional well-being!",
        "Your writing shows resilience in the face of challenges. Keep that strength going!",
        "Consider practicing gratitude daily - it can significantly improve your mood.",
        "You seem to be processing complex emotions. Remember, it's okay to feel this way."
      ];
      setAiInsights(mockInsights[Math.floor(Math.random() * mockInsights.length)]);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGeneratingInsights(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      await API.post('/journal', {
        prompt: "How are you feeling today?",
        content,
        isPrivate: true
      });
      navigate('/journal/history');
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save journal entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptClick = (prompt) => {
    setContent(prev => prev + (prev ? '\n\n' : '') + prompt + '\n');
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <BookOpen size={30} className="text-indigo-500" />
          Write Your Journal
        </h1>
        <p className="text-gray-300">Express your thoughts and feelings in a safe space</p>
      </div>

      {/* Writing Prompts */}
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-500 mb-3">Writing Prompts</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {prompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePromptClick(prompt)}
              className="px-3 py-2 bg-gray-900 border border-gray-800 text-gray-300 rounded-lg text-xs font-medium hover:border-indigo-500 hover:text-indigo-400 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Text Area */}
      <div className="mb-8">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your thoughts, feelings, and experiences..."
          className="w-full h-64 px-6 py-4 bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-lg text-white placeholder-gray-500 focus:outline-none resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">{content.length} characters</p>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <div className="mb-8 p-6 bg-indigo-600/10 border border-indigo-600/20 rounded-xl flex items-start gap-3">
          <Wand2 size={20} className="text-indigo-400 flex-shrink-0 mt-1" />
          <div>
            <p className="font-semibold text-indigo-400 mb-1">AI Insights</p>
            <p className="text-gray-300 text-sm">{aiInsights}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/journal/history')}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 border border-gray-800 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          <X size={18} />
          Cancel
        </button>
        
        <button
          onClick={handleGenerateInsights}
          disabled={!content.trim() || generatingInsights}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 border border-gray-800 text-gray-300 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors font-medium"
        >
          <Wand2 size={18} />
          {generatingInsights ? 'Generating...' : 'Get Insights'}
        </button>
        
        <button
          onClick={handleSave}
          disabled={!content.trim() || loading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg transition-colors font-medium"
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
};

export default JournalEntry; 
