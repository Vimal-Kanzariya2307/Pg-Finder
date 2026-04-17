import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token)
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user)
      return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  const userRole = (req.user?.role || '').toLowerCase();
  const allowedRoles = roles.map(role => String(role).toLowerCase());
  if (!allowedRoles.includes(userRole))
    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
  next();
};
