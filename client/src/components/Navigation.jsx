import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Smile, BarChart2, BookOpen, MessageCircle, Users, Gamepad2, Brain, Settings, Menu, X } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/mood/check-in', label: 'Mood Check-in', icon: Smile },
    { path: '/mood/history', label: 'Mood History', icon: BarChart2 },
    { path: '/journal', label: 'Journal', icon: BookOpen },
    { path: '/chat', label: 'AI Chat', icon: MessageCircle },
    { path: '/forum', label: 'Community', icon: Users },
    { path: '/games', label: 'Games', icon: Gamepad2 },
    { path: '/calm-zone', label: 'Calm Zone', icon: Brain },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gray-900 border-r border-gray-800">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-6">
            <h1 className="text-2xl font-bold text-white">SoulSpace</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <IconComponent size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="flex-shrink-0 border-t border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || 'User'}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-800 bg-gray-900 px-4">
        <button
          type="button"
          className="text-gray-400 hover:text-gray-200 lg:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold text-white">SoulSpace</h1>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-950/80"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
              <h1 className="text-lg font-bold text-white">SoulSpace</h1>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconComponent size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.name || 'User'}
                  </p>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation; 
