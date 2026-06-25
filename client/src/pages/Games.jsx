import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Brain,
  Check,
  Clock,
  Gamepad2,
  Info,
  Loader,
  RotateCcw,
  Trophy,
  X
} from 'lucide-react';

const Games = () => {
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

  const [game2048Board, setGame2048Board] = useState(Array(4).fill().map(() => Array(4).fill(0)));
  const [game2048Score, setGame2048Score] = useState(0);
  const [memoryCards, setMemoryCards] = useState([]);
  const [memoryFlipped, setMemoryFlipped] = useState([]);
  const [memoryMatched, setMemoryMatched] = useState([]);
  const [memoryCanFlip, setMemoryCanFlip] = useState(true);

  useEffect(() => {
    loadGameHistory();
  }, []);

  const loadGameHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/games/recent');
      const data = response.data && Array.isArray(response.data.data) ? response.data.data : [];
      setGameHistory(data);
    } catch (error) {
      console.error('Error loading game history:', error);
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
              while (k > 0 && (row[k - 1] === 0 || (row[k - 1] === row[k] && !merged[k - 1]))) {
                if (row[k - 1] === 0) {
                  row[k - 1] = row[k];
                  row[k] = 0;
                  k--;
                  moved = true;
                } else if (row[k - 1] === row[k] && !merged[k - 1]) {
                  row[k - 1] *= 2;
                  score += row[k - 1];
                  row[k] = 0;
                  merged[k - 1] = true;
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
              while (k < 3 && (row[k + 1] === 0 || (row[k + 1] === row[k] && !merged[k + 1]))) {
                if (row[k + 1] === 0) {
                  row[k + 1] = row[k];
                  row[k] = 0;
                  k++;
                  moved = true;
                } else if (row[k + 1] === row[k] && !merged[k + 1]) {
                  row[k + 1] *= 2;
                  score += row[k + 1];
                  row[k] = 0;
                  merged[k + 1] = true;
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
              while (k > 0 && (col[k - 1] === 0 || (col[k - 1] === col[k] && !merged[k - 1]))) {
                if (col[k - 1] === 0) {
                  col[k - 1] = col[k];
                  col[k] = 0;
                  k--;
                  moved = true;
                } else if (col[k - 1] === col[k] && !merged[k - 1]) {
                  col[k - 1] *= 2;
                  score += col[k - 1];
                  col[k] = 0;
                  merged[k - 1] = true;
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
              while (k < 3 && (col[k + 1] === 0 || (col[k + 1] === col[k] && !merged[k + 1]))) {
                if (col[k + 1] === 0) {
                  col[k + 1] = col[k];
                  col[k] = 0;
                  k++;
                  moved = true;
                } else if (col[k + 1] === col[k] && !merged[k + 1]) {
                  col[k + 1] *= 2;
                  score += col[k + 1];
                  col[k] = 0;
                  merged[k + 1] = true;
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
      setGameScore(prev => prev + score);
    }
  };

  const initializeMemory = () => {
    const symbols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
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

        if (memoryMatched.length + 2 === 16) {
          setTimeout(() => {
            endGame();
          }, 500);
        }
      } else {
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

  const gameCategories = [
    {
      id: 'puzzle',
      name: 'Puzzle Games',
      icon: Brain,
      description: 'Brain-teasing puzzle games to challenge your mind',
      games: [
        {
          id: '2048',
          name: '2048',
          description: 'Slide tiles to combine them and reach 2048.',
          duration: '5-15 min',
          difficulty: 'Medium',
          benefits: ['Improves strategic thinking', 'Enhances focus', 'Reduces stress'],
          instructions: [
            'Use the arrow buttons to move tiles in any direction.',
            'When two tiles with the same number touch, they merge into one.',
            'Try to reach the 2048 tile.',
            'You can continue playing beyond 2048 for higher scores.'
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
            'Click on cards to flip them and reveal their symbols.',
            'Find two cards with matching symbols to make a pair.',
            'Try to remember where each symbol is located.',
            'Complete all pairs to win.'
          ]
        }
      ]
    },
    {
      id: 'arcade',
      name: 'Arcade Games',
      icon: Gamepad2,
      description: 'Fast-paced games for a quick reset',
      games: [
        {
          id: 'bubble-pop',
          name: 'Bubble Pop',
          description: 'Pop groups of matching bubbles',
          duration: '3-8 min',
          difficulty: 'Easy',
          benefits: ['Quick stress relief', 'Improves reflexes', 'Fun distraction'],
          instructions: [
            'Click on groups of two or more matching bubbles.',
            'Connected bubbles of the same color pop together.',
            'Larger groups give you more points.',
            'Clear as many bubbles as you can.'
          ]
        },
        {
          id: 'snake',
          name: 'Snake',
          description: 'Eat food, grow longer, avoid hitting yourself',
          duration: '2-10 min',
          difficulty: 'Easy',
          benefits: ['Improves reflexes', 'Classic arcade fun'],
          instructions: [
            'Use arrow keys to move the snake.',
            'Eat food to grow longer.',
            'Avoid running into yourself or the walls.'
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
    if (!selectedGame) return;
    const finalScore = selectedGame.id === '2048' ? game2048Score : gameScore;
    const gameData = {
      gameName: selectedGame.name,
      score: finalScore,
      time: gameTime,
      category: 'cognitive',
      difficulty: selectedGame.difficulty || 'Medium'
    };

    try {
      await axios.post('/games/save', gameData);
      await loadGameHistory();
      setSuccessMessage('Game result saved successfully.');
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

  const renderTileClass = (cell) => {
    if (cell === 0) return 'bg-gray-800 text-gray-800';
    if (cell < 32) return 'bg-gray-700 text-white';
    if (cell < 256) return 'bg-indigo-600/20 text-indigo-400 border border-indigo-500';
    return 'bg-indigo-600 text-white';
  };

  const renderGame = () => {
    if (!selectedGame) return null;

    if (selectedGame.id === '2048') {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="grid grid-cols-4 gap-3 mb-6 max-w-xs mx-auto">
            {game2048Board.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold transition-colors ${renderTileClass(cell)}`}
                >
                  {cell || ''}
                </div>
              ))
            )}
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { direction: 'up', icon: ArrowUp, label: 'Up' },
              { direction: 'down', icon: ArrowDown, label: 'Down' },
              { direction: 'left', icon: ArrowLeft, label: 'Left' },
              { direction: 'right', icon: ArrowRight, label: 'Right' }
            ].map(({ direction, icon: Icon, label }) => (
              <button
                key={direction}
                onClick={() => move2048(direction)}
                className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                aria-label={label}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (selectedGame.id === 'memory') {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
            {memoryCards.map(card => (
              <button
                key={card.id}
                onClick={() => flipCard(card.id)}
                className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold transition-colors ${
                  card.isFlipped || card.isMatched
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-900 hover:bg-gray-700 text-gray-500 border border-gray-700'
                }`}
              >
                {(card.isFlipped || card.isMatched) ? card.symbol : '?'}
              </button>
            ))}
          </div>
          <div className="text-center mt-6">
            <p className="text-gray-300">
              Matched: {memoryMatched.length / 2} / 8 pairs
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
        <div className="text-center">
          <Gamepad2 size={48} className="mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-white mb-2">{selectedGame.name}</h3>
          <p className="text-gray-300">Coming soon.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Gamepad2 size={30} className="text-indigo-500" />
            Fun Games
          </h1>
          <p className="text-gray-300 max-w-2xl">
            Play focused games to reset your attention and support your mental well-being.
          </p>
        </div>

        {error && <p className="text-xs text-gray-600 text-center mt-6">{error}</p>}
        {successMessage && <p className="text-xs text-gray-600 text-center mt-6">{successMessage}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {gameCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left hover:bg-gray-800 transition-colors"
                onClick={() => setSelectedCategory(category)}
              >
                <Icon size={32} className="text-indigo-500 mb-4" />
                <h2 className="text-xl font-semibold text-white mb-3">{category.name}</h2>
                <p className="text-gray-300 mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.games.length} games available
                  </span>
                  <ArrowRight size={20} className="text-indigo-500" />
                </div>
              </button>
            );
          })}
        </div>

        {selectedCategory && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  {selectedCategory.name}
                </h2>
                <p className="text-gray-300">{selectedCategory.description}</p>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-gray-500 hover:text-gray-300 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
                aria-label="Close category"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCategory.games.map((game) => (
                <div
                  key={game.id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-6"
                >
                  <h3 className="text-xl font-semibold text-white mb-3">{game.name}</h3>
                  <p className="text-gray-300 mb-4">{game.description}</p>
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-lg">
                      <Clock size={14} />
                      {game.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-gray-900 px-2 py-1 rounded-lg">
                      <Trophy size={14} />
                      {game.difficulty}
                    </span>
                  </div>
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Benefits</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {game.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check size={14} className="text-indigo-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => startGame(game)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg transition-colors font-semibold"
                  >
                    Play Game
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isGameActive && selectedGame && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-12">
            {showInstructions && (
              <div
                className="fixed inset-0 bg-gray-950/80 flex items-center justify-center z-50 p-4"
                onClick={() => setShowInstructions(false)}
              >
                <div
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-semibold text-white mb-4">How to Play {selectedGame.name}</h3>
                  <ul className="space-y-3 mb-6">
                    {selectedGame.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-indigo-400 font-bold">{index + 1}.</span>
                        <span className="text-gray-300">{instruction}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg transition-colors font-semibold"
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-white mb-2">{selectedGame.name}</h2>
              <p className="text-gray-300 mb-6">{selectedGame.description}</p>
              <div className="flex justify-center gap-4 text-sm">
                <div className="bg-gray-800 border border-gray-700 px-6 py-3 rounded-lg">
                  <span className="font-semibold text-white">Score: {selectedGame.id === '2048' ? game2048Score : gameScore}</span>
                </div>
                <div className="bg-gray-800 border border-gray-700 px-6 py-3 rounded-lg">
                  <span className="font-semibold text-white">Time: {formatTime(gameTime)}</span>
                </div>
              </div>
            </div>

            {renderGame()}

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setShowInstructions(true)}
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                <Info size={18} />
                Instructions
              </button>
              <button
                onClick={endGame}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                End Game
              </button>
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-white">Recent Games</h2>
            {loading && (
              <div className="flex items-center text-gray-500">
                <Loader size={18} className="animate-spin text-indigo-500 mr-2" />
                Loading...
              </div>
            )}
          </div>

          {gameHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gameHistory.map((game, index) => (
                <div
                  key={index}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-6"
                >
                  <h3 className="font-semibold text-white mb-3 text-lg">{game.gameName}</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Score:</span>
                      <span className="font-semibold text-indigo-400">{game.score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-semibold text-indigo-400">{formatTime(game.time)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-semibold text-gray-300">{formatDate(game.completedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <RotateCcw size={48} className="mx-auto mb-4 text-gray-700" />
              <h3 className="text-xl font-semibold text-white mb-2">Failed to load game history</h3>
              <p className="text-gray-300 mb-4">{error}</p>
              <button
                onClick={loadGameHistory}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                <RotateCcw size={18} />
                Try Again
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Gamepad2 size={48} className="mx-auto mb-4 text-gray-700" />
              <h3 className="text-xl font-semibold text-white mb-2">No games played yet</h3>
              <p className="text-gray-300">Start playing games to see your history here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Games;
