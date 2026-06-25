import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, Shield } from 'lucide-react';

const Toggle = ({ value, onChange }) => (
  <button onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-indigo-600' : 'bg-gray-200'}`}>
    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
  </button>
);

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ notifications: true, emailUpdates: false, privacyMode: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key, val) => setSettings(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const avatarColors = ['bg-indigo-500', 'bg-violet-500', 'bg-teal-500', 'bg-rose-500', 'bg-amber-500'];
  const avatarColor = avatarColors[(user?.name?.charCodeAt(0) || 0) % avatarColors.length];

  return (
    <div className="max-w-xl mx-auto py-8 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-400 text-sm">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} className="text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-700">Account</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 ${avatarColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
            <span className="text-xl font-bold text-white">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-800">{user?.name || 'User'}</p>
            <p className="text-sm text-gray-400">{user?.email || 'No email'}</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={16} className="text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-700">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { key: 'notifications', label: 'Push Notifications', desc: 'Mood reminders and updates' },
            { key: 'emailUpdates', label: 'Email Updates', desc: 'Occasional news and tips' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <Toggle value={settings[item.key]} onChange={v => set(item.key, v)} />
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={16} className="text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-700">Privacy</h2>
        </div>
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-medium text-gray-800">Privacy Mode</p>
            <p className="text-xs text-gray-400 mt-0.5">Keep your data private</p>
          </div>
          <Toggle value={settings.privacyMode} onChange={v => set('privacyMode', v)} />
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving}
        className={`w-full py-3 font-semibold rounded-xl text-sm transition-all ${saved ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'} disabled:opacity-50`}>
        {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Preferences'}
      </button>

      {/* Logout */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <button onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-sm font-semibold">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;