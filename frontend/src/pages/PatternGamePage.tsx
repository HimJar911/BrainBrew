import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Trophy, Play, Home } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { gameAPI } from '@/utils/api';

type GameState = 'menu' | 'playing' | 'finished';

interface GameStats {
  round: number;
  score: number;
  streak: number;
  maxStreak: number;
  accuracy: number;
  totalRounds: number;
}

const PatternGamePage: React.FC = () => {
  const { playSound } = useTheme();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [gridSize, setGridSize] = useState(3);
  const [showSequence, setShowSequence] = useState(false);
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [timer, setTimer] = useState(0);
  const [gameId, setGameId] = useState<number | null>(null);
  
  const [gameStats, setGameStats] = useState<GameStats>({
    round: 1,
    score: 0,
    streak: 0,
    maxStreak: 0,
    accuracy: 0,
    totalRounds: 0
  });

  const startGame = async (): Promise<void> => {
    try {
      setGameState('playing');
      playSound('click');
      
      // Call backend API to start game
      const response = await gameAPI.startPatternGame({ gridSize: gridSize });
      const { game_id, sequence, round } = response.data;
      
      setGameId(game_id);
      setCurrentSequence(sequence);
      setGameStats(prev => ({ ...prev, round }));
      setUserSequence([]);
      setSelectedCells([]);
      setTimer(5);
      
      showPattern(sequence);
    } catch (error) {
      console.error('Failed to start game:', error);
      playSound('error');
    }
  };

  const showPattern = (sequence: number[]): void => {
    setShowSequence(true);
    let index = 0;
    
    const showNext = (): void => {
      if (index < sequence.length) {
        setSelectedCells([sequence[index]]);
        setTimeout(() => {
          setSelectedCells([]);
          index++;
          setTimeout(showNext, 200);
        }, 800);
      } else {
        setShowSequence(false);
        startTimer();
      }
    };
    
    setTimeout(showNext, 500);
  };

  const startTimer = (): void => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          submitSequence();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCellClick = (cellIndex: number): void => {
    if (showSequence || gameState !== 'playing') return;
    
    playSound('click');
    
    if (!userSequence.includes(cellIndex)) {
      const newSequence = [...userSequence, cellIndex];
      setUserSequence(newSequence);
      
      if (newSequence.length === currentSequence.length) {
        setTimeout(submitSequence, 300);
      }
    }
  };

  const submitSequence = async (): Promise<void> => {
    if (!gameId) return;

    try {
      const response = await gameAPI.submitPatternRound({
        game_id: gameId,
        sequence: userSequence,
        response_time: 5 - timer
      });

      const { correct, total_score, next_round, game_over } = response.data;
      
      if (correct) {
        playSound('success');
        setGameStats(prev => ({
          ...prev,
          score: total_score,
          streak: prev.streak + 1,
          maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
          totalRounds: prev.totalRounds + 1
        }));
      } else {
        playSound('error');
        setGameStats(prev => ({
          ...prev,
          streak: 0,
          totalRounds: prev.totalRounds + 1
        }));
      }

      // Update accuracy
      setGameStats(prev => ({
        ...prev,
        accuracy: Math.round(((prev.totalRounds - 1) * prev.accuracy + (correct ? 100 : 0)) / prev.totalRounds)
      }));

      if (game_over || !next_round) {
        setGameState('finished');
      } else {
        // Continue to next round
        setCurrentSequence(next_round.sequence);
        setGameStats(prev => ({ ...prev, round: next_round.round }));
        setUserSequence([]);
        setSelectedCells([]);
        setTimer(5);
        setTimeout(() => showPattern(next_round.sequence), 1500);
      }
    } catch (error) {
      console.error('Failed to submit round:', error);
      playSound('error');
    }
  };

  const resetGame = (): void => {
    setGameState('menu');
    setGameStats({
      round: 1,
      score: 0,
      streak: 0,
      maxStreak: 0,
      accuracy: 0,
      totalRounds: 0
    });
    setCurrentSequence([]);
    setUserSequence([]);
    setSelectedCells([]);
    setTimer(0);
    setGameId(null);
    playSound('click');
  };

  const renderGrid = (): JSX.Element[] => {
    const cells: JSX.Element[] = [];
    for (let i = 0; i < gridSize * gridSize; i++) {
      const isSelected = selectedCells.includes(i);
      const isUserSelected = userSequence.includes(i);
      
      cells.push(
        <button
          key={i}
          onClick={() => handleCellClick(i)}
          className={`
            aspect-square rounded-lg border-2 transition-all duration-300 transform
            ${isSelected 
              ? 'bg-purple-500 border-purple-400 scale-110 shadow-lg shadow-purple-500/50' 
              : isUserSelected
              ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/30'
              : 'bg-slate-700 border-slate-600 hover:border-slate-500 hover:bg-slate-600'
            }
            ${!showSequence && gameState === 'playing' ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
          `}
          disabled={showSequence || gameState !== 'playing'}
        />
      );
    }
    return cells;
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <Brain className="w-20 h-20 text-purple-400 mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl font-bold text-white mb-4">Pattern Memory Matrix</h1>
            <p className="text-slate-300 text-lg mb-8">
              Watch the pattern, then recreate it. Test your visual working memory!
            </p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
            <div className="text-left space-y-2 text-slate-300">
              <p>• Watch as cells light up in sequence</p>
              <p>• Click the cells in the same order</p>
              <p>• Complete as many rounds as possible</p>
              <p>• Grid size increases as you progress</p>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-white font-medium mb-4">Grid Size: {gridSize}x{gridSize}</label>
            <input
              type="range"
              min="3"
              max="6"
              value={gridSize}
              onChange={(e) => setGridSize(parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={startGame}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
            >
              <Play className="w-5 h-5" />
              <span>Start Game</span>
            </button>
            <button
              onClick={() => navigate('/games')}
              className="flex items-center justify-center space-x-2 px-8 py-4 border border-slate-600 text-slate-300 font-semibold rounded-xl hover:border-purple-500 hover:text-white transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              <span>Back to Games</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Game Complete!</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Final Score:</span>
                <span className="text-purple-400 font-bold text-xl">{gameStats.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Accuracy:</span>
                <span className="text-green-400 font-bold">{gameStats.accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Streak:</span>
                <span className="text-blue-400 font-bold">{gameStats.maxStreak}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rounds:</span>
                <span className="text-slate-300 font-bold">{gameStats.totalRounds}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={resetGame}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                Play Again
              </button>
              <button
                onClick={() => navigate('/games')}
                className="w-full py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:border-purple-500 hover:text-white transition-all duration-300"
              >
                Back to Games
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Game Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Pattern Memory Matrix</h1>
            <button
              onClick={() => navigate('/games')}
              className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:border-purple-500 hover:text-white transition-all"
            >
              Exit Game
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">Round</p>
              <p className="text-white font-bold text-xl">{gameStats.round}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">Score</p>
              <p className="text-purple-400 font-bold text-xl">{gameStats.score.toLocaleString()}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">Streak</p>
              <p className="text-green-400 font-bold text-xl">{gameStats.streak}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">Timer</p>
              <p className={`font-bold text-xl ${timer <= 2 ? 'text-red-400' : 'text-blue-400'}`}>
                {timer}s
              </p>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="flex flex-col items-center">
          <div className="mb-6">
            {showSequence ? (
              <p className="text-lg text-purple-400 font-medium">Watch the pattern...</p>
            ) : (
              <p className="text-lg text-white font-medium">
                Click the cells: {userSequence.length}/{currentSequence.length}
              </p>
            )}
          </div>
          
          <div 
            className="grid gap-2 p-6 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              width: 'fit-content'
            }}
          >
            {renderGrid()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternGamePage;