import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }
  try {
    const token = authHeader.split(' ')[1];
    console.log('Verifying token:', token.substring(0, 10) + '...');
    const decoded = jwt.verify(token, env.jwtAccessSecret);
    console.log('Token decoded:', decoded);
    req.user = await User.findById(decoded.sub).select('-password');
    if (!req.user) {
      console.log('User not found for token sub:', decoded.sub);
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.log('User authenticated:', req.user.email);
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

