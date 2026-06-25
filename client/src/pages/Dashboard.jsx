import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Smile, BookOpen, MessageCircle, Wind, TrendingUp, Flame, CalendarCheck, Star, ArrowRight } from 'lucide-react';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const StatCard = ({ label, value, sub, icon: Icon, bg, iconColor }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between mb-4">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}
      <span className="text-base font-normal text-gray-400 ml-1">{sub}</span>
    </p>
  </Card>
);

const QuickAction = ({ icon: Icon, label, desc, bg, iconColor, onClick }) => (
  <button onClick={onClick}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group text-left w-full">
    <div className={`w-11 h-11 ${bg} rounded-2xl flex items-center justify-center mb-3`}>
      <Icon size={22} className={iconColor} />
    </div>
    <p className="text-sm font-semibold text-gray-800">{label}</p>
    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
    <ArrowRight size={14} className="text-gray-300 mt-2 group-hover:text-indigo-500 transition-colors" />
  </button>
);

const Skeleton = ({ className }) => (
  <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [moodData, setMoodData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ averageMood: 0, totalCheckins: 0, currentStreak: 0, weeklyEntries: 0 });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [dashRes, actRes] = await Promise.allSettled([
          API.get('/dashboard?days=7'),
          API.get('/dashboard/activities')
        ]);

        if (dashRes.status === 'fulfilled') {
          const d = dashRes.value.data.data;
          const trends = Array.isArray(d.moodTrends) ? d.moodTrends : [];
          setMoodData(trends);

          let insightsArr = [];
          if (Array.isArray(d.insights)) insightsArr = d.insights;
          else if (d.insights) {
            insightsArr = [
              { title: 'Patterns', value: d.insights.patterns || 'Start tracking your mood to see patterns' },
              { title: 'Achievements', value: d.insights.achievements || 'Keep up the great work!' },
              { title: 'Suggestions', value: d.insights.suggestions || 'Try a new self-care activity today' },
            ];
          }
          setInsights(insightsArr);

          const avgMood = trends.length
            ? Math.round((trends.reduce((s, e) => s + e.intensity, 0) / trends.length) * 10) / 10
            : (d.stats?.mood?.avgIntensity || 0);
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 6);
          const weekly = trends.filter(e => new Date(e.timestamp) >= oneWeekAgo).length;

          setStats({
            averageMood: avgMood,
            totalCheckins: d.stats?.mood?.count || trends.length,
            currentStreak: d.currentStreaks?.mood || d.stats?.mood?.streak || 0,
            weeklyEntries: weekly || d.recentActivity?.moods || 0,
          });
        }

        if (actRes.status === 'fulfilled' && Array.isArray(actRes.value.data.data)) {
          setRecentActivities(actRes.value.data.data);
        }
      } catch (_) {
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋</h1>
        <p className="text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <QuickAction icon={Smile} label="Check Mood" desc="How are you feeling?" bg="bg-indigo-50" iconColor="text-indigo-600" onClick={() => navigate('/mood/check-in')} />
        <QuickAction icon={BookOpen} label="Write Journal" desc="Express yourself" bg="bg-violet-50" iconColor="text-violet-600" onClick={() => navigate('/journal')} />
        <QuickAction icon={MessageCircle} label="AI Chat" desc="Talk it out" bg="bg-teal-50" iconColor="text-teal-600" onClick={() => navigate('/chat')} />
        <QuickAction icon={Wind} label="Calm Zone" desc="Breathe & relax" bg="bg-rose-50" iconColor="text-rose-500" onClick={() => navigate('/calm-zone')} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard label="Avg Mood" value={stats.averageMood} sub="/10" icon={TrendingUp} bg="bg-indigo-50" iconColor="text-indigo-600" />
            <StatCard label="Total Check-ins" value={stats.totalCheckins} icon={CalendarCheck} bg="bg-violet-50" iconColor="text-violet-600" />
            <StatCard label="Streak" value={stats.currentStreak} sub="days" icon={Flame} bg="bg-amber-50" iconColor="text-amber-500" />
            <StatCard label="This Week" value={stats.weeklyEntries} sub="entries" icon={Star} bg="bg-teal-50" iconColor="text-teal-600" />
          </>
        )}
      </div>

      {/* Chart + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-6">Mood this week</h2>
          {loading ? <Skeleton className="h-48" /> : moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={moodData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey={e => new Date(e.timestamp).toLocaleDateString('en-US', { weekday: 'short' })} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="intensity" radius={[6, 6, 0, 0]} fill="#6366f1" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400">
              <Smile size={32} className="mb-2 opacity-30" />
              <p className="text-sm">No mood data yet</p>
              <button onClick={() => navigate('/mood/check-in')} className="mt-3 text-xs text-indigo-500 hover:text-indigo-600 font-medium">
                Record your first check-in →
              </button>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Insights</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : insights.length > 0 ? (
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight, i) => (
                <div key={i} className="p-3 bg-indigo-50 rounded-xl">
                  <p className="text-xs font-semibold text-indigo-600 mb-1">{insight.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{insight.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Start tracking to unlock insights.</p>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Recent Activity</h2>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10" />)}</div>
        ) : recentActivities.length > 0 ? (
          <ul className="divide-y divide-gray-50">
            {recentActivities.slice(0, 5).map((a, i) => (
              <li key={i} className="py-3 flex items-center justify-between">
                <p className="text-sm text-gray-700">{a.title || a.description}</p>
                <p className="text-xs text-gray-400 ml-4 whitespace-nowrap">
                  {a.timestamp ? new Date(a.timestamp).toLocaleDateString() : a.time || ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No recent activity yet. Start exploring SoulSpace!</p>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;