from llama_index.core.settings import Settings
from llama_index.llms.ollama import Ollama
from llama_index.llms.groq import Groq
from app.core.config import settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
def get_embed_model():
    print("Loading model from local path...")
    # Get HF_HOME environment variable, default to /app/models if not set
    # hf_home = os.getenv("HF_HOME", "/app/models/")
    hf_home=settings.EMBEDDING_MODEL_PATH
    # Set the logging level to INFO
    print(f"HF_HOME is set to: {hf_home}")
    
    # Construct the local path using HF_HOME
    # local_model_path = os.path.join(hf_home, "e5-base-v2")
    local_model_path=hf_home
    embed_model = HuggingFaceEmbedding(
        model_name=settings.EMBEDDING_MODEL_NAME,
        cache_folder=local_model_path
       )
    print("Model loaded successfully")
    return embed_model

def get_groq_llm():
    model_name=settings.GROQ_MODEL_NAME
    api_key=settings.GROQ_API_KEY
    llm = Groq(model=model_name, api_key=api_key, safe_prompt=True)
    return llm

# def get_llama_cpp_llm():
#     # print("it is called EVERYTIME")
#     model_path = f"llm/mixtral-8x7b-instruct-v0.1.Q4_K_M.gguf"
#     return LlamaCPP(
#         # You can pass in the URL to a GGML model to download it automatically
#         model_url=None,
#         # optionally, you can set the path to a pre-downloaded model instead of model_url
#         model_path=model_path,
#         temperature=0.1,
#         max_new_tokens=512,
        
#         # llama2 has a context window of 4096 tokens, but we set it lower to allow for some wiggle room
#         context_window=4096,
#         # kwargs to pass to __call__()
#         generate_kwargs={},
#         # embed_model = embedding,
#         # kwargs to pass to __init__()
#         # set to at least 1 to use GPU
        
#         model_kwargs={"n_gpu_layers": 33},
#         # transform inputs into Llama2 format
#         messages_to_prompt=messages_to_prompt,
#         completion_to_prompt=completion_to_prompt,
#         verbose=False,
#     )
# mllm = get_llm()
def get_ollama_llm():
    # Model should already be pulled via `ollama run llama3`
    return Ollama(
        model=settings.LLM_MODEL_NAME,  # or "llama2", "mistral", etc.
        base_url=settings.LLM_URL,
        # base_url="http://localhost:11434",
        completion_only=True  
    )


def get_llm():
    if settings.LLM_PROVIDER == "groq":
        return get_groq_llm()
    elif settings.LLM_PROVIDER == "ollama":
        return get_ollama_llm()
    else:
        raise ValueError("Unsupported LLM_PROVIDER: use 'groq' or 'ollama'")


mllm = get_llm()
membed_model = get_embed_model()

# mllm = get_groq_llm()
# membed_model = get_embed_model()
# mtokenizer, mmmodel = get_embed_model()

def init_settings():
    print("before ini")
    Settings.llm = mllm
    Settings.chunk_size = 512
    Settings.chunk_overlap = 64
    Settings.context_window =  3900
    Settings.embed_model= membed_model
    Settings.num_output = 256
    

