import json
import os
from typing import AsyncGenerator, List
from pydantic import BaseModel, Field
from fastapi.responses import PlainTextResponse, StreamingResponse
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from llama_index.core.llms import ChatMessage, MessageRole
from app.engine.model_data import ModelData
from app.core.config import settings
from app.engine.query_engine_tool_loader import QueryEngineToolsLoader
# import boto3


router = APIRouter()
manager = QueryEngineToolsLoader()
model_data = ModelData()
# translator = TextTranslator()

class ContentSchema:
    def __init__(self, content, book_name, from_language, to_language, user_id):
        self.content = content
        self.book_name = book_name
        self.to_language = to_language
        self.from_language = from_language
        self.user_id = user_id
    def __str__(self):
        return f'Book Name: {self.book_name}\nContent: {self.content}\nFrom Language: {self.from_language}\nTo Language: {self.to_language}\nUser Id: {self.user_id}'
    
class _Message(BaseModel):
    role: MessageRole
    content: str
    additional_kwargs: dict = Field(default_factory=dict)

class _ChatData(BaseModel):
    messages: List[_Message]

class DetailModel(BaseModel):
    format: str
    family: str
    # families: Optional[None] = None
    parameter_size: str
    quantization_level: str

class TagModel(BaseModel):
    id: str
    name: str
    # modified_at: datetime
    size: int
    digest: str
    details: DetailModel
    stream: bool

class TagsResponse(BaseModel):
    models: List[TagModel]

def json_to_class(json_str):
    # Parse the JSON string into a Python dictionary
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError:
        return None  # or raise an exception or handle as appropriate
    
    # Create an instance of BookTranslation using data from the dictionary
    if 'content' in data and 'book_name' in data and 'to_language' in data and 'from_language' in data and 'user_id' in data:
        return ContentSchema(content=data['content'], book_name=data['book_name'], from_language=data['from_language'], to_language=data['to_language'], user_id=data['user_id'])
    else:
        return None  # or raise an exception or handle as appropriate
    
@router.get("/models")
async def get_models(): 
    # fix going to DB each time
    # await model_data.initialize()
    # await PromptManager().initialize()
    return model_data.get_data()



# # Async function to call the translation service
# # async def translate(content: str, from_lang: str, to_lang: str) -> str:
# async def translate_stream(content: str, from_lang: str, to_lang: str) -> AsyncGenerator[str, None]:
#     # Prepare the payload for the translation service
#     payload = {
#         "content": content,
#         "from_lang": from_lang,
#         "to_lang": to_lang  
#     }

#     # Use environment variable with a default fallback
#     turl = os.getenv("TRANSLATION_SERVICE_URL", "http://localhost:8010/v1/translate/translate").strip()

#     # print("Prepared payload:", payload)
#     # print("Translation Service URL:", turl)

#     try:
#         timeout = httpx.Timeout(connect=10.0, read=30.0, write=10.0, pool=5.0)
#         async with httpx.AsyncClient(timeout=timeout) as client:
#             # Set headers for the request
#             headers = {
#                 'Content-Type': 'application/json'
#             }
            
#             # Make an async POST request to the translation service
#             print("Sending request to translation service...")
#             response = await client.post(turl, json=payload, headers=headers)
            
#             # Check if the request was successful
#             if response.status_code != 200:
#                 print(f"Error: received status code {response.status_code}")
#                 response.raise_for_status()  # This will trigger the exception handling below

#             print(f"Response status code: {response.status_code}")
#             # Read the streamed response in chunks
#             async for chunk in response.aiter_bytes():
#                 if chunk:
#                     # Decode the chunk and append to the result
#                     # translated_text += chunk.decode('utf-8')
#                     yield chunk.decode('utf-8')

#     except httpx.HTTPStatusError as http_exc:
#         print(f"HTTP error occurred: {http_exc.response.status_code} - {http_exc}")
#         yield content
#     except httpx.RequestError as req_exc:
#         print(f"Request error occurred: {req_exc}")
#         yield content
#     except Exception as exc:
#         print(f"An unexpected error occurred: {str(exc)}")
#         yield content


# @router.post("/webhook/")
# async def process_webhook(request: Request):
#     data = await request.json()  # Expecting {"type": "Books"} or {"type": "Languages"}
    
#     # Determine the type of update and act accordingly
#     if data.get("type") == "Books":
#         model_data.update_books()  # Update books data
#     elif data.get("type") == "Languages":
#         model_data.update_languages()  # Update languages data
#     else:
#         raise HTTPException(status_code=400, detail="Invalid type specified")

#     return {"status": "received"}

# @router.get("/vedas_plugins")
# async def get_plugs():
#     return model_data.get_plugs()

async def stream_response(request: Request, response_stream):
    full_response = ""
    try:
        for token in response_stream:
            if await request.is_disconnected():
                raise HTTPException(status_code=400, detail="Client disconnected")
            full_response += token 
    except HTTPException as e:
        return PlainTextResponse(str(e.detail), status_code=e.status_code)

    return full_response.strip()

# def response_stream(streaming_response):
#         for text in streaming_response.response_gen:
#             yield text + "\n"
#     return Response(response_stream(), mimetype="text/event-stream")

# Assuming the translation service's REST endpoint URL
# TRANSLATION_SERVICE_URL = "https://translation-service-url/translate"







