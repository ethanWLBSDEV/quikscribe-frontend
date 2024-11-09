import express from 'express';
import mysql from 'mysql2';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Adjust the path based on the location of the .env file

const adminRouter = express.Router();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Middleware to verify admin JWT
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || decoded.type !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    req.user = decoded;
    next();
  });
};

// Fetch all users
adminRouter.get('/users', authenticateAdmin, (req, res) => {
  const query = 'SELECT id, name, email, type FROM users';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Error fetching users' });
    }
    res.json(results);
  });
});

// Update user type
adminRouter.put('/users/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { type } = req.body;

  // Ensure admins cannot demote themselves or other admins
  const getUserQuery = 'SELECT * FROM users WHERE id = ?';
  db.query(getUserQuery, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetUser = results[0];
    if (targetUser.type === 'admin' && type !== 'admin') {
      return res.status(403).json({ message: 'Cannot demote other admins' });
    }
    if (targetUser.id === req.user.id) {
      return res.status(403).json({ message: 'Admins cannot demote themselves' });
    }

    const updateQuery = 'UPDATE users SET type = ? WHERE id = ?';
    db.query(updateQuery, [type, id], (err) => {
      if (err) {
        console.error('Error updating user type:', err);
        return res.status(500).json({ message: 'Error updating user type' });
      }
      res.json({ message: `User updated to ${type}` });
    });
  });
});


export default adminRouter;
