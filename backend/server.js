const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize database
const { testConnection, syncDatabase } = require('./config/database');
const { syncDatabase: syncModels } = require('./models');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json({ extended: false }));
app.use(cors());
app.use(morgan('dev')); // Logging

// Health check endpoint for CLI
app.get('/', (req, res) => {
  res.json({ 
    status: 'online',
    version: '0.1.0',
    message: 'Chess Coach API is running'
  });
});

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/games', require('./routes/api/games'));
app.use('/api/lessons', require('./routes/api/lessons'));
app.use('/api/profiles', require('./routes/api/profiles'));
app.use('/api/chat', require('./routes/api/chat'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('frontend/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// Define PORT
const PORT = process.env.PORT || 5000;

// Initialize database connection and sync models
const initializeDatabase = async () => {
  try {
    await testConnection();
    await syncModels();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    console.log('Database connected and models synchronized');
  });
};

startServer();
