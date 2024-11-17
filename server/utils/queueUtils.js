import { ListObjectsV2Command, HeadObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './awsClient.js';

export const listFilesWithMetadata = async (bucketName, prefix) => {
  try {
    // List all objects in the specified folder
    const listParams = { Bucket: bucketName, Prefix: prefix };
    const listCommand = new ListObjectsV2Command(listParams);
    const listData = await s3Client.send(listCommand);

    const files = listData.Contents?.filter(item => item.Size > 0) || [];

    // Fetch metadata for each file and include queueNumber and email (uploaded-by) if available
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const headParams = { Bucket: bucketName, Key: file.Key };
        try {
          const headCommand = new HeadObjectCommand(headParams);
          const metadata = await s3Client.send(headCommand);

          return {
            fileName: file.Key.split('/').pop(),
            queueNumber: metadata.Metadata['queue-number'] || 'Unknown',
            uploadedBy: metadata.Metadata['uploaded-by'] || 'Unknown', // Case-sensitive key
            fileKey: file.Key,
          };
        } catch (err) {
          console.error(`Failed to retrieve metadata for file: ${file.Key}`, err);
          return {
            fileName: file.Key.split('/').pop(),
            queueNumber: 'Unknown',
            uploadedBy: 'Unknown',
            fileKey: file.Key,
          };
        }
      })
    );

    // Sort files by current queue number
    fileDetails.sort((a, b) => parseInt(a.queueNumber) - parseInt(b.queueNumber) || 0);

    // Reassign queue numbers starting from 1
    let newQueueNumber = 1;
    for (const file of fileDetails) {
      try {
        const copyParams = {
          Bucket: bucketName,
          CopySource: `${bucketName}/${file.fileKey}`,
          Key: file.fileKey,
          MetadataDirective: 'REPLACE',
          Metadata: {
            'queue-number': newQueueNumber.toString(),
            'uploaded-by': file.uploadedBy, // Use consistent metadata key
          },
        };

        // Copy the object with the new metadata
        await s3Client.send(new CopyObjectCommand(copyParams));

        // Update local queue number
        file.queueNumber = newQueueNumber.toString();
        newQueueNumber++;
      } catch (err) {
        console.error(`Failed to update metadata for file: ${file.fileKey}`, err);
      }
    }

    return fileDetails; // Return the updated list with new queue numbers
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error('Failed to list files');
  }
};
