import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-gray-950 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 max-w-lg w-full border border-gray-100 dark:border-gray-700 text-center">
        <h1 className="text-6xl font-extrabold text-blue-600 dark:text-blue-400 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Sorry, the page you are looking for does not exist.</p>
        <Link to="/" className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-semibold shadow">Go Home</Link>
      </div>
    </div>
  );
};

export default NotFound; 