// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const authRoute = require('./Routes/authRoute');
const messageRoute = require('./Routes/messageRoute');
const userRoute = require('./Routes/userRoute');
const roomRoute = require('./Routes/roomRoute');
const notificationRoute = require('./Routes/notificationRoute');
const setupSocket = require('./socket');
const { setIO } = require('./controllers/roomController')

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
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // For file uploads
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/auth', authRoute);
app.use('/api/messages', messageRoute);
app.use('/api/users', userRoute);
app.use('/api/rooms', roomRoute);
app.use('/api/notifications', notificationRoute);

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Socket.io setup
setupSocket(io);
setIO(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

module.exports = { app, server, io }; 