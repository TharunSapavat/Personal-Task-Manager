import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Flame, Trophy, TrendingUp, Plus, Sparkles, X } from 'lucide-react';
import { taskAPI, streakAPI, quoteAPI, achievementAPI } from '../services/api';
import Navbar from '../components/Navbar';
import AchievementUnlockModal from '../components/AchievementUnlockModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    currentStreak: 0,
    totalPoints: 0,
    weeklyCompleted: 0,
    longestStreak: 0
  });
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState(null);
  const [achievementQueue, setAchievementQueue] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchDashboardData();
    fetchDailyQuote();
    checkUnlockedAchievements();
  }, [navigate]);

  const fetchDailyQuote = useCallback(async () => {
    try {
      const response = await quoteAPI.getDailyQuote();
      if (response.data.success && response.data.showQuote) {
        setQuote(response.data.quote);
        setShowQuoteModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch daily quote:', err);
    }
  }, []);

  const checkUnlockedAchievements = useCallback(async () => {
    try {
      const response = await achievementAPI.getUnnotified();
      if (response.data.unnotified && response.data.unnotified.length > 0) {
        setAchievementQueue(response.data.unnotified);
        setUnlockedAchievement(response.data.unnotified[0]);
      }
    } catch (err) {
      console.error('Failed to check achievements:', err);
    }
  }, []);

  const closeAchievementModal = useCallback(async () => {
    if (!unlockedAchievement) return;

    try {
      // Mark as notified
      await achievementAPI.markNotified([unlockedAchievement.id]);
      
      // Show next achievement in queue
      const remainingQueue = achievementQueue.slice(1);
      setAchievementQueue(remainingQueue);
      
      if (remainingQueue.length > 0) {
        setTimeout(() => {
          setUnlockedAchievement(remainingQueue[0]);
        }, 500);
      } else {
        setUnlockedAchievement(null);
      }
    } catch (err) {
      console.error('Failed to mark achievement as notified:', err);
      setUnlockedAchievement(null);
    }
  }, [unlockedAchievement, achievementQueue]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Parallel fetch for better performance
      const [tasksResponse, statsResponse, streakResponse] = await Promise.all([
        taskAPI.getTodayTasks(),
        taskAPI.getTaskStats(),
        streakAPI.getStreakStats()
      ]);

      if (tasksResponse.data.success) {
        setTasks(tasksResponse.data.tasks);
      }

      if (statsResponse.data.success && streakResponse.data.success) {
        const taskStats = statsResponse.data.stats;
        const streakStats = streakResponse.data.stats;
        
        console.log('Task Stats:', taskStats);
        console.log('Streak Stats:', streakStats);
        
        setStats({
          tasksCompleted: taskStats.completedTasks || 0,
          currentStreak: streakStats.currentStreak || 0,
          totalPoints: streakStats.totalPoints || 0,
          weeklyCompleted: streakStats.tasksThisWeek || 0,
          longestStreak: streakStats.longestStreak || 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const toggleTask = useCallback(async (taskId) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;
      
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await taskAPI.updateTask(taskId, { status: newStatus });
      await fetchDashboardData(); // Refresh data
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  }, [tasks, fetchDashboardData]);

  // Memoize priority colors
  const priorityColors = useMemo(() => ({
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  }), []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Welcome back! Here's your progress today.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg mb-2 sm:mb-0">
                      <CheckCircle2 className="text-blue-500" size={20} />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-gray-800">{stats.tasksCompleted}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700">Tasks Completed</h3>
                  <p className="text-xs text-blue-500 mt-1 hidden sm:block">Total completed</p>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-orange-100 rounded-lg mb-2 sm:mb-0">
                      <Flame className="text-orange-500" size={20} />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-gray-800">{stats.currentStreak}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700">Day Streak</h3>
                  <p className="text-xs text-orange-500 mt-1 hidden sm:block">Keep it going!</p>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-purple-100 rounded-lg mb-2 sm:mb-0">
                      <Trophy className="text-purple-500" size={20} />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-gray-800">{stats.totalPoints}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700">Total Points</h3>
                  <p className="text-xs text-purple-500 mt-1 hidden sm:block">Earned from tasks</p>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-green-100 rounded-lg mb-2 sm:mb-0">
                      <TrendingUp className="text-green-500" size={20} />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-gray-800">{stats.weeklyCompleted}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700">This Week</h3>
                  <p className="text-xs text-green-500 mt-1 hidden sm:block">Tasks completed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Today's Tasks */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-800">Today's Tasks</h3>
                <span className="text-xs sm:text-sm text-gray-600">
                  {tasks.filter(t => t.status === 'completed').length}/{tasks.length} completed
                </span>
              </div>

              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No tasks for today</p>
                    <button
                      onClick={() => navigate('/tasks')}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus size={18} />
                      Add Task
                    </button>
                  </div>
                ) : (
                  tasks.map(task => (
                    <div
                      key={task._id}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <button
                        onClick={() => toggleTask(task._id)}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          task.status === 'completed'
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {task.status === 'completed' && <CheckCircle2 size={16} className="text-white" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm sm:text-base font-medium break-words ${
                          task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'
                        }`}>
                          {task.title}
                        </p>
                      </div>
                      
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Streak Progress */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">Streak Progress</h3>
              
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-orange-100 mb-3 sm:mb-4">
                  <Flame size={40} className="text-orange-500 sm:w-12 sm:h-12" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stats.currentStreak} Days</p>
                <p className="text-xs sm:text-sm text-gray-600">Current streak</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-gray-700">This week</span>
                    <span className="font-semibold text-gray-800">{stats.weeklyCompleted} tasks</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((stats.weeklyCompleted / 7) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <TrendingUp size={16} className="text-green-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-800">Personal Best: {stats.longestStreak} days</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Trophy size={16} className="text-purple-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-800">Total Points: {stats.totalPoints}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </div>

      {/* Daily Quote Modal */}
      {showQuoteModal && quote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-xl relative animate-slideUp">
            <button
              onClick={() => setShowQuoteModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>

            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Sparkles className="text-blue-500" size={32} />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Daily Inspiration
            </h3>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <p className="text-lg text-gray-700 italic text-center leading-relaxed mb-4">
                "{quote.text}"
              </p>
              <p className="text-right text-sm font-semibold text-blue-500">
                — {quote.author}
              </p>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Start Your Day!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Unlock Modal */}
      {unlockedAchievement && (
        <AchievementUnlockModal
          achievement={unlockedAchievement}
          onClose={closeAchievementModal}
        />
      )}
    </div>
  );
}