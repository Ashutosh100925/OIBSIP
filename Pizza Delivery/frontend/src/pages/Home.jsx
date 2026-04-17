import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiArrowRight, HiFire, HiLightningBolt, HiStar } from 'react-icons/hi';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-content">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <span className="badge">
              <HiFire className="icon" /> New: Truffle Cheese Burst
            </span>
            <h1>The <span className="text-gradient">Premium</span> Experience in Every Slice.</h1>
            <p>Crafted with artisanal ingredients, delivered with startup speed. Build your dream pizza or choose from our curated signatures.</p>
            
            <div className="hero-cta">
              <Link to="/menu" className="btn-primary">
                Explore Menu <HiArrowRight />
              </Link>
              <Link to="/custom-builder" className="btn-secondary">
                Custom Builder
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat">
                <h3>4.9/5</h3>
                <p>User Rating</p>
              </div>
              <div className="stat">
                <h3>25+</h3>
                <p>Artisan Toppings</p>
              </div>
              <div className="stat">
                <h3>20m</h3>
                <p>Avg Delivery</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hero-image"
          >
            <div className="image-glow"></div>
            <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop" alt="Premium Pizza" />
            
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="floating-card c1"
            >
              <HiStar className="icon" /> <span>500+ Daily Orders</span>
            </motion.div>
            <motion.div 
               animate={{ y: [0, 15, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="floating-card c2"
            >
              <HiLightningBolt className="icon" /> <span>Superfast Delivery</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="features container">
        <div className="feature-card">
          <div className="feat-icon"><HiFire /></div>
          <h3>Fresh Ingredients</h3>
          <p>Sourced daily from local organic farms for the best taste.</p>
        </div>
        <div className="feature-card">
          <div className="feat-icon"><HiLightningBolt /></div>
          <h3>Fast Delivery</h3>
          <p>Our fleet ensures your pizza arrives piping hot in under 20 mins.</p>
        </div>
        <div className="feature-card">
          <div className="feat-icon"><HiStar /></div>
          <h3>Custom Craft</h3>
          <p>Over 10,000+ possible combinations in our custom builder.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
