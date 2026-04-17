import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { orderService } from '../services/api';
import { HiCheck, HiTruck, HiFire, HiReceiptTax } from 'react-icons/hi';
import './OrderTracking.css';

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const statuses = [
    { name: 'Order Received', icon: <HiReceiptTax /> },
    { name: 'In the Kitchen', icon: <HiFire /> },
    { name: 'Sent to Delivery', icon: <HiTruck /> },
    { name: 'Delivered', icon: <HiCheck /> },
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await orderService.getOrderById(id);
        setOrder(data.order);
      } catch (err) {
        console.error('Failed to fetch order', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    const socket = io('http://localhost:5000');
    socket.emit('join_order', id);

    socket.on('order_status_update', (updatedOrder) => {
      setOrder(updatedOrder);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  if (loading) return <div className="tracking-loading">Locating your pizza...</div>;
  if (!order) return <div className="tracking-error container">Order not found</div>;

  const currentStatusIndex = statuses.findIndex(s => s.name === order.status);

  return (
    <div className="tracking-page container">
      <div className="tracking-header">
        <h1>Track Your <span className="text-gradient">Order</span></h1>
        <p>Order ID: #{order._id}</p>
      </div>

      <div className="tracking-content">
        <div className="status-stepper">
          {statuses.map((status, index) => {
            const isActive = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;

            return (
              <div key={status.name} className={`status-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="status-icon">
                  {status.icon}
                </div>
                <div className="status-label">
                  <strong>{status.name}</strong>
                  <p>{isActive ? (isCurrent ? 'Happening now' : 'Completed') : 'Pending'}</p>
                </div>
                {index < statuses.length - 1 && <div className="status-line"></div>}
              </div>
            );
          })}
        </div>

        <div className="order-details-card">
          <h3>Order Summary</h3>
          <div className="items-list">
            {order.items.map((item, idx) => (
              <div key={idx} className="tracking-item">
                <span>{item.quantity}x {item.name}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="tracking-total">
            <span>Total Amount Paid</span>
            <strong>₹{order.totalAmount}</strong>
          </div>
          <div className="payment-badge">
            <HiCheck /> Payment Verified
          </div>
          
          <Link to="/menu" className="btn-secondary" style={{marginTop: '2rem', display: 'block', textAlign: 'center'}}>
            Order Something Else
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
