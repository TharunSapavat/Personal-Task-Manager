import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TrendingUp, PieChart, BarChart3, Calendar } from 'lucide-react';
import { taskAPI, streakAPI } from '../services/api';
import Navbar from '../components/Navbar';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    currentStreak: 0,
    totalPoints: 0,
    weeklyCompleted: 0,
    longestStreak: 0
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [priorityData, setPriorityData] = useState({ high: 0, medium: 0, low: 0 });
  const [statusData, setStatusData] = useState({ pending: 0, inProgress: 0, completed: 0 });
  const [allTasks, setAllTasks] = useState([]);

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

    fetchAnalyticsData();
  }, [navigate]);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [statsResponse, streakResponse, tasksResponse] = await Promise.all([
        taskAPI.getTaskStats(),
        streakAPI.getStreakStats(),
        taskAPI.getAllTasks()
      ]);

      if (statsResponse.data.success && streakResponse.data.success) {
        const taskStats = statsResponse.data.stats;
        const streakStats = streakResponse.data.stats;
        
        setStats({
          tasksCompleted: taskStats.completedTasks || 0,
          currentStreak: streakStats.currentStreak || 0,
          totalPoints: streakStats.totalPoints || 0,
          weeklyCompleted: streakStats.tasksThisWeek || 0,
          longestStreak: streakStats.longestStreak || 0
        });
      }

      // Process all tasks for priority and status distribution
      if (tasksResponse.data.success) {
        const tasks = tasksResponse.data.tasks || [];
        setAllTasks(tasks);

        // Calculate priority distribution
        const priorities = { high: 0, medium: 0, low: 0 };
        tasks.forEach(task => {
          if (priorities.hasOwnProperty(task.priority)) {
            priorities[task.priority]++;
          }
        });
        setPriorityData(priorities);

        // Calculate status distribution
        const statuses = { pending: 0, inProgress: 0, completed: 0 };
        tasks.forEach(task => {
          if (task.status === 'pending') statuses.pending++;
          else if (task.status === 'in-progress') statuses.inProgress++;
          else if (task.status === 'completed') statuses.completed++;
        });
        setStatusData(statuses);

        // Calculate weekly data (last 7 days)
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);
          
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          // Count tasks completed on this day
          const completedCount = tasks.filter(task => {
            if (task.status !== 'completed' || !task.updatedAt) return false;
            const taskDate = new Date(task.updatedAt);
            return taskDate >= date && taskDate < nextDay;
          }).length;
          
          last7Days.push({
            day: dayName,
            completed: completedCount
          });
        }
        setWeeklyData(last7Days);
      }
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Chart configurations
  const lineChartData = useMemo(() => ({
    labels: weeklyData.map(d => d.day),
    datasets: [
      {
        label: 'Tasks Completed',
        data: weeklyData.map(d => d.completed),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }
    ]
  }), [weeklyData]);

  const lineChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 12 },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 12 }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: { size: 12 }
        },
        grid: {
          display: false
        }
      }
    }
  }), []);

  const doughnutChartData = useMemo(() => ({
    labels: ['High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [
      {
        data: [priorityData.high, priorityData.medium, priorityData.low],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(234, 179, 8)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  }), [priorityData]);

  const doughnutChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: { size: 13 },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    }
  }), []);

  const barChartData = useMemo(() => ({
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        label: 'Tasks by Status',
        data: [statusData.pending, statusData.inProgress, statusData.completed],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgb(156, 163, 175)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  }), [statusData]);

  const barChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 12 }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: { size: 12 }
        },
        grid: {
          display: false
        }
      }
    }
  }), []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Analytics</h2>
          <p className="text-sm text-gray-600 mt-1">Track your productivity and task completion trends</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="text-blue-500" size={20} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700">Completion Rate</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {Math.round((statusData.completed / (statusData.pending + statusData.inProgress + statusData.completed) * 100) || 0)}%
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="text-purple-500" size={20} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700">Total Tasks</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {statusData.pending + statusData.inProgress + statusData.completed}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="text-orange-500" size={20} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700">Weekly Avg</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {Math.round(weeklyData.reduce((sum, d) => sum + d.completed, 0) / 7)}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <PieChart className="text-green-500" size={20} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700">Active Tasks</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {statusData.pending + statusData.inProgress}
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {/* Weekly Completion Trend */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Weekly Completion Trend</h3>
                <div className="h-64">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>

              {/* Task Status Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Task Status Distribution</h3>
                <div className="h-64">
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:col-span-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Priority Distribution</h3>
                <div className="h-72 flex items-center justify-center">
                  <div className="w-full max-w-sm h-full">
                    <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Insights Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Insights & Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Most Productive Day</h4>
                  <p className="text-sm text-gray-600">
                    {weeklyData.length > 0 
                      ? weeklyData.reduce((max, d) => d.completed > max.completed ? d : max, weeklyData[0]).day
                      : 'N/A'}
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Tasks This Week</h4>
                  <p className="text-sm text-gray-600">
                    {weeklyData.reduce((sum, d) => sum + d.completed, 0)} tasks completed
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Current Streak</h4>
                  <p className="text-sm text-gray-600">
                    {stats.currentStreak} consecutive days
                  </p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Total Points</h4>
                  <p className="text-sm text-gray-600">
                    {stats.totalPoints} points earned
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
