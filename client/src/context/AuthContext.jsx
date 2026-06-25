import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rehydrate = async () => {
      try {
        const res = await API.get('/auth/me');
        setUser(res.data.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    rehydrate();
  }, []);

  const login = async (data) => {
    try {
      const res = await API.post('/auth/login', data);
      setUser(res.data.data.user);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data) => {
    try {
      const res = await API.post('/auth/register', data);
      setUser(res.data.data.user);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 