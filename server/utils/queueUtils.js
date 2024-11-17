import { ListObjectsV2Command, HeadObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './awsClient.js';

export const listFilesWithMetadata = async (bucketName, prefix) => {
  try {
    // List all objects in the queue folder
    const listParams = { Bucket: bucketName, Prefix: prefix };
    const listCommand = new ListObjectsV2Command(listParams);
    const listData = await s3Client.send(listCommand);

    const files = listData.Contents?.filter(item => item.Size > 0) || [];

    // Fetch metadata for each file and include queueNumber if available
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const headParams = { Bucket: bucketName, Key: file.Key };
        try {
          const headCommand = new HeadObjectCommand(headParams);
          const metadata = await s3Client.send(headCommand);
          return {
            fileName: file.Key.split('/').pop(),
            queueNumber: metadata.Metadata['queue-number'] || 'Unknown',
            fileKey: file.Key,
          };
        } catch {
          return { fileName: file.Key.split('/').pop(), queueNumber: 'Unknown', fileKey: file.Key };
        }
      })
    );

    // Sort files by current queue number
    fileDetails.sort((a, b) => parseInt(a.queueNumber) - parseInt(b.queueNumber));

    // Reassign queue numbers starting from 1
    let newQueueNumber = 1;
    for (const file of fileDetails) {
      // Update metadata in S3
      const copyParams = {
        Bucket: bucketName,
        CopySource: `${bucketName}/${file.fileKey}`,
        Key: file.fileKey,
        MetadataDirective: 'REPLACE', // Tell S3 to replace metadata
        Metadata: {
          'queue-number': newQueueNumber.toString(),
        },
      };

      // Copy the object with the new metadata
      await s3Client.send(new CopyObjectCommand(copyParams));

      // Increment queue number for the next file
      newQueueNumber++;
    }

    return fileDetails; // Return the updated list with new queue numbers
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error('Failed to list files');
  }
};
