const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getMessages, sendMessage, markAsRead } = require('../controllers/messageController');
// Get messages for a room or between two users

router.get('/messages', getMessages);
router.post('/messages', sendMessage);
router.post('/messages/read', markAsRead)

module.exports = router;