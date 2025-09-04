#!/usr/bin/env bash
set -e

# Run the pre-start script
python /app/app/celeryworker_pre_start.py

# Start the Celery worker
celery -A app.worker worker -l info -Q main-queue -c 1