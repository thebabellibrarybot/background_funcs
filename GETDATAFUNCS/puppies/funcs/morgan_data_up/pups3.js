const AWS = require('aws-sdk');
const axios = require('axios');
AWS.config.update({ region: 'us-east-1' }); 
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });
const sharp = require('sharp');

// s3 config
const accessKeyId = 'your_access_key_id';
const secretAccessKey = 'your_secret_access_key';
AWS.config.credentials = new AWS.Credentials({ accessKeyId, secretAccessKey });
// mongo config



async function uploadToS3(imageUrl, imageName) {

  const s3Key = imageName.replace('+', '_').replace(',','_').replace(' ', '_');
  const s3Bucket = 'thisthatbukfornola';
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  const metadata = await sharp(buffer).metadata();
  const { width, height, format } = metadata;

  
  const params = {
    Bucket: s3Bucket,
    Key: s3Key,
    Body: data,
    ACL: 'public-read',
    ContentType: format
  };

  const s3UploadResponse = await s3.upload(params).promise();

  return {
    s3Key: s3Key,
    s3Bucket: s3Bucket,
    s3Url: s3UploadResponse.Location,
    width: width,
    heigh: height,
    fileType: format
  };
};




async function uploadToMongo(tombInfo, pageInfo) {

  const tombParam = {
    book_title: tombInfo.tombName,
    language: tombInfo.language,
    date: tombInfo.date,
    location: tombInfo.location,
    current_lib: 'Morgan Library',
    digitization: 'Fascimilie',
    font: tombInfo.font,
    detail: tombInfo.title,
    num_pages: pageInfo.length
  };
  // upload tomb to mongoDB
  // return tomb ID
};