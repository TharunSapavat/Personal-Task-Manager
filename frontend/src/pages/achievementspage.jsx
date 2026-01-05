import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { achievementAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { 
  Trophy, Lock, Star, Filter, Search, X, Sparkles, 
  Medal, Award, TrendingUp, Zap, ArrowLeft, Flame, 
  CheckCircle2, SlidersHorizontal, Target
} from 'lucide-react';
import { toast } from 'react-toastify';

const AchievementsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [profileStats, setProfileStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const categories = {
    all: { name: 'All', color: 'cyan', icon: Trophy },
    streak: { name: 'Streak', color: 'orange', icon: Flame },
    tasks: { name: 'Tasks', color: 'green', icon: CheckCircle2 },
    timing: { name: 'Timing', color: 'blue', icon: Zap },
    priority: { name: 'Priority', color: 'red', icon: Target },
    weekly: { name: 'Weekly', color: 'purple', icon: Medal },
    special: { name: 'Special', color: 'yellow', icon: Sparkles }
  };

  const profileLevelIcons = {
    bronze: { emoji: '🥉', color: 'text-amber-700' },
    silver: { emoji: '🥈', color: 'text-slate-400' },
    gold: { emoji: '🥇', color: 'text-yellow-500' },
    diamond: { emoji: '💎', color: 'text-cyan-400' }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchAchievements();
    fetchProfileStats();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await achievementAPI.getAllAchievements();
      setAchievements(response.data.achievements || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileStats = async () => {
    try {
      const response = await achievementAPI.getProfileStats();
      setProfileStats(response.data);
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    }
  };

  const getRarityConfig = (rarity) => {
    const configs = {
      common: { 
        bg: 'bg-gray-100',
        border: 'border-gray-300',
        badge: 'bg-gray-500 text-white',
        text: 'text-gray-800'
      },
      rare: { 
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        badge: 'bg-blue-500 text-white',
        text: 'text-blue-900'
      },
      epic: { 
        bg: 'bg-purple-50',
        border: 'border-purple-300',
        badge: 'bg-purple-500 text-white',
        text: 'text-purple-900'
      },
      legendary: { 
        bg: 'bg-amber-50',
        border: 'border-amber-400',
        badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
        text: 'text-amber-900'
      }
    };
    return configs[rarity] || configs.common;
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = selectedCategory === 'all' || achievement.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    const matchesSearch = !searchQuery || 
      achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesRarity && matchesSearch;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const completionPercentage = achievements.length > 0 
    ? Math.round((unlockedCount / achievements.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading achievements...</div>
      </div>
    );
  }

  const levelInfo = profileStats?.profileLevel ? profileLevelIcons[profileStats.profileLevel] : null;
  const progressToNext = profileStats?.profileLevelData?.maxPoints !== Infinity && profileStats?.achievementPoints 
    ? Math.min(((profileStats.achievementPoints / profileStats.profileLevelData.maxPoints) * 100), 100)
    : 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Trophy className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Achievements</h1>
            </div>
          </div>
          <p className="text-sm text-gray-600 ml-14">Unlock rewards as you progress</p>
        </div>

        {/* Stats Overview */}
        {profileStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {/* Level Card */}
            <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 bg-gray-100 rounded-lg ${levelInfo?.color || 'text-gray-500'}`}>
                  <Medal className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Rank</p>
                  <p className={`text-sm font-bold ${levelInfo?.color || 'text-gray-600'}`}>
                    {profileStats.profileLevel.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{Math.round(progressToNext)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {profileStats.profileLevelData?.maxPoints === Infinity 
                    ? 'Max Level!' 
                    : `${profileStats.profileLevelData?.maxPoints - profileStats.achievementPoints} XP to next`}
                </p>
              </div>
            </div>

            {/* Total Points */}
            <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Star className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Total XP</p>
                  <p className="text-gray-800 text-sm font-bold">{profileStats.achievementPoints.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">Active</span>
              </div>
            </div>

            {/* Completion */}
            <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Unlocked</p>
                  <p className="text-gray-800 text-sm font-bold">{unlockedCount} / {achievements.length}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">{completionPercentage}% Complete</p>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-orange-100 rounded-lg">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Current Streak</p>
                  <p className="text-gray-800 text-sm font-bold">{profileStats.currentStreak} Days</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-3 h-3 text-orange-500" />
                <span className="text-xs text-gray-600">Record: {profileStats.longestStreak} days</span>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg outline-none transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg flex items-center gap-2 justify-center transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filter Pills */}
          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              <div>
                <p className="text-gray-700 text-sm mb-2 font-medium">Category</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(categories).map(([key, data]) => {
                    const CategoryIcon = data.icon;
                    const isSelected = selectedCategory === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`cursor-pointer transition-all px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <CategoryIcon className="w-3.5 h-3.5" />
                        {data.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-gray-700 text-sm mb-2 font-medium">Rarity</p>
                <div className="flex flex-wrap gap-2">
                  {['all', 'common', 'rare', 'epic', 'legendary'].map((rarity) => {
                    const isSelected = selectedRarity === rarity;
                    return (
                      <button
                        key={rarity}
                        onClick={() => setSelectedRarity(rarity)}
                        className={`cursor-pointer transition-all px-3 py-1.5 rounded-lg text-sm capitalize ${
                          isSelected
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {rarity}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Achievement Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => {
            const config = getRarityConfig(achievement.rarity);
            
            return (
              <div
                key={achievement.id}
                className={`relative group rounded-lg p-4 border transition-all duration-300 ${
                  achievement.unlocked
                    ? `${config.bg} ${config.border} shadow-sm hover:shadow-md cursor-pointer`
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                {/* Rarity Badge */}
                <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-bold ${achievement.unlocked ? config.badge : 'bg-gray-300 text-gray-600'}`}>
                  {achievement.rarity.toUpperCase()}
                </div>

                {/* Icon */}
                <div className={`mb-3 p-2.5 rounded-lg inline-flex text-5xl ${
                  achievement.unlocked 
                    ? 'bg-white/50' 
                    : 'bg-gray-100 grayscale opacity-50'
                }`}>
                  {achievement.icon}
                </div>

                {/* Lock Overlay */}
                {!achievement.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[1px] rounded-lg">
                    <div className="text-center">
                      <Lock className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-xs font-medium">Locked</p>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className={achievement.unlocked ? '' : 'opacity-30'}>
                  <h3 className={`mb-1.5 text-base font-bold ${achievement.unlocked ? config.text : 'text-gray-800'}`}>{achievement.name}</h3>
                  <p className={`text-xs mb-3 ${achievement.unlocked ? 'text-gray-700' : 'text-gray-600'}`}>{achievement.description}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-1">
                      <Star className={`w-3.5 h-3.5 ${achievement.unlocked ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                      <span className={`text-xs font-semibold ${achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'}`}>
                        {achievement.points} XP
                      </span>
                    </div>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-600 text-lg mb-2">No achievements found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPage;
