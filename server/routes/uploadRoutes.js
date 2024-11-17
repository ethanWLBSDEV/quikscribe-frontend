import express from 'express';
import multer from 'multer';
import { uploadToS3 } from '../controllers/uploadController.js';
import { listQueueFiles } from '../controllers/queueController.js';
import authenticateToken from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route for uploading files
router.post('/upload', authenticateToken, upload.single('file'), uploadToS3);

// Route for listing files in the Queue
router.get('/list', listQueueFiles);

export default router;
