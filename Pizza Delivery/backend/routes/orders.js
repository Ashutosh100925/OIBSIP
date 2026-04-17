const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db, admin } = require('../config/firebase');
const { protect, authorize } = require('../middleware/auth');
const razorpayInstance = require('../services/paymentService');
const sendEmail = require('../services/emailService');

// Create razorpay order
router.post('/create-razorpay-order', protect, async (req, res) => {
  try {
    const { totalAmount } = req.body;
    
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify payment and place order
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items,
      totalAmount
    } = req.body;

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpaySignature;

    if (isAuthentic) {
      const newOrder = {
        user: req.user.id,
        items,
        totalAmount,
        status: 'Order Received',
        paymentStatus: 'Paid',
        razorpayOrderId,
        razorpayPaymentId,
        createdAt: new Date().toISOString()
      };

      const orderRef = await db.collection('orders').add(newOrder);
      const createdOrder = { _id: orderRef.id, ...newOrder };

      // Update Inventory
      for (const item of items) {
        if (item.isCustom) {
           const ingredientIds = [
             item.base, item.sauce, item.cheese,
             ...(item.veggies || []), ...(item.meat || [])
           ].filter(id => id);

           for (const ingId of ingredientIds) {
             const ingRef = db.collection('ingredients').doc(ingId);
             const ingDoc = await ingRef.get();
             
             if (ingDoc.exists) {
               const currentStock = ingDoc.data().stock;
               const newStock = currentStock - item.quantity;
               const threshold = ingDoc.data().threshold;
               
               await ingRef.update({ stock: newStock });

               if (newStock <= threshold) {
                  try {
                    await sendEmail({
                      email: process.env.ADMIN_EMAIL,
                      subject: 'ALERT: Low Stock (Firebase)',
                      message: `Ingredient ${ingDoc.data().name} is running low. Current stock: ${newStock}.`
                    });
                  } catch (e) {
                    console.error("Alert email failed", e);
                  }
               }
             }
           }
        }
      }

      req.io.emit('admin_new_order', createdOrder);

      res.status(200).json({ success: true, order: createdOrder });
    } else {
      res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Get all orders
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    
    // Enrich with user info
    const orders = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        const userDoc = await db.collection('users').doc(data.user).get();
        return { 
            _id: doc.id, 
            ...data, 
            user: userDoc.exists ? { name: userDoc.data().name, email: userDoc.data().email } : null 
        };
    }));

    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update order status
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const orderRef = db.collection('orders').doc(req.params.id);
    await orderRef.update({ status: req.body.status });
    const doc = await orderRef.get();
    
    if (!doc.exists) return res.status(404).json({ success: false, message: 'Order not found' });

    const updatedOrder = { _id: doc.id, ...doc.data() };
    req.io.to(`order_${doc.id}`).emit('order_status_update', updatedOrder);

    res.status(200).json({ success: true, order: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// User: Get specific order by id
router.get('/:id', protect, async (req, res) => {
  try {
    const doc = await db.collection('orders').doc(req.params.id).get();
    if(!doc.exists) return res.status(404).json({ success: false, message: 'Order not found' });
    
    const order = { _id: doc.id, ...doc.data() };
    if(order.user !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized for this order' });
    }
    
    res.status(200).json({ success: true, order });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
