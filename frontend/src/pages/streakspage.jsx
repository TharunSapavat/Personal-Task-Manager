import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Award,
} from 'lucide-react';
import { streakAPI } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function StreaksPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [streakData, setStreakData] = useState(null);
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

    fetchStreakData();
  }, [navigate]);

  const fetchStreakData = async () => {
    try {
      setLoading(true);
      const response = await streakAPI.getStreakData();
      if (response.data.success) {
        setStreakData(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch streak data:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 w-full">
      <Sidebar activeTab="streaks" user={user} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="ml-12 lg:ml-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Activity</h2>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Last 365 days of task completion</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading streak data...</p>
            </div>
          ) : streakData ? (
            <div className="space-y-6">
              {/* Stats Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-orange-200 hover:border-orange-400 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Current Streak</span>
                    <Flame className="text-orange-500" size={20} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{streakData.streak?.current || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">consecutive days</p>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-purple-200 hover:border-purple-400 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Longest Streak</span>
                    <Award className="text-purple-500" size={20} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{streakData.streak?.longest || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">personal best</p>
                </div>

                <div className="bg-white rounded-lg p-4 sm:p-6 border-2 border-blue-200 hover:border-blue-400 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Total Tasks</span>
                    <Flame className="text-blue-500" size={20} />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {streakData.activityHistory?.reduce((sum, day) => sum + day.tasksCompleted, 0) || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">completed</p>
                </div>
              </div>

              {/* Activity Overview */}
              <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 border border-gray-200">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Recent Activity</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Your task completion over the last 30 days</p>
                </div>

                {/* Last 30 Days Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
                  {streakData.activityHistory?.slice(-30).map((day, index) => {
                    // Parse UTC date correctly to avoid timezone shifts
                    const [year, month, dayNum] = day.date.split('-').map(Number);
                    const date = new Date(year, month - 1, dayNum);
                    
                    const today = new Date();
                    const isToday = date.getDate() === today.getDate() && 
                                   date.getMonth() === today.getMonth() && 
                                   date.getFullYear() === today.getFullYear();
                    
                    return (
                      <div
                        key={index}
                        className={`relative group`}
                      >
                        <div
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 transition-all cursor-pointer ${
                            isToday
                              ? 'bg-indigo-500 text-white ring-2 ring-indigo-300'
                              : day.tasksCompleted > 0
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          <span className="text-xs font-bold">{dayNum}</span>
                          {day.tasksCompleted > 0 && (
                            <span className="text-xs mt-0.5">{day.tasksCompleted}</span>
                          )}
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          <br />
                          {day.tasksCompleted} task{day.tasksCompleted !== 1 ? 's' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded"></div>
                    <span className="text-sm text-gray-600">No tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-600">Completed tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-500 rounded"></div>
                    <span className="text-sm text-gray-600">Today</span>
                  </div>
                </div>
              </div>

              {/* Weekly Breakdown */}
              <div className="bg-white rounded-lg p-8 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Progress</h3>
                
                <div className="space-y-4">
                  {(() => {
                    const weeks = [];
                    const last28Days = streakData.activityHistory?.slice(-28) || [];
                    
                    for (let i = 0; i < 4; i++) {
                      const weekDays = last28Days.slice(i * 7, (i + 1) * 7);
                      const weekTotal = weekDays.reduce((sum, day) => sum + day.tasksCompleted, 0);
                      
                      if (weekDays[0]) {
                        // Parse UTC date correctly
                        const [year, month, dayNum] = weekDays[0].date.split('-').map(Number);
                        const weekStart = new Date(year, month - 1, dayNum);
                        
                        weeks.push({
                          label: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                          total: weekTotal,
                          days: weekDays
                        });
                      }
                    }
                    
                    return weeks.reverse().map((week, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{week.label}</span>
                          <span className="text-sm font-bold text-gray-900">{week.total} tasks</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                            style={{ width: `${Math.min((week.total / 20) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <Flame className="text-gray-300 mb-4" size={64} />
              <p className="text-gray-500 text-lg">No streak data available</p>
              <p className="text-gray-400 text-sm mt-2">Complete tasks to start building your streak!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
