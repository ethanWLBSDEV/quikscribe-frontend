import { listFilesWithMetadata } from '../utils/queueUtils.js';

export const listQueueFiles = async (req, res) => {
  try {
    // List and update files with new queue numbers
    const fileDetails = await listFilesWithMetadata(process.env.AWS_BUCKET_NAME, 'Queue/');
    
    // Send the updated list with new queue numbers
    res.status(200).json({ files: fileDetails });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list queue files' });
  }
};
