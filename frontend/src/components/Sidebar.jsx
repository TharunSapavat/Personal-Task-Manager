import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  Flame,
  Settings,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';

function Sidebar({ activeTab, user }) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { id: 'tasks', icon: ListTodo, label: 'Tasks', path: '/tasks' },
    { id: 'streaks', icon: Flame, label: 'Streaks', path: '/streaks' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 p-6 flex-shrink-0 flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Flame className="text-indigo-600" size={32} />
          <h1 className="text-xl font-bold text-gray-800">TaskStreak</h1>
        </div>
      </div>
      
      <nav className="space-y-2 flex-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="text-indigo-600" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              {user?.name || (user?.email ? user.email.split('@')[0] : 'User')}
            </p>
            <p className="text-xs text-gray-500">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
    </>
  );
}

// Memoize to prevent unnecessary re-renders
export default React.memo(Sidebar);
