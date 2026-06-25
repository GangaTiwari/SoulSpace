import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    privacyMode: true
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <SettingsIcon size={30} className="text-indigo-500" />
          Settings
        </h1>
        <p className="text-gray-300">Manage your account and preferences</p>
      </div>

      {/* Account Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-6">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
            <p className="text-lg text-white">{user?.name || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <p className="text-lg text-white">{user?.email || 'Not set'}</p>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-6">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Notifications</p>
              <p className="text-sm text-gray-400">Receive notifications for updates</p>
            </div>
            <button
              onClick={() => handleSettingChange('notifications', !settings.notifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.notifications ? 'bg-indigo-600' : 'bg-gray-800'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-gray-300 rounded-full transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Email Updates</p>
              <p className="text-sm text-gray-400">Receive occasional updates via email</p>
            </div>
            <button
              onClick={() => handleSettingChange('emailUpdates', !settings.emailUpdates)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.emailUpdates ? 'bg-indigo-600' : 'bg-gray-800'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-gray-300 rounded-full transition-transform ${
                  settings.emailUpdates ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Privacy Mode</p>
              <p className="text-sm text-gray-400">Keep your data private</p>
            </div>
            <button
              onClick={() => handleSettingChange('privacyMode', !settings.privacyMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.privacyMode ? 'bg-indigo-600' : 'bg-gray-800'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-gray-300 rounded-full transition-transform ${
                  settings.privacyMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* Logout Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Account Actions</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-lg transition-colors justify-center"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Settings; 
