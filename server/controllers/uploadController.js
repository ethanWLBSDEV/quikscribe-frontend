import { PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client } from '../utils/awsClient.js';

export const uploadToS3 = async (req, res) => {
  try {
    const file = req.file;
    const fileStream = file.buffer;

    // Check existing files in the Queue folder
    const listParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: 'Queue/',
    };
    const listCommand = new ListObjectsV2Command(listParams);
    const listData = await s3Client.send(listCommand);

    // Calculate the queue number
    const validItems = listData.Contents?.filter(item => item.Size > 0) || [];
    const queueNumber = validItems.length + 1;

    // Upload the file with the calculated queue number
    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `Queue/${file.originalname}`,
      Body: fileStream,
      ContentType: file.mimetype,
      Metadata: {
        'queue-number': queueNumber.toString(),
      },
    };
    const uploadCommand = new PutObjectCommand(uploadParams);
    await s3Client.send(uploadCommand);

    res.status(200).json({ message: `File uploaded successfully with queue number ${queueNumber}!` });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};
