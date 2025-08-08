const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getUsers, setUserOnlineStatus } = require('../controllers/userController');


// Get all users except the currently logged-in user
router.get('/users', getUsers);
router.post('/users/online',setUserOnlineStatus)

module.exports = router;
