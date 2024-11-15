import express from 'express';
import multer from 'multer';
import { uploadToS3 } from '../controllers/uploadController.js'; // Controller for S3 upload

const router = express.Router();

// Set up multer storage (in-memory for this case)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to handle file upload to S3
router.post('/upload', upload.single('file'), uploadToS3);

export default router;
