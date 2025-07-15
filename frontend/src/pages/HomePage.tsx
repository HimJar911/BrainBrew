import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, TrendingUp, Trophy, ChevronRight, Play, Target, Users, Star } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
}

const HomePage: React.FC = () => {
  const { playSound } = useTheme();

  const handleButtonClick = (): void => {
    playSound('click');
  };

  const features: Feature[] = [
    {
      icon: Brain,
      title: "5 Brain Games",
      description: "Scientifically designed cognitive challenges"
    },
    {
      icon: TrendingUp,
      title: "AI Analytics",
      description: "Advanced progress tracking and insights"
    },
    {
      icon: Trophy,
      title: "Competitive",
      description: "Challenge yourself and others"
    },
    {
      icon: Target,
      title: "Adaptive",
      description: "Difficulty scales with your performance"
    }
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Dr. Sarah Chen",
      role: "Neuroscientist",
      text: "BrainBrew's games are based on solid cognitive science research.",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Professional Gamer",
      text: "Improved my reaction time and decision-making significantly.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Student",
      text: "Perfect for study breaks - fun and mentally stimulating!",
      rating: 5
    }
  ];

  const gameShowcase = [
    {
      name: "Pattern Memory",
      description: "Visual sequence memorization",
      gradient: "from-purple-500 to-blue-500"
    },
    {
      name: "Binary Battle",
      description: "Strategic AI competition",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Stroop Task",
      description: "Cognitive interference",
      gradient: "from-green-500 to-blue-500"
    },
    {
      name: "Dual N-Back",
      description: "Working memory challenge",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent animate-shimmer">
                BrainBrew
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Unleash your cognitive potential with scientifically-designed brain training games
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-slate-700/50">
                  <feature.icon className="w-5 h-5 text-purple-400" />
                  <span className="text-slate-300 font-medium">{feature.title}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              to="/register"
              onClick={handleButtonClick}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Start Training</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link 
              to="/login"
              onClick={handleButtonClick}
              className="px-8 py-4 border border-slate-600 text-slate-300 font-semibold rounded-xl hover:border-purple-500 hover:text-white transition-all duration-300"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">10K+</div>
              <div className="text-slate-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">50M+</div>
              <div className="text-slate-400">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">87%</div>
              <div className="text-slate-400">Improvement Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">4.9★</div>
              <div className="text-slate-400">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Games Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Train Every Aspect of Your Mind
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              From memory enhancement to attention training, our scientifically-backed games target specific cognitive functions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameShowcase.map((game, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br opacity-20 rounded-xl blur group-hover:opacity-30 transition-opacity" 
                     style={{background: `linear-gradient(135deg, var(--tw-gradient-stops))`}}></div>
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${game.gradient} mb-4 flex items-center justify-center`}>
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                  <p className="text-slate-400">{game.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-800/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose BrainBrew?
            </h2>
            <p className="text-xl text-slate-300">
              Advanced technology meets cognitive science
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl p-6 mb-6 group-hover:scale-105 transition-transform duration-300">
                  <feature.icon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-300">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-slate-300">
              See what our users are saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-slate-400 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Unlock Your Potential?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of users who are already improving their cognitive abilities
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register"
              onClick={handleButtonClick}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Join Free Today</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link 
              to="/login"
              onClick={handleButtonClick}
              className="px-8 py-4 border border-slate-600 text-slate-300 font-semibold rounded-xl hover:border-purple-500 hover:text-white transition-all duration-300"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;