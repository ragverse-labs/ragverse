# from llama_index.core import SimpleDirectoryReader, get_response_synthesizer
# from llama_index.core import DocumentSummaryIndex
# from llama_index.core.node_parser import SentenceSplitter

# from app import settings

# books_titles = [
#     "bhagavad-gita",
#     "Bhakti-Yoga-by-Swami-Vivekananda",
#     # "Complete_Works_of_Swami_Vivekananda_all_volumes",
#     "Essentials_of_Hindutva",
#     "Jnana-Yoga-by-Swami-Vivekananda",
#     "Karma-Yoga-by-Swami-Vivekananda",
#     "Kautilyas_Arthashastra_1915",
#     "Mahabharata_Unabridged",
#     "Patanjali-yogasutra_IGS",
#     "Raja-Yoga-by-Swami-Vivekananda",
#     "Upanishads_of_the_Atharva_Veda",
#     "Upanishads_of_the_Krishna_Yajur_Veda",
#     "Upanishads_of_the_Rig_Veda",
#     "Upanishads_of_the_Shukla_Yajur_Veda",
#     "Valmiki_Ramayana_Trans_Bibek_Debroy"
# ]

# all_books = []
# for book_title in books_titles:
#     docs = SimpleDirectoryReader(
#         input_files=[f"data/{book_title}.pdf"]
#     ).load_data()
#     docs[0].doc_id = book_title
#     all_books.extend(docs)

# splitter = SentenceSplitter(chunk_size=1024)

# response_synthesizer = get_response_synthesizer(
#     response_mode="tree_summarize", use_async=True
# )
# settings.init_settings()

# doc_summary_index = DocumentSummaryIndex.from_documents(
#     all_books,
#     llm=settings.mllm,
#     transformations=[splitter],
#     response_synthesizer=response_synthesizer,
#     show_progress=True,
# )



# doc_summary_index.storage_context.persist(persist_dir="summary_store")

# summary = doc_summary_index.get_document_summary("Mahabharata_Unabridged")

# print(summary)