import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Angry, ArrowRight, Cloud, Frown, Laugh, Meh, Smile, Zap } from 'lucide-react';

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
    { id: 'very_happy', icon: Laugh, label: 'Very Happy' },
    { id: 'happy', icon: Smile, label: 'Happy' },
    { id: 'calm', icon: Cloud, label: 'Calm' },
    { id: 'neutral', icon: Meh, label: 'Neutral' },
    { id: 'sad', icon: Frown, label: 'Sad' },
    { id: 'anxious', icon: Cloud, label: 'Anxious' },
    { id: 'angry', icon: Angry, label: 'Angry' },
    { id: 'excited', icon: Zap, label: 'Excited' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMood) {
      alert('Please select a mood');
      return;
    }

    try {
      setLoading(true);

      await API.post('/mood', {
        mood: selectedMood.id,
        intensity,
        notes: notes.trim() || undefined,
        timestamp: new Date().toISOString()
      });
      alert('Mood recorded successfully!');
      navigate('/mood/history');
    } catch (error) {
      console.error('Error recording mood:', error);
      alert('Failed to record mood. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const recentMoodMeta = recentMood ? moods.find(m => m.id === recentMood.mood) : null;
  const RecentMoodIcon = recentMoodMeta?.icon || Meh;

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Smile size={30} className="text-indigo-500" />
          How are you feeling?
        </h1>
        <p className="text-gray-300">Take a moment to check in with yourself</p>
      </div>

      {recentMood && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <p className="text-sm font-medium text-gray-500 mb-3">Your Last Check-in</p>
          <RecentMoodIcon size={28} className="text-indigo-500" />
          <p className="text-white font-medium mt-2">{recentMoodMeta?.label} ({recentMood.intensity}/10)</p>
          <p className="text-gray-500 text-xs mt-1">{new Date(recentMood.timestamp).toLocaleDateString()}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Select Your Mood</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {moods.map((mood) => {
              const MoodIcon = mood.icon;
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  className={`p-6 rounded-lg border-2 transition-colors ${
                    selectedMood?.id === mood.id
                      ? 'border-indigo-500 bg-indigo-600/10'
                      : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                  }`}
                >
                  <MoodIcon size={32} className="text-indigo-500 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-300">{mood.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Intensity: {intensity}/10</h2>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Add Notes (Optional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={journalPrompt || "What's going on? Any thoughts or feelings you'd like to capture?"}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 focus:border-indigo-500 rounded-lg text-white placeholder-gray-500 focus:outline-none transition resize-none h-24"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? 'Saving...' : 'Record Mood'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>
    </div>
  );
};

export default MoodCheckIn;
