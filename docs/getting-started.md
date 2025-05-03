
# 🚀 Getting Started with RAGVerse

Welcome to **RAGVerse** — a fully modular, end-to-end Retrieval-Augmented Generation (RAG) platform. With backend, frontend, and control panel components, RAGVerse is your plug-and-play stack to build powerful, production-ready knowledge systems.

This guide will walk you through:

* Environment setup
* Service builds
* One-time setup
* Running the full stack

---

## 🧱 Prerequisites

Ensure you have the following tools installed:

* [Miniconda](https://docs.conda.io/en/latest/miniconda.html)  
* [Docker](https://www.docker.com/)  
* [Docker Compose](https://docs.docker.com/compose/install/)  
* [Node.js & npm](https://nodejs.org/)  
* [Git](https://git-scm.com/)

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

### 3. Configure Environment Variables

Copy and rename the sample `.env` files:

```bash
cp .env.sample .env
cp .env.local.sample .env.local
```

Edit these files and add your required configuration (e.g., database credentials, paths).

---

## 🐋 Build Services (Docker)

> **Note:** Make sure you’ve downloaded the required embedding model from Hugging Face before continuing.

### Build All Services (First Time)

```bash
docker-compose -f dev-docker-compose.yml build --no-cache
```

### Or Build Services Individually

**Backend:**

```bash
docker-compose -f dev-docker-compose.yml build --no-cache celeryworker
docker-compose -f dev-docker-compose.yml build --no-cache backend
```

**Frontend:**

```bash
docker-compose -f dev-docker-compose.yml build --no-cache frontend
```

**Control Panel:**

```bash
docker-compose -f dev-docker-compose.yml build --no-cache control-panel
```

---

## 🧪 Run the Full Stack

Start all services:

```bash
docker-compose -f dev-docker-compose.yml up
```

---

## ⚙️ First-Time Data Setup

Initialize your data and vector index:

```bash
cd backend
sh app/create-data.sh
```

> ⏳ This script will insert records into MongoDB and build a Milvus index from your documents.

📌 **Important Notes:**

* `data-source/` folder names must **only contain alphanumeric characters and underscores (`_`)**.
* Currently supported input format: **PDF only**
  (Support for more formats is coming soon.)

You should see:

```
All folders processed and index created
```

---

## 🔁 Restarting Services

To restart your containers:

```bash
docker-compose -f dev-docker-compose.yml down
docker-compose -f dev-docker-compose.yml up
```

---

## 🧭 Access Services

| Service          | URL                                            |
| ---------------- | ---------------------------------------------- |
| 🌐 Frontend      | [http://localhost:3000](http://localhost:3000) |
| 🔌 Backend API   | [http://localhost:8000](http://localhost:8000) |
| 🧭 Control Panel | [http://localhost:3001](http://localhost:3001) |
| 🗃️ MongoDB      | `localhost:27017`                              |

---

## ✅ Verifying Setup

Tail logs for debugging:

```bash
docker-compose logs -f
```

Check backend health endpoint:

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

If you run into issues:

* Open a GitHub [issue](https://github.com/ragverse-labs/ragverse/issues)
* Join our community discussions (coming soon)

---

Let me know if you also want a `mkdocs.yml` setup for GitHub Pages-style documentation.
