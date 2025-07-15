import React from 'react';
import { Brain } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Initializing cognitive training..." 
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Brain Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 border-4 border-purple-500/30 rounded-full"></div>
          <div className="absolute inset-0 w-32 h-32 border-4 border-purple-400 rounded-full border-t-transparent animate-spin"></div>
          <Brain className="absolute inset-0 m-auto w-12 h-12 text-purple-400 animate-pulse" />
        </div>
        
        {/* Brand */}
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4 animate-pulse">
          BrainBrew
        </h1>
        
        {/* Loading Message */}
        <p className="text-slate-400 text-lg mb-6">{message}</p>
        
        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          <div 
            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" 
            style={{ animationDelay: '0ms' }}
          ></div>
          <div 
            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" 
            style={{ animationDelay: '150ms' }}
          ></div>
          <div 
            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" 
            style={{ animationDelay: '300ms' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;