import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Lock, Star } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface GameCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  difficulty: string;
  category?: string;
  isLocked?: boolean;
  unlockLevel?: number;
  bestScore?: number;
  accuracy?: number;
  to?: string;
  onClick?: () => void;
  className?: string;
}

const GameCard: React.FC<GameCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  difficulty, 
  category,
  isLocked = false, 
  unlockLevel = 0,
  bestScore = 0,
  accuracy = 0,
  to,
  onClick,
  className = ""
}) => {
  const { playSound, animations } = useTheme();

  const handleClick = (): void => {
    if (!isLocked) {
      playSound('click');
      if (onClick) onClick();
    }
  };

  const cardContent = (
    <div 
      className={`
        relative group cursor-pointer transition-all duration-300 h-full
        ${isLocked ? 'opacity-60' : animations ? 'hover:scale-105' : 'hover:scale-101'}
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Hover Effect Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Card Content */}
      <div className={`
        relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 h-full
        ${!isLocked && 'group-hover:border-purple-500/50'} 
        transition-all duration-300
      `}>
        {/* Lock Indicator */}
        {isLocked && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-2 bg-slate-700/80 rounded-lg px-3 py-1">
              <Lock className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">Lv.{unlockLevel}</span>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-4">
          <div className={`
            p-3 rounded-lg 
            ${isLocked ? 'bg-slate-700/50' : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20'}
          `}>
            <Icon className={`w-8 h-8 ${isLocked ? 'text-slate-500' : 'text-purple-400'}`} />
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${isLocked ? 'text-slate-500' : 'text-white'}`}>
              {title}
            </h3>
            <div className="flex items-center space-x-2">
              {category && (
                <span className={`text-sm px-2 py-1 rounded ${
                  isLocked 
                    ? 'bg-slate-700 text-slate-500' 
                    : 'bg-purple-600/20 text-purple-400'
                }`}>
                  {category}
                </span>
              )}
              <span className="text-sm text-slate-400">{difficulty}</span>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <p className={`text-sm mb-6 ${isLocked ? 'text-slate-500' : 'text-slate-300'}`}>
          {description}
        </p>
        
        {/* Stats & Action */}
        {!isLocked ? (
          <div className="space-y-3">
            {bestScore > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Best Score</span>
                <span className="text-lg font-bold text-purple-400">
                  {bestScore.toLocaleString()}
                </span>
              </div>
            )}
            
            {accuracy > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Accuracy</span>
                <span className="text-sm font-medium text-green-400">{accuracy}%</span>
              </div>
            )}
            
            {accuracy > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-slate-400">{accuracy}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${accuracy}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-slate-400">
                  {bestScore > 0 ? `Best: ${bestScore.toLocaleString()}` : 'Not played'}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <Lock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                Unlock at Level {unlockLevel}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // If it's a link and not locked, wrap in Link component
  if (to && !isLocked) {
    return (
      <Link to={to} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default GameCard;