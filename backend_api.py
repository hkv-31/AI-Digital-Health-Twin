from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import shutil
import os
import json
from dotenv import load_dotenv

# Import existing logic
from ocr.ocr_engine import extract_text
from ml.predictor import predict_all_risks
from parsing.gemini_extractor import extract_labs
from ai.explanation import explain
from gemini_client import get_text_model
from ai.prompts import REASONING_PROMPT

load_dotenv()

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load WHO standards
def load_who():
    for p in ["who/who_standard.json", "who_standard.json"]:
        if os.path.exists(p):
            with open(p, "r") as f:
                return json.load(f)
    raise FileNotFoundError("who_standard.json not found in ./who/ or project root.")

WHO = load_who()

# Replicating logic from app.py for consistency
def classify_fasting_glucose(val):
    fg = WHO["diabetes_indicators"]["fasting_glucose"]
    if val is None: return "Unknown"
    if fg["normal"][0] <= val <= fg["normal"][1]: return "Normal"
    if fg["diabetes_indicator"][0] <= val <= fg["diabetes_indicator"][1]: return "Diabetes Indicator"
    return "Unknown"

def classify_hba1c(val):
    h = WHO["diabetes_indicators"]["hba1c"]
    if val is None: return "Unknown"
    if h["normal"][0] <= val <= h["normal"][1]: return "Normal"
    if h["diabetes_indicator"][0] <= val <= h["diabetes_indicator"][1]: return "Diabetes Indicator"
    return "Unknown"

def classify_bp(sys_bp, dia_bp):
    if sys_bp is None or dia_bp is None: return "Unknown"
    cls = WHO["hypertension_engine"]["classification"]
    def in_band(b): return (b["systolic"][0] <= sys_bp <= b["systolic"][1]) and (b["diastolic"][0] <= dia_bp <= b["diastolic"][1])
    if in_band(cls["normal"]): return "Normal"
    if in_band(cls["elevated"]): return "Elevated"
    if in_band(cls["hypertension_stage_1"]): return "Hypertension Stage 1"
    if in_band(cls["hypertension_stage_2"]): return "Hypertension Stage 2"
    if in_band(cls["hypertensive_crisis"]): return "Hypertensive Crisis"
    return "Unknown"

def classify_lipids(ldl, hdl, tg):
    out = {}
    lip = WHO.get("lipid_profile_standards", {})
    def in_spec(val, spec):
        if val is None: return False
        if isinstance(spec, (list, tuple)) and len(spec) == 2: return spec[0] <= val <= spec[1]
        if isinstance(spec, dict):
            lo, hi = spec.get("min"), spec.get("max")
            if lo is not None:
                if hi is not None: return lo <= val <= hi
                return val >= lo
            if hi is not None: return val <= hi
        return False

    def bucket(field_name, val):
        if val is None: return "Unknown"
        field = lip.get(field_name, {})
        for label, spec in field.items():
            if in_spec(val, spec): return label.replace("_", " ").title()
        return "Unknown"

    if "ldl_cholesterol" in lip: out["LDL"] = bucket("ldl_cholesterol", ldl)
    if "hdl_cholesterol" in lip: out["HDL"] = bucket("hdl_cholesterol", hdl)
    if "triglycerides" in lip: out["Triglycerides"] = bucket("triglycerides", tg)
    return out

class AnalysisRequest(BaseModel):
    user_data: Dict[str, Any]

class ChatRequest(BaseModel):
    question: str
    context: Dict[str, Any]

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        print(f"Received upload: {file.filename}")
        # Save temp file
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"Saved temp file: {temp_path}")
        
        # OCR
        raw_text = extract_text(temp_path)
        print(f"Extracted Text Length: {len(raw_text)}")
        
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        # Extract
        extracted_data = extract_labs(raw_text)
        print(f"Extracted Data: {extracted_data}")
        
        return {"extracted_data": extracted_data, "raw_text": raw_text[:500] + "..."}
    except Exception as e:
        print(f"Upload Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze")
async def analyze_health(req: AnalysisRequest):
    data = req.user_data
    
    # Helper to safely float conversion
    def safe_float(v):
        try:
            return float(v)
        except (ValueError, TypeError):
            return None

    # Safe extraction
    fg = safe_float(data.get("fasting_glucose"))
    hba1c = safe_float(data.get("hba1c"))
    sys_bp = safe_float(data.get("sys_bp_avg"))
    dia_bp = safe_float(data.get("dia_bp_avg"))
    ldl = safe_float(data.get("ldl"))
    hdl = safe_float(data.get("hdl"))
    tg = safe_float(data.get("triglycerides"))
    
    # Classify
    classifications = {
        "Fasting Glucose": classify_fasting_glucose(fg),
        "HbA1c": classify_hba1c(hba1c),
        "Blood Pressure": classify_bp(sys_bp, dia_bp),
        "Lipids": classify_lipids(ldl, hdl, tg)
    }
    
    # Predict Risks
    # Ensure correct keys for ML model
    ml_input = {
        "age": int(data.get("age", 30)),
        "gender": data.get("gender"),
        "bmi": float(data.get("bmi", 22.0)),
        "waist_circumference": float(data.get("waist_circumference", 0)),
        "sys_bp_avg": float(data.get("sys_bp_avg", 120)),
        "dia_bp_avg": float(data.get("dia_bp_avg", 80)),
        "fasting_glucose": float(data.get("fasting_glucose", 90)),
        "hba1c": float(data.get("hba1c", 5.2)),
        "total_cholesterol": float(data.get("total_cholesterol", 170)),
        "ldl": float(data.get("ldl", 100)),
        "hdl": float(data.get("hdl", 45)),
        "triglycerides": float(data.get("triglycerides", 120))
    }
    
    risks = predict_all_risks(ml_input)
    
    return {"classifications": classifications, "risks": risks}

