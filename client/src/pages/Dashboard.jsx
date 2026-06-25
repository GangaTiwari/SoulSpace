import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { ArrowRight, Smile, BarChart2, BookOpen, MessageCircle, Brain, RotateCcw, AlertCircle, Loader } from 'lucide-react';

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
            trend: 'up'
          },
          {
            title: 'Achievements',
            value: dashboardData.insights.achievements || 'Your dedication to mental health is impressive',
            trend: 'up'
          },
          {
            title: 'Suggestions',
            value: dashboardData.insights.suggestions || 'Consider trying new self-care activities',
            trend: 'neutral'
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
        { title: 'Welcome!', value: 'Start tracking your mood', trend: 'up' },
        { title: 'Journal Entries', value: '0 entries', trend: 'neutral' },
        { title: 'Sleep Quality', value: 'Not tracked', trend: 'neutral' },
        { title: 'Stress Level', value: 'Not tracked', trend: 'neutral' }
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-300 text-lg">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchDashboardData();
              fetchRecentActivities();
              fetchDashboardSummary();
            }}
            className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size={48} className="mx-auto mb-4 text-indigo-500 animate-spin" />
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12">
      {/* Greeting */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name || 'Soul'}</h1>
        <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <button onClick={() => navigate('/mood/check-in')} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:bg-gray-800 transition-all group">
          <Smile size={32} className="text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-medium text-white">Check Mood</div>
        </button>
        <button onClick={() => navigate('/journal')} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:bg-gray-800 transition-all group">
          <BookOpen size={32} className="text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-medium text-white">Write Journal</div>
        </button>
        <button onClick={() => navigate('/chat')} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:bg-gray-800 transition-all group">
          <MessageCircle size={32} className="text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-medium text-white">AI Chat</div>
        </button>
        <button onClick={() => navigate('/calm-zone')} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:bg-gray-800 transition-all group">
          <Brain size={32} className="text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
          <div className="text-sm font-medium text-white">Calm Zone</div>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-2">Average Mood</p>
          <p className="text-3xl font-bold text-white">{stats.averageMood}<span className="text-xl text-gray-500">/10</span></p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-2">Total Check-ins</p>
          <p className="text-3xl font-bold text-white">{stats.totalCheckins}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-2">Current Streak</p>
          <p className="text-3xl font-bold text-white">{stats.currentStreak}<span className="text-xl text-gray-500"> days</span></p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm font-medium mb-2">This Week</p>
          <p className="text-3xl font-bold text-white">{stats.weeklyEntries}<span className="text-xl text-gray-500"> entries</span></p>
        </div>
      </div>

      {/* Mood Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Mood Over Time</h2>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
          >
            <RotateCcw size={16} />
            Refresh
          </button>
        </div>
        {moodData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={moodData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={entry => new Date(entry.timestamp).toLocaleDateString()} tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#374151' }} />
              <YAxis domain={[0, 10]} tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#374151' }} />
              <Tooltip contentStyle={{ background: '#1f2937', borderRadius: 8, border: '1px solid #374151' }} labelFormatter={v => `Date: ${v}`} />
              <Bar dataKey="intensity" radius={[8, 8, 0, 0]} fill="#6366f1" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart2 size={48} className="mx-auto mb-2 opacity-50" />
              <p>No mood data yet</p>
              <p className="text-sm">Start tracking your mood to see trends</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2">
          {/* Recent Activity */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <button
                onClick={fetchRecentActivities}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
              >
                <RotateCcw size={16} />
                Refresh
              </button>
            </div>
            {recentActivities.length === 0 ? (
              <p className="text-gray-500">No recent activity yet.</p>
            ) : (
              <ul className="divide-y divide-gray-800">
                {recentActivities.map((activity, idx) => (
                  <li key={idx} className="py-4 flex items-start gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-gray-200">{activity.title || activity.description}</div>
                      <div className="text-gray-500 text-sm">{activity.time ? activity.time : (activity.timestamp ? new Date(activity.timestamp).toLocaleString() : '')}</div>
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
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Insights</h2>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <ArrowRight size={16} className="text-indigo-400 mt-0.5" />`r`n                  <div>`r`n                    <p className="font-medium text-gray-200 text-sm">{insight.title}</p>
                    <p className="text-gray-400 text-xs">{insight.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goal Progress */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Goal Progress</h2>
            <div className="space-y-6">
              {dynamicGoals.map((goal, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-300">{goal.title}</p>
                    <p className="text-xs text-gray-500">{goal.progress} / {goal.target} {goal.unit}</p>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, (goal.progress / goal.target) * 100)}%` }}
                    ></div>
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

