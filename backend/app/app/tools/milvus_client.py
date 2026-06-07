from pymilvus import Collection, MilvusClient, connections

# Connect to Milvus server
milvus_client = MilvusClient("http://ragv_milvus-standalone:19530/")

# connections.connect(alias="default", host='localhost', port='19530')

collection_names = ["codebase", "cpp_csharp_codebase", "machinecontrolcpp"]

# Check number of entities for each collection
for name in collection_names:
    try:
        # Initialize the collection object
        collection = Collection(name)
        # Load the collection (required for querying entities)
        collection.load()
        # Get the number of entities
        num_entities = collection.num_entities
        print(f"Collection '{name}' has {num_entities} entities.")
    except Exception as e:
        print(f"Error checking collection '{name}': {str(e)}")
    finally:
        # Release the collection to free resources
        collection.release()
        
# List all collections
collections = milvus_client.list_collections()

# Loop through each collection and describe it
for collection in collections:
    desc_c1 = milvus_client.describe_collection(collection)
    collection.load()
    print(collection.num_entities)
    print(f"{collection} :", desc_c1)

# Disconnect from Milvus server
connections.disconnect(alias="default")
