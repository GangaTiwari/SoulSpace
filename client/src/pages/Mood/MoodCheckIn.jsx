import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { Angry, Cloud, Frown, Laugh, Meh, Smile, Zap, ArrowRight } from 'lucide-react';

const moods = [
  { id: 'very_happy', icon: Laugh, label: 'Very Happy', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  { id: 'happy', icon: Smile, label: 'Happy', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-300' },
  { id: 'calm', icon: Cloud, label: 'Calm', color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-300' },
  { id: 'neutral', icon: Meh, label: 'Neutral', color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-300' },
  { id: 'sad', icon: Frown, label: 'Sad', color: 'text-blue-400', bg: 'bg-blue-50', border: 'border-blue-300' },
  { id: 'anxious', icon: Cloud, label: 'Anxious', color: 'text-purple-400', bg: 'bg-purple-50', border: 'border-purple-300' },
  { id: 'angry', icon: Angry, label: 'Angry', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-300' },
  { id: 'excited', icon: Zap, label: 'Excited', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-300' },
];

const intensityLabels = ['', 'Very Low', 'Low', 'Slightly Low', 'Moderate', 'Average', 'Above Avg', 'Good', 'Great', 'Very High', 'Exceptional'];

const MoodCheckIn = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [journalPrompt, setJournalPrompt] = useState('');

  useEffect(() => {
    API.get('/journal/prompt').then(r => setJournalPrompt(r.data.data?.prompt || '')).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) return;
    try {
      setLoading(true);
      await API.post('/mood', { mood: selectedMood.id, intensity, notes: notes.trim() || undefined, timestamp: new Date().toISOString() });
      navigate('/mood/history');
    } catch {
      alert('Failed to record mood. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="ss-section-title mb-1">How are you feeling?</h1>
        <p className="ss-subtitle">Take a mindful pause and check in with yourself</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood grid */}
        <div className="ss-card p-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">Select your mood</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {moods.map(mood => {
              const Icon = mood.icon;
              const selected = selectedMood?.id === mood.id;
              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setSelectedMood(mood)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    selected ? `${mood.bg} ${mood.border} shadow-sm` : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <Icon size={28} className={selected ? mood.color : 'text-gray-400'} />
                  <span className={`text-xs font-medium ${selected ? 'text-gray-800' : 'text-gray-400'}`}>{mood.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Intensity */}
        <div className="ss-card p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">Intensity</p>
            <span className="text-sm font-semibold text-indigo-600">{intensity}/10 — {intensityLabels[intensity]}</span>
          </div>
          <input
            type="range" min="1" max="10" value={intensity}
            onChange={e => setIntensity(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-600 bg-indigo-100"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-2">
            <span>Low</span><span>High</span>
          </div>
        </div>

        {/* Notes */}
        <div className="ss-card p-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Add a note <span className="text-gray-400 font-normal">(optional)</span></p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={journalPrompt || "What's on your mind?"}
            className="ss-textarea bg-gray-50 h-24"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selectedMood}
          className="ss-btn-primary w-full py-3.5"
        >
          {loading ? 'Saving...' : <><span>Record Mood</span><ArrowRight size={18} /></>}
        </button>
      </form>
    </div>
  );
};

export default MoodCheckIn;