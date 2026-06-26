import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Wind, Timer, Music } from 'lucide-react';

const breathingExercises = [
  { name: '4-7-8 Breathing', inhale: 4, hold: 7, exhale: 8, desc: 'Calm your nervous system', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, desc: 'Improve focus & reduce stress', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { name: 'Deep Breathing', inhale: 4, hold: 0, exhale: 6, desc: 'Simple relaxation', color: 'bg-violet-50 border-violet-200 text-violet-700' },
];

const ambientSounds = [
  { id: 'rain', name: 'Rain', icon: '🌧️' },
  { id: 'ocean', name: 'Ocean', icon: '🌊' },
  { id: 'forest', name: 'Forest', icon: '🌲' },
  { id: 'fire', name: 'Fireplace', icon: '🔥' },
  { id: 'birds', name: 'Birds', icon: '🐦' },
];

const SOUND_URLS = {
  rain: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3',
  ocean: 'https://assets.mixkit.co/active_storage/sfx/2516/2516-preview.mp3',
  forest: 'https://assets.mixkit.co/active_storage/sfx/2517/2517-preview.mp3',
  fire: 'https://assets.mixkit.co/active_storage/sfx/1792/1792-preview.mp3',
  birds: 'https://assets.mixkit.co/active_storage/sfx/2525/2525-preview.mp3',
};

const phaseColors = {
  inhale: { ring: 'bg-indigo-400', text: 'text-indigo-600', label: 'Inhale' },
  hold: { ring: 'bg-amber-400', text: 'text-amber-600', label: 'Hold' },
  exhale: { ring: 'bg-teal-400', text: 'text-teal-600', label: 'Exhale' },
};

const formatTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const CalmZone = () => {
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathActive, setBreathActive] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedSound, setSelectedSound] = useState(null);
  const [meditationActive, setMeditationActive] = useState(false);
  const [meditationTime, setMeditationTime] = useState(300);
  const [currentTime, setCurrentTime] = useState(300);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Meditation timer
  useEffect(() => {
    if (meditationActive && currentTime > 0) {
      timerRef.current = setTimeout(() => setCurrentTime(t => t - 1), 1000);
    } else if (currentTime === 0 && meditationActive) {
      setMeditationActive(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [meditationActive, currentTime]);

  // Breathing animation
  useEffect(() => {
    if (!breathActive || !selectedExercise) return;
    const { inhale, hold, exhale } = selectedExercise;
    const sequence = [
      { phase: 'inhale', duration: inhale * 1000 },
      ...(hold > 0 ? [{ phase: 'hold', duration: hold * 1000 }] : []),
      { phase: 'exhale', duration: exhale * 1000 },
    ];
    let idx = 0;
    let timer;
    const next = () => {
      setBreathPhase(sequence[idx].phase);
      timer = setTimeout(() => { idx = (idx + 1) % sequence.length; next(); }, sequence[idx].duration);
    };
    next();
    return () => clearTimeout(timer);
  }, [breathActive, selectedExercise]);

  // Ambient audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (selectedSound) {
      const audio = new Audio(SOUND_URLS[selectedSound.id]);
      audio.loop = true;
      audio.volume = 0.5;
      audio.play().catch(() => {});
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedSound]);

  const phase = phaseColors[breathPhase];

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Calm Zone</h1>
        <p className="text-gray-400 text-sm">Breathe, relax, and find your peace</p>
      </div>

      {/* Breathing */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Wind size={18} className="text-indigo-500" />
          <h2 className="text-base font-semibold text-gray-800">Breathing Exercises</h2>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {breathingExercises.map(ex => (
            <button key={ex.name}
              onClick={() => { setSelectedExercise(ex); setBreathActive(false); setBreathPhase('inhale'); }}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedExercise?.name === ex.name ? ex.color : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}>
              <p className="text-sm font-semibold text-gray-800 mb-1">{ex.name}</p>
              <p className="text-xs text-gray-500">{ex.desc}</p>
              <p className="text-xs text-gray-400 mt-1">{ex.inhale}s · {ex.hold}s · {ex.exhale}s</p>
            </button>
          ))}
        </div>

        {selectedExercise && (
          <div className="flex flex-col items-center py-6">
            <p className={`text-sm font-semibold mb-6 ${phase.text}`}>{phase.label}</p>
            <div className="relative flex items-center justify-center mb-8">
              <div className={`w-32 h-32 ${phase.ring} rounded-full opacity-20 transition-all duration-1000 ${breathActive ? 'scale-150' : 'scale-100'}`} />
              <div className={`absolute w-20 h-20 ${phase.ring} rounded-full opacity-60 transition-all duration-1000 ${breathActive ? 'scale-125' : 'scale-100'}`} />
              <div className={`absolute w-10 h-10 ${phase.ring} rounded-full`} />
            </div>
            <button onClick={() => setBreathActive(!breathActive)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
              {breathActive ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
            </button>
          </div>
        )}
      </div>

      {/* Ambient Sounds */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Music size={18} className="text-teal-500" />
          <h2 className="text-base font-semibold text-gray-800">Ambient Sounds</h2>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {ambientSounds.map(s => (
            <button key={s.id}
              onClick={() => setSelectedSound(selectedSound?.id === s.id ? null : s)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${selectedSound?.id === s.id ? 'border-teal-300 bg-teal-50' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}>
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs font-medium text-gray-500">{s.name}</span>
            </button>
          ))}
        </div>

        {selectedSound && (
          <div className="mt-4 flex items-center justify-between px-4 py-3 bg-teal-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="flex gap-1 items-end">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-1 bg-teal-400 rounded-full animate-pulse"
                    style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-sm font-medium text-teal-700">{selectedSound.name} playing</span>
            </div>
            <button onClick={() => setSelectedSound(null)}
              className="text-xs text-teal-500 hover:text-teal-700 font-semibold transition-colors">
              Stop
            </button>
          </div>
        )}
      </div>

      {/* Meditation Timer */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Timer size={18} className="text-violet-500" />
          <h2 className="text-base font-semibold text-gray-800">Meditation Timer</h2>
        </div>

        <div className="flex gap-2 mb-6">
          {[{ label: '5 min', value: 300 }, { label: '10 min', value: 600 }, { label: '20 min', value: 1200 }].map(p => (
            <button key={p.value}
              onClick={() => { setMeditationTime(p.value); setCurrentTime(p.value); setMeditationActive(false); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${meditationTime === p.value ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center py-4">
          <div className="relative w-36 h-36 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#7c3aed" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - currentTime / meditationTime)}`}
                className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800 font-mono">{formatTime(currentTime)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setMeditationActive(!meditationActive)}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors">
              {meditationActive ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Start</>}
            </button>
            <button onClick={() => { setCurrentTime(meditationTime); setMeditationActive(false); }}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors">
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        If you're in crisis, call or text <span className="font-semibold">988</span> (Suicide & Crisis Lifeline) or text HOME to <span className="font-semibold">741741</span>
      </p>
    </div>
  );
};

export default CalmZone;