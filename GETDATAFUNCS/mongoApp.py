import pymongo
import json

# set up connection to MongoDB
client = pymongo.MongoClient("mongodb+srv://babeluser:babelpassword@babelcluster.fogf4.mongodb.net/public?retryWrites=true&w=majority")
db = client["test"]
collection = db["booksoverviews"]

# find all documents in the collection
cursor = collection.find()

# write documents to JSON file
def handle_fi(json_data):
    with open(json_data, 'w') as f:
        for document in cursor:
            document["_id"] = str(document["_id"]) # convert ObjectId to string
            json.dump(document, f)
            f.write('\n')