async def translate_stream(content: str, from_lang: str, to_lang: str) -> AsyncGenerator[str, None]:
    # Initialize a session using your Access Keys
    client = boto3.client(
        'translate',
        aws_access_key_id=settings.AWS_ACCESS_KEY,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name='ap-south-1'  # Specify your region
    )

    # Split the content by sentence (assuming sentences end with '.')
    sentences = content.split('. ')
    context_window = []  # Context window to hold previous sentences
    
    for i, sentence in enumerate(sentences):
        if sentence.strip():  # Ensure non-empty content
            try:
                # Formulate the chunk with the context window + current sentence
                # You can adjust the window size by modifying `context_window[-1:]`
                # For example, context_window[-2:] includes two previous sentences
                chunk_to_translate = '. '.join(context_window[-1:] + [sentence])

                # Translate the chunk
                response = client.translate_text(
                    Text=chunk_to_translate,
                    SourceLanguageCode=model_data.get_language_code(from_lang),
                    TargetLanguageCode=model_data.get_language_code(to_lang)
                )
                
                # Get the translated result
                translated_text = response['TranslatedText']
                
                # Yield only the last translated sentence (current one), stripping any leading/trailing spaces
                yield translated_text.split('. ')[-1].strip() + '. '

                # Update context window with the current sentence
                context_window.append(sentence)
                # Keep only the last two sentences for context to control overhead
                if len(context_window) > 2:
                    context_window.pop(0)

            except Exception as e:
                print(f"Error during translation: {e}")
                yield sentence + '. '  # Fallback to original text if error occurs

# async def translate_stream(content: str, from_lang: str, to_lang: str) -> AsyncGenerator[str, None]:
#     # Initialize a session using your Access Keys
#     client = boto3.client(
#         'translate',
#         aws_access_key_id=settings.AWS_ACCESS_KEY,
#         aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
#         region_name='ap-south-1'  # Specify your region
#     )

#     # Split the content into smaller parts to simulate streaming (e.g., by sentence or fixed length)
#     # Here, we're assuming you can split by sentences, but adjust as needed
#     sentences = content.split('. ')
    
#     # Process each part separately to allow for streaming-like behavior
#     for sentence in sentences:
#         if sentence.strip():  # Ensure there is content to translate
#             try:
#                 # Translate each sentence
#                 response = client.translate_text(
#                     Text=sentence,
#                     SourceLanguageCode=get_language_code(from_lang),
#                     TargetLanguageCode=get_language_code(to_lang)
#                 )

#                 # Yield the translated text
#                 translated_text = response['TranslatedText']
#                 yield translated_text + '. '  # Add punctuation to recompose original text
#             except Exception as e:
#                 print(f"Error during translation: {e}")
#                 yield content

# Example usage (within an async context):
# async for translated_chunk in translate_stream("Hello, how are you? I hope you're well.", "en", "es"):
#     print(translated_chunk)


async def collect_translation(content: str, from_lang: str, to_lang: str) -> str:
    translated_chunks = [chunk async for chunk in translate_stream(content, from_lang, to_lang)]
    return ''.join(translated_chunks)

        
@router.post("/chat")
async def chat(
    request: Request,
    data: _ChatData,
):
    # check preconditions and get last message
    if len(data.messages) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No messages provided",
        )
    lastMessage = data.messages.pop()
    if lastMessage.role != MessageRole.USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Last message must be from user",
        )
    # convert messages coming from the request to type ChatMessage
    messages = [
        ChatMessage(
            role=m.role,
            content=m.content,
            additional_kwargs=m.additional_kwargs
        )
        for m in data.messages
    ]

    resetChat = len(messages) == 1

    try:

        content_details=json_to_class(lastMessage.content)
        print("before call...XXXX")
        print(lastMessage.content)
        print("before call...")
        print(content_details.book_name)
        print(content_details.user_id)

        engine = manager.get_engine(content_details.book_name, content_details.user_id, resetChat)
        input_query = content_details.content
 
        # if content_details.from_language != "eng_Latn":
        #     input_query = await collect_translation(input_query, content_details.from_language, "eng_Latn")

        # Use the translation service asynchronously
        # if content_details.from_language != "eng_Latn":
        #     input_query = await translate_stream(input_query, content_details.from_language, "eng_Latn")
     
        # input_query += ". Answer in the context of the " + content_details.book_name + " ONLY."
        print("input query")
        print(input_query)
        
        resp =  engine.stream_chat(input_query)
        print("resp")
        print(resp)
        response_content = await stream_response(request, resp.response_gen)
        print("response here...")
        print(response_content)
    except Exception as e:
        response_content = "The book you're searching for is not available at the moment, or something went wrong. Please try again." 
        print(f"Failed to process request: {e}")

    async def event_generator():
        try:
                if content_details.to_language != "eng_Latn":
                    # Stream translated response directly
                    async for translated_chunk in translate_stream(response_content, "eng_Latn", content_details.to_language):
                        # print("yielfing....")
                        # print(translated_chunk)
                        yield translated_chunk.encode()
                else:
                    # Stream original response directly
                    for chunk in response_content:
                        yield chunk.encode()


        except Exception as e:
            print(f"Error while processing streaming response: {e}")
            yield b"An error occurred. Please try again."

    # Return StreamingResponse using raw text
    return StreamingResponse(event_generator(), media_type="text/event-stream")

   

    # this one is working section!!
    async def event_generator():
        for token in  engine.query(lastMessage.content).response_gen:
            print(token)
            if await request.is_disconnected():
                break
            yield token.encode()  # Assuming you want to encode the token before sending
    return StreamingResponse(event_generator(), media_type="text/plain")
