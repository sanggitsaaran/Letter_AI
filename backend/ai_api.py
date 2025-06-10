import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, BitsAndBytesConfig
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

# --- 1. Pydantic Model for Input Validation ---
# This ensures the incoming request has a 'text' field of type string.
class TextInput(BaseModel):
    text: str

# --- 2. Initialize FastAPI app ---
app = FastAPI()

# --- 3. Load The Model (only once on startup!) ---
print("Loading AI model. This might take a moment...")

MODEL_ID = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

# Use quantization for better memory efficiency (from your run_model.py)
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

# Create the text generation pipeline
pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)

print("✅ Model loaded successfully!")

# --- 4. Define the API Endpoint ---
@app.post("/analyze")
async def analyze_text(data: TextInput):
    """
    Receives text from the Node.js server, generates feedback using the loaded model,
    and returns the feedback.
    """
    user_input = data.text
    if not user_input or not user_input.strip():
        return {"feedback": ""} # Return empty feedback if input is empty
    # Improved prompt for better, more structured feedback
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
    
    # The output includes the full prompt, so we need to extract only the generated part.
    raw_response = outputs[0]['generated_text']
    
    try:
        # Try to split the response as intended
        feedback = raw_response.split("<|assistant|>")[1].strip()
    except IndexError:
        # If the split fails, it means the tag wasn't in the response.
        # Fallback: Just use the raw response (without the prompt part)
        # This is better than crashing.
        print("Warning: Model response did not contain '<|assistant|>' tag. Using raw output.")
        feedback = raw_response.replace(prompt, "").strip()

    return {"feedback": feedback}

@app.post("/predict")
async def predict_text(data: TextInput):
    """
    Receives the current text and predicts the next few words.
    """
    user_input = data.text
    if not user_input or not user_input.strip():
        return {"prediction": ""} # Return empty prediction if input is empty
    # We don't need a complex chat prompt here. We just want the model to continue the thought.
    # A simple prompt is best for completion.
    prompt = user_input[-500:]

    # We want a very short, fast response.
    outputs = pipe(
        prompt,
        max_new_tokens=10,  # Generate only a few words
        do_sample=True,
        temperature=0.5,    # A bit less creative to stay on topic
        return_full_text=False, # Crucially, only return the *new* text
    )
    
    prediction = outputs[0]['generated_text'].strip()

    # This splits the prediction by new lines and takes the first one.
    clean_prediction = prediction.split('\n')[0]

    return {"prediction": clean_prediction}

# --- 5. Run the app ---
if __name__ == "__main__":
    # The server will run on http://127.0.0.1:8000
    uvicorn.run(app, host="127.0.0.1", port=8000)