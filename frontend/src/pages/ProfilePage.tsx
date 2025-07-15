import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Volume2, Shield, Trophy, Star, Award, Calendar, Target, Gamepad2, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ProfileData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  birthDate: string;
}

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { soundEnabled, setSoundEnabled, notifications, setNotifications, playSound } = useTheme();
  
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'settings'>('profile');
  const [profileData, setProfileData] = useState<ProfileData>({
    username: user?.username || '',
    email: user?.email || '',
    firstName: '',
    lastName: '',
    bio: 'Cognitive training enthusiast focused on improving mental performance through consistent practice.',
    location: 'San Francisco, CA',
    birthDate: '1990-01-01'
  });

  const achievements: Achievement[] = [
    { 
      id: '1', 
      name: 'First Steps', 
      description: 'Complete your first game', 
      icon: '🎯', 
      unlocked: true, 
      unlockedAt: '2024-01-15',
      rarity: 'common'
    },
    { 
      id: '2', 
      name: 'Streak Master', 
      description: 'Achieve 10 correct answers in a row', 
      icon: '🔥', 
      unlocked: true, 
      unlockedAt: '2024-01-20',
      rarity: 'rare'
    },
    { 
      id: '3', 
      name: 'Speed Demon', 
      description: 'Complete a pattern in under 2 seconds', 
      icon: '⚡', 
      unlocked: true, 
      unlockedAt: '2024-02-01',
      rarity: 'epic'
    },
    { 
      id: '4', 
      name: 'Perfectionist', 
      description: 'Score 100% accuracy in 5 consecutive games', 
      icon: '💎', 
      unlocked: false, 
      progress: 3, 
      maxProgress: 5,
      rarity: 'legendary'
    },
    { 
      id: '5', 
      name: 'Brain Elite', 
      description: 'Reach level 20', 
      icon: '👑', 
      unlocked: false, 
      progress: 12, 
      maxProgress: 20,
      rarity: 'legendary'
    },
    { 
      id: '6', 
      name: 'AI Crusher', 
      description: 'Beat AI in Binary Search 10 times', 
      icon: '🤖', 
      unlocked: true, 
      unlockedAt: '2024-02-10',
      rarity: 'epic'
    },
    { 
      id: '7', 
      name: 'Memory Master', 
      description: 'Complete 100 pattern memory games', 
      icon: '🧠', 
      unlocked: false, 
      progress: 67, 
      maxProgress: 100,
      rarity: 'rare'
    },
    { 
      id: '8', 
      name: 'Daily Grind', 
      description: 'Play for 30 consecutive days', 
      icon: '📅', 
      unlocked: false, 
      progress: 7, 
      maxProgress: 30,
      rarity: 'epic'
    }
  ];

  const handleSave = (): void => {
    setEditMode(false);
    playSound('success');
    // Here you would typically save to the backend
  };

  const handleCancel = (): void => {
    setEditMode(false);
    // Reset form data
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
      firstName: '',
      lastName: '',
      bio: 'Cognitive training enthusiast focused on improving mental performance through consistent practice.',
      location: 'San Francisco, CA',
      birthDate: '1990-01-01'
    });
    playSound('click');
  };

  const getRarityColor = (rarity: Achievement['rarity']): string => {
    switch (rarity) {
      case 'common': return 'border-slate-500 bg-slate-500/10';
      case 'rare': return 'border-blue-500 bg-blue-500/10';
      case 'epic': return 'border-purple-500 bg-purple-500/10';
      case 'legendary': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-slate-500 bg-slate-500/10';
    }
  };

  const getRarityBadgeColor = (rarity: Achievement['rarity']): string => {
    switch (rarity) {
      case 'common': return 'text-slate-400 bg-slate-500/20';
      case 'rare': return 'text-blue-400 bg-blue-500/20';
      case 'epic': return 'text-purple-400 bg-purple-500/20';
      case 'legendary': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{user?.username || 'User'}</h1>
                <p className="text-slate-400">Level {user?.level || 12} • {(user?.totalScore || 15420).toLocaleString()} XP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Member since</p>
              <p className="text-white font-medium">January 2024</p>
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

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-slate-800/30 rounded-xl p-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'achievements', label: 'Achievements', icon: Trophy },
            { id: 'settings', label: 'Settings', icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                playSound('click');
              }}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Profile Information</h2>
                  {!editMode ? (
                    <button
                      onClick={() => {
                        setEditMode(true);
                        playSound('click');
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                        disabled={!editMode}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-60"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!editMode}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      disabled={!editMode}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-60"
                      placeholder="Enter first name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      disabled={!editMode}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-60"
                      placeholder="Enter last name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      disabled={!editMode}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-60 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      disabled={!editMode}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-60"
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Birth Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        value={profileData.birthDate}
                        onChange={(e) => setProfileData({...profileData, birthDate: e.target.value})}
                        disabled={!editMode}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Profile Stats</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current Level</span>
                    <span className="text-purple-400 font-bold text-xl">{user?.level || 12}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total XP</span>
                    <span className="text-white font-bold">{(user?.totalScore || 15420).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Games Played</span>
                    <span className="text-white font-bold">{user?.gamesPlayed || 47}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Avg Accuracy</span>
                    <span className="text-green-400 font-bold">{user?.accuracy || 84.2}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Achievements</span>
                    <span className="text-yellow-400 font-bold">{unlockedAchievements.length}/{achievements.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link 
                    to="/games"
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Play Games</span>
                  </Link>
                  <Link 
                    to="/analytics"
                    className="w-full py-3 border border-slate-600 text-slate-300 font-semibold rounded-lg hover:border-purple-500 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Target className="w-4 h-4" />
                    <span>View Analytics</span>
                  </Link>
                  <button 
                    onClick={logout}
                    className="w-full py-3 border border-red-600 text-red-400 font-semibold rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Achievements</h2>
              <p className="text-slate-400">
                {unlockedAchievements.length} of {achievements.length} achievements unlocked
              </p>
              <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Unlocked Achievements */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>Unlocked ({unlockedAchievements.length})</span>
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${getRarityColor(achievement.rarity)}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRarityBadgeColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      </div>
                    </div>
                    <h4 className="font-bold text-white mb-1">{achievement.name}</h4>
                    <p className="text-sm text-slate-300 mb-2">{achievement.description}</p>
                    {achievement.unlockedAt && (
                      <p className="text-xs text-slate-500">
                        Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Locked Achievements */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Award className="w-5 h-5 text-slate-400" />
                <span>In Progress ({lockedAchievements.length})</span>
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className="p-4 rounded-xl border-2 border-slate-600 bg-slate-700/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl grayscale">{achievement.icon}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRarityBadgeColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-400 mb-1">{achievement.name}</h4>
                    <p className="text-sm text-slate-500 mb-3">{achievement.description}</p>
                    {achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-slate-400">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="space-y-6">
              {/* Audio Settings */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <Volume2 className="w-5 h-5" />
                  <span>Audio & Notifications</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Sound Effects</label>
                      <p className="text-sm text-slate-400">Play sounds for button clicks and game events</p>
                    </div>
                    <button
                      onClick={() => {
                        setSoundEnabled(!soundEnabled);
                        playSound('click');
                      }}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        soundEnabled ? 'bg-purple-600' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                        soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Push Notifications</label>
                      <p className="text-sm text-slate-400">Receive notifications about achievements and streaks</p>
                    </div>
                    <button
                      onClick={() => {
                        setNotifications(!notifications);
                        playSound('click');
                      }}
                      className={`relative w-12 h-6 rounded-full transition-all ${
                        notifications ? 'bg-purple-600' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Privacy & Security</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Profile Visibility</label>
                      <p className="text-sm text-slate-400">Make your profile visible to other users</p>
                    </div>
                    <select className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-1 text-sm">
                      <option>Public</option>
                      <option>Friends Only</option>
                      <option>Private</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Data Analytics</label>
                      <p className="text-sm text-slate-400">Share anonymous usage data to improve the platform</p>
                    </div>
                    <button className="relative w-12 h-6 bg-purple-600 rounded-full">
                      <div className="absolute w-5 h-5 bg-white rounded-full top-0.5 translate-x-6 transition-transform"></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Account Actions</h3>
                <div className="space-y-3">
                  <button className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all">
                    Change Password
                  </button>
                  <button className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all">
                    Export Data
                  </button>
                  <button className="w-full py-3 bg-red-600/20 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white font-medium rounded-lg transition-all">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;