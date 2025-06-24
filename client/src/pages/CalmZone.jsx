import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CalmZone = () => {
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedSound, setSelectedSound] = useState(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.5);
  const [isMeditationActive, setIsMeditationActive] = useState(false);
  const [meditationTime, setMeditationTime] = useState(300); // 5 minutes in seconds
  const [currentMeditationTime, setCurrentMeditationTime] = useState(300);
  const audioRef = useRef(null);
  const meditationTimerRef = useRef(null);

  const breathingExercises = [
    { name: "4-7-8 Breathing", inhale: 4, hold: 7, exhale: 8, description: "Calm your nervous system" },
    { name: "Box Breathing", inhale: 4, hold: 4, exhale: 4, description: "Improve focus and reduce stress" },
    { name: "Deep Breathing", inhale: 4, hold: 0, exhale: 6, description: "Simple relaxation technique" }
  ];

  const ambientSounds = [
    { id: 'rain', name: 'Rain Sounds', emoji: '🌧️', description: 'Gentle rainfall', color: 'from-blue-100 to-blue-200', file: '/audio/morning-rain-346863.mp3' },
    { id: 'ocean', name: 'Ocean Waves', emoji: '🌊', description: 'Calming ocean waves', color: 'from-cyan-100 to-blue-100', file: '/audio/ocean-waves-112906.mp3' },
    { id: 'forest', name: 'Forest Ambience', emoji: '🌲', description: 'Peaceful forest sounds', color: 'from-green-100 to-green-200', file: '/audio/forest-ambience-296528.mp3' },
    { id: 'white-noise', name: 'White Noise', emoji: '🔇', description: 'Consistent background noise', color: 'from-gray-100 to-gray-200', file: '/audio/underwater-white-noise-46423.mp3' },
    { id: 'fire', name: 'Crackling Fire', emoji: '🔥', description: 'Warm fireplace sounds', color: 'from-orange-100 to-red-100', file: '/audio/fireplace2-cracking-26091.mp3' },
    { id: 'birds', name: 'Bird Songs', emoji: '🐦', description: 'Morning bird chorus', color: 'from-yellow-100 to-green-100', file: '/audio/chirping-birds-hd-1-271401.mp3' }
  ];

  const quickRelaxation = [
    {
      id: 'meditation',
      title: "5-Minute Meditation",
      description: "Quick guided meditation for immediate relief",
      duration: "5 min",
      emoji: "🧘",
      action: () => startMeditation(300)
    },
    {
      id: 'muscle-relaxation',
      title: "Progressive Muscle Relaxation",
      description: "Release tension from head to toe",
      duration: "10 min",
      emoji: "💆",
      action: () => startMuscleRelaxation()
    },
    {
      id: 'mindful-walking',
      title: "Mindful Walking",
      description: "Take a peaceful walk in nature",
      duration: "15 min",
      emoji: "🚶",
      action: () => startMindfulWalking()
    },
    {
      id: 'gratitude',
      title: "Gratitude Practice",
      description: "Focus on what you're thankful for",
      duration: "5 min",
      emoji: "🙏",
      action: () => startGratitudePractice()
    }
  ];

  // Meditation timer effect
  useEffect(() => {
    if (isMeditationActive && currentMeditationTime > 0) {
      meditationTimerRef.current = setTimeout(() => {
        setCurrentMeditationTime(prev => prev - 1);
      }, 1000);
    } else if (currentMeditationTime === 0) {
      setIsMeditationActive(false);
      setCurrentMeditationTime(meditationTime);
      alert('Meditation session complete! Take a moment to notice how you feel.');
    }

    return () => {
      if (meditationTimerRef.current) {
        clearTimeout(meditationTimerRef.current);
      }
    };
  }, [isMeditationActive, currentMeditationTime, meditationTime]);

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
        if (current.duration > 0) {
            setBreathingPhase(current.phase);
            timer = setTimeout(() => {
                currentIndex = (currentIndex + 1) % sequence.length;
                nextPhase();
            }, current.duration);
        } else {
            currentIndex = (currentIndex + 1) % sequence.length;
            nextPhase();
        }
      };

      nextPhase();
    }
    return () => clearTimeout(timer);
  }, [isBreathingActive, selectedExercise]);
  
  useEffect(() => {
    if (selectedSound) {
      const soundData = ambientSounds.find(s => s.id === selectedSound);
      if (soundData && audioRef.current) {
        audioRef.current.src = soundData.file;
        audioRef.current.currentTime = 0;
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.loop = true;
        audioRef.current.play();
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    // Pause sound on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSound]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const startBreathing = (exercise) => {
    setSelectedExercise(exercise);
    setIsBreathingActive(true);
  };

  const stopBreathing = () => {
    setIsBreathingActive(false);
    setBreathingPhase('inhale');
    setSelectedExercise(null);
  };

  const startMeditation = (duration) => {
    setMeditationTime(duration);
    setCurrentMeditationTime(duration);
    setIsMeditationActive(true);
  };

  const stopMeditation = () => {
    setIsMeditationActive(false);
    setCurrentMeditationTime(meditationTime);
  };

  const startMuscleRelaxation = () => {
    alert('Progressive Muscle Relaxation Guide:\n\n1. Find a comfortable position\n2. Start with your toes - tense for 5 seconds, then relax\n3. Move up to your calves, thighs, stomach, chest, arms, neck, and face\n4. Take deep breaths throughout\n5. Notice the difference between tension and relaxation');
  };

  const startMindfulWalking = () => {
    alert('Mindful Walking Guide:\n\n1. Find a safe, quiet place to walk\n2. Walk slowly and deliberately\n3. Focus on each step - feel your feet touching the ground\n4. Notice your surroundings - sights, sounds, smells\n5. If your mind wanders, gently bring it back to your walking\n6. Walk for 15 minutes or as long as feels comfortable');
  };

  const startGratitudePractice = () => {
    const gratitudePrompts = [
      "What made you smile today?",
      "Who are you thankful for in your life?",
      "What's something you're looking forward to?",
      "What's a challenge you've overcome recently?",
      "What's something beautiful you noticed today?"
    ];
    
    const randomPrompt = gratitudePrompts[Math.floor(Math.random() * gratitudePrompts.length)];
    const response = prompt(`Gratitude Practice:\n\n${randomPrompt}\n\nTake 5 minutes to reflect on this question. You can write your thoughts or just think about them.`);
    
    if (response) {
      alert('Thank you for practicing gratitude! Remember, even small moments of appreciation can shift your perspective.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-950 p-6 flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 max-w-5xl w-full border border-gray-100 dark:border-gray-700">
        <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-8 flex items-center justify-center gap-2">
          Calm Zone 🧘
        </h1>

        {/* Meditation Timer */}
        {isMeditationActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 mb-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🧘 Meditation in Progress</h2>
            <div className="text-6xl font-bold text-blue-600 mb-4">{formatTime(currentMeditationTime)}</div>
            <p className="text-gray-600 mb-6">Find a comfortable position and focus on your breath</p>
            <button
              onClick={stopMeditation}
              className="bg-red-600 dark:bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
            >
              End Session
            </button>
          </motion.div>
        )}

        {/* Breathing Exercise */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Breathing Exercises</h2>
          
          <AnimatePresence mode="wait">
          {isBreathingActive && selectedExercise ? (
            <motion.div 
              key="breathing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center">
                <div className="relative w-64 h-64 mx-auto mb-6">
                    <motion.div 
                        className="absolute inset-0 bg-blue-200 rounded-full"
                        animate={{
                            scale: breathingPhase === 'inhale' ? 1.1 : (breathingPhase === 'hold' ? 1.1 : 0.9),
                            opacity: breathingPhase === 'inhale' ? 1 : (breathingPhase === 'hold' ? 1 : 0.8)
                        }}
                        transition={{ duration: selectedExercise ? selectedExercise.inhale : 4, ease: "easeInOut" }}
                    />
                    <motion.div 
                        className="absolute inset-0 rounded-full flex items-center justify-center text-6xl"
                        animate={{
                            scale: breathingPhase === 'inhale' ? 1.1 : (breathingPhase === 'hold' ? 1.1 : 0.9),
                        }}
                        transition={{ duration: selectedExercise ? selectedExercise.exhale : 4, ease: "easeInOut" }}
                    >
                         {breathingPhase === 'inhale' ? '🫁' : breathingPhase === 'hold' ? '⏸️' : '😮‍💨'}
                    </motion.div>
                </div>

              <h3 className="text-2xl font-semibold text-gray-800 mb-2 capitalize">
                {breathingPhase} ({selectedExercise.name})
              </h3>
              <p className="text-gray-600 mb-6">Follow the circle's rhythm</p>
              <button
                onClick={stopBreathing}
                className="bg-red-600 dark:bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Stop Exercise
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
             className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {breathingExercises.map((exercise, index) => (
                <motion.div 
                    key={index} 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{exercise.name}</h3>
                  <p className="text-gray-600 mb-4 flex-grow">{exercise.description}</p>
                  <div className="text-sm text-gray-500 mb-4">
                    Inhale: {exercise.inhale}s | Hold: {exercise.hold}s | Exhale: {exercise.exhale}s
                  </div>
                  <button
                    onClick={() => startBreathing(exercise)}
                    className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors mt-auto"
                  >
                    Start Exercise
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>

        {/* Ambient Sounds */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 mb-8">
          <audio ref={audioRef} style={{ display: 'none' }} />
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ambient Sounds</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {ambientSounds.map((sound) => (
              <button
                key={sound.id}
                onClick={() => setSelectedSound(prev => (prev === sound.id ? null : sound.id))}
                className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                  selectedSound === sound.id
                    ? 'border-blue-500 bg-blue-100 shadow-lg'
                    : `border-gray-200 hover:border-gray-300 bg-gradient-to-br ${sound.color}`
                }`}
              >
                <div className="text-4xl mb-2">{sound.emoji}</div>
                <div className="text-sm font-medium text-gray-800">{sound.name}</div>
                <AnimatePresence>
                {selectedSound === sound.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-blue-600 text-xs font-semibold">Playing</motion.div>
                )}
                </AnimatePresence>
              </button>
            ))}
          </div>
          {selectedSound && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => setIsMuted(m => !m)}
                  className={`p-2 rounded-lg transition-colors ${
                    isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
                <span className="text-sm text-gray-600">Volume:</span>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <span className="text-sm text-gray-600 w-12 text-right">
                  {Math.round(volume * 100)}%
                </span>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Relaxation */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Relaxation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickRelaxation.map((activity, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                <div className="text-3xl mb-3">{activity.emoji}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{activity.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{activity.duration}</span>
                  <button 
                    onClick={activity.action}
                    className="text-blue-600 text-sm font-semibold hover:underline"
                  >
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Emergency Resources */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-4">🚨 Emergency Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-red-800 mb-2">Crisis Hotlines</h3>
              <ul className="space-y-1 text-red-700">
                <li>• National Suicide Prevention: 988</li>
                <li>• Crisis Text Line: Text HOME to 741741</li>
                <li>• Emergency Services: 911</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-red-800 mb-2">Professional Help</h3>
              <ul className="space-y-1 text-red-700">
                <li>• Find a therapist near you</li>
                <li>• Talk to your doctor</li>
                <li>• Reach out to trusted friends/family</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mt-8 bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">💡 Tips for Finding Calm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <ul className="space-y-2">
              <li>• Practice deep breathing regularly</li>
              <li>• Take breaks from screens and technology</li>
              <li>• Spend time in nature</li>
              <li>• Listen to calming music or sounds</li>
            </ul>
            <ul className="space-y-2">
              <li>• Practice mindfulness and meditation</li>
              <li>• Maintain a regular sleep schedule</li>
              <li>• Exercise regularly</li>
              <li>• Connect with supportive people</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CalmZone;