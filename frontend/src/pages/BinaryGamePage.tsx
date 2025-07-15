import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Trophy, Brain, User, Play, Home, Zap } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { gameAPI } from '@/utils/api';

type GameState = 'menu' | 'playing' | 'finished';
type Difficulty = 'easy' | 'normal' | 'hard';

interface GuessHistory {
  guess: number;
  feedback: 'too_low' | 'too_high' | 'correct';
  turn: number;
  guesser: 'user' | 'ai';
}

const BinaryGamePage: React.FC = () => {
  const { playSound } = useTheme();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<GameState>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [gameId, setGameId] = useState<number | null>(null);
  const [range, setRange] = useState({ min: 1, max: 100 });
  const [currentGuess, setCurrentGuess] = useState('');
  const [guessHistory, setGuessHistory] = useState<GuessHistory[]>([]);
  const [winner, setWinner] = useState<'user' | 'ai' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [round, setRound] = useState(1);

  const difficultySettings = {
    easy: { min: 1, max: 50, label: 'Easy (1-50)' },
    normal: { min: 1, max: 100, label: 'Normal (1-100)' },
    hard: { min: 1, max: 1000, label: 'Hard (1-1000)' }
  };

  const startGame = async (): Promise<void> => {
    try {
      setGameState('playing');
      playSound('click');
      
      const response = await gameAPI.startBinaryGame({ difficulty });
      const { game_id, range_min, range_max } = response.data;
      
      setGameId(game_id);
      setRange({ min: range_min, max: range_max });
      setGuessHistory([]);
      setWinner(null);
      setFeedback('');
      setRound(1);
      setCurrentGuess('');
    } catch (error) {
      console.error('Failed to start game:', error);
      playSound('error');
    }
  };

  const makeGuess = async (): Promise<void> => {
    if (!gameId || !currentGuess) return;

    const guess = parseInt(currentGuess);
    if (isNaN(guess) || guess < range.min || guess > range.max) {
      playSound('error');
      return;
    }

    try {
      const response = await gameAPI.makeBinaryGuess({
        game_id: gameId,
        guess
      });

      const { result, ai_guess, ai_result, winner: gameWinner, round: currentRound } = response.data;
      
      // Add user guess to history
      const newHistory = [...guessHistory, {
        guess,
        feedback: result,
        turn: round,
        guesser: 'user' as const
      }];

      if (result === 'correct') {
        setWinner('user');
        setGameState('finished');
        playSound('success');
      } else {
        playSound('click');
        setFeedback(result);

        // Add AI guess if game continues
        if (ai_guess !== undefined && ai_result) {
          newHistory.push({
            guess: ai_guess,
            feedback: ai_result,
            turn: round,
            guesser: 'ai' as const
          });

          if (ai_result === 'correct') {
            setWinner('ai');
            setGameState('finished');
            playSound('error');
          }
        }

        if (gameWinner) {
          setWinner(gameWinner);
          setGameState('finished');
        }

        if (currentRound) {
          setRound(currentRound);
        }
      }

      setGuessHistory(newHistory);
      setCurrentGuess('');
    } catch (error) {
      console.error('Failed to make guess:', error);
      playSound('error');
    }
  };

  const resetGame = (): void => {
    setGameState('menu');
    setGameId(null);
    setGuessHistory([]);
    setWinner(null);
    setFeedback('');
    setRound(1);
    setCurrentGuess('');
    playSound('click');
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      makeGuess();
    }
  };

  const getFeedbackIcon = (feedback: string): string => {
    switch (feedback) {
      case 'correct': return '🎯';
      case 'too_low': return '📈';
      case 'too_high': return '📉';
      default: return '❓';
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <Target className="w-20 h-20 text-purple-400 mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl font-bold text-white mb-4">Binary Search Battle</h1>
            <p className="text-slate-300 text-lg mb-8">
              Compete against an AI using optimal binary search strategy. Who can guess the number faster?
            </p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Select Difficulty</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(difficultySettings).map(([key, settings]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key as Difficulty)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    difficulty === key 
                      ? 'border-purple-500 bg-purple-500/20 text-white' 
                      : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="font-bold capitalize">{key}</div>
                  <div className="text-sm text-slate-400">{settings.label}</div>
                </button>
              ))}
            </div>
            
            <div className="text-left space-y-2 text-slate-300">
              <p>• You and AI take turns guessing</p>
              <p>• Use "too high" and "too low" feedback strategically</p>
              <p>• First to guess correctly wins</p>
              <p>• AI uses optimal binary search - can you beat it?</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={startGame}
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
            >
              <Play className="w-5 h-5" />
              <span>Start Battle</span>
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
    const userGuesses = guessHistory.filter(h => h.guesser === 'user').length;
    const aiGuesses = guessHistory.filter(h => h.guesser === 'ai').length;

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8">
            {winner === 'user' ? (
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
            ) : (
              <Brain className="w-16 h-16 text-red-400 mx-auto mb-6" />
            )}
            
            <h2 className="text-3xl font-bold text-white mb-4">
              {winner === 'user' ? 'Victory! 🎉' : 'AI Wins! 🤖'}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Your Guesses:</span>
                <span className="text-blue-400 font-bold">{userGuesses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Guesses:</span>
                <span className="text-red-400 font-bold">{aiGuesses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Efficiency:</span>
                <span className={`font-bold ${userGuesses <= aiGuesses ? 'text-green-400' : 'text-orange-400'}`}>
                  {userGuesses <= aiGuesses ? 'Excellent!' : 'Good!'}
                </span>
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
            <h1 className="text-2xl font-bold text-white">Binary Search Battle</h1>
            <button
              onClick={() => navigate('/games')}
              className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:border-purple-500 hover:text-white transition-all"
            >
              Exit Game
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">Range</p>
              <p className="text-white font-bold text-xl">{range.min} - {range.max}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">Round</p>
              <p className="text-purple-400 font-bold text-xl">{round}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">Difficulty</p>
              <p className="text-green-400 font-bold text-xl capitalize">{difficulty}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Player Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Your Turn
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enter your guess ({range.min} - {range.max})
                </label>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    value={currentGuess}
                    onChange={(e) => setCurrentGuess(e.target.value)}
                    onKeyPress={handleKeyPress}
                    min={range.min}
                    max={range.max}
                    className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Enter number..."
                  />
                  <button
                    onClick={makeGuess}
                    disabled={!currentGuess}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Guess
                  </button>
                </div>
              </div>
              
              {feedback && (
                <div className={`p-3 rounded-lg text-center font-medium ${
                  feedback === 'correct' ? 'bg-green-500/20 text-green-400' :
                  feedback === 'too_low' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {getFeedbackIcon(feedback)} {
                    feedback === 'correct' ? 'Correct!' :
                    feedback === 'too_low' ? 'Too Low!' :
                    'Too High!'
                  }
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-3">Your Guesses</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {guessHistory.filter(h => h.guesser === 'user').map((guess, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                    <span className="text-white font-medium">{guess.guess}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      guess.feedback === 'correct' ? 'bg-green-500/20 text-green-400' :
                      guess.feedback === 'too_low' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {getFeedbackIcon(guess.feedback)} {
                        guess.feedback === 'correct' ? 'Correct!' :
                        guess.feedback === 'too_low' ? 'Too Low' :
                        'Too High'
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI Opponent
            </h2>
            
            <div className="mb-6">
              <div className="p-4 bg-slate-700/30 rounded-lg text-center">
                <p className="text-slate-400 text-sm mb-2">AI Strategy</p>
                <p className="text-white font-medium">Optimal Binary Search</p>
                <p className="text-slate-400 text-xs mt-1">
                  Always chooses the middle value of remaining range
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-3">AI Guesses</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {guessHistory.filter(h => h.guesser === 'ai').map((guess, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                    <span className="text-white font-medium">{guess.guess}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      guess.feedback === 'correct' ? 'bg-green-500/20 text-green-400' :
                      guess.feedback === 'too_low' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {getFeedbackIcon(guess.feedback)} {
                        guess.feedback === 'correct' ? 'Correct!' :
                        guess.feedback === 'too_low' ? 'Too Low' :
                        'Too High'
                      }
                    </span>
                  </div>
                ))}
              </div>
              
              {guessHistory.filter(h => h.guesser === 'ai').length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>AI is waiting for your first move...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Strategy Tips */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Strategy Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <p className="font-medium text-white mb-2">Binary Search Strategy:</p>
              <ul className="space-y-1">
                <li>• Always guess the middle number</li>
                <li>• Eliminate half the possibilities each turn</li>
                <li>• Update your range after each guess</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-white mb-2">Beat the AI:</p>
              <ul className="space-y-1">
                <li>• Use the same optimal strategy</li>
                <li>• Stay calm under pressure</li>
                <li>• Calculate quickly and accurately</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryGamePage;