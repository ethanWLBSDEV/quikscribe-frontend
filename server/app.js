import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';
import adminRouter from './routes/adminRouter.js';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { EC2Client, StartInstancesCommand, StopInstancesCommand } from '@aws-sdk/client-ec2';
import uploadRoutes from './routes/uploadRoutes.js';

// Load environment variables from .env file
dotenv.config({ path: '../.env' });

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

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/admin', adminRouter);
app.use('/api', uploadRoutes);

const PORT = process.env.PORT || 5000;

console.log('Bucket name:', process.env.AWS_BUCKET_NAME);
console.log('EC2 instance ID:', process.env.EC2_INSTANCE_ID);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Function to check if the Queue folder has items
const checkQueue = async () => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: 'Queue/',
    };

    const command = new ListObjectsV2Command(params);
    const data = await s3Client.send(command);

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

// Functions to control EC2 instance
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
let isMonitoring = false;
const monitorQueueAndControlEC2 = async () => {
  if (isMonitoring) return;
  isMonitoring = true;

  try {
    const hasItemsInQueue = await checkQueue();
    if (hasItemsInQueue) {
      await startEC2Instance();
    } else {
      await stopEC2Instance();
    }
  } catch (error) {
    console.error("Error in monitoring EC2 and Queue:", error);
  } finally {
    isMonitoring = false;
  }
};

// Call the monitoring function periodically
monitorQueueAndControlEC2();
setInterval(monitorQueueAndControlEC2, 60000);

app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});
