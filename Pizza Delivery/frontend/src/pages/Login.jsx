import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { HiMail, HiLockClosed, HiArrowRight } from 'react-icons/hi';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', formData);
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin' : '/menu');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="auth-card"
      >
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your premium pizza experience</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label><HiMail /> Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required 
            />
          </div>

          <div className="form-group">
            <label><HiLockClosed /> Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required 
            />
          </div>

          <div className="auth-options">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Processing...' : 'Login Now'} <HiArrowRight />
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Create Account</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
