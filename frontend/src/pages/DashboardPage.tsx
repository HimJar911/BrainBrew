import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Target, Eye, Zap, Gamepad2, Trophy, TrendingUp, Award, Calendar, Clock, Star, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GameCard from '@/components/UI/GameCard';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: string;
}

interface RecentGame {
  name: string;
  score: number;
  accuracy: number;
  time: string;
  difficulty: string;
  result: 'win' | 'loss' | 'complete';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  const stats: StatCard[] = [
    { 
      label: 'Games Played', 
      value: user?.gamesPlayed || 47, 
      icon: Gamepad2, 
      color: 'text-blue-400',
      trend: '+5 this week'
    },
    { 
      label: 'Total Score', 
      value: (user?.totalScore || 15420).toLocaleString(), 
      icon: Trophy, 
      color: 'text-yellow-400',
      trend: '+12% this month'
    },
    { 
      label: 'Accuracy', 
      value: `${user?.accuracy || 84.2}%`, 
      icon: Target, 
      color: 'text-green-400',
      trend: '+3% improvement'
    },
    { 
      label: 'Current Level', 
      value: user?.level || 12, 
      icon: Award, 
      color: 'text-purple-400',
      trend: '75% to next level'
    }
  ];

  const recentGames: RecentGame[] = [
    { name: 'Pattern Memory', score: 1240, accuracy: 87, time: '2 hours ago', difficulty: 'Hard', result: 'complete' },
    { name: 'Binary Search', score: 980, accuracy: 92, time: '1 day ago', difficulty: 'Normal', result: 'win' },
    { name: 'Stroop Task', score: 760, accuracy: 78, time: '2 days ago', difficulty: 'Medium', result: 'complete' },
    { name: 'Dual N-Back', score: 1100, accuracy: 85, time: '3 days ago', difficulty: 'Hard', result: 'complete' },
    { name: 'Chunking Challenge', score: 890, accuracy: 81, time: '4 days ago', difficulty: 'Normal', result: 'complete' }
  ];

  const todaysChallenges = [
    { name: 'Speed Demon', description: 'Complete 3 games in under 5 minutes each', progress: 1, max: 3, reward: '50 XP' },
    { name: 'Accuracy Master', description: 'Achieve 90%+ accuracy in any game', progress: 0, max: 1, reward: '100 XP' },
    { name: 'Streak Builder', description: 'Get 5 correct answers in a row', progress: 3, max: 5, reward: '25 XP' }
  ];

  const recentAchievements: Achievement[] = [
    { id: '1', name: 'First Steps', description: 'Complete your first game', icon: '🎯', unlocked: true },
    { id: '2', name: 'Streak Master', description: 'Achieve 10 correct answers in a row', icon: '🔥', unlocked: true },
    { id: '3', name: 'Speed Demon', description: 'Complete a pattern in under 2 seconds', icon: '⚡', unlocked: true },
    { id: '4', name: 'Perfectionist', description: 'Score 100% accuracy in 5 consecutive games', icon: '💎', unlocked: false, progress: 3, maxProgress: 5 },
  ];

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-green-400';
      case 'loss': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win': return '🏆';
      case 'loss': return '❌';
      default: return '✅';
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.username || 'Trainer'}! 🧠
              </h1>
              <p className="text-slate-400">Ready to challenge your mind today?</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">Current Streak</p>
                <p className="text-2xl font-bold text-orange-400">7 days</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Today's XP</p>
                <p className="text-2xl font-bold text-purple-400">250</p>
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Level {user?.level || 12} Progress</span>
              <span className="text-slate-400 text-sm">1,250 XP to Level {(user?.level || 12) + 1}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full w-3/4 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse opacity-50"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
              {stat.trend && (
                <p className="text-green-400 text-xs">↗ {stat.trend}</p>
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Play */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Games */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Quick Play</h2>
                <Link 
                  to="/games" 
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <GameCard
                  icon={Brain}
                  title="Pattern Memory"
                  description="Test your visual working memory"
                  difficulty="Adaptive"
                  category="Memory"
                  bestScore={8542}
                  accuracy={87}
                  to="/games/pattern"
                />
                <GameCard
                  icon={Target}
                  title="Binary Battle"
                  description="Strategic number guessing vs AI"
                  difficulty="Medium"
                  category="Logic"
                  bestScore={6230}
                  accuracy={92}
                  to="/games/binary"
                />
                <GameCard
                  icon={Eye}
                  title="Stroop Task"
                  description="Overcome cognitive interference"
                  difficulty="Dynamic"
                  category="Attention"
                  bestScore={4180}
                  accuracy={78}
                  to="/games"
                />
                <GameCard
                  icon={Zap}
                  title="Dual N-Back"
                  description="Ultimate working memory challenge"
                  difficulty="Intense"
                  category="Working Memory"
                  isLocked={(user?.level || 12) < 5}
                  unlockLevel={5}
                  bestScore={(user?.level || 12) >= 5 ? 5670 : 0}
                  accuracy={(user?.level || 12) >= 5 ? 85 : 0}
                  to="/games"
                />
              </div>
            </div>

            {/* Today's Challenges */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Today's Challenges</h2>
              <div className="space-y-4">
                {todaysChallenges.map((challenge, index) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-medium">{challenge.name}</h3>
                      <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                        {challenge.reward}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{challenge.description}</p>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(challenge.progress / challenge.max) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-400">
                        {challenge.progress}/{challenge.max}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Games</h2>
                <Link 
                  to="/analytics" 
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  View Analytics
                </Link>
              </div>
              <div className="space-y-3">
                {recentGames.slice(0, 5).map((game, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getResultIcon(game.result)}</span>
                      <div>
                        <p className="text-white font-medium text-sm">{game.name}</p>
                        <p className="text-slate-400 text-xs">{game.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${getResultColor(game.result)}`}>
                        {game.score.toLocaleString()}
                      </p>
                      <p className="text-slate-400 text-xs">{game.accuracy}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Achievements</h2>
                <Link 
                  to="/profile" 
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {recentAchievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-3 rounded-lg border transition-all ${
                      achievement.unlocked 
                        ? 'border-purple-500/50 bg-purple-500/10' 
                        : 'border-slate-600 bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{achievement.icon}</span>
                      <div className="flex-1">
                        <h3 className={`font-medium text-sm ${
                          achievement.unlocked ? 'text-white' : 'text-slate-400'
                        }`}>
                          {achievement.name}
                        </h3>
                        <p className="text-xs text-slate-500">{achievement.description}</p>
                      </div>
                      {achievement.unlocked && (
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      )}
                    </div>
                    {!achievement.unlocked && achievement.progress !== undefined && (
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-slate-600 rounded-full h-1.5">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full"
                            style={{ width: `${(achievement.progress! / achievement.maxProgress!) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">This Week</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300 text-sm">Games Played</span>
                  </div>
                  <span className="text-white font-bold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300 text-sm">Time Played</span>
                  </div>
                  <span className="text-white font-bold">2h 45m</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300 text-sm">Improvement</span>
                  </div>
                  <span className="text-green-400 font-bold">+8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300 text-sm">Best Score</span>
                  </div>
                  <span className="text-white font-bold">1,240</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-700">
                <Link 
                  to="/analytics"
                  className="w-full py-2 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 block"
                >
                  View Full Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-6 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">
            Keep up the momentum! 🚀
          </h3>
          <p className="text-slate-300 mb-4">
            You're on a 7-day streak! Play one more game today to maintain your progress.
          </p>
          <Link 
            to="/games"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
          >
            <Gamepad2 className="w-5 h-5" />
            <span>Continue Training</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;