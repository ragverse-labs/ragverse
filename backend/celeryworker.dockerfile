# Use the official Python 3.11 image as the base
FROM python:3.11

# Set the working directory inside the container
WORKDIR /app/

# Define ARGs for versioning
ARG HATCH_VERSION=1.7.0
ARG PIPX_VERSION=1.2.0

# Set environment variables
ENV \
  C_FORCE_ROOT=1 \
  HATCH_ENV_TYPE_VIRTUAL_PATH=.venv \
  HATCH_VERSION=$HATCH_VERSION \
  PATH=/opt/pipx/bin:/app/.venv/bin:$PATH \
  PIPX_BIN_DIR=/opt/pipx/bin \
  PIPX_HOME=/opt/pipx/home \
  PIPX_VERSION=$PIPX_VERSION \
  PYTHONPATH=/app

# Copy the application code into the container
COPY ./app/ /app/

# Install pipx, hatch, and set up the virtual environment, combining everything to reduce layers and cleanup afterwards
RUN python -m pip install --no-cache-dir --upgrade pip "pipx==$PIPX_VERSION" && \
    pipx install "hatch==$HATCH_VERSION" && \
    hatch env prune && \
    hatch env create production && \
    # Clean up pip and temporary files to reduce the image size
    rm -rf /root/.cache/pip /root/.cache/hatch

# Make the worker-start.sh script executable
RUN chmod +x /app/worker-start.sh

# Set the command to run the worker script
CMD ["bash", "worker-start.sh"]
