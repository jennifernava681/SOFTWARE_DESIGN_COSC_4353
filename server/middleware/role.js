module.exports = function restrictTo(...roles) {
  return (req, res, next) => {
    console.log('=== ROLE MIDDLEWARE DEBUG ===');
    console.log('User object:', req.user);
    console.log('User role:', req.user?.role);
    console.log('Required roles:', roles);
    console.log('User role included in required roles:', roles.includes(req.user?.role));
    
    if (!roles.includes(req.user?.role)) {
      console.log('Access denied - user role not in required roles');
      return res.status(403).json({ message: 'Access denied. Insufficient role.' });
    }
    console.log('Role check passed');
    next();
  };
};