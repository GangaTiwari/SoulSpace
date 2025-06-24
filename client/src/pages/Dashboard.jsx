import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [moodData, setMoodData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageMood: 0,
    totalCheckins: 0,
    currentStreak: 0,
    weeklyEntries: 0
  });
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  // Helper to ensure only numbers are rendered
  const safeNumber = (val) => (typeof val === 'number' && !isNaN(val) ? val : 0);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardResponse = await API.get('/dashboard?days=7');
      const dashboardData = dashboardResponse.data.data;
      setMoodData(Array.isArray(dashboardData.moodTrends) ? dashboardData.moodTrends : []);
      let insightsArray = [];
      if (Array.isArray(dashboardData.insights)) {
        insightsArray = dashboardData.insights;
      } else if (dashboardData.insights && typeof dashboardData.insights === 'object') {
        insightsArray = [
          {
            title: 'Patterns',
            value: dashboardData.insights.patterns || 'Start tracking your mood to see patterns',
            trend: 'up',
            color: 'blue'
          },
          {
            title: 'Achievements',
            value: dashboardData.insights.achievements || 'Your dedication to mental health is impressive',
            trend: 'up',
            color: 'green'
          },
          {
            title: 'Suggestions',
            value: dashboardData.insights.suggestions || 'Consider trying new self-care activities',
            trend: 'neutral',
            color: 'purple'
          }
        ];
      }
      setInsights(Array.isArray(insightsArray) ? insightsArray : []);

      // --- DYNAMIC STATS CALCULATION ---
      let moodTrends = dashboardData.moodTrends || [];
      let averageMood = 0;
      let totalCheckins = 0;
      let currentStreak = 0;
      let weeklyEntries = 0;

      // Always use all-time count for totalCheckins if available
      if (dashboardData.stats && dashboardData.stats.mood && typeof dashboardData.stats.mood.count === 'number') {
        totalCheckins = dashboardData.stats.mood.count;
      } else if (dashboardData.stats && dashboardData.stats.mood && Array.isArray(moodTrends)) {
        totalCheckins = moodTrends.length;
      }

      if (moodTrends.length > 0) {
        averageMood = Math.round((moodTrends.reduce((sum, entry) => sum + entry.intensity, 0) / moodTrends.length) * 10) / 10;
        // Calculate weekly entries (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
        weeklyEntries = moodTrends.filter(entry => new Date(entry.timestamp) >= oneWeekAgo).length;
        // Current streak: prefer currentStreaks.mood, fallback to API stat
        currentStreak = dashboardData.currentStreaks?.mood || dashboardData.stats?.mood?.streak || dashboardData.stats?.mood?.currentStreak || 0;
      } else if (dashboardData.stats && dashboardData.stats.mood) {
        averageMood = dashboardData.stats.mood.avgIntensity ? Math.round(dashboardData.stats.mood.avgIntensity * 10) / 10 : 0;
        weeklyEntries = dashboardData.recentActivity?.moods || 0;
        currentStreak = dashboardData.stats.mood.streak || dashboardData.stats.mood.currentStreak || 0;
      }

      setStats({
        averageMood,
        totalCheckins,
        currentStreak,
        weeklyEntries
      });
    } catch (error) {
      setMoodData([]);
      setRecentActivities([
        { type: 'mood_check', title: 'Welcome to SoulSpace!', timestamp: new Date().toISOString() },
        { type: 'journal', title: 'Start your first journal entry', timestamp: new Date().toISOString() },
        { type: 'chat', title: 'Try chatting with our AI companion', timestamp: new Date().toISOString() }
      ]);
      setInsights([
        { title: 'Welcome!', value: 'Start tracking your mood', trend: 'up', color: 'blue' },
        { title: 'Journal Entries', value: '0 entries', trend: 'neutral', color: 'gray' },
        { title: 'Sleep Quality', value: 'Not tracked', trend: 'neutral', color: 'gray' },
        { title: 'Stress Level', value: 'Not tracked', trend: 'neutral', color: 'gray' }
      ]);
      if (error.response?.status === 429) {
        setError('Too many requests. Please wait and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const res = await API.get('/dashboard/activities');
      if (res.data.success && Array.isArray(res.data.data)) {
        setRecentActivities(res.data.data);
      } else {
        setRecentActivities([]);
      }
    } catch (error) {
      setRecentActivities([]);
    }
  };

  const fetchDashboardSummary = async () => {
    try {
      const res = await API.get('/dashboard/summary');
      if (res.data.success && res.data.data) {
        setSummary(res.data.data);
      } else {
        setSummary(null);
      }
    } catch (error) {
      setSummary(null);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivities();
    fetchDashboardSummary();
  }, []);

  const getMoodColor = (mood) => {
    const colors = {
      very_happy: '#22c55e', // green-500
      happy: '#4ade80', // green-400
      calm: '#3b82f6', // blue-500
      neutral: '#a3a3a3', // gray-400
      sad: '#6b7280', // gray-500
      stressed: '#facc15', // yellow-400
      tired: '#a3a3a3', // gray-400
      grateful: '#f472b6', // pink-400
      anxious: '#fde047', // yellow-300
      confident: '#22c55e', // green-500
      excited: '#a78bfa', // purple-400
      frustrated: '#ef4444', // red-500
      peaceful: '#bae6fd', // blue-200
      overwhelmed: '#fb923c', // orange-400
      angry: '#ef4444' // red-500
    };
    return colors[mood] || '#a3a3a3';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '→';
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const dynamicGoals = [
    {
      title: 'Daily Mood Check-in',
      progress: safeNumber(summary?.mood?.streak),
      target: 7,
      unit: 'days'
    },
    {
      title: 'Journal Entries',
      progress: safeNumber(summary?.journal?.weekly),
      target: 5,
      unit: 'entries'
    },
    {
      title: 'Wellness Score',
      progress: safeNumber(Math.round(summary?.mood?.average)),
      target: 10,
      unit: 'points'
    }
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4 text-red-500">⚠️</div>
          <p className="mt-4 text-gray-600">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchDashboardData();
              fetchRecentActivities();
              fetchDashboardSummary();
            }}
            className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h2 className="text-3xl font-extrabold mb-8 text-gray-900 dark:text-gray-100 tracking-tight">Welcome back, {user?.name || 'Soul'}! <span className="text-blue-600 dark:text-blue-400">👋</span></h2>
      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <button onClick={() => navigate('/mood/check-in')} className="bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-700 dark:to-blue-900 text-white p-6 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all flex flex-col items-center">
          <div className="text-3xl mb-2">😊</div>
          <div className="text-base font-semibold">Check Mood</div>
        </button>
        <button onClick={() => navigate('/journal')} className="bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-700 dark:to-purple-900 text-white p-6 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all flex flex-col items-center">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-base font-semibold">Write Journal</div>
        </button>
        <button onClick={() => navigate('/chat')} className="bg-gradient-to-br from-green-500 to-green-700 dark:from-green-700 dark:to-green-900 text-white p-6 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all flex flex-col items-center">
          <div className="text-3xl mb-2">💬</div>
          <div className="text-base font-semibold">AI Chat</div>
        </button>
        <button onClick={() => navigate('/calm-zone')} className="bg-gradient-to-br from-pink-500 to-pink-700 dark:from-pink-700 dark:to-pink-900 text-white p-6 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all flex flex-col items-center">
          <div className="text-3xl mb-2">🧘</div>
          <div className="text-base font-semibold">Calm Zone</div>
        </button>
      </div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-100 dark:border-gray-800">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mb-2">
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Average Mood</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.averageMood}/10</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-100 dark:border-gray-800">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mb-2">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Check-ins</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCheckins}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-100 dark:border-gray-800">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mb-2">
            <span className="text-2xl">🔥</span>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Current Streak</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.currentStreak} days</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-100 dark:border-gray-800">
          <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg mb-2">
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">This Week</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.weeklyEntries} entries</p>
        </div>
      </div>
      {/* Mood Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 mb-10 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Mood Over Time</h2>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors font-semibold"
          >
            Refresh Chart
          </button>
        </div>
        {moodData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={moodData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={entry => new Date(entry.timestamp).toLocaleDateString()} tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, border: 'none', boxShadow: '0 2px 8px #0001' }} labelFormatter={v => `Date: ${v}`} />
              <Bar dataKey="intensity" radius={[8, 8, 0, 0]} fill="#3b82f6" isAnimationActive={true}>
                {moodData.map((entry, idx) => (
                  <cell key={`cell-${idx}`} fill={getMoodColor(entry.mood)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">📊</div>
              <p>No mood data yet</p>
              <p className="text-sm">Start tracking your mood to see trends</p>
            </div>
          </div>
        )}
      </div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Activity Feed */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Recent Activity</h2>
              <button
                onClick={fetchRecentActivities}
                className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors font-semibold shadow"
              >
                Refresh
              </button>
            </div>
            {recentActivities.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No recent activity yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentActivities.map((activity, idx) => (
                  <li key={idx} className="py-3 flex items-center">
                    <span className="mr-3 text-xl">
                      {activity.type === 'mood_check' && '😊'}
                      {activity.type === 'journal' && '📝'}
                      {activity.type === 'chat' && '💬'}
                    </span>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">{activity.title || activity.description}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">{activity.time ? activity.time : (activity.timestamp ? new Date(activity.timestamp).toLocaleString() : '')}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Right Column */}
        <div className="space-y-8">
          {/* Insights */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Insights</h2>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className={`text-lg ${getTrendColor(insight.trend)}`}>{getTrendIcon(insight.trend)}</span>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{insight.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{insight.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Goal Progress */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Goal Progress</h2>
            <div className="space-y-6">
              {dynamicGoals.map((goal, idx) => (
                <div key={idx} className="flex items-center gap-4 w-full">
                  <div className="w-48 text-gray-700 dark:text-gray-300 font-medium text-base">{goal.title}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (goal.progress / goal.target) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-28 text-right text-gray-600 dark:text-gray-300 text-sm font-semibold">
                    {goal.progress} / {goal.target} {goal.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;