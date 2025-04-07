# import requests
# import os
# from llama_index.llms.groq import Groq
# api_key = os.environ.get("GROQ_API_KEY")
# # api_key="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"
# url = "https://api.groq.com/openai/v1/models"

# headers = {
#     "Authorization": f"Bearer {api_key}",
#     "Content-Type": "application/json"
# }

# llm = Groq(model="mixtral-8x7b-32768", api_key=api_key)

# response = requests.get(url, headers=headers)

# print(response.json())

# response = llm.complete("Explain the importance of low latency LLMs")

# print(response)
