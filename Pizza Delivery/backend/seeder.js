const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { db } = require('./config/firebase');

dotenv.config();

const ingredientsData = [
  // Bases
  { name: 'Thin Crust', category: 'base', price: 50, stock: 100, threshold: 20 },
  { name: 'Thick Crust', category: 'base', price: 60, stock: 100, threshold: 20 },
  { name: 'Cheese Burst', category: 'base', price: 100, stock: 100, threshold: 20 },
  { name: 'Whole Wheat', category: 'base', price: 70, stock: 100, threshold: 20 },
  
  // Sauces
  { name: 'Classic Tomato', category: 'sauce', price: 20, stock: 100, threshold: 20 },
  { name: 'Spicy Arrabbiata', category: 'sauce', price: 25, stock: 100, threshold: 20 },
  { name: 'Pesto', category: 'sauce', price: 30, stock: 100, threshold: 20 },
  { name: 'Barbecue', category: 'sauce', price: 30, stock: 100, threshold: 20 },
  
  // Cheese
  { name: 'Mozzarella', category: 'cheese', price: 40, stock: 100, threshold: 20 },
  { name: 'Cheddar', category: 'cheese', price: 45, stock: 100, threshold: 20 },
  { name: 'Parmesan', category: 'cheese', price: 50, stock: 100, threshold: 20 },
  { name: 'Vegan Cheese', category: 'cheese', price: 60, stock: 100, threshold: 20 },
  
  // Veggies
  { name: 'Onion', category: 'veggie', price: 15, stock: 100, threshold: 20 },
  { name: 'Capsicum', category: 'veggie', price: 15, stock: 100, threshold: 20 },
  { name: 'Mushroom', category: 'veggie', price: 25, stock: 100, threshold: 20 },
  { name: 'Jalapeño', category: 'veggie', price: 20, stock: 100, threshold: 20 },
  { name: 'Black Olives', category: 'veggie', price: 25, stock: 100, threshold: 20 },
  { name: 'Sweet Corn', category: 'veggie', price: 20, stock: 100, threshold: 20 },
  { name: 'Paneer', category: 'veggie', price: 40, stock: 100, threshold: 20 },
  
  // Meats
  { name: 'Grilled Chicken', category: 'meat', price: 60, stock: 100, threshold: 20 },
  { name: 'Pepperoni', category: 'meat', price: 70, stock: 100, threshold: 20 },
  { name: 'Smoked Sausage', category: 'meat', price: 65, stock: 100, threshold: 20 }
];

const seedData = async () => {
  try {
    console.log('Starting Firebase Seeding...');
    
    // Cleanup collections
    const collections = ['users', 'ingredients', 'pizzas', 'orders'];
    for (const coll of collections) {
      const snapshot = await db.collection(coll).get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      console.log(`Cleaned collection: ${coll}`);
    }

    // Seed Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminRef = await db.collection('users').add({
      name: 'Admin User',
      email: 'admin@pizzapro.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      createdAt: new Date().toISOString()
    });
    console.log('Admin seeded');

    // Seed Ingredients
    const ingredients = [];
    for (const data of ingredientsData) {
      const ref = await db.collection('ingredients').add(data);
      ingredients.push({ id: ref.id, ...data });
    }
    console.log('Ingredients seeded');
    
    const findIngId = (name) => ingredients.find(i => i.name === name).id;

    // Seed Pizzas
    const pizzasData = [
      {
        name: 'Margherita Plus',
        description: 'Classic delight with double mozzarella cheese and fresh basil.',
        price: 299,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=800&auto=format&fit=crop',
        tags: ['Veg', 'Bestseller'],
        ingredients: [findIngId('Thin Crust'), findIngId('Classic Tomato'), findIngId('Mozzarella')]
      },
      {
        name: 'Pepperoni Feast',
        description: 'The ultimate classic! Loaded with premium pepperoni and extra mozzarella.',
        price: 499,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop',
        tags: ['Non-Veg', 'Classic'],
        ingredients: [findIngId('Thick Crust'), findIngId('Classic Tomato'), findIngId('Mozzarella'), findIngId('Pepperoni')]
      },
      {
        name: 'Veggie Supreme',
        description: 'A colorful blend of mushrooms, capsicum, onions, and sweet corn.',
        price: 399,
        image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?q=80&w=800&auto=format&fit=crop',
        tags: ['Veg', 'Popular'],
        ingredients: [findIngId('Thin Crust'), findIngId('Classic Tomato'), findIngId('Mozzarella'), findIngId('Mushroom'), findIngId('Capsicum'), findIngId('Onion'), findIngId('Sweet Corn')]
      }
    ];

    for (const p of pizzasData) {
      await db.collection('pizzas').add(p);
    }

    console.log('Data Imported successfully to Firestore');
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
