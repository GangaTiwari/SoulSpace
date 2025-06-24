import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

const MoodHistory = () => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMoodHistory();
  }, [timeRange]);

  const fetchMoodHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate days based on time range
      let days = 7;
      switch (timeRange) {
        case 'month':
          days = 30;
          break;
        case '3months':
          days = 90;
          break;
        case 'year':
          days = 365;
          break;
        default:
          days = 7;
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
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      very_happy: '😄',
      happy: '🙂',
      neutral: '😐',
      sad: '😔',
      very_sad: '😢'
    };
    return emojis[mood] || '😐';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mood history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchMoodHistory}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-6">
            {/* Time Range Selector */}
            <div className="flex gap-2">
              {['Week', 'Month', '3 Months', 'Year'].map((range) => (
                <button
                  key={range}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm border border-gray-200 dark:border-gray-700 text-sm
                    ${timeRange === range ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700'}`}
                  onClick={() => setTimeRange(range.toLowerCase())}
                >
                  {range}
                </button>
              ))}
            </div>
            {/* Stats */}
            <div className="flex flex-wrap gap-6 items-center justify-between">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Check-ins</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{moodHistory.length}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Average Intensity</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {moodHistory.length > 0 
                    ? (moodHistory.reduce((sum, entry) => sum + entry.intensity, 0) / moodHistory.length).toFixed(1)
                    : '0.0'
                  }
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">Most Common Mood</span>
                <span className="text-2xl">{getMoodEmoji(moodHistory[0]?.mood || 'neutral')}</span>
                <span className="text-base font-semibold text-gray-700 dark:text-gray-200 capitalize">
                  {(moodHistory[0]?.mood || 'neutral').replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
          {/* Mood list */}
          <div className="space-y-4">
            {moodHistory.map((entry) => (
              <div key={entry._id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow flex items-center gap-6">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-white`}>{entry.mood}</span>
                <span className="text-gray-700 dark:text-gray-200 font-medium">{entry.intensity}/10</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(entry.timestamp)}</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-auto">{entry.notes}</span>
              </div>
            ))}
          </div>
        </div>

        {moodHistory.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No mood entries yet</h3>
            <p className="text-gray-600 mb-4">Start tracking your mood to see your history here</p>
            <Link
              to="/mood/check-in"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Record Your First Mood
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodHistory; 