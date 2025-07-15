import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, Target, Brain, Gamepad2, Trophy, ChevronDown, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceData {
  game: string;
  sessions: number;
  avgScore: number;
  accuracy: number;
  improvement: number;
  category: string;
}

interface WeeklyProgress {
  week: string;
  score: number;
  accuracy: number;
  gamesPlayed: number;
}

interface CognitiveProfile {
  area: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedGame, setSelectedGame] = useState<string>('all');

  const performanceData: PerformanceData[] = [
    { game: 'Pattern Memory', sessions: 12, avgScore: 8542, accuracy: 87, improvement: 12, category: 'Memory' },
    { game: 'Binary Search', sessions: 8, avgScore: 6230, accuracy: 92, improvement: 8, category: 'Logic' },
    { game: 'Stroop Task', sessions: 15, avgScore: 4180, accuracy: 78, improvement: -3, category: 'Attention' },
    { game: 'Dual N-Back', sessions: 5, avgScore: 5670, accuracy: 85, improvement: 15, category: 'Working Memory' },
    { game: 'Chunking Challenge', sessions: 10, avgScore: 3920, accuracy: 81, improvement: 5, category: 'Memory' }
  ];

  const weeklyProgress: WeeklyProgress[] = [
    { week: 'Week 1', score: 1200, accuracy: 75, gamesPlayed: 8 },
    { week: 'Week 2', score: 1800, accuracy: 79, gamesPlayed: 12 },
    { week: 'Week 3', score: 2400, accuracy: 82, gamesPlayed: 15 },
    { week: 'Week 4', score: 3100, accuracy: 87, gamesPlayed: 18 }
  ];

  const cognitiveProfile: CognitiveProfile[] = [
    { area: 'Working Memory', score: 85, trend: 'up', description: 'Strong ability to hold and manipulate information' },
    { area: 'Processing Speed', score: 78, trend: 'up', description: 'Good reaction time and quick thinking' },
    { area: 'Attention Control', score: 72, trend: 'stable', description: 'Moderate focus and concentration abilities' },
    { area: 'Pattern Recognition', score: 91, trend: 'up', description: 'Excellent at identifying visual patterns' },
    { area: 'Logical Reasoning', score: 88, trend: 'up', description: 'Strong analytical and problem-solving skills' }
  ];

  const overviewStats = [
    { 
      label: 'Total Sessions', 
      value: user?.gamesPlayed || 50, 
      icon: Gamepad2, 
      color: 'text-blue-400',
      change: '+5',
      period: 'this week'
    },
    { 
      label: 'Average Score', 
      value: Math.round((user?.totalScore || 25000) / (user?.gamesPlayed || 50)), 
      icon: Trophy, 
      color: 'text-yellow-400',
      change: '+12%',
      period: 'this month'
    },
    { 
      label: 'Overall Accuracy', 
      value: `${user?.accuracy || 84.2}%`, 
      icon: Target, 
      color: 'text-green-400',
      change: '+3%',
      period: 'improvement'
    },
    { 
      label: 'Cognitive Score', 
      value: 847, 
      icon: Brain, 
      color: 'text-purple-400',
      change: '+23',
      period: 'this month'
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Performance Analytics</h1>
              <p className="text-slate-400">Track your cognitive training progress and improvements</p>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                className="bg-slate-800/50 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewStats.map((stat, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 text-xs font-medium">{stat.change}</span>
                <span className="text-slate-500 text-xs">{stat.period}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Analytics */}
          <div className="lg:col-span-2 space-y-8">
            {/* Game Performance */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Game Performance</h2>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600 text-white text-sm rounded-lg px-3 py-1 focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Games</option>
                    {performanceData.map((game) => (
                      <option key={game.game} value={game.game}>{game.game}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              
              <div className="space-y-4">
                {performanceData
                  .filter(game => selectedGame === 'all' || game.game === selectedGame)
                  .map((game, index) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-white font-medium">{game.game}</h3>
                        <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                          {game.category}
                        </span>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded ${
                        game.improvement > 0 ? 'bg-green-500/20 text-green-400' : 
                        game.improvement < 0 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {game.improvement > 0 ? '+' : ''}{game.improvement}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Sessions</p>
                        <p className="text-white font-medium">{game.sessions}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Avg Score</p>
                        <p className="text-purple-400 font-medium">{game.avgScore.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Accuracy</p>
                        <p className="text-green-400 font-medium">{game.accuracy}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Progress Over Time</h2>
              <div className="space-y-6">
                {weeklyProgress.map((week, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{week.week}</span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-purple-400 font-bold">{week.score}</span>
                        <span className="text-green-400">{week.accuracy}%</span>
                        <span className="text-blue-400">{week.gamesPlayed} games</span>
                      </div>
                    </div>
                    
                    {/* Score Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Score Progress</span>
                        <span className="text-slate-400">{week.score}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(week.score / 3500) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Accuracy Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Accuracy</span>
                        <span className="text-slate-400">{week.accuracy}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${week.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-6">
            {/* Cognitive Profile */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">🧠 Cognitive Profile</h2>
              <div className="space-y-4">
                {cognitiveProfile.map((area, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium text-sm">{area.area}</span>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(area.trend)}
                        <span className={`font-bold ${getScoreColor(area.score)}`}>
                          {area.score}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          area.score >= 85 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          area.score >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          'bg-gradient-to-r from-red-500 to-pink-500'
                        }`}
                        style={{ width: `${area.score}%` }}
                      ></div>
                    </div>
                    <p className="text-slate-400 text-xs">{area.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights & Recommendations */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">💡 AI Insights</h2>
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-medium text-sm">Strength Identified</span>
                  </div>
                  <p className="text-slate-300 text-sm">
                    Your pattern recognition skills have improved by 23% this month. Consider tackling more complex visual puzzles.
                  </p>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-medium text-sm">Focus Area</span>
                  </div>
                  <p className="text-slate-300 text-sm">
                    Attention control could benefit from more Stroop task practice. Try 10-minute daily sessions.
                  </p>
                </div>

                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 font-medium text-sm">Optimal Timing</span>
                  </div>
                  <p className="text-slate-300 text-sm">
                    Your peak performance window is 2-4 PM. Schedule challenging games during this time.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                  Export Data
                </button>
                <button className="w-full py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:border-purple-500 hover:text-white transition-all duration-300">
                  Share Progress
                </button>
                <button className="w-full py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:border-purple-500 hover:text-white transition-all duration-300">
                  Set Goals
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-xl p-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-2xl font-bold text-purple-400 mb-2">Top 15%</h3>
              <p className="text-slate-300">Global Ranking</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-400 mb-2">847</h3>
              <p className="text-slate-300">Cognitive Score</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">+12%</h3>
              <p className="text-slate-300">This Month's Growth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;