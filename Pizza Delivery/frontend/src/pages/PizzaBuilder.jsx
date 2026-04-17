import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pizzaService } from '../services/api';
import { CartContext } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiCheck, HiArrowRight, HiArrowLeft, HiPlusCircle } from 'react-icons/hi';
import './PizzaBuilder.css';

const steps = [
  { id: 'base', name: 'Choose Base' },
  { id: 'sauce', name: 'Select Sauce' },
  { id: 'cheese', name: 'Pick Cheese' },
  { id: 'veggie', name: 'Add Veggies' },
  { id: 'meat', name: 'Optional Meat' }
];

const PizzaBuilder = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState({
    base: null,
    sauce: null,
    cheese: null,
    veggie: [],
    meat: []
  });

  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const basePizza = location.state?.basePizza;

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const { data } = await pizzaService.getIngredients();
        setIngredients(data.ingredients);
        
        // If we came from a base pizza, pre-select if relevant (simplified logic here)
        if (basePizza) {
            // Pre-fill logic could go here
        }
      } catch (err) {
        console.error('Failed to fetch ingredients', err);
      } finally {
        setLoading(false);
      }
    };
    fetchIngredients();
  }, [basePizza]);

  const handleSelect = (item) => {
    const category = steps[currentStep].id;
    if (category === 'veggie' || category === 'meat') {
      const exists = selection[category].find(i => i._id === item._id);
      if (exists) {
        setSelection({ ...selection, [category]: selection[category].filter(i => i._id !== item._id) });
      } else {
        setSelection({ ...selection, [category]: [...selection[category], item] });
      }
    } else {
      setSelection({ ...selection, [category]: item });
    }
  };

  const calculateTotal = () => {
    let total = 200; // Base pizza price
    if (selection.base) total += selection.base.price;
    if (selection.sauce) total += selection.sauce.price;
    if (selection.cheese) total += selection.cheese.price;
    selection.veggie.forEach(i => total += i.price);
    selection.meat.forEach(i => total += i.price);
    return total;
  };

  const isNextDisabled = () => {
    const category = steps[currentStep].id;
    if (category === 'base' || category === 'sauce' || category === 'cheese') {
      return !selection[category];
    }
    return false;
  };

  const handleAddToCart = () => {
    const customPizza = {
      pizzaId: null,
      name: `Custom ${selection.base?.name || 'Pizza'}`,
      isCustom: true,
      price: calculateTotal(),
      quantity: 1,
      image: selection.base?.image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      base: selection.base?._id,
      sauce: selection.sauce?._id,
      cheese: selection.cheese?._id,
      veggies: selection.veggie.map(i => i._id),
      meat: selection.meat.map(i => i._id),
      details: {
          base: selection.base?.name,
          sauce: selection.sauce?.name,
          cheese: selection.cheese?.name,
          veggies: selection.veggie.map(i => i.name).join(', '),
          meat: selection.meat.map(i => i.name).join(', ')
      }
    };
    addToCart(customPizza);
    navigate('/cart');
  };

  if (loading) return <div className="builder-loading">Mastering Ingredients...</div>;

  const currentCategoryOptions = ingredients.filter(i => i.category === steps[currentStep].id);

  return (
    <div className="builder-page container">
      <div className="builder-container">
        <aside className="builder-summary">
          <div className="summary-card">
            <h3>Your Pizza</h3>
            <div className="summary-list">
              <div className="summary-item">
                <span>Base:</span> <strong>{selection.base?.name || '---'}</strong>
              </div>
              <div className="summary-item">
                <span>Sauce:</span> <strong>{selection.sauce?.name || '---'}</strong>
              </div>
              <div className="summary-item">
                <span>Cheese:</span> <strong>{selection.cheese?.name || '---'}</strong>
              </div>
              <div className="summary-item">
                <span>Veggies:</span> 
                <p>{selection.veggie.map(v => v.name).join(', ') || 'None'}</p>
              </div>
              <div className="summary-item">
                <span>Meat:</span> 
                <p>{selection.meat.map(m => m.name).join(', ') || 'None'}</p>
              </div>
            </div>
            <div className="summary-total">
               <span>Total Price:</span>
               <strong>₹{calculateTotal()}</strong>
            </div>
          </div>
        </aside>

        <main className="builder-main">
          <nav className="builder-steps">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`step-indicator ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              >
                <div className="step-num">
                  {index < currentStep ? <HiCheck /> : index + 1}
                </div>
                <span>{step.name}</span>
              </div>
            ))}
          </nav>

          <div className="builder-content">
            <header>
              <h2>{steps[currentStep].name}</h2>
              <p>Choose from our premium {steps[currentStep].id} options.</p>
            </header>

            <AnimatePresence mode="wait">
              <motion.div 
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="option-grid"
              >
                {currentCategoryOptions.map(option => {
                  const isSelected = steps[currentStep].id === 'veggie' || steps[currentStep].id === 'meat'
                    ? selection[steps[currentStep].id].some(i => i._id === option._id)
                    : selection[steps[currentStep].id]?._id === option._id;

                  return (
                    <div 
                      key={option._id} 
                      className={`option-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect(option)}
                    >
                      {option.image && <img src={option.image} alt={option.name} />}
                      <div className="option-info">
                        <strong>{option.name}</strong>
                        <span>+₹{option.price}</span>
                      </div>
                      {isSelected && <HiCheck className="check-icon" />}
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <div className="builder-footer">
              <button 
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
                className="btn-prev"
              >
                <HiArrowLeft /> Back
              </button>

              {currentStep < steps.length - 1 ? (
                <button 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={isNextDisabled()}
                  className="btn-next"
                >
                  Continue <HiArrowRight />
                </button>
              ) : (
                <button 
                  onClick={handleAddToCart}
                  className="btn-next finalize"
                >
                  Add to Cart <HiPlusCircle />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PizzaBuilder;
