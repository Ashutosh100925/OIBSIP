import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/auth/me');
      setUser(data.user);
    } catch (err) {
      console.error(err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, tokenStr) => {
    localStorage.setItem('token', tokenStr);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenStr}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
