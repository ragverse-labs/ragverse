import json

import redis
from app.api import deps

class SingletonMeta(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        # Absolute safety: key by class import path instead of class itself
        key = f"{cls.__module__}.{cls.__qualname__}"
        if key not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[key] = instance
        return cls._instances[key]


class ModelData(metaclass=SingletonMeta):
 
    def __init__(self):
        self._initialized = False
        self.r = redis.Redis(host="ragv_redis-1", port=6379, decode_responses=True)
        self.books = None
        self.prompts = None
        self.languages = None
        self.response_data = {
            "object": "list",
            "data": [
                {
                    "id": "ragverse-1.0",
                    "object": "model",
                    "created": 1685474247,
                    "owned_by": "RagVerse",
                    "languages": [],
                    "books": []
                }
            ]
        }
        self.plug_ins = {
            "schema_version": "v1",
            "name_for_model": "RagVerse",
            "name_for_human": "RagVerse",
            "description_for_human": "Human Prompt",
            "description_for_model": "Modal Assistent",
            "api": {
                "type": "ragverse",
                "url": "http://backend:8000/api/v1/books/all/",
                "has_user_authentication": False
            },
            "auth": {
                "type": "none"
            },
            "books": [],
            "logo_url": "https://www.klarna.com/assets/sites/5/2020/04/27143923/klarna-K-150x150.jpg",
            "contact_email": "openai-products@klarna.com",
            "legal_info_url": "https://www.klarna.com/us/legal/"
            }

    async def initialize(self):
        
        if not self._initialized:
            self.books = await deps.get_all_books()

            self.r.set("ragv_books", json.dumps([b.model_dump(mode="json") for b in self.books]))
          
            self.prompts = await deps.get_all_prompts()
            
            self.r.set("ragv_prompts", json.dumps([p.model_dump(mode="json") for p in self.prompts]))
            self.languages = await deps.get_all_languages()
            self.r.set("ragv_languages", json.dumps([l.model_dump(mode="json") for l in self.languages]))
            self.response_data['data'][0]['books'] = self.books
            self.plug_ins['books']  = self.books
            self.response_data['data'][0]['languages'] = self.languages
   
            self._initialized = True
            print("all initialized once....")
    
    def get_data(self):
        return self.response_data
    
    def get_plugs(self):
        return self.plug_ins
    
    def get_books(self):
        print("inside books")
        return json.loads(self.r.get("ragv_books") or "[]")
        # return self.books
    
    def get_language_code(flores_code):
        flores_codes = {
            "asm_Beng": "as",
            "awa_Deva": "hi",
            "ben_Beng": "bn",
            "bho_Deva": "hi",
            "brx_Deva": "hi",
            "doi_Deva": "hi",
            "eng_Latn": "en",
            "gom_Deva": "kK",
            "guj_Gujr": "gu",
            "hin_Deva": "hi",
            "hne_Deva": "hi",
            "kan_Knda": "kn",
            "kas_Arab": "ur",
            "kas_Deva": "hi",
            "kha_Latn": "en",
            "lus_Latn": "en",
            "mag_Deva": "hi",
            "mai_Deva": "hi",
            "mal_Mlym": "ml",
            "mar_Deva": "mr",
            "mni_Beng": "bn",
            "mni_Mtei": "hi",
            "npi_Deva": "ne",
            "ory_Orya": "or",
            "pan_Guru": "pa",
            "san_Deva": "hi",
            "sat_Olck": "or",
            "snd_Arab": "ur",
            "snd_Deva": "hi",
            "tam_Taml": "ta",
            "tel_Telu": "te",
            "urd_Arab": "ur",
        }

        allowed_codes = {"en", "gu", "hi", "kn", "ml", "mr", "pa", "ta", "te"}
        
        code = flores_codes.get(flores_code)
        
        if code in allowed_codes:
            return code
        return "en"

    def get_prompts(self):
        # return self.prompts
        return json.loads(self.r.get("ragv_prompts") or "[]")
    
    def get_languages(self):
        return json.loads(self.r.get("ragv_languages") or "[]")
    
    # def update_books(self):
    #     bks = self.query_books()
    #     self.response_data['data'][0]['books'] = bks
    #     self.plug_ins['books']  = bks

    # def update_languages(self):
    #     self.response_data['data'][0]['languages'] = self.query_languages()

    # def query_languages(self):
    #     try:
    #         # ?filter={}&range=[0,9]&sort=[\"id\",\"ASC\"]
    #         response = requests.get("http://backend:8000/api/v1/languages")
    #         return response.json()
    #     except requests.RequestException as e:
    #         print(f"Error fetching languages: {e}")
    #         return []

    # def query_books(self):
    #     try:
    #         response = requests.get("http://backend:8000/api/v1/books/all", verify=False)
    #         # response.raise_for_status()
    #         return response.json()
    #     except requests.RequestException as e:
    #         print(f"Error fetching books: {e}")
    #         return []



