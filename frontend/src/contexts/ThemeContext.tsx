import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type SoundType = 'click' | 'success' | 'error' | 'notification';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  animations: boolean;
  setAnimations: (enabled: boolean) => void;
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
  playSound: (soundType: SoundType) => void;
  showNotification: (title: string, body: string, options?: NotificationOptions) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('brainbrew-theme') || 'dark';
  });
  
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('brainbrew-sound') !== 'false';
  });
  
  const [animations, setAnimations] = useState<boolean>(() => {
    return localStorage.getItem('brainbrew-animations') !== 'false';
  });

  const [notifications, setNotifications] = useState<boolean>(() => {
    return localStorage.getItem('brainbrew-notifications') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('brainbrew-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('brainbrew-sound', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('brainbrew-animations', animations.toString());
    if (!animations) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }
  }, [animations]);

  useEffect(() => {
    localStorage.setItem('brainbrew-notifications', notifications.toString());
  }, [notifications]);

  const playSound = (soundType: SoundType): void => {
    if (!soundEnabled) return;
    
    try {
      // Create simple audio feedback using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different sounds for different actions
      const sounds: Record<SoundType, { frequency: number; duration: number }> = {
        click: { frequency: 800, duration: 0.1 },
        success: { frequency: 1000, duration: 0.2 },
        error: { frequency: 300, duration: 0.3 },
        notification: { frequency: 600, duration: 0.15 }
      };
      
      const sound = sounds[soundType] || sounds.click;
      
      oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  const showNotification = (title: string, body: string, options: NotificationOptions = {}): void => {
    if (!notifications) return;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options
          });
        }
      });
    }
  };

  const toggleTheme = (): void => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    soundEnabled,
    setSoundEnabled,
    animations,
    setAnimations,
    notifications,
    setNotifications,
    playSound,
    showNotification
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};