const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3001;

// Database file path for Railway
const DB_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH 
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'database.json')
  : path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Database utilities
class Database {
  constructor() {
    this.data = {
      users: [],
      products: [],
      orders: [],
      cart: [],
      categories: [
        { id: "books", name: "Books", description: "Textbooks and academic materials" },
        { id: "electronics", name: "Electronics", description: "Gadgets and electronic devices" },
        { id: "fashion", name: "Fashion", description: "Clothing and accessories" },
        { id: "stationery", name: "Stationery", description: "Office and school supplies" },
        { id: "furniture", name: "Furniture", description: "Room and study furniture" },
        { id: "services", name: "Services", description: "Student services" }
      ],
      food: [],
      rooms: []
    };
    this.init();
  }

  async init() {
    try {
      const data = await fs.readFile(DB_PATH, 'utf8');
      this.data = { ...this.data, ...JSON.parse(data) };
      console.log('Database loaded from:', DB_PATH);
    } catch (error) {
      console.log('Creating new database at:', DB_PATH);
      await this.save();
    }
  }

  async save() {
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Database save error:', error);
    }
  }

  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

const db = new Database();

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // Simple token validation (in production, use proper JWT)
  const user = db.data.users.find(u => u.token === token);
  if (!user) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  req.user = user;
  next();
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    
    if (db.data.users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = {
      id: db.generateId(),
      username,
      email,
      phone,
      password, // In production, hash this
      token: db.generateId(),
      createdAt: new Date().toISOString()
    };

    db.data.users.push(user);
    await db.save();

    res.json({ user: { ...user, password: undefined }, token: user.token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.data.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ user: { ...user, password: undefined }, token: user.token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Products routes
app.get('/api/products', (req, res) => {
  try {
    const { category, search, featured, sort, limit = 20, page = 1 } = req.query;
    let products = [...db.data.products];

    if (category) {
      products = products.filter(p => p.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    if (featured === 'true') {
      products = products.filter(p => p.featured);
    }

    if (sort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedProducts = products.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      products: paginatedProducts,
      total: products.length,
      page: parseInt(page),
      totalPages: Math.ceil(products.length / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.data.products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const product = {
      id: db.generateId(),
      ...req.body,
      sellerId: req.user.id,
      sellerUsername: req.user.username,
      sellerPhone: req.user.phone,
      createdAt: new Date().toISOString()
    };

    db.data.products.push(product);
    await db.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cart routes
app.get('/api/cart', authenticateToken, (req, res) => {
  try {
    const userCart = db.data.cart.filter(item => item.userId === req.user.id);
    const total = userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      items: userCart,
      itemCount: userCart.reduce((sum, item) => sum + item.quantity, 0),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = db.data.products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingItem = db.data.cart.find(item => 
      item.userId === req.user.id && item.productId === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const cartItem = {
        id: db.generateId(),
        userId: req.user.id,
        productId,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity,
        sellerUsername: product.sellerUsername,
        sellerPhone: product.sellerPhone,
        type: product.type || 'product',
        createdAt: new Date().toISOString()
      };
      db.data.cart.push(cartItem);
    }

    await db.save();
    res.json({ message: 'Item added to cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/cart/:itemId', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = db.data.cart.find(item => 
      item.id === req.params.itemId && item.userId === req.user.id
    );

    if (!item) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    item.quantity = quantity;
    await db.save();

    res.json({ message: 'Cart updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cart/:itemId', authenticateToken, async (req, res) => {
  try {
    const index = db.data.cart.findIndex(item => 
      item.id === req.params.itemId && item.userId === req.user.id
    );

    if (index === -1) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    db.data.cart.splice(index, 1);
    await db.save();

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Orders routes
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { deliveryAddress } = req.body;
    const userCart = db.data.cart.filter(item => item.userId === req.user.id);
    
    if (userCart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const order = {
      id: db.generateId(),
      orderId: `CM${Date.now()}`,
      userId: req.user.id,
      items: userCart,
      totalAmount: userCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      deliveryAddress,
      status: 'pending',
      paymentMethod: 'pay_on_delivery',
      createdAt: new Date().toISOString()
    };

    db.data.orders.push(order);
    
    // Clear user's cart
    db.data.cart = db.data.cart.filter(item => item.userId !== req.user.id);
    
    await db.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', authenticateToken, (req, res) => {
  try {
    const userOrders = db.data.orders.filter(order => order.userId === req.user.id);
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categories routes
app.get('/api/categories', (req, res) => {
  res.json(db.data.categories);
});

// Food routes
app.get('/api/food', (req, res) => {
  try {
    const { search, limit = 20 } = req.query;
    let food = [...db.data.food];

    if (search) {
      const searchLower = search.toLowerCase();
      food = food.filter(f => 
        f.name.toLowerCase().includes(searchLower) ||
        f.description.toLowerCase().includes(searchLower)
      );
    }

    res.json(food.slice(0, parseInt(limit)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/food', authenticateToken, async (req, res) => {
  try {
    const foodItem = {
      id: db.generateId(),
      ...req.body,
      sellerId: req.user.id,
      sellerUsername: req.user.username,
      sellerPhone: req.user.phone,
      createdAt: new Date().toISOString()
    };

    db.data.food.push(foodItem);
    await db.save();

    res.status(201).json(foodItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rooms routes
app.get('/api/rooms', (req, res) => {
  try {
    const { search, limit = 20 } = req.query;
    let rooms = [...db.data.rooms];

    if (search) {
      const searchLower = search.toLowerCase();
      rooms = rooms.filter(r => 
        r.title.toLowerCase().includes(searchLower) ||
        r.location.toLowerCase().includes(searchLower)
      );
    }

    res.json(rooms.slice(0, parseInt(limit)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rooms', authenticateToken, async (req, res) => {
  try {
    const room = {
      id: db.generateId(),
      ...req.body,
      ownerId: req.user.id,
      ownerUsername: req.user.username,
      ownerPhone: req.user.phone,
      createdAt: new Date().toISOString()
    };

    db.data.rooms.push(room);
    await db.save();

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Users routes
app.get('/api/users/me', authenticateToken, (req, res) => {
  res.json({ ...req.user, password: undefined });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CampusMart server running on port ${PORT}`);
  console.log(`📊 Database: ${DB_PATH}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});