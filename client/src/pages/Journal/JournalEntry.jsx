import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const JournalEntry = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [aiInsights, setAiInsights] = useState('');
  const [mood, setMood] = useState('neutral');
  const [loading, setLoading] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const prompts = [
    "How are you feeling today?",
    "What's on your mind?",
    "Describe a moment that made you smile",
    "What challenges did you face today?",
    "What are you grateful for?",
    "What would you like to improve about yourself?",
    "Describe your dreams and aspirations",
    "What's something you learned recently?"
  ];

  const moodOptions = [
    { id: 'very_happy', emoji: '😄', label: 'Very Happy' },
    { id: 'happy', emoji: '🙂', label: 'Happy' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'sad', emoji: '😔', label: 'Sad' },
    { id: 'very_sad', emoji: '😢', label: 'Very Sad' }
  ];

  const handleGenerateInsights = async () => {
    if (!content.trim()) return;
    
    setGeneratingInsights(true);
    try {
      // TODO: Call AI service for insights
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockInsights = [
        "I notice you're feeling quite positive today. This is a great sign of emotional well-being!",
        "Your writing shows resilience in the face of challenges. Keep that strength going!",
        "Consider practicing gratitude daily - it can significantly improve your mood.",
        "You seem to be processing some complex emotions. Remember, it's okay to feel this way."
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
      // Create a default prompt if none is provided
      const prompt = "How are you feeling today?";
      
      // Save journal entry to API
      const response = await API.post('/journal', {
        prompt,
        content,
        isPrivate: true
      });
      
      console.log('Journal entry saved:', response.data);
      
      // Navigate to history page
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-8 flex items-center justify-center gap-2">
            <span>Your Journal</span>
            <span className="text-3xl">📝</span>
          </h1>

          {/* Writing Prompts */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Writing Prompts</h2>
            <div className="flex flex-wrap gap-2">
              {prompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="px-4 py-2 bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-gray-200 rounded-full text-sm font-medium shadow hover:bg-blue-200 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-400 transition-all duration-150"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">How are you feeling?</h2>
            <div className="flex gap-3">
              {moodOptions.map((moodOption) => (
                <button
                  key={moodOption.id}
                  onClick={() => setMood(moodOption.id)}
                  className={`p-4 rounded-full border-2 shadow transition-all duration-150 flex flex-col items-center gap-1 text-lg font-semibold
                    ${mood === moodOption.id
                      ? 'border-blue-500 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-700 dark:to-purple-800 text-blue-700 dark:text-white scale-105'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-blue-400 hover:scale-105'}`}
                >
                  <span className="text-2xl">{moodOption.emoji}</span>
                  <span className="text-xs">{moodOption.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Journal Text Area */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Write your thoughts...
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your thoughts, feelings, and experiences..."
              className="w-full h-64 p-5 border border-gray-300 dark:border-gray-700 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900 dark:text-gray-100 shadow-lg text-base"
            />
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">{content.length} characters</div>
          </div>

          {/* AI Insights */}
          {aiInsights && (
            <div className="mb-8 p-5 bg-blue-50 dark:bg-blue-900 rounded-2xl border-l-4 border-blue-400 dark:border-blue-500 flex items-start gap-3 shadow">
              <span className="text-2xl text-blue-500">🤖</span>
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-100 mb-1">AI Insights</h3>
                <p className="text-blue-700 dark:text-blue-200">{aiInsights}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate('/journal/history')}
              className="flex-1 py-3 px-6 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow"
            >
              Cancel
            </button>
            
            <button
              onClick={handleGenerateInsights}
              disabled={!content.trim() || generatingInsights}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-800 dark:hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-semibold"
            >
              {generatingInsights ? 'Generating Insights...' : 'Get AI Insights'}
            </button>
            
            <button
              onClick={handleSave}
              disabled={!content.trim() || loading}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-800 dark:hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg font-semibold"
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </button>
          </div>

          {/* Tips */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Writing Tips</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Write freely without worrying about grammar or structure</li>
              <li>• Focus on your feelings and emotions</li>
              <li>• Be honest with yourself - this is your private space</li>
              <li>• Try to write regularly, even if just a few sentences</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEntry; 