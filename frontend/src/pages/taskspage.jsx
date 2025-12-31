import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  X,
  Check,
  CheckSquare,
  Bell,
} from 'lucide-react';
import { taskAPI } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function TasksPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Memoize priority colors to avoid recreation on every render
  const priorityColors = useMemo(() => ({
    low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  }), []);

  // Memoize filtered tasks for better performance
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tasks, filterStatus, filterPriority, searchQuery]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: '',
    reminderEnabled: false,
    reminderTime: ''
  });

  // Use useCallback to memoize functions and prevent unnecessary re-renders
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getTasks();
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

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

    fetchTasks();
  }, [navigate, fetchTasks]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      tags: '',
      reminderEnabled: false,
      reminderTime: ''
    });
  }, []);

  const handleCreateTask = useCallback(async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        reminderEnabled: formData.reminderEnabled,
        reminderTime: formData.reminderEnabled && formData.reminderTime ? formData.reminderTime : null
      };

      if (editingTask) {
        await taskAPI.updateTask(editingTask._id, taskData);
      } else {
        await taskAPI.createTask(taskData);
      }

      await fetchTasks();
      closeModal();
    } catch (err) {
      console.error('Failed to save task:', err);
      alert(err.response?.data?.message || 'Failed to save task');
    }
  }, [editingTask, formData, fetchTasks, closeModal]);

  const handleDeleteTask = useCallback(async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskAPI.deleteTask(taskId);
      await fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Failed to delete task');
    }
  }, [fetchTasks]);

  const handleToggleComplete = useCallback(async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await taskAPI.updateTask(task._id, { status: newStatus });
      await fetchTasks();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  }, [fetchTasks]);

  const openModal = useCallback((task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        tags: task.tags?.join(', ') || '',
        reminderEnabled: task.reminderEnabled || false,
        reminderTime: task.reminderTime ? new Date(task.reminderTime).toISOString().slice(0, 16) : ''
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        tags: '',
        reminderEnabled: false,
        reminderTime: ''
      });
    }
    setShowModal(true);
  }, []);

  return (
    <div className="h-screen flex bg-gray-50 w-full">
      <Sidebar activeTab="tasks" user={user} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="ml-12 lg:ml-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Tasks</h2>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Manage your tasks and stay productive</p>
            </div>

            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Task</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm sm:text-base"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm sm:text-base"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <CheckSquare className="text-gray-300 mb-4" size={64} />
              <p className="text-gray-500 text-lg">No tasks found</p>
              <button
                onClick={() => openModal()}
                className="mt-4 text-indigo-600 hover:underline"
              >
                Create your first task
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
                        task.status === 'completed'
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-gray-300 hover:border-indigo-600'
                      }`}
                    >
                      {task.status === 'completed' && (
                        <Check className="text-white" size={14} strokeWidth={3} />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-base sm:text-lg font-semibold mb-2 break-words ${
                          task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      )}

                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            priorityColors[task.priority].bg
                          } ${priorityColors[task.priority].text} ${priorityColors[task.priority].border}`}
                        >
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>

                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={14} />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}

                        {task.reminderEnabled && task.reminderTime && !task.reminderSent && (
                          <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                            <Bell size={14} />
                            {new Date(task.reminderTime).toLocaleString()}
                          </span>
                        )}

                        {task.tags && task.tags.length > 0 && (
                          <div className="flex gap-2">
                            {task.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={() => openModal(task)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-4 sm:p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="work, urgent, personal"
                />
              </div>

              {/* Reminder Notification */}
              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.reminderEnabled}
                    onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <Bell className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Set notification reminder</span>
                </label>

                {formData.reminderEnabled && (
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.reminderTime}
                      onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                      className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                      required={formData.reminderEnabled}
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      You'll receive an email notification at this time
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
