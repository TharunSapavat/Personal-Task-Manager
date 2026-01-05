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
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { useDebounce } from '../hooks/useDebounce';

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
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, taskId: null });
  const [deleteAllModal, setDeleteAllModal] = useState(false);

  // Debounce search query for better performance (waits 300ms after user stops typing)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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
      const matchesSearch = task.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tasks, filterStatus, filterPriority, debouncedSearchQuery]);

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
      // Convert local time to ISO string for proper timezone handling
      let reminderTimeISO = null;
      if (formData.reminderEnabled && formData.reminderTime) {
        const localDateTime = new Date(formData.reminderTime);
        reminderTimeISO = localDateTime.toISOString();
      }

      const taskData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        reminderEnabled: formData.reminderEnabled,
        reminderTime: reminderTimeISO
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
      toast.error(err.response?.data?.message || 'Failed to save task');
    }
  }, [editingTask, formData, fetchTasks, closeModal]);

  const handleDeleteTask = useCallback((taskId) => {
    setDeleteConfirmModal({ show: true, taskId });
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      await taskAPI.deleteTask(deleteConfirmModal.taskId);
      await fetchTasks();
      toast.success('Task deleted successfully');
      setDeleteConfirmModal({ show: false, taskId: null });
    } catch (err) {
      console.error('Failed to delete task:', err);
      toast.error('Failed to delete task');
    }
  }, [deleteConfirmModal.taskId, fetchTasks]);

  const cancelDelete = useCallback(() => {
    setDeleteConfirmModal({ show: false, taskId: null });
  }, []);

  const handleDeleteAll = useCallback(() => {
    setDeleteAllModal(true);
  }, []);

  const confirmDeleteAll = useCallback(async () => {
    try {
      const response = await taskAPI.deleteAllTasks();
      await fetchTasks();
      toast.success(response.data.message || 'All tasks deleted successfully');
      setDeleteAllModal(false);
    } catch (err) {
      console.error('Failed to delete all tasks:', err);
      toast.error('Failed to delete all tasks');
    }
  }, [fetchTasks]);

  const cancelDeleteAll = useCallback(() => {
    setDeleteAllModal(false);
  }, []);

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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Tasks</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your tasks and stay productive</p>
          </div>

          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm sm:text-base"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {tasks.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm sm:text-base"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Delete All</span>
              </button>
            )}
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
                className="mt-4 text-blue-500 hover:underline"
              >
                Create your first task
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
                        task.status === 'completed'
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 hover:border-blue-500'
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
                          <span className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
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
                        className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
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
      </div>

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                    className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                  />
                  <Bell className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Set notification reminder</span>
                </label>

                {formData.reminderEnabled && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.reminderTime}
                      onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
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
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-600" size={24} />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
              Delete Task?
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {deleteAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-600" size={24} />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
              Delete All Tasks?
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete all {tasks.length} task(s)? This action cannot be undone and will permanently remove all your tasks.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDeleteAll}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAll}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
