const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { 
  getUserNotifications, 
  markNotificationRead, 
  getUnreadCount 
} = require('../controllers/notificationController');

// Get user notifications (protected)
router.get('/', authMiddleware, getUserNotifications);

// Mark notification as read (protected)
router.put('/:notificationId/read', authMiddleware, markNotificationRead);

// Get unread notification count (protected)
router.get('/unread/count', authMiddleware, getUnreadCount);

module.exports = router;

