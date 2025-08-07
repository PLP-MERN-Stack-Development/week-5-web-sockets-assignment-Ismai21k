const User = require('../models/user');

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'username email online');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// Update user online status
const setUserOnlineStatus = async (userId, online) => {
  try {
    await User.findByIdAndUpdate(userId, { online });
  } catch (error) {
    console.error('Failed to update user online status:', error.message);
  }
};

module.exports = { getUsers, setUserOnlineStatus };
