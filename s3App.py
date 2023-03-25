import boto3
import json

s3 = boto3.resource('s3')
bucket_name = 'your-bucket-name'

bucket = s3.Bucket(bucket_name)

items = []

for obj in bucket.objects.all():
    file_type = obj.key.split('.')[-1]
    original_filename = obj.key.split('/')[-1]
    s3_key = obj.key
    s3_url = f'https://{bucket_name}.s3.amazonaws.com/{s3_key}'

    item = {
        'fileType': file_type,
        'originalFilename': original_filename,
        'bucket': bucket_name,
        's3_key': s3_key,
        's3_url': s3_url
    }

    items.append(item)

with open('items.json', 'w') as f:
    json.dump(items, f)
