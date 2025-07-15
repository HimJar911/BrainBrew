export interface User {
  id: number;
  username: string;
  email: string;
  level?: number;
  totalScore?: number;
  gamesPlayed?: number;
  accuracy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  username: string; // Backend expects username field for email
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (username: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}