import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Brain } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-serenity-bg px-4">
    <div className="text-center ss-card p-10 max-w-md w-full">
      <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Brain size={32} className="text-indigo-600" />
      </div>
      <h1 className="text-7xl font-bold text-gray-200 mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Page not found</h2>
      <p className="text-gray-400 text-sm mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="ss-btn-primary text-sm">
        <Home size={18} /> Go Home
      </Link>
    </div>
  </div>
);

export default NotFound;