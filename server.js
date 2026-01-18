const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_SERVICE_URL = process.env.DATA_SERVICE_URL || 'http://localhost:3001';

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'microservice-one' });
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Microservice One (API Gateway)',
    endpoints: [
      'GET /health',
      'GET /api/users',
      'GET /api/users/:id',
      'POST /api/users',
      'PUT /api/users/:id',
      'DELETE /api/users/:id',
      'GET /api/users/:id/profile'
    ]
  });
});

// Get all users from microservice-two
app.get('/api/users', async (req, res) => {
  try {
    const response = await axios.get(`${DATA_SERVICE_URL}/api/users`);
    res.json({
      success: true,
      data: response.data.data,
      message: 'Users retrieved from data service'
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users from data service',
      error: error.message
    });
  }
});

// Get user by ID from microservice-two
app.get('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.get(`${DATA_SERVICE_URL}/api/users/${req.params.id}`);
    res.json({
      success: true,
      data: response.data.data,
      message: 'User retrieved from data service'
    });
  } catch (error) {
    console.error('Error fetching user:', error.message);
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({
      success: false,
      message: 'Failed to fetch user from data service',
      error: error.message
    });
  }
});

// Create user via microservice-two
app.post('/api/users', async (req, res) => {
  try {
    const response = await axios.post(`${DATA_SERVICE_URL}/api/users`, req.body);
    res.status(201).json({
      success: true,
      data: response.data.data,
      message: 'User created via data service'
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({
      success: false,
      message: 'Failed to create user via data service',
      error: error.message
    });
  }
});

// Update user via microservice-two
app.put('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.put(`${DATA_SERVICE_URL}/api/users/${req.params.id}`, req.body);
    res.json({
      success: true,
      data: response.data.data,
      message: 'User updated via data service'
    });
  } catch (error) {
    console.error('Error updating user:', error.message);
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({
      success: false,
      message: 'Failed to update user via data service',
      error: error.message
    });
  }
});

// Delete user via microservice-two
app.delete('/api/users/:id', async (req, res) => {
  try {
    const response = await axios.delete(`${DATA_SERVICE_URL}/api/users/${req.params.id}`);
    res.json({
      success: true,
      message: 'User deleted via data service'
    });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({
      success: false,
      message: 'Failed to delete user via data service',
      error: error.message
    });
  }
});

// Enhanced endpoint - Get user profile with additional processing
app.get('/api/users/:id/profile', async (req, res) => {
  try {
    const response = await axios.get(`${DATA_SERVICE_URL}/api/users/${req.params.id}`);
    const user = response.data.data;
    
    // Add some processing (gateway-level logic)
    const profile = {
      ...user,
      displayName: user.name.toUpperCase(),
      emailDomain: user.email.split('@')[1],
      isAdmin: user.role === 'admin',
      profileUrl: `/api/users/${user.id}/profile`,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: profile,
      message: 'Enhanced profile generated'
    });
  } catch (error) {
    console.error('Error generating profile:', error.message);
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({
      success: false,
      message: 'Failed to generate user profile',
      error: error.message
    });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Microservice One (API Gateway) running on port ${PORT}`);
  console.log(`Connecting to Data Service at: ${DATA_SERVICE_URL}`);
});

module.exports = { app, server };
