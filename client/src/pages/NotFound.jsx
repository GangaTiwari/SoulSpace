import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Brain } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F7F5F2] px-4">
    <div className="text-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Brain size={32} className="text-indigo-600" />
      </div>
      <h1 className="text-7xl font-bold text-gray-200 mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Page not found</h2>
      <p className="text-gray-400 text-sm mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
        <Home size={18} /> Go Home
      </Link>
    </div>
  </div>
);

export default NotFound;