import React, { useState } from 'react';
import { Brain, Target, Eye, Zap, Gamepad2, Filter, Search, Star, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GameCard from '@/components/UI/GameCard';

interface GameData {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  unlocked: boolean;
  unlockLevel?: number;
  bestScore: number;
  accuracy: number;
  averageTime?: number;
  totalPlayed?: number;
  to?: string;
  tags: string[];
}

type CategoryFilter = 'all' | 'memory' | 'logic' | 'attention' | 'working-memory' | 'processing';
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard' | 'adaptive';

const GamesPage: React.FC = () => {
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [sortBy, setSortBy] = useState<'name' | 'difficulty' | 'score' | 'recent'>('name');

  const games: GameData[] = [
    {
      id: 'pattern',
      icon: Brain,
      title: "Pattern Memory Matrix",
      description: "Memorize and reproduce increasingly complex visual patterns. Enhances visual working memory and spatial reasoning.",
      difficulty: "Adaptive",
      category: "memory",
      unlocked: true,
      bestScore: 8542,
      accuracy: 87,
      averageTime: 45,
      totalPlayed: 23,
      to: '/games/pattern',
      tags: ['visual', 'sequence', 'spatial', 'working-memory']
    },
    {
      id: 'binary',
      icon: Target,
      title: "Binary Search Battle",
      description: "Compete against AI in strategic number guessing using binary search algorithms. Improves logical reasoning.",
      difficulty: "Strategic",
      category: "logic",
      unlocked: true,
      bestScore: 6230,
      accuracy: 92,
      averageTime: 120,
      totalPlayed: 18,
      to: '/games/binary',
      tags: ['strategy', 'algorithms', 'competition', 'logical-thinking']
    },
    {
      id: 'stroop',
      icon: Eye,
      title: "Stroop Interference",
      description: "Name colors while ignoring word meanings. Strengthens cognitive control and attention management.",
      difficulty: "Dynamic",
      category: "attention",
      unlocked: true,
      bestScore: 4180,
      accuracy: 78,
      averageTime: 30,
      totalPlayed: 31,
      tags: ['attention', 'interference', 'cognitive-control', 'reaction-time']
    },
    {
      id: 'dual-nback',
      icon: Zap,
      title: "Dual N-Back",
      description: "Track both visual and auditory sequences simultaneously. The ultimate working memory workout.",
      difficulty: "Intense",
      category: "working-memory",
      unlocked: (user?.level || 12) >= 5,
      unlockLevel: 5,
      bestScore: (user?.level || 12) >= 5 ? 5670 : 0,
      accuracy: (user?.level || 12) >= 5 ? 85 : 0,
      averageTime: 180,
      totalPlayed: (user?.level || 12) >= 5 ? 12 : 0,
      tags: ['working-memory', 'dual-task', 'auditory', 'visual', 'n-back']
    },
    {
      id: 'chunk',
      icon: Gamepad2,
      title: "Chunking Challenge",
      description: "Memorize number sequences by grouping them efficiently. Develops memory compression strategies.",
      difficulty: "Progressive",
      category: "memory",
      unlocked: (user?.level || 12) >= 3,
      unlockLevel: 3,
      bestScore: (user?.level || 12) >= 3 ? 3920 : 0,
      accuracy: (user?.level || 12) >= 3 ? 81 : 0,
      averageTime: 60,
      totalPlayed: (user?.level || 12) >= 3 ? 15 : 0,
      tags: ['chunking', 'memory', 'sequences', 'strategy']
    }
  ];

  const categories = [
    { id: 'all', label: 'All Games', count: games.length },
    { id: 'memory', label: 'Memory', count: games.filter(g => g.category === 'memory').length },
    { id: 'logic', label: 'Logic', count: games.filter(g => g.category === 'logic').length },
    { id: 'attention', label: 'Attention', count: games.filter(g => g.category === 'attention').length },
    { id: 'working-memory', label: 'Working Memory', count: games.filter(g => g.category === 'working-memory').length }
  ];

  const filteredGames = games
    .filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || game.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'all' || 
                               game.difficulty.toLowerCase().includes(difficultyFilter);
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3, 'adaptive': 4, 'strategic': 4, 'dynamic': 4, 'progressive': 4, 'intense': 5 };
          return (difficultyOrder[a.difficulty.toLowerCase() as keyof typeof difficultyOrder] || 0) - 
                 (difficultyOrder[b.difficulty.toLowerCase() as keyof typeof difficultyOrder] || 0);
        case 'score':
          return b.bestScore - a.bestScore;
        case 'recent':
          return (b.totalPlayed || 0) - (a.totalPlayed || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Brain Training Games</h1>
          <p className="text-slate-400">Choose your cognitive challenge and start improving your mental performance</p>
        </div>

        {/* Filters & Search */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search games, skills, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-sm">Category:</span>
              <div className="flex items-center space-x-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      categoryFilter === cat.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat.label} ({cat.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-slate-700/50 border border-slate-600 text-white text-sm rounded-lg px-3 py-1 focus:outline-none focus:border-purple-500"
              >
                <option value="name">Name</option>
                <option value="difficulty">Difficulty</option>
                <option value="score">Best Score</option>
                <option value="recent">Most Played</option>
              </select>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredGames.map((game) => (
            <div key={game.id} className="group">
              <GameCard
                icon={game.icon}
                title={game.title}
                description={game.description}
                difficulty={game.difficulty}
                category={game.category}
                isLocked={!game.unlocked}
                unlockLevel={game.unlockLevel}
                bestScore={game.bestScore}
                accuracy={game.accuracy}
                to={game.to}
                className="h-full"
              />
              
              {/* Additional Stats */}
              {game.unlocked && (
                <div className="mt-4 grid grid-cols-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-slate-800/30 rounded-lg p-2 text-center">
                    <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">Avg Time</p>
                    <p className="text-xs text-white font-medium">{game.averageTime}s</p>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-2 text-center">
                    <Gamepad2 className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">Played</p>
                    <p className="text-xs text-white font-medium">{game.totalPlayed}</p>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg p-2 text-center">
                    <Star className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-400">Rating</p>
                    <p className="text-xs text-white font-medium">4.8★</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400 mb-2">No games found</h3>
            <p className="text-slate-500 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setDifficultyFilter('all');
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Stats Summary */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Your Gaming Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">
                {games.filter(g => g.unlocked).length}
              </div>
              <div className="text-slate-400 text-sm">Games Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {games.reduce((sum, g) => sum + (g.totalPlayed || 0), 0)}
              </div>
              <div className="text-slate-400 text-sm">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">
                {Math.round(games.reduce((sum, g) => sum + g.accuracy, 0) / games.length)}%
              </div>
              <div className="text-slate-400 text-sm">Avg Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                {Math.max(...games.map(g => g.bestScore)).toLocaleString()}
              </div>
              <div className="text-slate-400 text-sm">Best Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesPage;