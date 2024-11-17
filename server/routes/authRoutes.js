import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Adjust the path based on the location of the .env file

const router = express.Router();

// Set up database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
  console.log('Connected to MySQL database');

  // Automatically create the users table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      type ENUM('admin', 'customer', 'free', 'pro', 'company') DEFAULT 'customer'
    );
  `;
  
  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Users table checked/created successfully');
    }
  });
});

// Signup route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // Check if the email already exists
  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], async (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(insertQuery, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ message: 'Error signing up. Please try again.' });
      }

      // Respond with success
      res.status(201).json({ success: true, message: 'User signed up successfully' });
    });
  });
});

// Signin route for both admins and customers
router.post('/signin', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      console.error('Invalid credentials or error during query:', err);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, type: user.type, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Set a new token expiration
    );
    console.log('Generated token:', token); // Log the generated token
    res.json({ token, type: user.type });
  });
});





export default router;
