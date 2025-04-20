# Dockerfile for Milvus service
FROM ubuntu:20.04

# Install necessary packages
RUN apt-get update && apt-get install -y curl bash

# Set the working directory
WORKDIR /app

# Download the standalone_embed.sh script
RUN curl -sfL https://raw.githubusercontent.com/milvus-io/milvus/master/scripts/standalone_embed.sh -o standalone_embed.sh

# Ensure the script is executable
RUN chmod +x standalone_embed.sh

# Expose necessary ports (adjust as needed)
EXPOSE 19530
EXPOSE 9091

# Start Milvus when the container starts
CMD ["./standalone_embed.sh", "start"]
