const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { protect, authorize } = require('../middleware/auth');

// Get all ingredients
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('ingredients').get();
    const ingredients = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, ingredients });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Add Ingredient
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const docRef = await db.collection('ingredients').add(req.body);
    const doc = await docRef.get();
    res.status(201).json({ success: true, ingredient: { _id: doc.id, ...doc.data() } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Update Stock / Ingredient
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const docRef = db.collection('ingredients').doc(req.params.id);
    await docRef.update(req.body);
    const doc = await docRef.get();
    
    if (!doc.exists) {
         return res.status(404).json({ success: false, message: "Ingredient not found" });
    }
    
    res.status(200).json({ success: true, ingredient: { _id: doc.id, ...doc.data() } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Delete Ingredient
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await db.collection('ingredients').doc(req.params.id).delete();
    res.status(200).json({ success: true, message: 'Ingredient deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
