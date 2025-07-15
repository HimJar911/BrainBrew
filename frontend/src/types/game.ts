export type GameType = 'pattern' | 'binary' | 'stroop' | 'dual' | 'chunk';

export type GameStatus = 'menu' | 'playing' | 'paused' | 'finished';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'adaptive';

export interface GameState {
  status: GameStatus;
  round: number;
  score: number;
  startTime?: Date;
  endTime?: Date;
  [key: string]: any; // For game-specific data
}

export interface GameStats {
  totalGames: number;
  totalScore: number;
  averageAccuracy: number;
  bestStreak: number;
  gamesPlayed: number;
  averageScore: number;
  bestScore: number;
  totalTime: number;
}

export interface GameRecord {
  id: number;
  type: GameType;
  startTime: Date;
  endTime?: Date;
  duration: number;
  finalStats: {
    score: number;
    accuracy: number;
    streak?: number;
    rounds?: number;
  };
}

// Pattern Memory Game Types
export interface PatternGameConfig {
  gridSize: number;
}

export interface PatternSubmission {
  game_id: number;
  sequence: number[];
  response_time: number;
}

export interface PatternRoundResult {
  correct: boolean;
  score_gained: number;
  total_score: number;
  next_round?: {
    sequence: number[];
    round: number;
  };
  round_log: PatternRoundLog;
  game_over?: boolean;
  winner?: string;
  revived?: boolean;
}

export interface PatternRoundLog {
  round: number;
  correct: boolean;
  mistake_type: string;
  grid_size: number;
  sequence_length: number;
  response_time: number;
  score_this_round: number;
  correct_streak_at_time: number;
  max_streak_so_far: number;
  projected_final_score: number;
}

// Binary Search Game Types
export interface BinaryGameConfig {
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface BinaryStartResponse {
  game_id: number;
  range_min: number;
  range_max: number;
  first_turn: 'user';
}

export interface BinaryGuessRequest {
  game_id: number;
  guess: number;
}

export interface BinaryGuessResponse {
  result: 'too_low' | 'too_high' | 'correct';
  ai_guess?: number;
  ai_result?: 'too_low' | 'too_high' | 'correct';
  winner?: 'user' | 'ai';
  round?: number;
}

// Stroop Game Types
export interface StroopGameConfig {
  rounds: number;
}

export interface StroopSubmission {
  game_id: number;
  response_color: string;
  response_time: number;
}

// Dual N-Back Game Types
export interface DualNBackConfig {
  n: number;
}

export interface DualNBackSubmission {
  game_id: number;
  letter_match: boolean;
  position_match: boolean;
  response_time: number;
}

// Chunk Game Types
export interface ChunkGameConfig {
  length: number;
  max_chunk_size: number;
}

export interface ChunkSubmission {
  game_id: number;
  chunks: number[][];
  response_time: number;
}

export interface GameContextType {
  currentGame: GameRecord | null;
  gameState: GameState;
  gameHistory: GameRecord[];
  gameStats: GameStats;
  startGame: (gameType: GameType, gameData?: any) => void;
  updateGameState: (updates: Partial<GameState>) => void;
  endGame: (finalStats: any) => void;
  getGameStats: (gameType: GameType) => GameStats;
}