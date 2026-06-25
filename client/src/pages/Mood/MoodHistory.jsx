import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { Angry, BarChart2, Cloud, Frown, Laugh, Loader, Meh, Smile, Zap } from 'lucide-react';

const getMoodMeta = (mood) => {
  const map = {
    very_happy: { label: 'Very Happy', icon: Laugh, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    happy: { label: 'Happy', icon: Smile, color: 'text-green-500', bg: 'bg-green-50' },
    calm: { label: 'Calm', icon: Cloud, color: 'text-sky-500', bg: 'bg-sky-50' },
    neutral: { label: 'Neutral', icon: Meh, color: 'text-gray-400', bg: 'bg-gray-50' },
    sad: { label: 'Sad', icon: Frown, color: 'text-blue-400', bg: 'bg-blue-50' },
    anxious: { label: 'Anxious', icon: Cloud, color: 'text-purple-400', bg: 'bg-purple-50' },
    angry: { label: 'Angry', icon: Angry, color: 'text-red-500', bg: 'bg-red-50' },
    excited: { label: 'Excited', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
  };
  return map[mood] || { label: mood, icon: Meh, color: 'text-gray-400', bg: 'bg-gray-50' };
};

const MoodHistory = () => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);

  const fetchMoodHistory = useCallback(async () => {
    try {
      setLoading(true);
      const days = { week: 7, month: 30, '3months': 90, year: 365 }[timeRange] || 7;
      const res = await API.get(`/mood?limit=100&days=${days}`);
      setMoodHistory(res.data.data || []);
    } catch {
      setMoodHistory([]);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => { fetchMoodHistory(); }, [fetchMoodHistory]);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Mood History</h1>
        <p className="text-gray-400 text-sm">Track your emotional patterns over time</p>
      </div>

      {/* Time range filter */}
      <div className="flex gap-2">
        {[{ value: 'week', label: 'This Week' }, { value: 'month', label: 'Month' }, { value: '3months', label: '3 Months' }, { value: 'year', label: 'Year' }].map(o => (
          <button key={o.value} onClick={() => setTimeRange(o.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${timeRange === o.value ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}>
            {o.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader size={32} className="animate-spin text-indigo-400" />
        </div>
      ) : moodHistory.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <BarChart2 size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 mb-4">No mood entries yet</p>
          <Link to="/mood/check-in" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            Record Your First Mood
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {moodHistory.map((entry, idx) => {
            const meta = getMoodMeta(entry.mood);
            const Icon = meta.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 ${meta.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon size={22} className={meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{meta.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  {entry.notes && <p className="text-xs text-gray-500 mt-1 truncate">{entry.notes}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-lg font-bold text-indigo-600">{entry.intensity}</span>
                  <span className="text-xs text-gray-400">/10</span>
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