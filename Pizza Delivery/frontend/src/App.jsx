import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import PizzaBuilder from './pages/PizzaBuilder';
import Cart from './pages/Cart';
import OrderTracking from './pages/OrderTracking';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/custom-builder" element={<PizzaBuilder />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/order-tracking/:id" element={<OrderTracking />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
