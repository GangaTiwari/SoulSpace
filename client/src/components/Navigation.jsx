import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Smile, BarChart2, BookOpen, Clock,
  MessageCircle, Users, Wind, Settings, Menu, X, LogOut, Brain
} from 'lucide-react';

const navGroups = [
  {
    label: 'Track',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/mood/check-in', label: 'Mood Check-in', icon: Smile },
      { path: '/mood/history', label: 'Mood History', icon: BarChart2 },
    ]
  },
  {
    label: 'Journal & Connect',
    items: [
      { path: '/journal', label: 'Journal', icon: BookOpen },
      { path: '/journal/history', label: 'Past Entries', icon: Clock },
      { path: '/chat', label: 'AI Chat', icon: MessageCircle },
      { path: '/forum', label: 'Community', icon: Users },
    ]
  },
  {
    label: 'Unwind',
    items: [
      { path: '/calm-zone', label: 'Calm Zone', icon: Wind },
      { path: '/settings', label: 'Settings', icon: Settings },
    ]
  }
];

const avatarColors = ['bg-indigo-500', 'bg-violet-500', 'bg-teal-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500'];
const getAvatarColor = (name = '') => avatarColors[name.charCodeAt(0) % avatarColors.length];

const SidebarContent = ({ onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">SoulSpace</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-indigo-600' : 'text-gray-400'} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${getAvatarColor(user?.name)} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 transition-colors p-1" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <SidebarContent />
      </div>

      <div className="lg:hidden fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-100 bg-white px-4">
        <button onClick={() => setMobileOpen(true)} className="text-gray-500 hover:text-gray-800">
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Brain size={14} className="text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">SoulSpace</span>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;