@app.post("/api/explain")
async def explain_results(req: Dict[str, Any]):
    # Wrapper for ai.explanation.explain
    # It expects: explain(values, who, risk)
    # The frontend should send these.
    values = req.get("values")
    who = req.get("who_classification")
    risks = req.get("risks")
    
    explanation = explain(values, who, risks)
    return {"explanation": explanation}

@app.post("/api/chat")
async def chat_assistant(req: ChatRequest):
    # Replicating health_assistant_reply from app.py
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"reply": "AI assistant unavailable (API key not configured)."}

    try:
        from gemini_client import get_text_model
        model = get_text_model()

        # Context from request
        ctx = req.context
        user_data = ctx.get("user_data", {})
        who_labels = ctx.get("who_classification", {})
        risks = ctx.get("risks", {})
        
        prompt = REASONING_PROMPT.format(
            user_data=json.dumps(user_data, indent=2),
            who_labels=json.dumps(who_labels, indent=2),
            risk_score=round(float(risks.get("Diabetes_Risk_%", 0)), 2)
        )

        final_prompt = f"{prompt}\n\nExtra Context:\n{json.dumps(ctx, indent=2)}\n\nUser Question:\n{req.question}"
        
        response = model.generate_content(final_prompt)
        return {"reply": response.text}

    except Exception as e:
        return {"reply": f"Unable to generate response: {str(e)}"}

from fpdf import FPDF

class PDFReport(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'AI Digital Health Twin - Health Analysis Report', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

@app.post("/api/report")
async def generate_report(req: AnalysisRequest):
    data = req.user_data
    
    # Helper to safely float conversion
    def safe_float(v):
        try:
            return float(v)
        except (ValueError, TypeError):
            return None

    # Safe extraction
    fg = safe_float(data.get("fasting_glucose"))
    hba1c = safe_float(data.get("hba1c"))
    sys_bp = safe_float(data.get("sys_bp_avg"))
    dia_bp = safe_float(data.get("dia_bp_avg"))
    ldl = safe_float(data.get("ldl"))
    hdl = safe_float(data.get("hdl"))
    tg = safe_float(data.get("triglycerides"))

    # Re-run analysis to ensure consistency
    classifications = {
        "Fasting Glucose": classify_fasting_glucose(fg),
        "HbA1c": classify_hba1c(hba1c),
        "Blood Pressure": classify_bp(sys_bp, dia_bp),
        "Lipids": classify_lipids(ldl, hdl, tg)
    }
    
    ml_input = {
        "age": int(data.get("age", 30)),
        "gender": data.get("gender"),
        "bmi": float(data.get("bmi", 22.0)),
        "waist_circumference": float(data.get("waist_circumference", 0)),
        "sys_bp_avg": float(data.get("sys_bp_avg", 120)),
        "dia_bp_avg": float(data.get("dia_bp_avg", 80)),
        "fasting_glucose": float(data.get("fasting_glucose", 90)),
        "hba1c": float(data.get("hba1c", 5.2)),
        "total_cholesterol": float(data.get("total_cholesterol", 170)),
        "ldl": float(data.get("ldl", 100)),
        "hdl": float(data.get("hdl", 45)),
        "triglycerides": float(data.get("triglycerides", 120))
    }
    risks = predict_all_risks(ml_input)

    # Generate PDF
    pdf = PDFReport()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # User Details
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(0, 10, "Patient Details", 0, 1)
    pdf.set_font("Arial", size=12)
    for k, v in data.items():
        pdf.cell(0, 8, f"{k.replace('_', ' ').title()}: {v}", 0, 1)
    pdf.ln(5)
    
    # Risk Assessment
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(0, 10, "Risk Assessment (ML Models)", 0, 1)
    pdf.set_font("Arial", size=12)
    for k, v in risks.items():
        pdf.cell(0, 8, f"{k.replace('_', ' ').title()}: {v}%", 0, 1)
    pdf.ln(5)
    
    # WHO Classification
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(0, 10, "WHO Standards Classification", 0, 1)
    pdf.set_font("Arial", size=12)
    for k, v in classifications.items():
        if isinstance(v, dict):
            pdf.cell(0, 8, f"{k}:", 0, 1)
            for sub_k, sub_v in v.items():
                pdf.cell(10) # Indent
                pdf.cell(0, 8, f"{sub_k}: {sub_v}", 0, 1)
        else:
            pdf.cell(0, 8, f"{k}: {v}", 0, 1)
            
    # Disclaimer
    pdf.ln(10)
    pdf.set_font("Arial", 'I', 10)
    pdf.multi_cell(0, 5, "Disclaimer: This report is generated by an AI Digital Health Twin and is for informational purposes only. It does not constitute a medical diagnosis. Please consult a healthcare professional.")

    # Save to temp file
    report_path = "health_report.pdf"
    pdf.output(report_path)
    
    return FileResponse(report_path, media_type="application/pdf", filename="Health_Analysis_Report.pdf")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
