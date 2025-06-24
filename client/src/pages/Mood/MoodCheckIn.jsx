import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const MoodCheckIn = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [journalPrompt, setJournalPrompt] = useState('');
  const [recentMood, setRecentMood] = useState(null);

  useEffect(() => {
    fetchRecentMood();
    generateJournalPrompt();
  }, []);

  const fetchRecentMood = async () => {
    try {
      const response = await API.get('/mood/history?limit=1');
      if (response.data.data && response.data.data.length > 0) {
        setRecentMood(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching recent mood:', error);
    }
  };

  const generateJournalPrompt = async () => {
    try {
      const response = await API.get('/journal/prompt');
      setJournalPrompt(response.data.data.prompt);
    } catch (error) {
      console.error('Error generating journal prompt:', error);
      setJournalPrompt("How are you feeling today? What's on your mind?");
    }
  };

  const moods = [
    { id: 'very_happy', emoji: '😄', label: 'Very Happy', color: 'bg-green-500' },
    { id: 'happy', emoji: '🙂', label: 'Happy', color: 'bg-green-400' },
    { id: 'calm', emoji: '😌', label: 'Calm', color: 'bg-blue-400' },
    { id: 'neutral', emoji: '😐', label: 'Neutral', color: 'bg-gray-400' },
    { id: 'sad', emoji: '😔', label: 'Sad', color: 'bg-blue-500' },
    { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'bg-yellow-500' },
    { id: 'angry', emoji: '😠', label: 'Angry', color: 'bg-red-500' },
    { id: 'excited', emoji: '🤩', label: 'Excited', color: 'bg-purple-500' }
  ];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMood) {
      alert('Please select a mood');
      return;
    }

    try {
      setLoading(true);
      
      const moodData = {
        mood: selectedMood.id,
        intensity: intensity,
        notes: notes.trim() || undefined,
        timestamp: new Date().toISOString()
      };

      await API.post('/mood', moodData);

      // Show success message and redirect
      alert('Mood recorded successfully!');
      navigate('/mood/history');
    } catch (error) {
      console.error('Error recording mood:', error);
      alert('Failed to record mood. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMoodComparison = () => {
    if (!recentMood || !selectedMood) return null;
    
    const intensityDiff = intensity - recentMood.intensity;
    if (Math.abs(intensityDiff) <= 1) return 'similar';
    return intensityDiff > 0 ? 'better' : 'worse';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">How are you feeling? <span className="text-blue-600 dark:text-blue-400">😊</span></h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Take a moment to check in with yourself</p>
          </div>

          {/* Recent Mood Comparison */}
          {recentMood && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Your Last Check-in</h2>
              <div className="flex items-center space-x-4">
                <div className="text-3xl">
                  {moods.find(m => m.id === recentMood.mood)?.emoji}
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">
                    {moods.find(m => m.id === recentMood.mood)?.label} ({recentMood.intensity}/10)
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(recentMood.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mood Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Select Your Mood</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => handleMoodSelect(mood)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedMood?.id === mood.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{mood.emoji}</div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity Slider */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Intensity: {intensity}/10
              </h2>
              <div className="space-y-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Very Low</span>
                  <span>Very High</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Additional Notes (Optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What's contributing to your mood today? Any specific thoughts or feelings?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
              />
            </div>

            {/* Journal Prompt */}
            {journalPrompt && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Journal Prompt</h3>
                <p className="text-gray-700 mb-4">{journalPrompt}</p>
                <button
                  type="button"
                  onClick={() => navigate('/journal', { state: { prompt: journalPrompt } })}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Write in your journal →
                </button>
              </div>
            )}

            {/* Mood Comparison */}
            {selectedMood && recentMood && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Mood Comparison</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {getMoodComparison() === 'better' && '📈'}
                    {getMoodComparison() === 'worse' && '📉'}
                    {getMoodComparison() === 'similar' && '➡️'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      Your mood is {getMoodComparison()} than your last check-in
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.abs(intensity - recentMood.intensity)} points difference
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={!selectedMood || loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Recording...' : 'Record My Mood'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/mood/history')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/chat')}
                className="p-4 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <div className="text-2xl mb-2">💬</div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Talk to AI</div>
              </button>
              <button
                onClick={() => navigate('/calm-zone')}
                className="p-4 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                <div className="text-2xl mb-2">🧘</div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Calm Zone</div>
              </button>
              <button
                onClick={() => navigate('/forum')}
                className="p-4 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors"
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Community</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodCheckIn; 