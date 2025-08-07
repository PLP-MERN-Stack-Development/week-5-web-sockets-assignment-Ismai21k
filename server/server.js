// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./controllers/authController');
const messageController = require('./controllers/messageController');
const userController = require('./controllers/userController');
const authMiddleware = require('./middleware/auth');
const setupSocket = require('./socket');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and messages
const users = {};
const messages = [];
const typingUsers = {};

// API routes
const router = express.Router();

// Auth routes
router.post('/auth/register', authRoutes.registerUser);
router.post('/auth/login', authRoutes.loginUser);

// Message routes (protected)
router.get('/messages', authMiddleware, messageController.getMessages);
router.post('/messages', authMiddleware, messageController.sendMessage);
router.post('/messages/read', authMiddleware, messageController.markAsRead);

// User routes (protected)
router.get('/users', authMiddleware, userController.getUsers);

app.use('/api', router);

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Socket.io setup
setupSocket(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 