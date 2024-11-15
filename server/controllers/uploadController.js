import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../utils/awsClient.js';

export const uploadToS3 = async (req, res) => {
  console.log('Received file:', req.file); // Log the file object
  try {
    const file = req.file;
    const fileStream = file.buffer; // File buffer

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `Queue/${file.originalname}`,
      Body: fileStream,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    res.status(200).json({ message: 'File uploaded successfully!' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};
