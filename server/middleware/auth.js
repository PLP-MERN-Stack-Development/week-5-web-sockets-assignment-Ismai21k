const { verifyToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader?.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    console.log('User authenticated:', req.user);
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
