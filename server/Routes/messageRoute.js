const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getMessages, sendMessage, markAsRead } = require('../controllers/messageController');

// Get messages for a room or between two users
router.get('/', authMiddleware, getMessages);

// Send a message
router.post('/', authMiddleware, sendMessage);

// Mark message as read
router.post('/read', authMiddleware, markAsRead);

module.exports = router;