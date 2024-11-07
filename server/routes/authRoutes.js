import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2';

const router = express.Router();

// Set up database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'quikscribe-username',
  password: 'new_password',
  database: 'quikscribe'
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
      password VARCHAR(255) NOT NULL
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
    console.log('Signup request received:', { name, email, password });
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed:', hashedPassword);
  
      const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      db.query(query, [name, email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error registering user:', err);
          return res.status(500).json({ message: 'Error registering user' });
        }
        console.log('User registered successfully:', result);
        res.status(201).json({ message: 'User registered successfully' });
      });
    } catch (error) {
      console.error('Error during signup process:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

// Signin route
router.post('/signin', (req, res) => {
    const { email, password } = req.body;  // Use email instead of username
    console.log('Signin request received:', { email, password });
    
    const query = 'SELECT * FROM users WHERE email = ?';  // Use email in the query
    db.query(query, [email], async (err, results) => {  // Pass email here
      if (err || results.length === 0) {
        console.error('Invalid credentials or error during query:', err);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const user = results[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        console.log('Invalid password for user:', email);  // Log using email
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log('Token generated for user:', email);  // Log using email
      res.json({ token });
    });
  });
  

export default router;
