const express = require('express');
const route = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');


// Register route
route.post('/register', registerUser);


// Login route
route.post('/login', loginUser);


module.exports = route;

