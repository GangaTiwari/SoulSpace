import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

const JournalHistory = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    fetchJournalEntries();
  }, []);

  const fetchJournalEntries = async () => {
    try {
      setLoading(true);
      const response = await API.get('/journal');
      console.log('Journal entries response:', response.data);
      
      if (response.data.success && response.data.data) {
        setEntries(response.data.data);
      } else {
        console.error('Invalid response format:', response.data);
        setEntries([]);
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      setEntries([]);
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
      very_sad: '😢',
      anxious: '😰',
      angry: '😠',
      excited: '🤩',
      calm: '😌',
    };
    return emojis[mood] || '😐';
  };

  const getMoodFromSentiment = (sentiment) => {
    if (!sentiment || !sentiment.label) return 'neutral';
    
    const sentimentToMood = {
      'positive': 'happy',
      'negative': 'sad',
      'neutral': 'neutral'
    };
    
    return sentimentToMood[sentiment.label] || 'neutral';
  };

  const getEmotionInsights = (emotions) => {
    if (!emotions || emotions.length === 0) return null;
    
    // Get the emotion with highest confidence
    const topEmotion = emotions.reduce((prev, current) => 
      (prev.confidence > current.confidence) ? prev : current
    );
    
    return `Detected emotion: ${topEmotion.emotion} (${Math.round(topEmotion.confidence * 100)}% confidence)`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your journal...</p>
        </div>
      </div>
    );
  }

  // Statistics
  const positiveCount = entries.filter(e => 
    e.sentiment && e.sentiment.label === 'positive'
  ).length;
  const aiInsightsCount = entries.filter(e => 
    e.emotions && e.emotions.length > 0
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-8 flex items-center justify-center gap-2">
            <span>Journal History</span>
            <span className="text-3xl">📚</span>
          </h1>
          <div className="space-y-6">
            {entries.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">No Journal Entries Yet</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Start writing to see your journal history here!</p>
                <Link to="/journal" className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 dark:hover:from-blue-800 dark:hover:to-purple-800 transition-all font-semibold shadow">+ New Entry</Link>
              </div>
            ) : (
              entries.map((entry, idx) => (
                <div key={entry._id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-white">
                      {getMoodEmoji(entry.mood || 'neutral')} {(entry.mood || 'neutral').replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(entry.timestamp)}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-200 text-base leading-relaxed">
                    {selectedEntry?._id === entry._id ? entry.content : truncateText(entry.content)}
                  </div>
                  {entry.aiInsights && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border-l-4 border-blue-400 dark:border-blue-500 flex items-start gap-2">
                      <span className="text-xl text-blue-500">🤖</span>
                      <span className="text-blue-700 dark:text-blue-200 text-sm">{entry.aiInsights}</span>
                    </div>
                  )}
                  <div className="flex justify-end">
                    {selectedEntry?._id === entry._id ? (
                      <button onClick={() => setSelectedEntry(null)} className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">Show less</button>
                    ) : (
                      entry.content && entry.content.length > 150 && (
                        <button onClick={() => setSelectedEntry(entry)} className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">Read more</button>
                      )
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Statistics */}
        {entries.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Journal Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{entries.length}</div>
                <p className="text-gray-600">Total Entries</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {Math.round((positiveCount / entries.length) * 100)}%
                </div>
                <p className="text-gray-600">Positive Entries</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">{aiInsightsCount}</div>
                <p className="text-gray-600">AI Insights Generated</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalHistory; 