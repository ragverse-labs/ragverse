import glob
import os
from pathlib import Path
from typing import List, Dict, Optional
import torch
from app.core.config import settings
# LlamaIndex imports
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    Document,
    StorageContext,
    Settings
)
from llama_index.core.node_parser import SentenceSplitter
from llama_index.vector_stores.milvus import MilvusVectorStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.ollama import Ollama

# Milvus imports
from pymilvus import connections, utility, Collection

from app.engine import configuration

class CodeIndex:
    def __init__(
        self,
        collection_name: str = "cpp_csharp_codebase",
        overwrite_collection: bool = False,
        device: str | None = None
    ):
        self.collection_name = collection_name
        self.milvus_host = "ragv_milvus-standalone"
        self.milvus_port = settings.MILVUS_PORT
        
        # Auto-detect device if not specified
        if device is None:
            if torch.cuda.is_available():
                device = "cuda"
            elif torch.backends.mps.is_available():
                device = "mps"
            else:
                device = "cpu"
        self.device = device
        print(f"Using device: {self.device}")
        
        # Connect to Milvus
        self._connect_milvus()
        
        self.embed_model = HuggingFaceEmbedding(
            model_name=settings.EMBEDDING_MODEL_NAME,
            device=self.device,
            trust_remote_code=True,
            embed_batch_size=32 if self.device != "cpu" else 8,
            max_length=512
        )
        
        # Get embedding dimension by testing
        print("Detecting embedding dimensions...")
        test_embedding = self.embed_model.get_text_embedding("test")
        self.embedding_dim = len(test_embedding)
        print(f"Embedding dimension detected: {self.embedding_dim}")
        
        # Check if collection exists and has different dimensions
        self._check_collection_compatibility(overwrite_collection)
        
        # # Initialize Ollama LLM
        # self.llm = Ollama(
        #     model=llm_model,
        #     base_url=ollama_base_url,
        #     temperature=0.1,
        #     context_window=4096,
        #     request_timeout=120.0
        # )
        
        # # Configure LlamaIndex settings
        # Settings.embed_model = self.embed_model
        # Settings.llm = self.llm
        # Settings.chunk_size = 512
        # Settings.chunk_overlap = 50
        
        # Initialize vector store with detected dimensions
        self.vector_store = MilvusVectorStore(
            uri="/tmp/milvus_llamaindex.db",
            collection_name=self.collection_name,
            dim=1024,
        )
        
        # Initialize storage context
        self.storage_context = StorageContext.from_defaults(
            vector_store=self.vector_store
        )
    
    def _connect_milvus(self):
        """Connect to Milvus server"""
        try:
            connections.connect(
                alias="default",
                host="ragv_milvus-standalone",
                port="19530"
            )
            print(f"Connected to Milvus at {self.milvus_host}:{self.milvus_port}")
        except Exception as e:
            print(f"Failed to connect to Milvus: {e}")
            raise
    
    def _check_collection_compatibility(self, overwrite: bool):
        """Check if existing collection has compatible dimensions"""
        try:
            if utility.has_collection(self.collection_name):
                collection = Collection(self.collection_name)
                existing_dim = None
                for field in collection.schema.fields:
                    if field.dtype == 101:  # FLOAT_VECTOR type
                        existing_dim = field.params.get('dim')
                        break
                
                if existing_dim and existing_dim != self.embedding_dim:
                    print(f"WARNING: Existing collection has dimension {existing_dim}, but model has {self.embedding_dim}")
                    
                    if overwrite:
                        print("Dropping existing collection as requested...")
                        utility.drop_collection(self.collection_name)
                        print("Collection dropped. Will create new one.")
                    else:
                        print("\nOptions to fix this:")
                        print("1. Pass overwrite_collection=True to recreate")
                        print("2. Use a different collection name")
                        print("3. Use a model with matching dimensions")
                        
                        response = input("\nRecreate collection now? (y/n): ").strip().lower()
                        if response == 'y':
                            utility.drop_collection(self.collection_name)
                            print("Collection dropped. Will create new one.")
                        else:
                            raise ValueError(f"Dimension mismatch: collection has {existing_dim}, model has {self.embedding_dim}")
        except Exception as e:
            if "Dimension mismatch" in str(e):
                raise
            print(f"Note: Could not check existing collection: {e}")
    
    def load_code_files(self, directory_path: str, extensions: List[str] = None) -> List[Document]:
        """
        Load C++ and C# code files from directory
        
        Args:
            directory_path: Path to codebase directory
            extensions: List of file extensions to include
        
        Returns:
            List of Document objects
        """
        if extensions is None:
            extensions = ['.cpp', '.hpp', '.h', '.cs', '.cxx', '.cc']
        
        documents = []
        file_count = 0
        
        for ext in extensions:
            pattern = os.path.join(directory_path, f"**/*{ext}")
            files = glob.glob(pattern, recursive=True)
            
            for file_path in files:
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    # Skip empty files
                    if not content.strip():
                        continue
                    
                    # Truncate very large files
                    if len(content) > 100000:  # ~100KB
                        content = content[:100000] + "\n... [truncated]"
                    
                    # Create metadata
                    metadata = {
                        'file_path': file_path,
                        'file_name': os.path.basename(file_path),
                        'extension': ext,
                        'language': 'C++' if ext in ['.cpp', '.hpp', '.h', '.cxx', '.cc'] else 'C#',
                        'file_size': len(content)
                    }
                    
                    # Create document
                    doc = Document(
                        text=content,
                        metadata=metadata
                    )
                    documents.append(doc)
                    file_count += 1
                    
                    if file_count % 100 == 0:
                        print(f"Loaded {file_count} files...")
                    
                except Exception as e:
                    print(f"Error loading file {file_path}: {e}")
        
        print(f"Loaded {len(documents)} code files")
        return documents
    
    def get_code_splitter(self, language: str = "cpp"):
        """
        Get a code-aware splitter with multiple fallback options using tree-sitter-language-pack
        
        Args:
            language: Programming language (cpp or csharp)
        
        Returns:
            A node parser/splitter
        """
        # Try to use CodeSplitter with tree-sitter-language-pack
        try:
            from llama_index.core.node_parser import CodeSplitter
            from tree_sitter_language_pack import get_language, get_parser
            
            # Map language to tree-sitter-language-pack language names
            lang_map = {
                "cpp": "cpp",
                "c++": "cpp",
                "csharp": "csharp",
                "c#": "csharp"
            }
            
            ts_lang = lang_map.get(language.lower(), "cpp")
            
            try:
                # Test getting the language and parser
                test_language = get_language(ts_lang)
                test_parser = get_parser(ts_lang)
                print(f"✓ {language} parser available as '{ts_lang}'")
                
                # Create CodeSplitter
                splitter = CodeSplitter(
                    language=ts_lang,
                    chunk_lines=40,
                    chunk_lines_overlap=15,
                    max_chars=1500
                )
                print(f"✓ Using CodeSplitter for {language}")
                return splitter
                
            except Exception as e:
                print(f"Could not get parser for language {ts_lang}. Check https://github.com/Goldziher/tree-sitter-language-pack?tab=readme-ov-file#available-languages for a list of valid languages.")
                print(f"Error creating CodeSplitter for {ts_lang}: {e}")
                raise
                
        except ImportError as e:
            print(f"tree-sitter-language-pack not properly installed: {e}")
            print("To use CodeSplitter, install: pip install tree-sitter tree-sitter-language-pack")
            raise
            
        except Exception as e:
            if "not supported" not in str(e):
                print(f"Error with CodeSplitter: {e}")
        
        # Fallback to code-aware SentenceSplitter
        print(f"Using code-optimized SentenceSplitter for {language}")
        
        # Use different settings for different languages
        if language.lower() in ['csharp', 'c#']:
            # C# specific settings
            splitter = SentenceSplitter(
                chunk_size=600,
                chunk_overlap=60,
                paragraph_separator="\n\n",
                secondary_chunking_regex=r"[^{};\n]+[{};\n]?"
            )
        else:
            # C++ specific settings
            splitter = SentenceSplitter(
                chunk_size=512,
                chunk_overlap=50,
                paragraph_separator="\n\n",
                secondary_chunking_regex=r"[^{};\n]+[{};\n]?"
            )
        
        return splitter
    
    def create_coding_index(self, documents: List[Document], batch_size: int = 100) -> VectorStoreIndex:
        """
        Create vector index from documents with batching for large codebases
        
        Args:
            documents: List of Document objects
            batch_size: Number of documents to process at once
        
        Returns:
            VectorStoreIndex object
        """
        print(f"Creating index for {len(documents)} documents...")
        
        # Separate documents by language
        cpp_docs = [d for d in documents if d.metadata.get('language') == 'C++']
        cs_docs = [d for d in documents if d.metadata.get('language') == 'C#']
        
        print(f"Found {len(cpp_docs)} C++ files and {len(cs_docs)} C# files")
        
        # Try to get appropriate splitters
        cpp_splitter = self.get_code_splitter("cpp") if cpp_docs else None
        cs_splitter = self.get_code_splitter("csharp") if cs_docs else None
        
        # Process documents with appropriate splitters
        all_nodes = []
        failed_files = []
        
        # Process C++ documents
        if cpp_docs and cpp_splitter:
            print(f"\nProcessing C++ documents...")
            for i, doc in enumerate(cpp_docs):
                if i % 100 == 0:
                    print(f"  Processing C++ file {i}/{len(cpp_docs)}...")
                try:
                    nodes = cpp_splitter.get_nodes_from_documents([doc])
                    all_nodes.extend(nodes)
                except Exception as e:
                    failed_files.append((doc.metadata.get('file_name', 'Unknown'), str(e)))
                    # Use fallback splitter for this file
                    try:
                        fallback_splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
                        nodes = fallback_splitter.get_nodes_from_documents([doc])
                        all_nodes.extend(nodes)
                    except Exception as e2:
                        print(f"  Warning: Skipping {doc.metadata.get('file_name')}: {e2}")
        
        # Process C# documents
        if cs_docs and cs_splitter:
            print(f"\nProcessing C# documents...")
            for i, doc in enumerate(cs_docs):
                if i % 100 == 0:
                    print(f"  Processing C# file {i}/{len(cs_docs)}...")
                try:
                    nodes = cs_splitter.get_nodes_from_documents([doc])
                    all_nodes.extend(nodes)
                except Exception as e:
                    failed_files.append((doc.metadata.get('file_name', 'Unknown'), str(e)))
                    # Use fallback splitter for this file
                    try:
                        fallback_splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)
                        nodes = fallback_splitter.get_nodes_from_documents([doc])
                        all_nodes.extend(nodes)
                    except Exception as e2:
                        print(f"  Warning: Skipping {doc.metadata.get('file_name')}: {e2}")
        
        # Report parsing issues if any
        if failed_files:
            print(f"\nNote: {len(failed_files)} files required fallback parsing")
            if len(failed_files) <= 5:
                for fname, error in failed_files[:5]:
                    print(f"  - {fname}: {error[:100]}")
        
        # Create index from nodes or documents
        if all_nodes:
            print(f"\nCreating index from {len(all_nodes)} chunks...")
            index = VectorStoreIndex(
                nodes=all_nodes,
                storage_context=self.storage_context,
                show_progress=True
            )
        else:
            # Fallback: use documents directly
            print("\nUsing direct document processing...")
            default_splitter = SentenceSplitter(
                chunk_size=512,
                chunk_overlap=50
            )
            
            index = VectorStoreIndex.from_documents(
                documents,
                storage_context=self.storage_context,
                transformations=[default_splitter],
                show_progress=True
            )
        
        print("✓ Index created successfully")
        return index
    
    def load_existing_index(self) -> VectorStoreIndex:
        """
        Load existing index from Milvus
        
        Returns:
            VectorStoreIndex object
        """
        index = VectorStoreIndex.from_vector_store(
            vector_store=self.vector_store,
            storage_context=self.storage_context
        )
        print("Loaded existing index from Milvus")
        return index
    
    def query(self, index: VectorStoreIndex, query_text: str, top_k: int = 5) -> Dict:
        """
        Query the index with a question
        
        Args:
            index: VectorStoreIndex object
            query_text: Question to ask
            top_k: Number of similar chunks to retrieve
        
        Returns:
            Query response dictionary
        """
        query_engine = index.as_query_engine(
            similarity_top_k=top_k,
            response_mode="compact",
            verbose=True
        )
        
        response = query_engine.query(query_text)
        
        # Extract source information
        sources = []
        if hasattr(response, 'source_nodes'):
            for node in response.source_nodes:
                sources.append({
                    'file': node.metadata.get('file_name', 'Unknown'),
                    'path': node.metadata.get('file_path', 'Unknown'),
                    'score': node.score,
                    'text_preview': node.text[:200] + '...' if len(node.text) > 200 else node.text
                })
        
        return {
            'answer': str(response),
            'sources': sources
        }
    
    def chat(self, index: VectorStoreIndex):
        """
        Interactive chat interface
        
        Args:
            index: VectorStoreIndex object
        """
        chat_engine = index.as_chat_engine(
            chat_mode="condense_question",
            verbose=True
        )
        
        print("\n=== Codebase RAG Chat Interface ===")
        print("Type 'exit' to quit, 'clear' to reset conversation\n")
        
        while True:
            query = input("\nYour question: ").strip()
            
            if query.lower() == 'exit':
                print("Goodbye!")
                break
            elif query.lower() == 'clear':
                chat_engine.reset()
                print("Conversation cleared.")
                continue
            elif not query:
                continue
            
            try:
                response = chat_engine.chat(query)
                print(f"\nAnswer: {response}")
                
                # Show sources
                if hasattr(response, 'source_nodes') and response.source_nodes:
                    print("\nSources:")
                    for i, node in enumerate(response.source_nodes[:3], 1):
                        print(f"{i}. {node.metadata.get('file_name', 'Unknown')} "
                              f"(Score: {node.score:.3f})")
            
            except Exception as e:
                print(f"Error: {e}")
    
    def cleanup(self):
        """Clean up connections"""
        connections.disconnect("default")
        print("Disconnected from Milvus")


