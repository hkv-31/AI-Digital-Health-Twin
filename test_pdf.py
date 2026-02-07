
import os
import sys

def test_pdf_extraction():
    print("\n--- Testing PDF Extraction ---")
    try:
        import pdfplumber
        from fpdf import FPDF
        
        # 1. Create a dummy PDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt="Medical Report: Diabetes Test", ln=1, align="C")
        pdf.cell(200, 10, txt="Fasting Glucose: 110 mg/dL", ln=2, align="L")
        pdf.output("test_report.pdf")
        print("✅ Created test_report.pdf")
        
        # 2. Extract using logic similar to ocr_engine
        text = ""
        with pdfplumber.open("test_report.pdf") as p:
            for page in p.pages:
                text += page.extract_text() + "\n"
        
        print(f"Extracted Content: {text.strip()}")
        
        if "Diabetes Test" in text:
            print("✅ PDF Extraction SUCCESS")
        else:
            print("❌ PDF Extraction FAILED (Text mismatch)")
            
    except ImportError as e:
        print(f"❌ Missing Library: {e}")
    except Exception as e:
        print(f"❌ PDF Error: {e}")
    finally:
        if os.path.exists("test_report.pdf"):
            os.remove("test_report.pdf")

if __name__ == "__main__":
    test_pdf_extraction()
