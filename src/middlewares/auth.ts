// Define the authenticator middleware
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
export const authenticator = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).send('Access denied.');
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    if (!decoded.userEmail) {
      return res.status(401).send('Access denied.');
    }
    req.userId = decoded.userId;
    req.userEmail = decoded.userEmail;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
