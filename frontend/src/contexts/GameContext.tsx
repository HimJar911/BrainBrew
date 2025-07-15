import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameType, GameState, GameStats, GameRecord, GameContextType } from '@/types/game';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [currentGame, setCurrentGame] = useState<GameRecord | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    status: 'menu',
    round: 0,
    score: 0
  });
  const [gameHistory, setGameHistory] = useState<GameRecord[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGames: 0,
    totalScore: 0,
    averageAccuracy: 0,
    bestStreak: 0,
    gamesPlayed: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0
  });

  const startGame = (gameType: GameType, gameData?: any): void => {
    const newGame: GameRecord = {
      id: Date.now(),
      type: gameType,
      startTime: new Date(),
      duration: 0,
      finalStats: {
        score: 0,
        accuracy: 0,
        streak: 0,
        rounds: 0
      },
      ...gameData
    };

    setCurrentGame(newGame);
    setGameState({
      status: 'playing',
      round: 1,
      score: 0,
      startTime: new Date(),
      ...gameData
    });
  };

  const updateGameState = (updates: Partial<GameState>): void => {
    setGameState(prev => ({
      ...prev,
      ...updates
    }));
  };

  const endGame = (finalStats: any): void => {
    if (currentGame) {
      const endTime = new Date();
      const gameRecord: GameRecord = {
        ...currentGame,
        endTime,
        finalStats,
        duration: endTime.getTime() - new Date(currentGame.startTime).getTime()
      };
      
      setGameHistory(prev => [gameRecord, ...prev].slice(0, 50)); // Keep last 50 games
      setGameStats(prev => ({
        totalGames: prev.totalGames + 1,
        totalScore: prev.totalScore + (finalStats.score || 0),
        averageAccuracy: calculateNewAverage(prev.averageAccuracy, prev.totalGames, finalStats.accuracy || 0),
        bestStreak: Math.max(prev.bestStreak, finalStats.streak || 0),
        gamesPlayed: prev.gamesPlayed + 1,
        averageScore: calculateNewAverage(prev.averageScore, prev.totalGames, finalStats.score || 0),
        bestScore: Math.max(prev.bestScore, finalStats.score || 0),
        totalTime: prev.totalTime + (gameRecord.duration / 1000) // Convert to seconds
      }));
      
      setCurrentGame(null);
      setGameState({
        status: 'finished',
        round: 0,
        score: finalStats.score || 0
      });
    }
  };

  const calculateNewAverage = (currentAvg: number, count: number, newValue: number): number => {
    return ((currentAvg * count) + newValue) / (count + 1);
  };

  const getGameStats = (gameType: GameType): GameStats => {
    const gameTypeHistory = gameHistory.filter(game => game.type === gameType);
    
    if (gameTypeHistory.length === 0) {
      return {
        gamesPlayed: 0,
        averageScore: 0,
        averageAccuracy: 0,
        bestScore: 0,
        totalTime: 0,
        totalGames: 0,
        totalScore: 0,
        bestStreak: 0
      };
    }

    const totalScore = gameTypeHistory.reduce((sum, game) => sum + (game.finalStats?.score || 0), 0);
    const totalAccuracy = gameTypeHistory.reduce((sum, game) => sum + (game.finalStats?.accuracy || 0), 0);
    const totalTime = gameTypeHistory.reduce((sum, game) => sum + (game.duration || 0), 0);
    const bestScore = Math.max(...gameTypeHistory.map(game => game.finalStats?.score || 0));
    const bestStreak = Math.max(...gameTypeHistory.map(game => game.finalStats?.streak || 0));

    return {
      gamesPlayed: gameTypeHistory.length,
      averageScore: Math.round(totalScore / gameTypeHistory.length),
      averageAccuracy: Math.round(totalAccuracy / gameTypeHistory.length),
      bestScore,
      totalTime: Math.round(totalTime / 1000), // Convert to seconds
      totalGames: gameTypeHistory.length,
      totalScore,
      bestStreak
    };
  };

  const value: GameContextType = {
    currentGame,
    gameState,
    gameHistory,
    gameStats,
    startGame,
    updateGameState,
    endGame,
    getGameStats
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};