import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, AuthResult } from '@/types/auth';
import { api } from '@/utils/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    validateToken();
  }, [token]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        username: email, // Backend expects username field
        password
      });
      
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      // Get user data
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);
      
      return { success: true };
    } catch (error: any) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      await api.post('/auth/register', {
        username,
        email,
        password
      });
      
      // Auto login after successful registration
      return await login(email, password);
    } catch (error: any) {
      console.error('Registration failed:', error);
      setLoading(false);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};