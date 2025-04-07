from pymilvus import MilvusClient, connections

# Connect to Milvus server
milvus_client = MilvusClient("http://localhost:19530")

# connections.connect(alias="default", host='localhost', port='19530')

# List all collections
collections = milvus_client.list_collections()

# Loop through each collection and describe it
for collection_name in collections:
    desc_c1 = milvus_client.describe_collection(collection_name)
    
    print(f"{collection_name} :", desc_c1)
    # collection = Collection(name=collection_name)
    # description = collection.description
    # schema = collection.schema
    # print(f"Collection: {collection_name}")
    # print(f"Description: {description}")s
    # print("Schema:")
    # for field in schema.fields:
    #     print(f"  Field name: {field.name}")
    #     print(f"  Data type: {field.dtype}")
    #     print(f"  Is primary key: {field.is_primary}")
    #     print(f"  Description: {field.description}")
    #     print("  --------------------")
    # print("======================")

# Disconnect from Milvus server
connections.disconnect(alias="default")
