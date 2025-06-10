import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load Model
MODEL_NAME = r"C:\Users\asus\.cache\huggingface\hub\models--TinyLlama--TinyLlama-1.1B-Chat-v1.0"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, torch_dtype=torch.float16, device_map="auto")

def analyze_text(user_input):
    """Generates AI feedback based on the user's letter."""
    prompt = f"Analyze this letter and provide feedback:\n{user_input}\n\nSuggestion:"
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    outputs = model.generate(**inputs, max_new_tokens=100)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return response
