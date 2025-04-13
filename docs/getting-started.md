```markdown
# 🚀 Getting Started

Welcome to **Ragverse** — an end-to-end RAG (Retrieval-Augmented Generation) platform with modular components for the backend, frontend, and control panel. This guide will help you set up the development environment, build services, and import a MongoDB dump.

---

## 🧱 Prerequisites

Make sure you have the following installed:

- [Conda](https://docs.conda.io/en/latest/miniconda.html)
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

---

## 🐋 Build Services with Docker

### Build the Backend

```bash
docker-compose -f dev-docker-compose.yml build backend
```

### Build the Frontend

```bash
docker-compose -f dev-docker-compose.yml build frontend
```

### Build the Control Panel

```bash
docker-compose -f dev-docker-compose.yml build control-panel
```

---

## 🗃️ Importing the MongoDB Dump

A pre-configured MongoDB dump (`db/ragverse.gz`) is available for bootstrapping the project database.

### 1. Start MongoDB Container

```bash
docker-compose up -d mongodb
```

### 2. Import the Database Dump

You can restore the MongoDB dump manually:

```bash
docker-compose exec mongodb mongorestore \
  --authenticationDatabase=admin \
  -u <your-username> -p <your-password> \
  --gzip --archive=/db/ragverse.gz
```

Replace `<your-username>` and `<your-password>` using the credentials from `.env.local`.

Alternatively, use the provided script:

```bash
bash scripts/restore-db.sh
```

> ✅ Make sure your `docker-compose.yml` mounts the `db/` folder correctly into the MongoDB container.

---

## 🧪 Running the Full Stack

Start all services:

```bash
docker-compose -f dev-docker-compose.yml up
```

### Access URLs

- Frontend → http://localhost:3000
- Backend API → http://localhost:8000
- Control Panel → http://localhost:3001
- MongoDB → localhost:27017

---

## 🔍 Verify Setup

Tail logs:

```bash
docker-compose logs -f
```

Test backend health:

```bash
curl http://localhost:8000/health
```

---

## 🧹 Cleanup

Stop all containers:

```bash
docker-compose down
```

Remove the Conda environment:

```bash
conda remove -n ragverse --all
```

---

Need help? Open an issue or join our discussion forum for support.
```

---
