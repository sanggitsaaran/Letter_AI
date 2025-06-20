import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, BitsAndBytesConfig
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
class TextInput(BaseModel):
    text: str

app = FastAPI()

print("Loading AI model. This might take a moment...")

MODEL_ID = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    quantization_config=bnb_config,
    device_map="auto",
    torch_dtype=torch.float16
)

pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)

print("✅ Model loaded successfully!")

@app.post("/analyze")
async def analyze_text(data: TextInput):
    """

    """
    user_input = data.text
    if not user_input or not user_input.strip():
        return {"feedback": ""} 
    prompt = f"""<|system|>
You are an expert writing assistant. Your task is to analyze the following letter and provide concise, helpful feedback. Focus on tone, clarity, and one key grammatical suggestion.
</s>
<|user|>
{user_input}
</s>
<|assistant|>
"""
    outputs = pipe(
        prompt,
        max_new_tokens=150,
        do_sample=True,
        temperature=0.7,
        top_k=50,
        top_p=0.95
    )
    
    raw_response = outputs[0]['generated_text']
    
    try:
        feedback = raw_response.split("<|assistant|>")[1].strip()
    except IndexError:
        print("Warning: Model response did not contain '<|assistant|>' tag. Using raw output.")
        feedback = raw_response.replace(prompt, "").strip()

    return {"feedback": feedback}

@app.post("/predict")
async def predict_text(data: TextInput):
    """
    """
    user_input = data.text
    if not user_input or not user_input.strip():
        return {"prediction": ""}
    prompt = user_input[-500:]

    outputs = pipe(
        prompt,
        max_new_tokens=5,
        do_sample=True,
        temperature=0.6,
        return_full_text=False,
    )
    
    prediction = outputs[0]['generated_text'].strip()

    clean_prediction = prediction.split('\n')[0]

    return {"prediction": clean_prediction}

if __name__ == "__main__":
    # The server will run on http://127.0.0.1:8000
    uvicorn.run(app, host="127.0.0.1", port=8000)