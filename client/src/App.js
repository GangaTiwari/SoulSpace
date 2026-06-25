import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import MoodCheckIn from './pages/Mood/MoodCheckIn';
import MoodHistory from './pages/Mood/MoodHistory';
import JournalEntry from './pages/Journal/JournalEntry';
import JournalHistory from './pages/Journal/JournalHistory';
import ChatBuddy from './pages/Chat/ChatBuddy';
import ForumList from './pages/Forum/ForumList';
import ForumPost from './pages/Forum/ForumPost';
import ForumCreate from './pages/Forum/ForumCreate';
import CalmZone from './pages/CalmZone';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const authPaths = ['/login', '/register'];

const AppLayout = () => {
  const location = useLocation();
  const isAuth = authPaths.includes(location.pathname);

  return (
    <div className="flex h-screen bg-[#F7F5F2]">
      {!isAuth && <Navigation />}
      <div className={!isAuth ? 'flex-1 lg:pl-64 overflow-y-auto' : 'flex-1'}>
        {!isAuth && <div className="lg:hidden h-16" />}
        <main className={!isAuth ? 'p-6 md:p-8 min-h-screen' : 'min-h-screen'}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/mood/check-in" element={<ProtectedRoute><MoodCheckIn /></ProtectedRoute>} />
            <Route path="/mood/history" element={<ProtectedRoute><MoodHistory /></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute><JournalEntry /></ProtectedRoute>} />
            <Route path="/journal/history" element={<ProtectedRoute><JournalHistory /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatBuddy /></ProtectedRoute>} />
            <Route path="/forum" element={<ProtectedRoute><ForumList /></ProtectedRoute>} />
            <Route path="/forum/create" element={<ProtectedRoute><ForumCreate /></ProtectedRoute>} />
            <Route path="/forum/:id" element={<ProtectedRoute><ForumPost /></ProtectedRoute>} />
            <Route path="/calm-zone" element={<ProtectedRoute><CalmZone /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppLayout />
    </Router>
  </AuthProvider>
);

export default App;