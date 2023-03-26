import pymongo
import json
import os

client = pymongo.MongoClient('mongodb+srv://babeluser:babelpassword@babelcluster.fogf4.mongodb.net/public')
db = client['public']
collection = db['pagemodels']

def load_data(json_data):
    with open(json_data) as f:
        json_data = f.read()
        data = json.loads(json_data)
        for obj in data:
            collection.insert_one(obj)
            print(f"{obj} added to mongoDB")

for fi in os.listdir('../../s3Pagedata'):
    fi_path = os.path.join('/home/mumbot/babel_background/s3Tombdata', fi)
    print(fi_path)
    load_data(fi_path)