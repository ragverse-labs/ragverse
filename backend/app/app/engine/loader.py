from llama_index.core.readers import SimpleDirectoryReader

DATA_DIR = "data"  # directory containing the documents


# def get_documents():
#     return SimpleDirectoryReader(DATA_DIR).load_data()

def get_documents():
    file_metadata = lambda x: {"filename": x}
    reader = SimpleDirectoryReader(DATA_DIR, file_metadata=file_metadata)
    return reader.load_data()