
# 🚀 Getting Started with RAGVerse

Welcome to **RAGVerse** — an end-to-end Retrieval-Augmented Generation (RAG) platform with modular components for the backend, frontend, and control panel.

This guide will walk you through:

- Environment setup
- Service builds
- MongoDB import
- Running the full stack

---

## 🧱 Prerequisites

Ensure the following tools are installed on your machine:

- [Miniconda](https://docs.conda.io/en/latest/miniconda.html)
- [Docker](https://www.docker.com/)
- [Node.js & npm](https://nodejs.org/)
- Git

---

## 🔧 Environment Setup

### 1. Clone the Repository

```bash
git clone git@github.com:ragverse-labs/ragverse.git
cd ragverse
```

### 2. Create the Conda Environment

```bash
conda env create -n ragverse -f environment.yml
conda activate ragverse
```

### 3. Setup Environment Variables

Copy and rename the `.env.sample` and `.env.local.sample` files:

```bash
cp .env.sample .env
cp .env.local.sample .env.local
```

Edit these files to add the correct credentials and configuration values.

---

## 🐋 Build Services with Docker

Before building, make sure you've downloaded the required embedding model from Hugging Face.

### Backend

```bash
docker-compose -f dev-docker-compose.yml build --no-cache celeryworker
docker-compose -f dev-docker-compose.yml build --no-cache backend
```

### Frontend

```bash
docker-compose -f dev-docker-compose.yml build --no-cache frontend
```

### Control Panel

```bash
docker-compose -f dev-docker-compose.yml build --no-cache control-panel
```

---

## 🗃️ Import the MongoDB Dump

A pre-configured dump is available in `db/ragverse.gz`.

### 1. Start MongoDB Container

```bash
docker-compose up -d ragv_mongo
```

### 2. Import the Database Dump

Manual Method:

```bash
cd frontend
docker cp ./db/ragverse.gz ragv_mongo:/tmp/ragverse.gz

docker-compose exec ragv_mongo mongorestore \
  --authenticationDatabase=admin \
  -u <your-username> -p <your-password> \
  --gzip --archive=/tmp/ragverse.gz
```

Replace `<your-username>` and `<your-password>` with credentials from `.env.local`.

**Or use the provided script:**

```bash
bash scripts/restore-db.sh
```

---

## 📦 Create Milvus Vector Index

Run the following script to generate vector indexes in Milvus:

```bash
python scripts/index_creator.py
```

---

## 🧪 Run the Full Stack

Start all services:

```bash
docker-compose -f dev-docker-compose.yml up
```

### Access Services

- 🌐 Frontend → [http://localhost:3000](http://localhost:3000)
- 🔌 Backend API → [http://localhost:8000](http://localhost:8000)
- 🧭 Control Panel → [http://localhost:3001](http://localhost:3001)
- 🗃️ MongoDB → `localhost:27017`

---

## ✅ Verify Setup

Tail logs:

```bash
docker-compose logs -f
```

Test backend health endpoint:

```bash
curl http://localhost:8000/health
```

---

## 🧹 Cleanup

Stop and remove all Docker containers:

```bash
docker-compose down
```

Remove the Conda environment:

```bash
conda remove -n ragverse --all
```

---

## 🆘 Need Help?

If you run into issues or have questions, feel free to:

- Open a GitHub issue
- Join our community discussions
```

