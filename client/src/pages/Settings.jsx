import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    privacyMode: true,
    theme: 'light'
  });
  const [loading, setLoading] = useState(false);

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // TODO: Save settings to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Settings <span className="text-blue-600 dark:text-blue-400">⚙️</span></h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Username</label>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">{user?.name || 'JohnDoe'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Email Address</label>
              <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">{user?.email || 'john.doe@example.com'}</p>
            </div>
            <button className="text-blue-600 hover:underline dark:text-blue-400">Change Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 