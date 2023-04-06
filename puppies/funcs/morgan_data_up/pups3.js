const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' }); // replace with your region
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const accessKeyId = 'your_access_key_id';
const secretAccessKey = 'your_secret_access_key';

AWS.config.credentials = new AWS.Credentials({ accessKeyId, secretAccessKey });

async function uploadToS3(imageUrl, imageName) {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const data = Buffer.from(response.data, 'binary');
  
    const params = {
      Bucket: 'your_bucket_name',
      Key: imageName,
      Body: data,
      ACL: 'public-read',
      ContentType: 'image/jpeg' // replace with the correct MIME type for your images
    };
  
    const result = await s3.upload(params).promise();
    const s3Url = result.Location;
    const s3Key = result.Key;
    const s3Bucket = result.Bucket;
  
    return { s3Url, s3Key, s3Bucket };
  };


