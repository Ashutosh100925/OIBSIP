const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { protect } = require('../middleware/auth');

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const { password, ...userData } = req.user;
    res.status(200).json({ success: true, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get user orders
router.get('/orders', protect, async (req, res) => {
  try {
    const snapshot = await db.collection('orders')
        .where('user', '==', req.user.id)
        .orderBy('createdAt', 'desc')
        .get();
        
    const orders = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
