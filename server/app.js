import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';
import adminRouter from './routes/adminRouter.js';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { EC2Client, StartInstancesCommand, StopInstancesCommand } from '@aws-sdk/client-ec2';
import uploadRoutes from './routes/uploadRoutes.js';
import multer from 'multer';

// Load environment variables from .env file
dotenv.config({ path: '../.env' }); // Adjust path if necessary

const app = express();

// Set up AWS SDK clients
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ec2Client = new EC2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Middleware and routes
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/admin', adminRouter);
app.use('/api', uploadRoutes); // Ensure this matches your frontend request

const PORT = process.env.PORT || 5000;

console.log('Bucket name:', process.env.AWS_BUCKET_NAME);  // Logs the bucket name
console.log('EC2 instance ID:', process.env.EC2_INSTANCE_ID);  // Logs the EC2 instance ID

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Function to check if the Queue folder has items
const checkQueue = async () => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: 'Queue/', // Looking inside the Queue folder
    };

    const command = new ListObjectsV2Command(params);
    const data = await s3Client.send(command);
    console.log('S3 Response:', data);  // Logs the full response from S3

    // Filter for items that are actual files (size > 0)
    const validItems = data.Contents?.filter(item => item.Size > 0);

    if (validItems && validItems.length > 0) {
      console.log(`Found ${validItems.length} valid item(s) in the Queue folder.`);
      return true;
    } else {
      console.log("No valid items found in the Queue folder.");
      return false;
    }
  } catch (error) {
    console.error("Error checking Queue folder:", error);
    return false;
  }
};

// Function to start EC2 instance
const startEC2Instance = async () => {
  const params = { InstanceIds: [process.env.EC2_INSTANCE_ID] };
  const command = new StartInstancesCommand(params);
  try {
    await ec2Client.send(command);
    console.log("EC2 instance started.");
  } catch (error) {
    console.error("Error starting EC2 instance:", error);
  }
};

// Function to stop EC2 instance
const stopEC2Instance = async () => {
  const params = { InstanceIds: [process.env.EC2_INSTANCE_ID] };
  const command = new StopInstancesCommand(params);
  try {
    await ec2Client.send(command);
    console.log("EC2 instance stopped.");
  } catch (error) {
    console.error("Error stopping EC2 instance:", error);
  }
};

// Monitor the Queue folder and control the EC2 instance
const monitorQueueAndControlEC2 = async () => {
  const hasItemsInQueue = await checkQueue();

  if (hasItemsInQueue) {
    // If there are items in the Queue, ensure EC2 is running
    await startEC2Instance();
  } else {
    // If no items in the Queue, stop EC2 instance
    await stopEC2Instance();
  }
};

// Call the monitoring function (it can run periodically with setInterval)
monitorQueueAndControlEC2();

// Set an interval to monitor the Queue folder every 60 seconds
setInterval(monitorQueueAndControlEC2, 60000); // Check every 60 seconds
