
import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Mock API key if missing for test
if not os.getenv("GEMINI_API_KEY"):
    print("WARNING: GEMINI_API_KEY not found in env.")

try:
    from ocr.ocr_engine import extract_text
    print("Imported extract_text")
except ImportError as e:
    print(f"Failed to import extract_text: {e}")

try:
    from parsing.gemini_extractor import extract_labs
    print("Imported extract_labs")
except ImportError as e:
    print(f"Failed to import extract_labs: {e}")

try:
    from gemini_client import get_text_model
    print("Imported get_text_model")
except ImportError as e:
    print(f"Failed to import get_text_model: {e}")

def test_gemini_connection():
    print("\n--- Testing Gemini Connection ---")
    try:
        model = get_text_model()
        print(f"Successfully got model: {model.model_name}")
        response = model.generate_content("Hello, reply with 'OK'")
        print(f"Model response: {response.text}")
    except Exception as e:
        print(f"Gemini Error: {e}")

def test_ocr():
    print("\n--- Testing OCR (Dummy File) ---")
    # Create a dummy text file
    with open("test_dummy.txt", "w") as f:
        f.write("Test Report\nFasting Glucose: 95 mg/dL")
    
    try:
        text = extract_text("test_dummy.txt")
        print(f"ocr output: {text}")
        if "Test Report" in text:
            print("OCR (Text File) Works")
        else:
            print("OCR Failed to extract expected text")
    except Exception as e:
        print(f"OCR Runtime Error: {e}")
    finally:
        if os.path.exists("test_dummy.txt"):
            os.remove("test_dummy.txt")

if __name__ == "__main__":
    test_gemini_connection()
    test_ocr()
