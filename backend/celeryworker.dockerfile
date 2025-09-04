# Use the official Python 3.11 slim image as the base
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app/

# Set environment variables
ENV \
    C_FORCE_ROOT=1 \
    PATH=/app/.venv/bin:$PATH \
    PYTHONPATH=/app \
    # Python optimization
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # pip optimization
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=100

# Install system dependencies if needed (adjust based on your requirements)
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     gcc \
#     && rm -rf /var/lib/apt/lists/*

# Copy requirements file first (for better layer caching)
COPY requirements.txt /app/

# Create virtual environment and install dependencies
RUN python -m venv /app/.venv && \
    /app/.venv/bin/pip install --upgrade pip setuptools wheel

# Install production dependencies
RUN /app/.venv/bin/pip install -r requirements.txt

# Copy the application code into the container
COPY ./app/ /app/

# Make the worker-start.sh script executable
RUN chmod +x /app/worker-start.sh

# Set the command to run the worker script
CMD ["bash", "worker-start.sh"]
