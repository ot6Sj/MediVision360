# Copyright (c) 2025 ot6_j. All Rights Reserved.

from transformers import pipeline
from PIL import Image
import logging
import os

# Force PyTorch only (avoid TensorFlow conflict)
os.environ["USE_TORCH"] = "1"

logger = logging.getLogger(__name__)

_clip_classifier = None

def get_clip_classifier():
    """Lazily loads the CLIP classifier using PyTorch."""
    global _clip_classifier
    if _clip_classifier is None:
        logger.info("Loading CLIP Universal Classifier (PyTorch)...")
        try:
            # Force PyTorch framework and use safetensors
            _clip_classifier = pipeline(
                "zero-shot-image-classification", 
                model="openai/clip-vit-base-patch32",
                framework="pt",  # Force PyTorch
                use_safetensors=True  # Use safetensors format
            )
            logger.info("CLIP loaded successfully!")
        except Exception as e:
            logger.error(f"Failed to load CLIP: {e}")
            raise
    return _clip_classifier

def analyze_skin_universal(image_pil):
    """Analyzes skin condition using CLIP zero-shot classification."""
    classifier = get_clip_classifier()
    
    candidate_labels = [
        "healthy skin",
        "a deep cut or laceration",
        "a bruise or hematoma",
        "a first degree burn with redness",
        "a second degree burn with blisters",
        "a third degree burn with white or charred skin",
        "skin cancer or melanoma",
        "skin rash or eczema",
        "surgical stitches",
        "acne or pimples",
        "insect bite",
        "psoriasis"
    ]
    
    results = classifier(image_pil, candidate_labels=candidate_labels)
    
    top_match = results[0]
    label = top_match['label']
    score = top_match['score']
    
    diagnostic_fr = "Skin condition detected"
    conseil = "Consult a doctor."
    gravite = "Low"
    couleur = "green"
    
    if "cut" in label or "laceration" in label:
        diagnostic_fr = "Cut / Laceration"
        conseil = "Disinfect. If deep, consult."
        gravite = "Medium"
        couleur = "orange"
        
    elif "bruise" in label or "hematoma" in label:
        diagnostic_fr = "Bruise"
        conseil = "Apply ice. Monitor."
        gravite = "Low"
        couleur = "green"
        
    elif "first degree" in label:
        diagnostic_fr = "1st Degree Burn"
        conseil = "Cool with water. Soothing cream."
        gravite = "Low"
        couleur = "green"
        
    elif "second degree" in label:
        diagnostic_fr = "2nd Degree Burn"
        conseil = "Cool with water. Do not pop blisters."
        gravite = "Medium"
        couleur = "orange"
        
    elif "third degree" in label:
        diagnostic_fr = "3rd Degree Burn"
        conseil = "EMERGENCY. Call ambulance."
        gravite = "EMERGENCY"
        couleur = "red"
        
    elif "burn" in label:
        diagnostic_fr = "Burn"
        conseil = "Cool with water. Consult if severe."
        gravite = "Medium"
        couleur = "orange"
        
    elif "cancer" in label or "melanoma" in label:
        diagnostic_fr = "Suspicious Lesion"
        conseil = "Consult dermatologist immediately."
        gravite = "URGENT"
        couleur = "red"
        
    elif "eczema" in label or "rash" in label:
        diagnostic_fr = "Eczema / Rash"
        conseil = "Moisturize. Avoid scratching."
        gravite = "Low"
        couleur = "green"
        
    elif "stitches" in label:
        diagnostic_fr = "Stitches"
        conseil = "Keep clean and dry."
        gravite = "Low"
        couleur = "green"
        
    elif "acne" in label or "pimples" in label:
        diagnostic_fr = "Acne"
        conseil = "Gentle cleansing."
        gravite = "Low"
        couleur = "green"
        
    elif "insect" in label:
        diagnostic_fr = "Insect Bite"
        conseil = "Disinfect. Apply ice."
        gravite = "Low"
        couleur = "green"
        
    elif "psoriasis" in label:
        diagnostic_fr = "Psoriasis"
        conseil = "Consult dermatologist."
        gravite = "Medium"
        couleur = "orange"
        
    elif "healthy" in label:
        diagnostic_fr = "Healthy Skin"
        conseil = "Skin appears healthy."
        gravite = "None"
        couleur = "green"
    
    return {
        "diagnostic_original": label,
        "diagnostic_fr": diagnostic_fr,
        "confiance": score,
        "conseil_ia": conseil,
        "gravite": gravite,
        "couleur": couleur,
        "top_3": [
            {"label": r['label'], "score": r['score']} 
            for r in results[:3]
        ]
    }
