include .env

.PHONY: all

build:
	docker build -t frontend .

run:
	export $(cat .env | xargs)
	docker stop chatbot-ui || true && docker rm frontend || true
	docker run --name frontend --rm -e OPENAI_API_KEY=${OPENAI_API_KEY} -p 3000:3000 frontend

logs:
	docker logs -f frontend

push:
	docker tag frontend:latest ${DOCKER_USER}/frontend:${DOCKER_TAG}
	docker push ${DOCKER_USER}/chatbot-ui:${DOCKER_TAG}