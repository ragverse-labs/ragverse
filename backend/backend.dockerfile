# Use the base image
FROM ghcr.io/br3ndonland/inboard:fastapi-0.51-python3.11

# Set the working directory
WORKDIR /app/

# Set environment variables for Hatch and Hugging Face cache
ENV HATCH_ENV_TYPE_VIRTUAL_PATH=.venv
ENV HF_HOME=/app/models

# Copy the application code to the container
COPY ./app/ /app/

# Install git and other necessary system dependencies
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

ENV HATCH_ENV_TYPE_VIRTUAL_PATH=.venv
RUN hatch env prune && hatch env create production && pip install --upgrade setuptools
RUN python -m nltk.downloader punkt

# Set the Hugging Face cache directory
ENV HF_HOME=/app/models

# Install Python dependencies and create virtual environment
# RUN hatch env prune && \
#     hatch env create production && \
#     pip install --upgrade setuptools && \
#     # Download required NLTK data
#     python -m nltk.downloader punkt && \
#     # Clean up unused files and cache
#     rm -rf /root/.cache/pip

# Ensure dependencies are installed by running pip list
RUN hatch run pip list

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
RUN hatch run python -c "import inboard; print(inboard.__version__)"

# # Expose the port
EXPOSE 8000

# Command to start the application
# CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "${APP_MODULE}", "--host", "0.0.0.0", "--port", "8000"]


# # Use the base image
# FROM ghcr.io/br3ndonland/inboard:fastapi-0.51-python3.11

# # Copy the application code to the container
# COPY ./app/ /app/

# # Set the working directory
# WORKDIR /app/

# # Set environment variables for Hatch and Hugging Face cache
# ENV HATCH_ENV_TYPE_VIRTUAL_PATH=.venv
# ENV HF_HOME=/app/models

# # Create the virtual environment, prune unused envs, and update setuptools
# RUN hatch env prune && \
#     hatch env create production && \
#     pip install --upgrade setuptools && \
#     # Download required NLTK data
#     python -m nltk.downloader punkt && \
#     # Clean up unused files and cache
#     rm -rf /root/.cache/pip

# # Copy the pre-downloaded models into the container
# COPY ./app/models /app/models

# # Set up application arguments for FastAPI
# ARG BACKEND_APP_MODULE=app.main:app
# ARG BACKEND_PRE_START_PATH=/app/prestart.sh
# ARG BACKEND_PROCESS_MANAGER=gunicorn
# ARG BACKEND_WITH_RELOAD=false

# # Set the environment variables for application configuration
# ENV APP_MODULE=${BACKEND_APP_MODULE} \
#     PRE_START_PATH=${BACKEND_PRE_START_PATH} \
#     PROCESS_MANAGER=${BACKEND_PROCESS_MANAGER} \
#     WITH_RELOAD=${BACKEND_WITH_RELOAD}

