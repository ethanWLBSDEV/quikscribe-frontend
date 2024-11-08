import express from 'express';
import mysql from 'mysql2';
import jwt from 'jsonwebtoken';

const adminRouter = express.Router();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'quikscribe-username',
  password: 'new_password',
  database: 'quikscribe'
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

// Update user type to admin
adminRouter.put('/users/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const updateQuery = 'UPDATE users SET type = ? WHERE id = ?';
  db.query(updateQuery, ['admin', id], (err, result) => {
    if (err) {
      console.error('Error updating user type:', err);
      return res.status(500).json({ message: 'Error updating user type' });
    }
    res.json({ message: 'User promoted to admin' });
  });
});

export default adminRouter;
