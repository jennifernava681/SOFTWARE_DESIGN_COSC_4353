const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  console.log('=== AUTH MIDDLEWARE DEBUG ===');
  console.log('Token:', token ? token.substring(0, 20) + '...' : 'No token');
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('JWT verification error:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    console.log('JWT decoded user:', user);
    req.user = user;
    next();
  });
}; 