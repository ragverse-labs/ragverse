# Use the base image
FROM ghcr.io/br3ndonland/inboard:0.73.0-fastapi-python3.11

# Set the working directory
WORKDIR /app/

# Set environment variables
ENV HF_HOME=/app/models

# comment below for CUDA Environment
ENV PIP_EXTRA_INDEX_URL=https://download.pytorch.org/whl/cpu
RUN pip install torch 

# uncomment below for CUDA Environment
# RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Install system dependencies
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Copy the application code to the container
COPY ./app/ /app/

# Install Python dependencies in a single pip install command
RUN pip install --upgrade pip && \
    pip install \
    "python-multipart>=0.0.5" \
    "email-validator>=1.3.0" \
    "requests>=2.28.1" \
    "celery>=5.2.7" \
    "passlib[bcrypt]>=1.7.4" \
    "tenacity>=8.1.0" \
    "emails>=0.6.0" \
    "raven>=6.10.0" \
    "jinja2>=3.1.2" \
    "python-jose[cryptography]>=3.3.0" \
    "pydantic>=2.8.0,<3.0.0" \
    "pydantic-settings>=2.0.3" \
    "httpx>=0.23.1" \
    "psycopg2-binary>=2.9.5" \
    "motor>=3.7.0" \
    "pytest==7.4.2" \
    "pytest-cov==4.1.0" \
    "pytest-asyncio>=0.21.0" \
    "argon2-cffi==23.1.0" \
    "argon2-cffi-bindings==21.2.0" \
    "odmantic>=1.0.2" \
    "llama-index-core>=0.12.0,<0.13.0" \
    "llama-index-cli>=0.4.1,<0.5" \
    "llama-index-embeddings-huggingface>=0.5.3" \
    "llama-index-llms-groq>=0.3.2" \
    "llama-index-readers-file>=0.4.0,<0.5" \
    "llama-index-storage-chat-store-redis>=0.4.1" \
    "llama-index-vector-stores-milvus>=0.8.1" \
    "llama-index-llms-ollama>=0.5.4" \
    "tree-sitter>=0.25.1" \
    "tree-sitter-language-pack>=0.9.0" \
    "boto3"

# Copy the pre-downloaded models into the container
COPY ./app/models /app/models
COPY ./app/prestart.sh /app/

# Give execute permissions to prestart.sh
RUN chmod +x /app/prestart.sh

# Set up application arguments for FastAPI
ARG BACKEND_APP_MODULE=app.main:app
ARG BACKEND_PRE_START_PATH=/app/prestart.sh
ARG BACKEND_PROCESS_MANAGER=gunicorn
ARG BACKEND_WITH_RELOAD=true

# Set the environment variables for application configuration
ENV APP_MODULE=${BACKEND_APP_MODULE} \
    PRE_START_PATH=${BACKEND_PRE_START_PATH} \
    PROCESS_MANAGER=${BACKEND_PROCESS_MANAGER} \
    WITH_RELOAD=${BACKEND_WITH_RELOAD}

# Verify inboard module is accessible
RUN python -c "import inboard; print(inboard.__version__)"

# Expose the port
EXPOSE 8000