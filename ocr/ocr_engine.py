# ocr_engine.py
import pdfplumber
from PIL import Image
import pytesseract

def extract_text(file) -> str:
    """
    Extract raw text from PDF or image.
    Args:
        file: Can be a file path (str) or a Streamlit UploadedFile object.
    """
    text = ""
    is_pdf = False

    # Check if it's a string path
    if isinstance(file, str):
        if file.lower().endswith(".pdf"):
            is_pdf = True
    # Check if it's a Streamlit/FastAPI uploaded object
    elif hasattr(file, "type") and file.type == "application/pdf":
        is_pdf = True
    elif hasattr(file, "name") and file.name.lower().endswith(".pdf"):
        is_pdf = True

    try:
        if is_pdf:
            with pdfplumber.open(file) as pdf:
                for page in pdf.pages:
                    text += (page.extract_text() or "") + "\n"
        else:
            image = Image.open(file)
            text = pytesseract.image_to_string(image)
    except Exception as e:
        print(f"Error extracting text: {e}")
        # Return empty string so backend can handle it or continue
        return ""

    return text.strip()
