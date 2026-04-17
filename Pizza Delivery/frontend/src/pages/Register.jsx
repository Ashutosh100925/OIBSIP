import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { HiMail, HiLockClosed, HiUser, HiArrowRight } from 'react-icons/hi';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', formData);
      setStatus({ type: 'success', message: data.message });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card"
      >
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join the elite pizza community</p>
        </div>

        {status.message && (
          <div className={`auth-status ${status.type}`}>
            {status.message}
          </div>
        )}

        {status.type !== 'success' && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label><HiUser /> Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required 
              />
            </div>

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

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Creating...' : 'Register'} <HiArrowRight />
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login Here</Link></p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
