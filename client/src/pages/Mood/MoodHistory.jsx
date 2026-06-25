import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { Angry, BarChart2, Cloud, Frown, Laugh, Loader, Meh, Smile, Zap } from 'lucide-react';

const MoodHistory = () => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMoodHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let days = 7;
      switch (timeRange) {
        case 'month': days = 30; break;
        case '3months': days = 90; break;
        case 'year': days = 365; break;
        default: days = 7;
      }

      const response = await API.get(`/mood?limit=100&days=${days}`);
      setMoodHistory(response.data.data || []);
    } catch (err) {
      console.error('Error fetching mood history:', err);
      setError('Failed to load mood history');
      setMoodHistory([]);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchMoodHistory();
  }, [fetchMoodHistory]);

  const getMoodMeta = (mood) => {
    const moods = {
      very_happy: { label: 'Very Happy', icon: Laugh },
      happy: { label: 'Happy', icon: Smile },
      calm: { label: 'Calm', icon: Cloud },
      neutral: { label: 'Neutral', icon: Meh },
      sad: { label: 'Sad', icon: Frown },
      very_sad: { label: 'Very Sad', icon: Frown },
      anxious: { label: 'Anxious', icon: Cloud },
      angry: { label: 'Angry', icon: Angry },
      excited: { label: 'Excited', icon: Zap }
    };
    return moods[mood] || { label: mood?.replace('_', ' ') || 'Mood', icon: Meh };
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size={48} className="mx-auto mb-4 text-indigo-500 animate-spin" />
          <p className="text-gray-300">Loading mood history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BarChart2 size={48} className="mx-auto mb-4 text-gray-700" />
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Data</h3>
          <p className="text-xs text-gray-600 text-center mt-6">{error}</p>
          <button
            onClick={fetchMoodHistory}
            className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <BarChart2 size={30} className="text-indigo-500" />
          Mood History
        </h1>
        <p className="text-gray-300">Track your emotional patterns over time</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: '3months', label: '3 Months' },
          { value: 'year', label: 'Year' }
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setTimeRange(option.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === option.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {moodHistory.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          <BarChart2 size={48} className="mx-auto mb-4 text-gray-700" />
          <p className="text-gray-300 mb-4">No mood entries yet</p>
          <Link
            to="/mood/check-in"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Record Your First Mood
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {moodHistory.map((entry, idx) => {
            const moodMeta = getMoodMeta(entry.mood);
            const MoodIcon = moodMeta.icon;
            return (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center justify-between hover:bg-gray-800 transition-colors">
                <div className="flex items-center gap-4">
                  <MoodIcon size={28} className="text-indigo-500" />
                  <div>
                    <p className="font-medium text-white capitalize">{moodMeta.label}</p>
                    <p className="text-xs text-gray-500">{formatDate(entry.timestamp)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-indigo-400">{entry.intensity}/10</p>
                  {entry.notes && (
                    <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">{entry.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MoodHistory;
