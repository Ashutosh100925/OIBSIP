import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { HiTrendingUp, HiArchive, HiChevronRight, HiBell } from 'react-icons/hi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, ingRes] = await Promise.all([
          api.get('/orders'),
          api.get('/inventory')
        ]);
        setOrders(ordersRes.data.orders);
        setIngredients(ingRes.data.ingredients);
      } catch (err) {
        console.error('Failed to fetch admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleStockUpdate = async (ingId, newStock) => {
    try {
      await api.put(`/inventory/${ingId}`, { stock: newStock });
      setIngredients(prev => prev.map(i => i._id === ingId ? { ...i, stock: newStock } : i));
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  if (loading) return <div className="admin-loading">Initializing Control Panel...</div>;

  const lowStockItems = ingredients.filter(i => i.stock <= i.threshold);

  return (
    <div className="admin-dashboard container">
      <header className="admin-header">
        <div>
          <h1>Admin <span className="text-gradient">Control Panel</span></h1>
          <p>Manage your pizza empire from one place.</p>
        </div>
        <div className="admin-stats">
          <div className="mini-stat">
            <HiTrendingUp className="icon" />
            <div>
              <strong>{orders.length}</strong>
              <span>Total Orders</span>
            </div>
          </div>
          <div className="mini-stat">
            <HiArchive className="icon" />
            <div>
              <strong>{ingredients.length}</strong>
              <span>Stock Items</span>
            </div>
          </div>
        </div>
      </header>

      {lowStockItems.length > 0 && (
        <div className="stock-alert-banner">
          <HiBell className="bell-icon" />
          <span><strong>Stock Alert:</strong> {lowStockItems.length} items are running low on stock!</span>
        </div>
      )}

      <nav className="admin-tabs">
        <button 
          className={activeTab === 'orders' ? 'active' : ''} 
          onClick={() => setActiveTab('orders')}
        >
          Manage Orders
        </button>
        <button 
          className={activeTab === 'inventory' ? 'active' : ''} 
          onClick={() => setActiveTab('inventory')}
        >
          Inventory Management
        </button>
      </nav>

      <div className="admin-content">
        {activeTab === 'orders' ? (
          <div className="orders-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td className="id-col">#{order._id.slice(-6)}</td>
                    <td>
                      <strong>{order.user?.name}</strong>
                      <span className="sub-text">{order.user?.email}</span>
                    </td>
                    <td className="price-col">₹{order.totalAmount}</td>
                    <td>
                      <span className={`status-badge ${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="Order Received">Order Received</option>
                        <option value="In the Kitchen">In the Kitchen</option>
                        <option value="Sent to Delivery">Sent to Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="inventory-grid">
            {ingredients.map(item => (
              <div key={item._id} className={`inventory-card ${item.stock <= item.threshold ? 'low' : ''}`}>
                <div className="ing-header">
                  <strong>{item.name}</strong>
                  <span className="category-pill">{item.category}</span>
                </div>
                <div className="ing-stock">
                  <div className="stock-value">
                    <span>Stock:</span>
                    <strong>{item.stock}</strong>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{ width: `${Math.min((item.stock/100)*100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ing-actions">
                  <button onClick={() => handleStockUpdate(item._id, item.stock + 10)}>Add 10</button>
                  <button onClick={() => handleStockUpdate(item._id, Math.max(0, item.stock - 10))}>Use 10</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
