import React from 'react';
import { motion } from 'framer-motion';
import { HiStar, HiShoppingBag, HiAdjustments } from 'react-icons/hi';
import './PizzaCard.css';

const PizzaCard = ({ pizza, onCustomize, onAddToCart }) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="pizza-card"
    >
      <div className="pizza-image">
        <img src={pizza.image} alt={pizza.name} />
        <div className="pizza-badges">
          {pizza.tags?.map(tag => (
            <span key={tag} className="tag-badge">{tag}</span>
          ))}
        </div>
      </div>
      
      <div className="pizza-info">
        <div className="info-header">
          <h3>{pizza.name}</h3>
          <div className="rating">
            <HiStar /> <span>4.8</span>
          </div>
        </div>
        <p className="description">{pizza.description}</p>
        
        <div className="pizza-footer">
          <div className="price">
            <span className="currency">₹</span>
            <span className="amount">{pizza.price}</span>
          </div>
          
          <div className="card-actions">
            <button 
              className="action-btn customize" 
              onClick={() => onCustomize(pizza)}
              title="Customize"
            >
              <HiAdjustments />
            </button>
            <button 
              className="action-btn add" 
              onClick={() => onAddToCart(pizza)}
            >
              <HiShoppingBag /> Add
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PizzaCard;
