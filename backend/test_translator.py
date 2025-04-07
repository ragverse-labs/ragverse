import torch
from IndicTransToolkit import IndicProcessor
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import nltk
from nltk.tokenize import sent_tokenize

ip = IndicProcessor(inference=True)

# Function to download the necessary NLTK data packages
def download_nltk_data():
    packages = ['punkt', ]  # List the packages you need here
    for package in packages:
        try:
            nltk.data.find(f'tokenizers/{package}')
        except LookupError:
            nltk.download(package)

# nltk.download('punkt')
download_nltk_data()

# models--ai4bharat--indictrans2-en-indic-1B
# tokenizer = AutoTokenizer.from_pretrained("ai4bharat/indictrans2-en-indic-dist-200M", trust_remote_code=True)
tokenizer = AutoTokenizer.from_pretrained("ai4bharat/indictrans2-en-indic-1B", trust_remote_code=True)
model = AutoModelForSeq2SeqLM.from_pretrained("ai4bharat/indictrans2-en-indic-1B", trust_remote_code=True)
paragraph = "Women in the Mahabharata play significant roles and are represented in various ways. Characters like Draupadi and Kunti challenge societal norms through their actions and decisions. Draupadi, for instance, challenges the traditional role of a wife by marrying five husbands, the Pandavas. She also stands up against injustice and asserts her rights, especially during the infamous dice game where she questions the norms of treating women as objects to be wagered. Kunti, on the other hand, conforms to societal expectations by being a devoted mother and following the duties expected of her as a woman of her time. Despite conforming to some norms, Kunti also challenges conventions by making unconventional choices, such as using her boon to bear children from gods. Overall, women in the Mahabharata exhibit a mix of conforming to and challenging societal norms, showcasing the complexity of their roles and representations in the epic."

sentences = sent_tokenize(paragraph)
batch = ip.preprocess_batch(sentences, src_lang="eng_Latn", tgt_lang="hin_Deva")
batch = tokenizer(batch, padding="longest", truncation=True, max_length=256, return_tensors="pt")

with torch.inference_mode():
    outputs = model.generate(**batch, num_beams=5, num_return_sequences=1, max_length=256)

with tokenizer.as_target_tokenizer():
    # This scoping is absolutely necessary, as it will instruct the tokenizer to tokenize using the target vocabulary.
    # Failure to use this scoping will result in gibberish/unexpected predictions as the output will be de-tokenized with the source vocabulary instead.
    outputs = tokenizer.batch_decode(outputs, skip_special_tokens=True, clean_up_tokenization_spaces=True)

outputs = ip.postprocess_batch(outputs, lang="hin_Deva")
print(outputs)
