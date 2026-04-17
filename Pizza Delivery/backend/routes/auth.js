const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
const sendEmail = require('../services/emailService');
const { protect } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const userQuery = await db.collection('users').where('email', '==', email).get();
    if (!userQuery.empty) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: 'user', // Default role
      isVerified: false,
      verificationToken,
      createdAt: new Date().toISOString()
    };

    const userRef = await db.collection('users').add(newUser);

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    const message = `Please confirm your email by clicking following link: \n\n ${verifyUrl}`;

    try {
      await sendEmail({
        email: newUser.email,
        subject: 'Email Verification: Pizza Premium',
        message
      });
      res.status(200).json({ success: true, message: 'Registration successful. Email sent for verification.' });
    } catch (err) {
      // Cleanup token on mail failure (optional)
      await userRef.update({ verificationToken: null });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify Email
router.post('/verify/:token', async (req, res) => {
  try {
    const userQuery = await db.collection('users').where('verificationToken', '==', req.params.token).get();
    
    if (userQuery.empty) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    const userDoc = userQuery.docs[0];
    await userDoc.ref.update({
      isVerified: true,
      verificationToken: null
    });

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Provide email and password' });

    const userQuery = await db.collection('users').where('email', '==', email).get();
    if (userQuery.empty) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const userDoc = userQuery.docs[0];
    const user = userDoc.data();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isVerified) return res.status(401).json({ success: false, message: 'Email not verified. Please check your inbox.' });

    const token = jwt.sign({ id: userDoc.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({ 
        success: true, 
        token, 
        user: { id: userDoc.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Forgot Password
router.post('/forgotpassword', async (req, res) => {
  try {
    const userQuery = await db.collection('users').where('email', '==', req.body.email).get();
    if (userQuery.empty) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    const userDoc = userQuery.docs[0];
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    
    await userDoc.ref.update({
      resetPasswordToken,
      resetPasswordExpire
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `You are receiving this email because you requested a password reset. Navigate to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: userDoc.data().email,
        subject: 'Password reset token',
        message
      });
      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      await userDoc.ref.update({
        resetPasswordToken: null,
        resetPasswordExpire: null
      });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reset Password
router.post('/resetpassword/:resettoken', async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    const userQuery = await db.collection('users')
        .where('resetPasswordToken', '==', resetPasswordToken)
        .where('resetPasswordExpire', '>', Date.now())
        .get();

    if (userQuery.empty) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const userDoc = userQuery.docs[0];
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await userDoc.ref.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null
    });

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Me
router.get('/me', protect, async (req, res) => {
  try {
      const { password, ...userData } = req.user;
      res.status(200).json({ success: true, user: userData });
  } catch (err) {
      res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
