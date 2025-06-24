import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/mood/check-in', label: 'Mood Check-in', icon: '😊' },
    { path: '/mood/history', label: 'Mood History', icon: '📊' },
    { path: '/journal', label: 'Journal', icon: '📝' },
    { path: '/journal/history', label: 'Journal History', icon: '📚' },
    { path: '/chat', label: 'AI Chat', icon: '💬' },
    { path: '/forum', label: 'Community', icon: '🌐' },
    { path: '/games', label: 'Games', icon: '🎮' },
    { path: '/calm-zone', label: 'Calm Zone', icon: '🧘' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
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
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl transition-colors duration-300">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Logo & Dark Mode Toggle */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-800 dark:to-gray-900 justify-between">
            <h1 className="text-xl font-bold text-white">SoulSpace</h1>
            <button
              onClick={() => setDarkMode((d) => !d)}
              className="ml-2 p-2 rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition"
              title="Toggle dark mode"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" /></svg>
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200
                  ${isActive(item.path)
                    ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-100 shadow'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-700 dark:hover:text-blue-400'}
                `}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-base font-semibold text-gray-800 dark:text-gray-100">
                  {user?.name || 'User'}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="fixed inset-x-0 top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200 lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">SoulSpace</h1>
            </div>
          </div>
          <button
            onClick={() => setDarkMode((d) => !d)}
            className="ml-2 p-2 rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            title="Toggle dark mode"
          >
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center justify-between">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">SoulSpace</h1>
                  <button
                    onClick={() => setDarkMode((d) => !d)}
                    className="ml-2 p-2 rounded-full bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    title="Toggle dark mode"
                  >
                    {darkMode ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" /></svg>
                    )}
                  </button>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul className="-mx-2 space-y-1">
                        {navigationItems.map((item) => (
                          <li key={item.path}>
                            <Link
                              to={item.path}
                              className={`group flex gap-x-3 rounded-lg p-2 text-base leading-6 font-semibold transition-colors duration-200
                                ${isActive(item.path)
                                  ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-gray-100 shadow'
                                  : 'text-gray-700 dark:text-gray-200 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800'}
                              `}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <span className="text-lg">{item.icon}</span>
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li className="mt-auto">
                      <div className="flex items-center gap-x-4 px-2 py-2">
                        <div className="w-9 h-9 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg font-semibold">
                            {user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-800 dark:text-gray-100">
                            {user?.name || 'User'}
                          </p>
                          <button
                            onClick={handleLogout}
                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation; 