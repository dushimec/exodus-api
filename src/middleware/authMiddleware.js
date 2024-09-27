import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { promisify } from 'util';
import User from '../models/user.js';

dotenv.config();

const jwtVerifyAsync = promisify(jwt.verify);

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) throw new Error('Access denied. Token is missing.');

    const decodedToken = await jwtVerifyAsync(token.split(" ")[1], process.env.JWT_SECRET, { expiresIn: '1m' });
    console.log('Decoded Token:', decodedToken);
    const foundUser = await User.findById(decodedToken.userId);

    if (!foundUser) {
      throw new Error('User not found.');
    }

    req.user = {
      userId: decodedToken.userId,
      isAdmin: decodedToken.isAdmin,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Invalid token.' });
  }
};


export { authenticateToken};
