```bash
cd ragverse
docker-compose -f dev-docker-compose.yml build --no-cache celeryworker

docker-compose -f dev-docker-compose.yml build --no-cache backend