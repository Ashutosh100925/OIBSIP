import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiXCircle, HiArrowRight } from 'react-icons/hi';
import './Auth.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const { data } = await axios.post(`http://localhost:5000/api/auth/verify/${token}`);
        setStatus('success');
        setMessage(data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      }
    };
    verifyToken();
  }, [token]);

  return (
    <div className="auth-page">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="auth-card"
      >
        <div className="auth-header">
          {status === 'loading' && <h2>Verifying...</h2>}
          {status === 'success' && (
            <>
              <HiCheckCircle size={60} color="var(--success)" style={{marginBottom: '1rem'}} />
              <h2>Email Verified!</h2>
              <p>{message}</p>
              <Link to="/login" className="btn-auth" style={{marginTop: '2rem'}}>
                Go to Login <HiArrowRight />
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <HiXCircle size={60} color="#ff4d4d" style={{marginBottom: '1rem'}} />
              <h2>Verification Failed</h2>
              <p>{message}</p>
              <Link to="/register" className="btn-auth" style={{marginTop: '2rem', background: '#333'}}>
                Try Registering Again
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
