from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import GPT2Tokenizer, GPT2LMHeadModel

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class Query(BaseModel):
    prompt: str
    model_name: str
    max_length: int = 200

# Set device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model(model_name=None):
    # if model_name == "gpt2-base":
    #     model_path = 'C:/repos/llm/custom_models/models--lbjPT1-kgp'
    # else:
    #     model_path = f'C:/repos/llm/custom_models/models--{model_name}'
    
    model_path = 'C:/repos/llm/custom_models/models--lbjPT1-kgp'
    
    tokenizer = GPT2Tokenizer.from_pretrained(model_path)
    model = GPT2LMHeadModel.from_pretrained(model_path)
    model.to(device)
    model.eval()
    return model, tokenizer

def generate_text(prompt, model, tokenizer, max_length=200):
    inputs = tokenizer.encode(prompt, return_tensors='pt').to(device)
    outputs = model.generate(
        inputs, 
        max_length=max_length, 
        num_return_sequences=1, 
        no_repeat_ngram_size=2, 
        early_stopping=True
    )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)[len(prompt):].strip()

@app.post("/generate")
async def generate_text_endpoint(query: Query):
    model, tokenizer = load_model(query.model_name)
    response = generate_text(query.prompt, model, tokenizer, query.max_length)
    print(response)
    return {"response": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
