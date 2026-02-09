#  Personal Health Digital Twin Platform
AI-Powered Preventive Health Risk Estimation for India

---

##  Problem Statement

India is facing a silent but devastating health crisis driven by delayed detection of chronic diseases:

-  Heart disease causes over **28% of all deaths** in India  
-  **57% of India’s 77 million diabetes cases are undiagnosed**  
-  **60% of the 42 million Indians with thyroid disorders are unaware** of their condition  
-  **85% of Indians lack continuous health monitoring**  
-  Doctors make decisions with **less than 40% of relevant patient health data**  
-  Diabetes complications cause **one death every 4 minutes**  
-  **1 in 4 heart attacks occur in people under 40**

Healthcare data in India is fragmented across lab reports, wearables, prescriptions, and clinical notes. This leads to delayed diagnosis, preventable complications, higher treatment costs, and millions of undiagnosed cases of chronic diseases such as diabetes, cardiovascular conditions, and thyroid disorders.

---

##  Proposed Solution

We propose a **Personal Health Digital Twin Platform** — a continuously evolving, AI-driven virtual replica of an individual’s health that learns from data, predicts disease risks, and recommends preventive interventions *before* clinical symptoms appear.

The platform focuses on India’s highest-burden chronic conditions:
- Diabetes  
- Hypertension  
- Cardiovascular diseases  

---

##  What Is the Digital Twin Here?

A **Digital Health Twin** is a living computational model that:

- Continuously ingests multi-source health data  
- Understands long-term physiological trends  
- Simulates future health outcomes  
- Recommends personalized preventive actions  

Traditional healthcare relies on static snapshots.  
This platform treats chronic diseases as **dynamic, slow-progressing systems**, making Digital Twins uniquely suited for preventive care.

---

##  How It Solves the Problem

- **Predictive Twin Modeling:** Estimates future risk for diabetes, hypertension, and cardiovascular disease  
- **Personalized Intervention Engine:** Provides tailored lifestyle guidance and preventive insights  
- **Doctor-Ready Insights:** Generates structured, interpretable health summaries  
- **Early Warning System:** Flags abnormal trends before symptoms manifest  

---

##  AI Integration (Gemini)

Google’s **Gemini 1.5 Flash** is used strictly for **language and reasoning**, not prediction:

- Extracting structured medical values from OCR text  
- Explaining risk results in simple, plain language  
- Writing physician-readable health summaries  

All medical risk calculations are handled using deterministic logic or trained ML models.  
**Gemini does NOT make medical decisions.**

---

##  Tech Stack

### 🔹 Core Language
**Python**  
Used end-to-end for data processing, machine learning, WHO rule validation, AI integration, and the application layer.  
This kept the system simple, consistent, and easy to debug during rapid development.

---

### 🔹 Application & UI
**Fast API and Vite**  
Serves as the main application interface and system orchestrator.

Enables users to:
- Upload blood reports (PDF / image)
- Enter values manually when needed
- View WHO-aligned classifications
- See disease risk scores
- Interact with a health assistant
- Download a structured health summary

Streamlit allowed us to prioritize **functionality and explainability over frontend boilerplate**.

---

### 🔹 OCR & Data Ingestion
**Tesseract OCR (pytesseract)**  
- Converts uploaded blood reports into raw text  
- Handles real-world lab report formats commonly used in India  

---

### 🔹 AI Layer
**Gemini 1.5 Flash**  
Used strictly for **language and reasoning tasks**, not prediction:
- Extracting structured medical values from OCR text  
- Explaining risk results in plain language  
- Writing physician-readable summaries  

All medical risk calculations are done using deterministic logic or trained ML models.  
**Gemini does not make medical decisions.**

---

### 🔹 Machine Learning
**Random Forest Classifier (scikit-learn)**  
- Trained offline on clinical and lifestyle features  
- Predicts diabetes, hypertension, and cardiovascular risk  

**SMOTE (imbalanced-learn)**  
- Used during training to handle class imbalance  

**joblib**  
- Saves trained models as `.pkl` files  
- In the final app, the model is only loaded, not retrained  

---

### 🔹 WHO Validation Engine
**Custom WHO Rules (Python + JSON)**  
- Clinical thresholds stored in a structured JSON file  
- Ensures all outputs are **WHO South Asia–aligned and explainable**

Covers:
- Diabetes indicators  
- Blood pressure ranges  
- BMI categories  
- Lipid profile standards  

---

### 🔹 Health Report Generation
**Markdown + PDF Generation (FPDF / ReportLab)**  

Produces a downloadable report containing:
- Lab values vs WHO reference ranges  
- Risk scores  
- AI-assisted clinical reasoning  
- Clear non-diagnostic disclaimer  

---

### 🔹 Project Structure & Modularity
OCR, ML prediction, WHO validation, AI reasoning, and reporting are fully modular, making the system easy to extend (e.g., adding new diseases later).

---

### 🔹 Environment & Execution
- Python virtual environment  
- `requirements.txt` for reproducible setup  
- Runs locally and can be deployed on **Streamlit Cloud**

---

## LIMITATIONS

- **NHANES data is cross-sectional, not longitudinal**, limiting true long-term health progression modeling  
- **Lifestyle data is limited** and partially self-reported  
- **Indian-specific clinical thresholds are not fully captured**  
- **This system provides risk estimation, not medical diagnosis** and does not replace professional clinical judgment  

Judges value this transparency, and these limitations guide future improvements.

---

# Visualizations

![Screenshot 1](assets/image.png)
![Screenshot 2](assets/image2.jpeg)
![Screenshot 5](assets/image5.jpeg)
![Screenshot 3](assets/image3.jpeg)
![Screenshot 4](assets/image4.jpeg)