# Example usage
def main():
    # Initialize RAG system with HuggingFace embeddings and Ollama LLM
    rag = CodeIndex(
        collection_name="cpp_csharp_codebase",
        overwrite_collection=True,
        # milvus_host="ragv_milvus-standalone",
        # milvus_port="19530",
        # embedding_model="Salesforce/SFR-Embedding-Code-400M_R",
        # llm_model="deepseek-coder-v2:16b-lite-instruct-q5_K_M",
        device=None,
      
    )
    
    # Option 1: Index new codebase
    print("=== Indexing Codebase ===")
    
    # Load code files
    # codebase_path = settings.CODEBASE_PATH
    # documents = rag.load_code_files(codebase_path)
    
    # if documents:
    #     # Create index (with batching for large codebases)
    #     index = rag.create_index(documents, batch_size=100)
        
    #     # Example queries
    #     print("\n=== Example Queries ===")
        
    #     queries = [
    #         "What are the main classes in this codebase?",
    #         "How is error handling implemented?",
    #         "Find examples of singleton pattern",
    #         "What database connections are used?",
    #         "Explain the authentication logic"
    #     ]
        
    #     for q in queries[:2]:
    #         print(f"\nQ: {q}")
    #         result = rag.query(index, q, top_k=3)
    #         print(f"A: {result['answer'][:500]}...")
    #         print(f"Sources: {len(result['sources'])} files referenced")
        
    #     # Start interactive chat
    #     print("\n" + "="*50)
    #     rag.chat(index)
    
    # else:
    #     print("No documents found. Please check the codebase path.")
    
    # Option 2: Load existing index (uncomment if you have an existing index)
    index = rag.load_existing_index()
    rag.chat(index)
    
    # Cleanup
    rag.cleanup()


if __name__ == "__main__":
    # Install required packages:
    # pip install llama-index llama-index-vector-stores-milvus 
    # pip install llama-index-embeddings-huggingface llama-index-llms-ollama 
    # pip install pymilvus torch transformers sentence-transformers
    # pip install tree-sitter tree-sitter-language-pack
    
    # Make sure Ollama has the LLM model:
    # ollama pull deepseek-coder-v2:16b-lite-instruct-q5_K_M
    configuration.init_settings()
    main()