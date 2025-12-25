import requests
import easyocr
import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)

FRENCH_TO_GENERIC = {
    "DOLIPRANE": "ACETAMINOPHEN",
    "DAFALGAN": "ACETAMINOPHEN",
    "PARACÉTAMOL": "ACETAMINOPHEN",
    "PARACETAMOL": "ACETAMINOPHEN",
    "AMOXICILLINE": "AMOXICILLIN",
    "ASPIRINE": "ASPIRIN",
    "IBUPROFÈNE": "IBUPROFEN",
    "IBUPROFENE": "IBUPROFEN"
}

_reader_instance = None

def get_ocr_reader():
    """Gets the EasyOCR reader instance."""
    global _reader_instance
    if _reader_instance is None:
        logger.info("Initializing EasyOCR...")
        _reader_instance = easyocr.Reader(['fr', 'en'], gpu=False)
    return _reader_instance

def preprocess_image_for_ocr(img):
    """Preprocesses image to improve OCR accuracy."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    denoised = cv2.fastNlMeansDenoising(enhanced, None, 10, 7, 21)
    _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresh

def clean_ocr_text(text_list):
    """Extracts potential medication name from OCR text."""
    ignore_words = ["COMPRIMES", "GELULES", "BOITE", "PRIX", "MEDICAMENT"]
    
    candidates = []
    for text in text_list:
        word = text.upper().strip()
        if len(word) > 4 and word not in ignore_words:
            if sum(c.isalpha() for c in word) / len(word) > 0.7:
                candidates.append(word)
    
    return candidates[0] if candidates else None

def search_openfda(generic_name):
    """Searches OpenFDA for drug information."""
    logger.info(f"OpenFDA search: {generic_name}")
    
    try:
        url = f'https://api.fda.gov/drug/label.json?search=openfda.generic_name:"{generic_name}"&limit=1'
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('results'):
                result = data['results'][0]
                
                brand_name = result.get('openfda', {}).get('brand_name', [generic_name])[0]
                generic = result.get('openfda', {}).get('generic_name', [generic_name])[0]
                
                purpose = result.get('purpose', [''])[0] if result.get('purpose') else ''
                indications = result.get('indications_and_usage', [''])[0] if result.get('indications_and_usage') else ''
                usage = purpose or indications or "Medication information available"
                usage = usage[:400]
                
                adverse = result.get('adverse_reactions', [''])[0] if result.get('adverse_reactions') else ''
                side_effects = adverse[:400] if adverse else "Consult package insert for side effects"
                
                warnings = []
                if result.get('warnings'):
                    warnings.append(result['warnings'][0][:150])
                if result.get('pregnancy'):
                    warnings.append("Pregnancy: precautions required")
                
                risk_level = "ATTENTION" if warnings else "Information"
                
                return {
                    "nom_detecte": generic,
                    "titre_web": f"{brand_name} ({generic})",
                    "description": usage,
                    "usage": usage,
                    "side_effects": side_effects,
                    "source": "https://open.fda.gov",
                    "niveau_risque": risk_level,
                    "mots_clefs_alertes": warnings or ["Consult package insert", "Follow prescribed dosage"]
                }
        
        return None
    except Exception as e:
        logger.error(f"OpenFDA error: {e}")
        return None

def search_drug_online(drug_info):
    """Searches for drug info using generic name."""
    french_name = drug_info['nom']
    full_name = drug_info['full_name']
    
    generic_name = FRENCH_TO_GENERIC.get(french_name, french_name)
    
    result = search_openfda(generic_name)
    
    if result:
        result['nom_detecte'] = full_name
        return result
    
    return {
        "nom_detecte": full_name,
        "titre_web": full_name,
        "description": "Medication information available.",
        "usage": "Consult package insert.",
        "side_effects": "Consult package insert.",
        "source": "https://www.vidal.fr",
        "niveau_risque": "Information",
        "mots_clefs_alertes": ["Consult package insert", "Follow prescribed dosage"]
    }

def process_pharma_image(img_numpy):
    """Processes image to find medication info."""
    logger.info("Starting OCR processing...")
    
    preprocessed = preprocess_image_for_ocr(img_numpy)
    reader = get_ocr_reader()
    raw_text = reader.readtext(preprocessed, detail=0)
    
    if not raw_text:
        return {"error": "No text detected", "ocr_raw": []}
    
    med_name = clean_ocr_text(raw_text)
    
    if not med_name:
        return {"error": "Medication name not found", "ocr_raw": raw_text}
    
    drug_info = {'nom': med_name, 'dosage': None, 'full_name': med_name}
    result = search_drug_online(drug_info)
    
    if result:
        return result
    else:
        return {"error": f"'{med_name}' not found", "nom_detecte": med_name, "ocr_raw": raw_text}
