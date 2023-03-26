import boto3
import json

s3 = boto3.resource('s3')

def write_json(bucket_data):
    """
    writes json for bucket_data, used for writing tombPage data to mongoDB
    params:
    dict => {bucket_name: meta_data}
        => meta_data = {
            "username": "username" || babel,
            "tombID":"tombID" || mongoDB_ID,
        }
    """
    items = []
    bucket_name = list(bucket_data.keys())[0]
    bucket = s3.Bucket(bucket_name)

    for num, obj in enumerate(sorted(bucket.objects.all(), key=lambda x: x.key)):
        file_type = obj.key.split('.')[-1]
        original_filename = obj.key.split('/')[-1]
        s3_key = obj.key
        s3_url = f'https://{bucket_name}.s3.amazonaws.com/{s3_key}'
        s3_url = s3_url.replace(' ', '+').replace(',', '%2C')

        item = {
            'fileType': file_type,
            'originalFilename': original_filename,
            'bucket': bucket_name,
            's3_key': s3_key,
            's3_url': s3_url,
            'page_num': num,
            'username': bucket_data[bucket_name]['username'],
            'tombID': bucket_data[bucket_name]['tombID'],
            'type': {'user': 'babel', 'access': 'babel', 'tombType': 'tombs'}
        }

        items.append(item)

    with open(f"{bucket_name}.json", 'w') as f:
        json.dump(items, f)

input_data = [
    {"msg5": {"username": "babel", "tombID": "641f345a8eca46695d031d2b"}},
    {"msm1073": {"username": "babel", "tombID": "641f34e78eca46695d031d2e"}},
    {"msm150": {"username": "babel", "tombID": "641f350d8eca46695d031d30"}},
    {"msm156": {"username": "babel", "tombID": "641f34fd8eca46695d031d2f"}},
    {"msm227": {"username": "babel", "tombID": "641f34d68eca46695d031d2d"}},
    {"msm454": {"username": "babel", "tombID": "641f35218eca46695d031d31"}},
    {"msm854": {"username": "babel", "tombID": "641f35358eca46695d031d32"}},
    {"msm917": {"username": "babel", "tombID": "641f34c68eca46695d031d2c"}}
]
for bucket_data in input_data:
    write_json(bucket_data)
    print(f"file written for {bucket_data}")
