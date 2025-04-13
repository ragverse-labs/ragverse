#!/bin/bash
set -euo pipefail

mongo_user=$(grep MONGO_INITDB_ROOT_USERNAME .env.local | cut -d '=' -f 2)
mongo_pass=$(grep MONGO_INITDB_ROOT_PASSWORD .env.local | cut -d '=' -f 2)
mongo_db=$(grep MONGODB_DB .env.local | cut -d '=' -f 2)

docker-compose exec mongodb mongorestore --authenticationDatabase admin \
  -u "$mongo_user" -p "$mongo_pass" \
  --gzip --archive=/db/ragverse.gz
