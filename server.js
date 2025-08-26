const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory storage for items (in a real app, you'd use a database)
let items = [
  { id: 1, name: 'Item 1', description: 'First item' },
  { id: 2, name: 'Item 2', description: 'Second item' }
];

// GET /items - Retrieve all items
app.get('/items', (req, res) => {
  try {
    res.json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve items'
    });
  }
});

// POST /items - Create a new item
app.post('/items', (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }
    
    // Create new item
    const newItem = {
      id: items.length + 1,
      name,
      description: description || ''
    };
    
    items.push(newItem);
    
    res.status(201).json({
      success: true,
      data: newItem,
      message: 'Item created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create item'
    });
  }
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Simple REST API',
    endpoints: {
      'GET /items': 'Retrieve all items',
      'POST /items': 'Create a new item'
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /items - Retrieve all items');
  console.log('  POST /items - Create a new item');
});