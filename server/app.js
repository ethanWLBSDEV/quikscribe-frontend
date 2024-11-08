import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'; // Add the .js extension
import dotenv from 'dotenv';
import adminRouter from './routes/adminRouter.js';

dotenv.config();

const app = express();

// Log the environment variables to verify they are loaded correctly
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '****' : 'Not set');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '****' : 'Not set');

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/admin', adminRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
