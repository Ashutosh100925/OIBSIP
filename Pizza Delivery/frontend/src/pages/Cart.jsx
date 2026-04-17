import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { orderService } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { HiTrash, HiMinus, HiPlus, HiCreditCard, HiArrowRight } from 'react-icons/hi';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, clearCart, cartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    const res = await loadRazorpay();

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      const { data } = await orderService.createRazorpayOrder(cartTotal);
      
      const options = {
        key: 'rzp_test_placeholder', // Should be in env in real app
        amount: data.order.amount,
        currency: 'INR',
        name: 'Pizza Premium',
        description: 'Quality Pizza Delivery',
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verificationData = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              items: cart,
              totalAmount: cartTotal
            };
            const verifyRes = await orderService.verifyPayment(verificationData);
            if (verifyRes.data.success) {
              clearCart();
              navigate(`/order-tracking/${verifyRes.data.order._id}`);
            }
          } catch (err) {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#ff5e3a',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert('Something went wrong during payment initialization');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty container">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="empty-icon">🍕</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any premium slices yet.</p>
          <Link to="/menu" className="btn-primary">Browse Menu</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1>Your <span className="text-gradient">Cart</span></h1>
      
      <div className="cart-container">
        <div className="cart-items">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div 
                key={item.cartId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="cart-item"
              >
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  {item.isCustom && <p className="item-config">{item.details?.base}, {item.details?.sauce}...</p>}
                  <p className="item-price">₹{item.price}</p>
                </div>
                
                <div className="item-quantity">
                  <button className="qty-btn" disabled><HiMinus /></button>
                  <span>{item.quantity}</span>
                  <button className="qty-btn" disabled><HiPlus /></button>
                </div>

                <div className="item-total">
                  <strong>₹{item.price * item.quantity}</strong>
                </div>

                <button 
                  className="delete-item" 
                  onClick={() => removeFromCart(item.cartId)}
                >
                  <HiTrash />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <aside className="cart-summary">
          <div className="summary-card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span className="free">FREE</span>
            </div>
            <div className="summary-row">
              <span>Tax (GST 5%)</span>
              <span>₹{Math.round(cartTotal * 0.05)}</span>
            </div>
            <div className="summary-total">
              <span>Order Total</span>
              <strong>₹{cartTotal + Math.round(cartTotal * 0.05)}</strong>
            </div>

            <button 
              className="btn-pay" 
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? 'Initializing...' : (
                <>
                  <HiCreditCard /> Pay with Razorpay
                </>
              )}
            </button>
            <p className="secure-text">Secure transaction powered by Razorpay</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
