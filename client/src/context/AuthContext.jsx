import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  // Clear invalid token
  const clearInvalidToken = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AuthContext: token in localStorage:', token);
    if (token && !isTokenExpired(token)) {
      API.get('/auth/me')
        .then(res => {
          console.log('AuthContext: /auth/me response:', res.data);
          setUser(res.data.data.user);
        })
        .catch((error) => {
          console.error('Auth check failed:', error);
          clearInvalidToken();
        })
        .finally(() => setLoading(false));
    } else {
      if (token) {
        clearInvalidToken();
      }
      setLoading(false);
    }
  }, []);

  const login = async (data) => {
    try {
      const res = await API.post('/auth/login', data);
      localStorage.setItem('token', res.data.data.token);
      setUser(res.data.data.user);
      return res;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data) => {
    try {
      const res = await API.post('/auth/register', data);
      localStorage.setItem('token', res.data.data.token);
      setUser(res.data.data.user);
      return res;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    clearInvalidToken();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 