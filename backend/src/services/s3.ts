import AWS from 'aws-sdk';

const s3Bucket = process.env.S3_BUCKET_NAME || 'blueprint-advisor-docs';
const s3Region = process.env.AWS_REGION || 'us-east-1';

// Setup S3 Client config
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: s3Region,
  signatureVersion: 'v4'
});

export const getUploadPresignedUrl = async (key: string, fileType: string): Promise<{ url: string; uploadKey: string }> => {
  const params = {
    Bucket: s3Bucket,
    Key: key,
    Expires: 600, // 10 minutes
    ContentType: fileType,
    ACL: 'private'
  };

  try {
    // Mock URL for local test
    if (!process.env.AWS_ACCESS_KEY_ID) {
      return {
        url: `http://localhost:5000/mock-upload/${key}`,
        uploadKey: key
      };
    }

    const url = await s3.getSignedUrlPromise('putObject', params);
    return { url, uploadKey: key };
  } catch (error) {
    console.error('Failed to generate upload signed URL:', error);
    throw new Error('Storage provider upload setup failed.');
  }
};

export const getDownloadPresignedUrl = async (key: string): Promise<string> => {
  const params = {
    Bucket: s3Bucket,
    Key: key,
    Expires: 3600 // 1 hour
  };

  try {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      return `http://localhost:5000/mock-download/${key}`;
    }

    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    console.error('Failed to generate download signed URL:', error);
    throw new Error('Storage provider download retrieval failed.');
  }
};

export const deleteS3Object = async (key: string): Promise<void> => {
  const params = {
    Bucket: s3Bucket,
    Key: key
  };

  try {
    if (!process.env.AWS_ACCESS_KEY_ID) {
      console.log(`[Mock Storage] Deleted object with key: ${key}`);
      return;
    }

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Failed to delete S3 object:', error);
    throw new Error('Storage provider object deletion failed.');
  }
};
