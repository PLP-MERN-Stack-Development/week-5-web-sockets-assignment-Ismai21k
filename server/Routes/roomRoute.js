const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { 
  getPublicRooms, 
  getUserRooms, 
  createRoom, 
  joinRoom, 
  leaveRoom, 
  getRoomDetails 
} = require('../controllers/roomController');

// Get all public rooms
router.get('/public', getPublicRooms);

// Get user's rooms (protected)
router.get('/user', authMiddleware, getUserRooms);

// Create a new room (protected)
router.post('/', authMiddleware, createRoom);

// Join a room (protected)
router.post('/:roomId/join', authMiddleware, joinRoom);

// Leave a room (protected)
router.post('/:roomId/leave', authMiddleware, leaveRoom);

// Get room details (protected)
router.get('/:roomId', authMiddleware, getRoomDetails);

module.exports = router;

