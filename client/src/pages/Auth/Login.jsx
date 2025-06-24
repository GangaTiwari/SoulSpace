import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', anonymousId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md p-6 sm:p-10 rounded-3xl shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border border-gray-200 dark:border-gray-800 flex flex-col items-center">
        <img src="/logo.svg" alt="SoulSpace Logo" className="w-16 h-16 mb-4 drop-shadow-xl" />
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">Welcome Back</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">Sign in to your SoulSpace account</p>
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg px-4 py-2 text-sm text-center mb-2">{error}</div>}
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} autoComplete="email" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} autoComplete="current-password" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
            <span>or</span>
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Create account</Link>
          </div>
          <input type="text" name="anonymousId" placeholder="Anonymous ID (for guest login)" value={form.anonymousId} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
          <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-800 text-white font-bold shadow-lg hover:scale-[1.02] hover:shadow-xl transition disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
      </div>
    </div>
  );
};

export default Login; 