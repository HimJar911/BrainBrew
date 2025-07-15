import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Home, Gamepad2, BarChart3, User, LogOut, Trophy, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface NavLink {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { playSound } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleLogout = (): void => {
    playSound('click');
    logout();
    setMobileMenuOpen(false);
  };

  const handleLinkClick = (): void => {
    playSound('click');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string): boolean => location.pathname === path;

  const navLinks: NavLink[] = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/games', label: 'Games', icon: Gamepad2 },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
            onClick={handleLinkClick}
          >
            <Brain className="w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              BrainBrew
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    isActive(path) 
                      ? 'bg-purple-600 text-white' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Stats (Desktop) */}
                <div className="hidden lg:flex items-center space-x-3 bg-slate-800/50 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-slate-300">
                      Lv.{user.level || 1}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-slate-600"></div>
                  <span className="text-sm font-medium text-purple-400">
                    {(user.totalScore || 0).toLocaleString()}
                  </span>
                </div>
                
                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <Link
                    to="/profile"
                    onClick={handleLinkClick}
                    className={`hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                      isActive('/profile')
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {user.username || 'User'}
                    </span>
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login"
                  onClick={handleLinkClick}
                  className="px-4 py-2 text-slate-300 hover:text-white transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  onClick={handleLinkClick}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {user && mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700/50">
            <div className="space-y-2">
              {/* User Info */}
              <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg mb-4">
                <User className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-white font-medium">{user.username || 'User'}</p>
                  <p className="text-sm text-slate-400">Level {user.level || 1}</p>
                </div>
              </div>

              {/* Navigation Links */}
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(path) 
                      ? 'bg-purple-600 text-white' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </Link>
              ))}

              <Link
                to="/profile"
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive('/profile') 
                    ? 'bg-purple-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;