from huggingface_hub import snapshot_download

# Example: Download BERT base model
model_id = "intfloat/e5-base-v2"
local_dir = "./models"

snapshot_download(repo_id=model_id, local_dir=local_dir)
