import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';

const CalmZone = () => {
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedSound, setSelectedSound] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isMeditationActive, setIsMeditationActive] = useState(false);
  const [currentMeditationTime, setCurrentMeditationTime] = useState(300);
  const [meditationTime, setMeditationTime] = useState(300);
  const meditationTimerRef = useRef(null);

  const breathingExercises = [
    { name: "4-7-8 Breathing", inhale: 4, hold: 7, exhale: 8, description: "Calm your nervous system" },
    { name: "Box Breathing", inhale: 4, hold: 4, exhale: 4, description: "Improve focus and reduce stress" },
    { name: "Deep Breathing", inhale: 4, hold: 0, exhale: 6, description: "Simple relaxation" }
  ];

  const ambientSounds = [
    { id: 'rain', name: 'Rain Sounds', emoji: '???' },
    { id: 'ocean', name: 'Ocean Waves', emoji: '??' },
    { id: 'forest', name: 'Forest', emoji: '??' },
    { id: 'fire', name: 'Fireplace', emoji: '??' },
    { id: 'birds', name: 'Birds', emoji: '??' }
  ];

  useEffect(() => {
    if (isMeditationActive && currentMeditationTime > 0) {
      meditationTimerRef.current = setTimeout(() => {
        setCurrentMeditationTime(prev => prev - 1);
      }, 1000);
    } else if (currentMeditationTime === 0 && isMeditationActive) {
      setIsMeditationActive(false);
      alert('Meditation session complete!');
    }

    return () => {
      if (meditationTimerRef.current) clearTimeout(meditationTimerRef.current);
    };
  }, [isMeditationActive, currentMeditationTime]);

  useEffect(() => {
    let timer;
    if (isBreathingActive && selectedExercise) {
      const { inhale, hold, exhale } = selectedExercise;
      const sequence = [
        { phase: 'inhale', duration: inhale * 1000 },
        { phase: 'hold', duration: hold * 1000 },
        { phase: 'exhale', duration: exhale * 1000 },
      ];
      
      let currentIndex = 0;
      const nextPhase = () => {
        const current = sequence[currentIndex];
        setBreathingPhase(current.phase);
        currentIndex = (currentIndex + 1) % sequence.length;
        timer = setTimeout(nextPhase, current.duration);
      };
      
      nextPhase();
      return () => clearTimeout(timer);
    }
  }, [isBreathingActive, selectedExercise]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Brain size={30} className="text-indigo-500" />
          Calm Zone
        </h1>
        <p className="text-gray-300">Relaxation exercises for peace and mindfulness</p>
      </div>

      {/* Breathing Exercises */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-6">Breathing Exercises</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {breathingExercises.map((exercise) => (
            <button
              key={exercise.name}
              onClick={() => {
                setSelectedExercise(exercise);
                setIsBreathingActive(false);
              }}
              className={`bg-gray-900 border-2 rounded-xl p-6 text-left transition-all ${
                selectedExercise?.name === exercise.name
                  ? 'border-indigo-500 bg-indigo-600/10'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <p className="font-semibold text-white">{exercise.name}</p>
              <p className="text-sm text-gray-400 mt-1">{exercise.description}</p>
              <p className="text-xs text-gray-500 mt-2">{exercise.inhale}s inhale / {exercise.hold}s hold / {exercise.exhale}s exhale</p>
            </button>
          ))}
        </div>

        {selectedExercise && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-indigo-400 mb-6 capitalize">{breathingPhase}</p>
            <motion.div
              animate={{ scale: isBreathingActive ? 1.5 : 1 }}
              transition={{ duration: selectedExercise[breathingPhase.toLowerCase()] || 2, ease: "easeInOut" }}
              className="w-32 h-32 bg-indigo-500 rounded-full mx-auto mb-8"
            />
            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
            >
              {isBreathingActive ? <Pause size={20} /> : <Play size={20} />}
              {isBreathingActive ? 'Pause' : 'Start'}
            </button>
          </div>
        )}
      </div>

      {/* Ambient Sounds */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-6">Ambient Sounds</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {ambientSounds.map((sound) => (
            <button
              key={sound.id}
              onClick={() => setSelectedSound(selectedSound?.id === sound.id ? null : sound)}
              className={`bg-gray-900 border-2 rounded-lg p-4 text-center transition-all ${
                selectedSound?.id === sound.id
                  ? 'border-indigo-500 bg-indigo-600/10'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <p className="text-3xl mb-2">{sound.emoji}</p>
              <p className="text-sm font-medium text-gray-300">{sound.name}</p>
            </button>
          ))}
        </div>

        {selectedSound && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">{selectedSound.name} Playing</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-24 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meditation Timer */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <h2 className="text-xl font-semibold text-white mb-6">Meditation Timer</h2>
        
        {/* Preset Buttons */}
        <div className="flex gap-3 justify-center mb-8">
          {[
            { label: '5 min', value: 300 },
            { label: '10 min', value: 600 },
            { label: '20 min', value: 1200 }
          ].map((preset) => (
            <button
              key={preset.value}
              onClick={() => {
                setMeditationTime(preset.value);
                setCurrentMeditationTime(preset.value);
              }}
              className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                meditationTime === preset.value
                  ? 'bg-indigo-600 border border-indigo-500 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        
        <div className="text-6xl font-bold text-indigo-400 mb-8 font-mono">{formatTime(currentMeditationTime)}</div>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setIsMeditationActive(!isMeditationActive)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
          >
            {isMeditationActive ? <Pause size={20} /> : <Play size={20} />}
            {isMeditationActive ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={() => setCurrentMeditationTime(meditationTime)}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2 border border-gray-700"
          >
            <RotateCcw size={18} />
            Reset
          </button>
        </div>
      </div>

      {/* Emergency Resources */}
      <p className="text-xs text-gray-600 text-center mt-8">
        If you're in crisis, call or text 988 (Suicide & Crisis Lifeline) or text HOME to 741741
      </p>
    </div>
  );
};

export default CalmZone;

