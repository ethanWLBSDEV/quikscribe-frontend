import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'; // Add the .js extension
import dotenv from 'dotenv';
import adminRouter from './routes/adminRouter.js';

dotenv.config({ path: '../.env' }); // Adjust the path based on the location of the .env file

const app = express();


app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/admin', adminRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
