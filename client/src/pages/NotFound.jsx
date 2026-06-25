import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-700 mb-4">404</div>
        <h1 className="text-3xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-gray-300 mb-8 max-w-md">Sorry, the page you are looking for does not exist or has been moved.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg transition-colors font-semibold"
        >
          <Home size={20} />
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 
