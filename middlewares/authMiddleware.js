import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    console.log('Token from cookies:', token);
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return res.status(401).json({ message: 'Invalid token' });

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
};
