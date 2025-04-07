from app.engine.query_engine_tool_loader import QueryEngineToolsLoader

class SingletonMeta(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]

class QueryEngineManager(metaclass=SingletonMeta):
    def __init__(self):
        # self.query_engine_tools = []
        # self.query_engines = []
        self.query_engine_loader = QueryEngineToolsLoader()
        # self.build_query_index_tools()

    # def build_query_index_tools(self):
    #     self.query_engines = self.query_engine_loader.get_query_engines()
    
    def get_engine(self, book_name, userId, resetChat) :
        print("1-new messages" + userId)
        return self.query_engine_loader.get_engine(book_name=book_name, userId=userId, reset_chat=resetChat)



