import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const Games = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Game States
  const [game2048Board, setGame2048Board] = useState(Array(4).fill().map(() => Array(4).fill(0)));
  const [game2048Score, setGame2048Score] = useState(0);
  const [memoryCards, setMemoryCards] = useState([]);
  const [memoryFlipped, setMemoryFlipped] = useState([]);
  const [memoryMatched, setMemoryMatched] = useState([]);
  const [memoryCanFlip, setMemoryCanFlip] = useState(true);
  const [colorMatchBoard, setColorMatchBoard] = useState([]);
  const [bubbleBoard, setBubbleBoard] = useState([]);

  useEffect(() => {
    loadGameHistory();
  }, []);

  const loadGameHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading game history...');
      const response = await axios.get('/games/recent');
      console.log('Game history response:', response.data);
      let data = response.data && Array.isArray(response.data.data) ? response.data.data : [];
      setGameHistory(data);
    } catch (error) {
      console.error('Error loading game history:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      if (error.response?.status === 401) {
        setError('Please log in to view game history');
      } else if (error.response?.status === 500) {
        setError('Server error loading game history');
      } else {
        setError('Failed to load game history');
      }
      setGameHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const saveGameResult = async (game, score, time) => {
    try {
      const gameData = {
        gameName: game.name,
        score: score,
        time: time,
        category: 'cognitive',
        difficulty: game.difficulty
      };
      
      await axios.post('/games/save', gameData);
      await loadGameHistory();
    } catch (error) {
      console.error('Error saving game result:', error);
      setError('Failed to save game result');
    }
  };

  // 2048 Game Logic
  const initialize2048 = () => {
    const newBoard = Array(4).fill().map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setGame2048Board(newBoard);
    setGame2048Score(0);
  };

  const addRandomTile = (board) => {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push({ i, j });
        }
      }
    }
    if (emptyCells.length > 0) {
      const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const move2048 = (direction) => {
    const newBoard = JSON.parse(JSON.stringify(game2048Board));
    let moved = false;
    let score = 0;

    if (direction === 'left' || direction === 'right') {
      for (let i = 0; i < 4; i++) {
        const row = newBoard[i];
        const merged = new Array(4).fill(false);
        
        if (direction === 'left') {
          for (let j = 1; j < 4; j++) {
            if (row[j] !== 0) {
              let k = j;
              while (k > 0 && (row[k-1] === 0 || (row[k-1] === row[k] && !merged[k-1]))) {
                if (row[k-1] === 0) {
                  row[k-1] = row[k];
                  row[k] = 0;
                  k--;
                  moved = true;
                } else if (row[k-1] === row[k] && !merged[k-1]) {
                  row[k-1] *= 2;
                  score += row[k-1];
                  row[k] = 0;
                  merged[k-1] = true;
                  moved = true;
                  break;
                }
              }
            }
          }
        } else {
          for (let j = 2; j >= 0; j--) {
            if (row[j] !== 0) {
              let k = j;
              while (k < 3 && (row[k+1] === 0 || (row[k+1] === row[k] && !merged[k+1]))) {
                if (row[k+1] === 0) {
                  row[k+1] = row[k];
                  row[k] = 0;
                  k++;
                  moved = true;
                } else if (row[k+1] === row[k] && !merged[k+1]) {
                  row[k+1] *= 2;
                  score += row[k+1];
                  row[k] = 0;
                  merged[k+1] = true;
                  moved = true;
                  break;
                }
              }
            }
          }
        }
      }
    } else {
      for (let j = 0; j < 4; j++) {
        const col = [newBoard[0][j], newBoard[1][j], newBoard[2][j], newBoard[3][j]];
        const merged = new Array(4).fill(false);
        
        if (direction === 'up') {
          for (let i = 1; i < 4; i++) {
            if (col[i] !== 0) {
              let k = i;
              while (k > 0 && (col[k-1] === 0 || (col[k-1] === col[k] && !merged[k-1]))) {
                if (col[k-1] === 0) {
                  col[k-1] = col[k];
                  col[k] = 0;
                  k--;
                  moved = true;
                } else if (col[k-1] === col[k] && !merged[k-1]) {
                  col[k-1] *= 2;
                  score += col[k-1];
                  col[k] = 0;
                  merged[k-1] = true;
                  moved = true;
                  break;
                }
              }
            }
          }
        } else {
          for (let i = 2; i >= 0; i--) {
            if (col[i] !== 0) {
              let k = i;
              while (k < 3 && (col[k+1] === 0 || (col[k+1] === col[k] && !merged[k+1]))) {
                if (col[k+1] === 0) {
                  col[k+1] = col[k];
                  col[k] = 0;
                  k++;
                  moved = true;
                } else if (col[k+1] === col[k] && !merged[k+1]) {
                  col[k+1] *= 2;
                  score += col[k+1];
                  col[k] = 0;
                  merged[k+1] = true;
                  moved = true;
                  break;
                }
              }
            }
          }
        }
        
        for (let i = 0; i < 4; i++) {
          newBoard[i][j] = col[i];
        }
      }
    }

    if (moved) {
      addRandomTile(newBoard);
      setGame2048Board(newBoard);
      setGame2048Score(prev => prev + score);
    }
  };

  // Memory Game Logic
  const initializeMemory = () => {
    const symbols = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎪', '🎯'];
    const cards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false
      }));
    
    setMemoryCards(cards);
    setMemoryFlipped([]);
    setMemoryMatched([]);
    setMemoryCanFlip(true);
  };

  const flipCard = (cardId) => {
    if (!memoryCanFlip) return;
    
    const card = memoryCards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = memoryCards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setMemoryCards(newCards);

    const newFlipped = [...memoryFlipped, cardId];
    setMemoryFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryCanFlip(false);
      
      const [firstId, secondId] = newFlipped;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);

      if (firstCard.symbol === secondCard.symbol) {
        // Match found
        const updatedCards = newCards.map(c => 
          c.id === firstId || c.id === secondId 
            ? { ...c, isMatched: true }
            : c
        );
        setMemoryCards(updatedCards);
        setMemoryMatched([...memoryMatched, firstId, secondId]);
        setMemoryFlipped([]);
        setMemoryCanFlip(true);
        setGameScore(prev => prev + 10);
        
        // Check if game is complete
        if (memoryMatched.length + 2 === 16) {
          setTimeout(() => {
            endGame();
          }, 500);
        }
      } else {
        // No match
        setTimeout(() => {
          const resetCards = newCards.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false }
              : c
          );
          setMemoryCards(resetCards);
          setMemoryFlipped([]);
          setMemoryCanFlip(true);
        }, 1000);
      }
    }
  };

  // Color Match Game Logic
  const initializeColorMatch = () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const board = Array(8).fill().map(() => 
      Array(8).fill().map(() => colors[Math.floor(Math.random() * colors.length)])
    );
    setColorMatchBoard(board);
  };

  const swapColors = (row1, col1, row2, col2) => {
    const newBoard = JSON.parse(JSON.stringify(colorMatchBoard));
    [newBoard[row1][col1], newBoard[row2][col2]] = [newBoard[row2][col2], newBoard[row1][col1]];
    setColorMatchBoard(newBoard);
    checkMatches(newBoard);
  };

  const checkMatches = (board) => {
    let matches = 0;
    // Check horizontal matches
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 6; j++) {
        if (board[i][j] === board[i][j+1] && board[i][j] === board[i][j+2]) {
          matches++;
        }
      }
    }
    // Check vertical matches
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j] === board[i+1][j] && board[i][j] === board[i+2][j]) {
          matches++;
        }
      }
    }
    if (matches > 0) {
      setGameScore(prev => prev + matches * 5);
    }
  };

  // Bubble Pop Game Logic
  const initializeBubblePop = () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
    const board = Array(10).fill().map(() => 
      Array(8).fill().map(() => colors[Math.floor(Math.random() * colors.length)])
    );
    setBubbleBoard(board);
  };

  const popBubbles = (row, col) => {
    const color = bubbleBoard[row][col];
    if (!color) return;
    
    const newBoard = JSON.parse(JSON.stringify(bubbleBoard));
    const toPop = new Set();
    
    const floodFill = (r, c) => {
      if (r < 0 || r >= 10 || c < 0 || c >= 8 || newBoard[r][c] !== color) return;
      toPop.add(`${r},${c}`);
      newBoard[r][c] = null;
      
      floodFill(r+1, c);
      floodFill(r-1, c);
      floodFill(r, c+1);
      floodFill(r, c-1);
    };
    
    floodFill(row, col);
    
    if (toPop.size >= 2) {
      setBubbleBoard(newBoard);
      setGameScore(prev => prev + toPop.size * 2);
    }
  };

  const gameCategories = [
    {
      id: 'puzzle',
      name: 'Puzzle Games',
      emoji: '🧩',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      description: 'Brain-teasing puzzle games to challenge your mind',
      games: [
        {
          id: '2048',
          name: '2048',
          description: 'Slide tiles to combine them and reach 2048!',
          duration: '5-15 min',
          difficulty: 'Medium',
          benefits: ['Improves strategic thinking', 'Enhances focus', 'Reduces stress'],
          instructions: [
            'Use the arrow buttons to move tiles in any direction',
            'When two tiles with the same number touch, they merge into one',
            'Try to reach the 2048 tile!',
            'You can continue playing beyond 2048 for higher scores'
          ]
        },
        {
          id: 'memory',
          name: 'Memory Match',
          description: 'Find matching pairs of cards',
          duration: '3-8 min',
          difficulty: 'Easy',
          benefits: ['Improves memory', 'Enhances concentration', 'Reduces anxiety'],
          instructions: [
            'Click on cards to flip them and reveal their symbols',
            'Find two cards with matching symbols to make a pair',
            'Try to remember where each symbol is located',
            'Complete all pairs to win!'
          ]
        },
        {
          id: 'color-match',
          name: 'Color Match',
          description: 'Match 3 or more colors in a row',
          duration: '5-10 min',
          difficulty: 'Easy',
          benefits: ['Improves pattern recognition', 'Reduces stress', 'Enhances focus'],
          instructions: [
            'Click on adjacent tiles to swap their positions',
            'Create horizontal or vertical lines of 3 or more same-colored tiles',
            'Matches will be automatically cleared and scored',
            'Try to create as many matches as possible!'
          ]
        },
        {
          id: 'sudoku',
          name: 'Sudoku',
          description: 'Fill the grid so every row, column, and box contains 1-9',
          duration: '10-30 min',
          difficulty: 'Medium',
          benefits: ['Improves logic', 'Enhances concentration', 'Fun challenge'],
          instructions: [
            'Fill the 9x9 grid with numbers 1-9',
            'Each row, column, and 3x3 box must contain each number exactly once',
            'No guessing! Use logic to solve the puzzle.'
          ]
        },
        {
          id: 'tetris',
          name: 'Tetris',
          description: 'Stack falling blocks to clear lines',
          duration: '5-20 min',
          difficulty: 'Easy',
          benefits: ['Improves spatial reasoning', 'Quick fun', 'Classic game'],
          instructions: [
            'Move and rotate falling blocks to complete horizontal lines',
            'Completed lines disappear and score points',
            'Game ends when the blocks reach the top'
          ]
        }
      ]
    },
    {
      id: 'arcade',
      name: 'Arcade Games',
      emoji: '🎮',
      color: 'from-green-500 to-teal-600',
      bgColor: 'from-green-50 to-teal-50',
      description: 'Fast-paced arcade games for quick fun',
      games: [
        {
          id: 'bubble-pop',
          name: 'Bubble Pop',
          description: 'Pop groups of colored bubbles',
          duration: '3-8 min',
          difficulty: 'Easy',
          benefits: ['Quick stress relief', 'Improves reflexes', 'Fun distraction'],
          instructions: [
            'Click on groups of 2 or more same-colored bubbles',
            'Connected bubbles of the same color will pop together',
            'Larger groups give you more points',
            'Clear as many bubbles as you can!'
          ]
        },
        {
          id: 'snake',
          name: 'Snake',
          description: 'Eat food, grow longer, avoid hitting yourself!',
          duration: '2-10 min',
          difficulty: 'Easy',
          benefits: ['Improves reflexes', 'Classic arcade fun'],
          instructions: [
            'Use arrow keys to move the snake',
            'Eat food to grow longer',
            'Dont run into yourself or the walls!'
          ]
        }
      ]
    }
  ];

  const startGame = (game) => {
    setSelectedGame(game);
    setIsGameActive(true);
    setGameScore(0);
    setGameTime(0);
    setError(null);
    setShowInstructions(true);
    
    if (game.id === '2048') {
      initialize2048();
    } else if (game.id === 'memory') {
      initializeMemory();
    }
  };

  const endGame = async () => {
    const finalScore = selectedGame.id === '2048' ? game2048Score : gameScore;
    const gameData = {
      gameName: selectedGame.name,
      score: finalScore,
      time: gameTime,
      category: 'cognitive',
      difficulty: 'Medium'
    };

    try {
      await axios.post('/games/save', gameData);
      await loadGameHistory();
      setSuccessMessage('Game result saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error saving game result:', error);
      setError('Failed to save game result');
      setTimeout(() => setError(null), 3000);
    }

    setIsGameActive(false);
    setSelectedGame(null);
    setGameScore(0);
    setGameTime(0);
  };

  useEffect(() => {
    let timer;
    if (isGameActive) {
      timer = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderGame = () => {
    if (!selectedGame) return null;

    if (selectedGame.id === '2048') {
      return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 shadow-lg">
          <div className="grid grid-cols-4 gap-3 mb-6 max-w-xs mx-auto">
            {game2048Board.map((row, i) =>
              row.map((cell, j) => (
                <motion.div
                  key={`${i}-${j}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, delay: (i * 4 + j) * 0.05 }}
                  className={`w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold shadow-md transition-all duration-200 ${
                    cell === 0 ? 'bg-gray-200' : 
                    cell === 2 ? 'bg-red-400 text-white' :
                    cell === 4 ? 'bg-orange-400 text-white' :
                    cell === 8 ? 'bg-yellow-400 text-white' :
                    cell === 16 ? 'bg-green-400 text-white' :
                    cell === 32 ? 'bg-blue-400 text-white' :
                    cell === 64 ? 'bg-purple-400 text-white' :
                    cell === 128 ? 'bg-pink-400 text-white' :
                    cell === 256 ? 'bg-indigo-400 text-white' :
                    'bg-gray-800 text-white'
                  }`}
                >
                  {cell || ''}
                </motion.div>
              ))
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => move2048('up')} 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              ↑
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => move2048('down')} 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              ↓
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => move2048('left')} 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              ←
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => move2048('right')} 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              →
            </motion.button>
          </div>
        </div>
      );
    }

    if (selectedGame.id === 'memory') {
      return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 shadow-lg">
          <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
            {memoryCards.map(card => (
              <motion.div
                key={card.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => flipCard(card.id)}
                className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl cursor-pointer transition-all duration-300 shadow-lg ${
                  card.isFlipped || card.isMatched
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white transform rotateY(0deg)'
                    : 'bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-600'
                }`}
              >
                {(card.isFlipped || card.isMatched) ? card.symbol : '?'}
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Matched: {memoryMatched.length / 2} / 8 pairs
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 shadow-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{selectedGame.name}</h3>
          <p className="text-gray-600">Coming Soon!</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:to-gray-950 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-2">
            <span>Fun Games</span>
            <span className="text-4xl">🎮</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Play these engaging games to distract yourself, have fun, and improve your mental well-being!
          </p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-8 max-w-2xl mx-auto"
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">⚠️</span>
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        >
          {gameCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={`bg-gradient-to-br ${category.bgColor} rounded-2xl p-8 border border-gray-200 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl`}
              onClick={() => setSelectedCategory(category)}
            >
              <div className="text-6xl mb-4">{category.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{category.name}</h3>
              <p className="text-gray-600 mb-4 text-lg">{category.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                  {category.games.length} games available
                </span>
                <span className="text-2xl">→</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Game List */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 mb-12"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {selectedCategory.emoji} {selectedCategory.name}
                  </h2>
                  <p className="text-gray-600 text-lg">{selectedCategory.description}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedCategory(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl p-2"
                >
                  ✕
                </motion.button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCategory.games.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{game.name}</h3>
                    <p className="text-gray-600 mb-4">{game.description}</p>
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                      <span className="bg-white px-2 py-1 rounded-full">⏱️ {game.duration}</span>
                      <span className="bg-white px-2 py-1 rounded-full">📊 {game.difficulty}</span>
                    </div>
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Benefits:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {game.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center">
                            <span className="text-green-500 mr-2">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startGame(game)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg"
                    >
                      Play Game
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Game */}
        <AnimatePresence>
          {isGameActive && selectedGame && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 mb-12"
            >
              {/* Instructions Modal */}
              <AnimatePresence>
                {showInstructions && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowInstructions(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">How to Play {selectedGame.name}</h3>
                      <ul className="space-y-3 mb-6">
                        {selectedGame.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 font-bold mr-3">{index + 1}.</span>
                            <span className="text-gray-700 dark:text-gray-200">{instruction}</span>
                          </li>
                        ))}
                      </ul>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowInstructions(false)}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-900 text-white py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 dark:hover:from-blue-800 dark:hover:to-purple-800 transition-all duration-300 font-semibold"
                      >
                        Got it!
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedGame.name}</h2>
                <p className="text-gray-600 mb-6 text-lg">{selectedGame.description}</p>
                <div className="flex justify-center gap-8 text-lg">
                  <div className="bg-gradient-to-r from-green-100 to-green-200 px-6 py-3 rounded-xl">
                    <span className="font-semibold text-green-800">Score: {gameScore}</span>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-3 rounded-xl">
                    <span className="font-semibold text-blue-800">Time: {formatTime(gameTime)}</span>
                  </div>
                </div>
              </div>
              
              {renderGame()}
              
              <div className="flex justify-center gap-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowInstructions(true)}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold shadow-lg"
                >
                  📖 Instructions
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={endGame}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-lg"
                >
                  End Game
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game History */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Recent Games</h2>
            {loading && (
              <div className="flex items-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                Loading...
              </div>
            )}
          </div>
          
          {gameHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameHistory.map((game, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">{game.gameName}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Score:</span>
                      <span className="font-semibold text-green-600">{game.score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-semibold text-blue-600">{formatTime(game.time)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-semibold">{formatDate(game.completedAt)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Failed to load game history</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadGameHistory}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold"
              >
                Try Again
              </motion.button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No games played yet</h3>
              <p className="text-gray-600">Start playing games to see your history here!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Games; 