const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { protect, authorize } = require('../middleware/auth');

// Get all menu pizzas
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('pizzas').get();
    const pizzas = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, pizzas });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Add Pizza
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const docRef = await db.collection('pizzas').add(req.body);
    const doc = await docRef.get();
    res.status(201).json({ success: true, pizza: { _id: doc.id, ...doc.data() } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
