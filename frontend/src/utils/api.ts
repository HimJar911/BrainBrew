import axios, { AxiosResponse, AxiosError } from 'axios';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User 
} from '@/types/auth';
import {
  PatternGameConfig,
  PatternSubmission,
  BinaryGameConfig,
  BinaryGuessRequest,
  StroopGameConfig,
  StroopSubmission,
  DualNBackConfig,
  DualNBackSubmission,
  ChunkGameConfig,
  ChunkSubmission
} from '@/types/game';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: (credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse>> => 
    api.post('/auth/login', credentials),
  
  register: (userData: RegisterData): Promise<AxiosResponse<User>> => 
    api.post('/auth/register', userData),
  
  getProfile: (): Promise<AxiosResponse<User>> => 
    api.get('/auth/me'),
  
  logout: (): Promise<AxiosResponse<void>> => 
    api.post('/auth/logout')
};

// Game API functions
export const gameAPI = {
  // Pattern Memory Game
  startPatternGame: (config: PatternGameConfig) => 
    api.post('/pattern/start', config),
  
  submitPatternRound: (data: PatternSubmission) => 
    api.post('/pattern/submit', data),
  
  getPatternStats: (gameId: number) => 
    api.get(`/pattern/stats?game_id=${gameId}`),
  
  getPatternFeedback: (gameId: number) => 
    api.get(`/pattern/feedback?game_id=${gameId}`),
  
  getPatternProgress: (gameId: number) => 
    api.get(`/pattern/progress?game_id=${gameId}`),
  
  // Binary Search Game
  startBinaryGame: (config: BinaryGameConfig) => 
    api.post('/binary/start', config),
  
  makeBinaryGuess: (data: BinaryGuessRequest) => 
    api.post('/binary/guess', data),
  
  getBinaryStats: (gameId: number) => 
    api.get(`/binary/stats?game_id=${gameId}`),
  
  getBinaryFeedback: (gameId: number) => 
    api.get(`/binary/feedback?game_id=${gameId}`),
  
  getBinaryBrainProfile: () => 
    api.get('/binary/brain_profile'),
  
  // Stroop Game
  startStroopGame: (config: StroopGameConfig) => 
    api.post('/stroop/start', config),
  
  submitStroopResponse: (data: StroopSubmission) => 
    api.post('/stroop/submit', data),
  
  getStroopStats: (gameId: number) => 
    api.get(`/stroop/stats?game_id=${gameId}`),
  
  getStroopFeedback: (gameId: number) => 
    api.get(`/stroop/feedback?game_id=${gameId}`),
  
  getStroopBrainProfile: () => 
    api.get('/stroop/brain_profile'),
  
  // Dual N-Back Game
  startDualNBack: (config: DualNBackConfig) => 
    api.post('/dual/start', config),
  
  submitDualNBack: (data: DualNBackSubmission) => 
    api.post('/dual/submit', data),
  
  getDualStats: (gameId: number) => 
    api.get(`/dual/stats?game_id=${gameId}`),
  
  getDualFeedback: (gameId: number) => 
    api.get(`/dual/feedback?game_id=${gameId}`),
  
  getDualBrainProfile: () => 
    api.get('/dual/brain_profile'),
  
  // Chunking Game
  startChunkGame: (config: ChunkGameConfig) => 
    api.post('/chunk/start', config),
  
  submitChunkResponse: (data: ChunkSubmission) => 
    api.post('/chunk/submit', data),
  
  getChunkStats: (gameId: number) => 
    api.get(`/chunk/stats?game_id=${gameId}`),
  
  getChunkFeedback: (gameId: number) => 
    api.get(`/chunk/feedback?game_id=${gameId}`),
  
  getChunkBrainProfile: () => 
    api.get('/chunk/brain_profile')
};

// Analytics API functions
export const analyticsAPI = {
  getGameProgress: (gameType: string, limit: number = 10) => 
    api.get(`/progress/${gameType}?limit=${limit}`),
  
  getPatternAnalysis: (gameId: number) => 
    api.get(`/pattern/analysis?game_id=${gameId}`),
  
  getPatternBrainProfile: () => 
    api.get('/pattern/brain_profile')
};

// Error handling interfaces
export interface APIError {
  message: string;
  status: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  status: number;
}

// Helper functions for error handling
export const handleAPIError = (error: AxiosError): APIError => {
  if (error.response) {
    // Server responded with error status
    return {
      message: (error.response.data as any)?.detail || 'An error occurred',
      status: error.response.status
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      status: 0
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: -1
    };
  }
};

// Utility function to format API responses
export const formatResponse = <T>(response: AxiosResponse<T>): APIResponse<T> => {
  return {
    success: true,
    data: response.data,
    status: response.status
  };
};

export default api;