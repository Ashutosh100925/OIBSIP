import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { HiOutlineShoppingCart, HiOutlineUserCircle, HiLogout } from 'react-icons/hi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="logo">
          PIZZA<span className="accent">PREMIUM</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/menu" className="nav-item">Menu</Link>
          <Link to="/custom-builder" className="nav-item">Build Your Own</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-item admin-link">Admin Panel</Link>
          )}
        </div>

        <div className="nav-actions">
          <Link to="/cart" className="cart-btn">
            <HiOutlineShoppingCart size={24} />
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </Link>

          {user ? (
            <div className="user-menu">
              <Link to="/profile" className="profile-link">
                <HiOutlineUserCircle size={24} />
                <span className="user-name">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                <HiLogout size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
