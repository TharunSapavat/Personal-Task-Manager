import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Flame, Trophy, TrendingUp, Plus } from 'lucide-react';
import { taskAPI, streakAPI } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    currentStreak: 0,
    totalPoints: 0,
    weeklyCompleted: 0
  });
  const [loading, setLoading] = useState(true);

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
  }, [navigate]);

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
        
        setStats({
          tasksCompleted: taskStats.completedTasks,
          currentStreak: streakStats.currentStreak,
          totalPoints: streakStats.totalPoints,
          weeklyCompleted: streakStats.tasksThisWeek
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
    <div className="flex h-screen bg-gray-50 w-full">
      <Sidebar activeTab="dashboard" user={user} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="ml-12 lg:ml-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Welcome back! Here's your progress today.</p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-orange-50 rounded-full">
                <Flame className="text-orange-500" size={16} />
                <span className="text-xs sm:text-sm font-bold text-orange-600">
                  <span className="hidden sm:inline">{stats.currentStreak} day streak</span>
                  <span className="sm:hidden">{stats.currentStreak}</span>
                </span>
              </div>
              
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm sm:text-base font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-blue-50 rounded-lg mb-2 sm:mb-0">
                      <CheckCircle2 className="text-blue-600" size={20} />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats.tasksCompleted}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600">Tasks Completed</h3>
                  <p className="text-xs text-blue-600 mt-1 hidden sm:block">Total completed</p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-orange-50 rounded-lg mb-2 sm:mb-0">
                      <Flame className="text-orange-600" size={20} />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats.currentStreak}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600">Day Streak</h3>
                  <p className="text-xs text-orange-600 mt-1 hidden sm:block">Keep it going!</p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-purple-50 rounded-lg mb-2 sm:mb-0">
                      <Trophy className="text-purple-600" size={20} />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalPoints}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Points</h3>
                  <p className="text-xs text-purple-600 mt-1 hidden sm:block">Earned from tasks</p>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-green-50 rounded-lg mb-2 sm:mb-0">
                      <TrendingUp className="text-green-600" size={20} />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">{stats.weeklyCompleted}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-600">This Week</h3>
                  <p className="text-xs text-green-600 mt-1 hidden sm:block">Tasks completed</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Today's Tasks */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Today's Tasks</h3>
                <span className="text-xs sm:text-sm text-gray-500">
                  {tasks.filter(t => t.status === 'completed').length}/{tasks.length} completed
                </span>
              </div>

              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No tasks for today</p>
                    <button
                      onClick={() => navigate('/tasks')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
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
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {task.status === 'completed' && <CheckCircle2 size={16} className="text-white" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm sm:text-base font-medium break-words ${
                          task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'
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
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Streak Progress</h3>
              
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 mb-3 sm:mb-4">
                  <Flame size={40} className="text-white sm:w-12 sm:h-12" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.currentStreak} Days</p>
                <p className="text-xs sm:text-sm text-gray-500">Current streak</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="text-gray-600">This week</span>
                    <span className="font-semibold text-gray-900">{stats.weeklyCompleted} tasks</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((stats.weeklyCompleted / 7) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <TrendingUp size={16} className="text-green-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-900">Personal Best: {stats.longestStreak} days</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Trophy size={16} className="text-purple-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-gray-900">Total Points: {stats.totalPoints}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}