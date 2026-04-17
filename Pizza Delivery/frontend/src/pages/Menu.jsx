import React, { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { pizzaService } from '../services/api';
import PizzaCard from '../components/PizzaCard';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { HiFilter, HiSearch } from 'react-icons/hi';
import './Menu.css';

const Menu = () => {
  const [pizzas, setPizzas] = useState([]);
  const [filteredPizzas, setFilteredPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        const { data } = await pizzaService.getMenu();
        setPizzas(data.pizzas);
        setFilteredPizzas(data.pizzas);
      } catch (err) {
        console.error('Failed to fetch menu', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPizzas();
  }, []);

  useEffect(() => {
    let result = pizzas;
    if (activeFilter !== 'All') {
      result = result.filter(p => p.tags.includes(activeFilter));
    }
    if (search) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredPizzas(result);
  }, [search, activeFilter, pizzas]);

  const handleAddToCart = (pizza) => {
    addToCart({
      pizzaId: pizza._id,
      name: pizza.name,
      price: pizza.price,
      quantity: 1,
      image: pizza.image,
      isCustom: false
    });
    // Add toast notification later
  };

  const handleCustomize = (pizza) => {
    navigate('/custom-builder', { state: { basePizza: pizza } });
  };

  return (
    <div className="menu-page container">
      <header className="menu-header">
        <div className="header-text">
          <h1>Our Pizza <span className="text-gradient">Varieties</span></h1>
          <p>Choose from our handcrafted signatures or customize your own.</p>
        </div>
        
        <div className="menu-controls">
          <div className="search-bar">
            <HiSearch />
            <input 
              type="text" 
              placeholder="Search pizzas..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="filter-chips">
            {['All', 'Veg', 'Non-Veg', 'Bestseller', 'Spicy'].map(filter => (
              <button 
                key={filter}
                className={`chip ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="loading-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-card"></div>)}
        </div>
      ) : (
        <motion.div 
          layout
          className="pizza-grid"
        >
          {filteredPizzas.map(pizza => (
            <PizzaCard 
              key={pizza._id} 
              pizza={pizza} 
              onAddToCart={handleAddToCart}
              onCustomize={handleCustomize}
            />
          ))}
        </motion.div>
      )}

      {filteredPizzas.length === 0 && !loading && (
        <div className="empty-state">
          <h3>No pizzas found</h3>
          <p>Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  );
};

export default Menu;
