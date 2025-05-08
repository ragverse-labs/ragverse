#!/bin/bash
set -euo pipefail

# Read MongoDB credentials
mongo_user=$(grep MONGO_INITDB_ROOT_USERNAME ../frontend/.env.local | cut -d '=' -f 2)
mongo_pass=$(grep MONGO_INITDB_ROOT_PASSWORD ../frontend/.env.local | cut -d '=' -f 2)
mongo_db=$(grep MONGODB_DB ../frontend/.env.local | cut -d '=' -f 2)
# Name of the docker container
container_name="ragv_mongo"

# Loop through each subfolder in data-source
for folder in ./app/data-source/*/; do
  # Remove trailing slash and get folder name
  folder_name=$(basename "$folder")

  echo "Processing folder: $folder_name"

  # Insert into 'book' collection
  docker exec "$container_name" mongosh --username "$mongo_user" --password "$mongo_pass" --authenticationDatabase admin "$mongo_db" --eval "
    db.book.insertOne({
      identifier: '$folder_name',
      name: '$folder_name',
      category: 'general',
      ranking: 14,
      author: 'to-be-update',
      description: '$folder_name',
      reviewed_by: 'Pending',
      status: 'published',
      created: $(date +%s),
      owned_by: 'ragverse'
    });
  "

  # Insert system/user prompt into collection named after folder
  docker exec "$container_name" mongosh --username "$mongo_user" --password "$mongo_pass" --authenticationDatabase admin "$mongo_db" --eval "
    db.prompt.insertOne({
      identifier: '$folder_name',
      name: '$folder_name',
      type: '$folder_name',
      system_prompt: 'You are RAG System strictly relying on the knowledge source given to you. Only answer from within your provided data source.',
      system_prompt_sfx: 'Avoid hallucinating or giving opinions. Respond with \\'No relevant info found\\' if not present in the context.',
      user_prompt: 'Answer the following query using only the given context:',
      user_prompt_prx: 'If the context does not contain the answer, say so explicitly.',
      system_few_shots: []
    });
  "

  
done

docker exec "$container_name" mongosh --username "$mongo_user" --password "$mongo_pass" --authenticationDatabase admin "$mongo_db" --eval '
  db.language.insertOne({
    identifier: "eng_Latn",
    name: "English",
    status: "E",
    created: '$(date +%s)',
    owned_by: "ragverse"
  });
'

# Prompt for sample question
  read -rp "Enter a sample question #1 " user_question

  # Insert into 'test_prompts' collection
  docker exec "$container_name" mongosh --username "$mongo_user" --password "$mongo_pass" --authenticationDatabase admin "$mongo_db" --eval "
    db.test_prompts.insertOne({
      question: \"$user_question\",
      answer: \"\",
      language: \"English\",
      book_name: \"$folder_name\",
      source_language: \"eng_Deva\",
      target_language: \"eng_Deva\",
      order: 3,
      show: 1
    });
  "

# Prompt for sample question
  read -rp "Enter a sample question #2 " user_question

  # Insert into 'test_prompts' collection
  docker exec "$container_name" mongosh --username "$mongo_user" --password "$mongo_pass" --authenticationDatabase admin "$mongo_db" --eval "
    db.test_prompts.insertOne({
      question: \"$user_question\",
      answer: \"\",
      language: \"English\",
      book_name: \"$folder_name\",
      source_language: \"eng_Deva\",
      target_language: \"eng_Deva\",
      order: 3,
      show: 1
    });
  "

  # Run generate.py in backend container
echo "Running ./app/generate.py inside ragv_backend..."
docker exec ragv_backend python ./app/engine/generate.py


echo "All folders processed and index created"
