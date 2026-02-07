# explanation.py
import os
from ai.prompts import EXPLANATION_PROMPT

def explain(values, who, risk):
    from gemini_client import get_text_model

    model = get_text_model()
    
    return model.generate_content(
        EXPLANATION_PROMPT.format(values=values, who=who, risk=risk)
    ).text
