# Copyright (c) 2025 ot6_j. All Rights Reserved.

import io
import logging
import numpy as np
from typing import Dict, Any
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2

from model_loader import (
    get_neuro_model,
    get_derma_model,
    get_surgery_model,
    get_tesseract_config
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MediVision 360 API",
    description="Simple AI Medical Imaging Analysis",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    from ultralytics import YOLO
    import base64
    model_surgery = YOLO('yolov8n.pt')
    logger.info("YOLOv8 loaded")
except Exception as e:
    logger.warning(f"YOLOv8 not available: {e}")
    model_surgery = None


def preprocess_image_for_model(image: Image.Image, target_size: tuple) -> np.ndarray:
    """Preprocess image for model input."""
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    image = image.resize(target_size)
    img_array = np.array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array


def create_mock_response(department: str, confidence: float, prediction: str) -> Dict[str, Any]:
    """Creates a mock response for testing."""
    logger.info(f"Using mock response for {department}")
    
    responses = {
        "neuro": {
            "confidence": confidence,
            "prediction": prediction,
            "diagnosis": f"Brain MRI analyzed. {prediction} detected with {int(confidence*100)}% confidence.",
            "recommendation": "Consult neurology department." if confidence >= 0.75 else "Retake scan.",
            "threshold_met": confidence >= 0.75
        },
        "derma": {
            "confidence": confidence,
            "prediction": prediction,
            "diagnosis": f"Skin lesion classification: {prediction} ({int(confidence*100)}% confidence).",
            "recommendation": "Monitor." if prediction == "Benign" else "Biopsy required.",
            "threshold_met": confidence >= 0.80
        },
        "pharma": {
            "text_detected": "DOLIPRANE 1000mg",
            "confidence": confidence,
            "drug_info": {
                "name": "Doliprane (Paracetamol)",
                "dosage": "1000mg",
                "warnings": "Do not exceed 3g per day.",
                "interactions": "May interact with anticoagulants."
            },
            "threshold_met": confidence >= 0.60
        },
        "surgery": {
            "detections": [
                {"label": "Scissors", "confidence": 0.94, "bbox": [120, 85, 80, 100]},
                {"label": "Scalpel", "confidence": 0.87, "bbox": [340, 220, 60, 90]},
                {"label": "Forceps", "confidence": 0.92, "bbox": [480, 150, 70, 85]}
            ],
            "total_detections": 3,
            "threshold_met": True
        }
    }
    
    return responses.get(department, {})


@app.get("/")
async def root():
    """Health check."""
    return {
        "status": "online",
        "service": "MediVision 360 API"
    }


@app.post("/api/scan/neuro")
async def scan_neuro(file: UploadFile = File(...)):
    """Brain Tumor Detection Endpoint."""
    try:
        contents = await file.read()
        model = get_neuro_model()
        
        if model is not None:
            import tensorflow as tf
            import base64
            from tensorflow.keras.models import Model
            
            nparr = np.frombuffer(contents, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                raise ValueError("Failed to decode image.")
            
            img_resized = cv2.resize(img, (224, 224))
            img_array = np.expand_dims(img_resized, axis=0)
            x = tf.keras.applications.resnet50.preprocess_input(img_array)
            
            predictions = model.predict(x, verbose=0)
            score_tumeur = float(predictions[0][1])
            
            logger.info(f"Tumor confidence: {score_tumeur * 100:.2f}%")
            
            heatmap_base64 = None
            try:
                if len(img_resized.shape) == 3:
                    gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY)
                else:
                    gray = img_resized.copy()
                
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                enhanced = clahe.apply(gray)
                
                min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(enhanced)
                thresh_value = max_val * 0.70
                _, mask = cv2.threshold(enhanced, thresh_value, 255, cv2.THRESH_BINARY)
                
                kernel = np.ones((5, 5), np.uint8)
                mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=2)
                
                heatmap_blur = cv2.GaussianBlur(mask, (41, 41), 0)
                heatmap_colored = cv2.applyColorMap(heatmap_blur, cv2.COLORMAP_JET)
                
                if len(img_resized.shape) == 2:
                    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_GRAY2RGB)
                else:
                    img_rgb = img_resized.copy()
                
                superimposed = cv2.addWeighted(img_rgb, 0.6, heatmap_colored, 0.4, 0)
                
                _, buffer = cv2.imencode('.png', superimposed)
                heatmap_base64 = base64.b64encode(buffer).decode('utf-8')
                
            except Exception as e:
                logger.error(f"Segmentation error: {str(e)}")
                heatmap_base64 = None
                    
            threshold_met = score_tumeur >= 0.70
            
            if threshold_met:
                resultat = "Tumor Detected"
                diagnosis = f"Tumor detected with {score_tumeur * 100:.2f}% confidence."
                recommendation = "Immediate biopsy required."
            else:
                resultat = "Healthy"
                diagnosis = f"Scan appears healthy with {(1 - score_tumeur) * 100:.2f}% confidence."
                recommendation = "Continue monitoring."
            
            response = {
                "filename": file.filename,
                "diagnostic": resultat,
                "confiance": f"{score_tumeur * 100:.2f}%",
                "confidence": round(score_tumeur * 100, 1),
                "prediction": resultat,
                "diagnosis": diagnosis,
                "recommendation": recommendation,
                "threshold_met": threshold_met,
                "message": "Analysis completed.",
                "probabilities": {
                    "healthy": float(predictions[0][0]),
                    "tumor": float(predictions[0][1])
                }
            }
            
            if threshold_met and heatmap_base64:
                try:
                    from neuro_advanced import analyze_heatmap_for_measurements
                    
                    advanced_data = analyze_heatmap_for_measurements(
                        heatmap_colored, 
                        img_resized,
                        round(score_tumeur * 100, 1)
                    )
                    
                    if advanced_data:
                        response["advanced_analysis"] = {
                            "measurements": advanced_data["measurements"],
                            "risk": advanced_data["risk"],
                            "recommendations": advanced_data["recommendations"]
                        }
                        
                        _, buffer = cv2.imencode('.png', advanced_data["annotated_image"])
                        annotated_b64 = base64.b64encode(buffer).decode('utf-8')
                        response["annotated_image"] = f"data:image/png;base64,{annotated_b64}"
                        
                except Exception as e:
                    logger.warning(f"Advanced analysis failed: {e}")
            
            if heatmap_base64:
                response["heatmap"] = f"data:image/png;base64,{heatmap_base64}"
            else:
                if len(img_resized.shape) == 2:
                    img_rgb = cv2.cvtColor(img_resized, cv2.COLOR_GRAY2RGB)
                else:
                    img_rgb = img_resized.copy()
                _, buffer = cv2.imencode('.png', img_rgb)
                fallback_base64 = base64.b64encode(buffer).decode('utf-8')
                response["heatmap"] = f"data:image/png;base64,{fallback_base64}"
            
            return response
        else:
            return create_mock_response("neuro", 0.98, "Tumor Detected")
    
    except Exception as e:
        logger.error(f"Error in neuro scan: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/scan/derma")
async def scan_derma(file: UploadFile = File(...)):
    """Dermatology: Lesion Analysis."""
    try:
        from derma_universal import analyze_skin_universal
        from PIL import Image
        from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
        
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Failed to decode image")
        
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(img_rgb)
        
        clip_result = analyze_skin_universal(pil_img)
        
        traumatic_keywords = ["burn", "cut", "laceration", "bruise", "hematoma", "stitches", "insect"]
        is_traumatic = any(keyword in clip_result["diagnostic_original"].lower() for keyword in traumatic_keywords)
        
        response = {
            "filename": file.filename,
            "diagnostic": clip_result["diagnostic_fr"],
            "confiance": f"{clip_result['confiance']*100:.1f}%",
            "confidence": round(clip_result['confiance'] * 100, 1),
            "conseil": clip_result["conseil_ia"],
            "gravite": clip_result["gravite"],
            "couleur_alerte": clip_result["couleur"],
            "method": "CLIP Universal Classifier",
            "threshold_met": clip_result["gravite"] in ["URGENCE", "Moyenne à Forte", "Moyenne"]
        }
        
        if not is_traumatic and clip_result['confiance'] < 0.80:
            model = get_derma_model()
            if model is not None:
                img_resized = cv2.resize(img, (224, 224))
                x = np.expand_dims(img_resized, axis=0)
                x = preprocess_input(x.astype(np.float32))
                
                preds = model.predict(x, verbose=0)
                cancer_prob = float(preds[0][1]) if len(preds[0]) > 1 else float(preds[0][0])
                
                if cancer_prob > 0.65:
                    response.update({
                        "diagnostic": "⚠️ Suspicious Lesion",
                        "confiance": f"{cancer_prob*100:.1f}%",
                        "confidence": round(cancer_prob * 100, 1),
                        "conseil": "Consult dermatologist immediately.",
                        "gravite": "URGENT",
                        "couleur_alerte": "red",
                        "method": "MobileNetV2 Cancer Detector",
                        "threshold_met": True
                    })
        
        return response
    
    except Exception as e:
        logger.error(f"Error in derma scan: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/scan/pharma")
async def scan_pharma(file: UploadFile = File(...)):
    """Pharmacy: OCR Analysis."""
    try:
        from pharma_scraper import process_pharma_image
        
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Failed to decode image")
        
        result = process_pharma_image(img)
        
        if "error" in result:
            return {
                "status": "FAILED",
                "message": result["error"],
                "nom_detecte": result.get("nom_detecte", ""),
                "ocr_raw": result.get("ocr_raw", []),
                "threshold_met": False
            }
        
        return {
            "status": "SUCCESS",
            "medicament": result['nom_detecte'],
            "info_web": {
                "titre": result['titre_web'],
                "resume": result['description'],
                "usage": result.get('usage', ''),
                "side_effects": result.get('side_effects', ''),
                "source": result['source']
            },
            "securite": {
                "niveau": result['niveau_risque'],
                "alertes": result['mots_clefs_alertes']
            },
            "threshold_met": result['niveau_risque'] == "ATTENTION"
        }
    
    except Exception as e:
        logger.error(f"Pharma error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/scan/pharma-manual")
async def scan_pharma_manual(medication_name: str = Form(...)):
    """Pharmacy: Manual search."""
    try:
        from pharma_scraper import search_drug_online
        
        drug_info = {
            'nom': medication_name.upper().strip(),
            'dosage': None,
            'full_name': medication_name.strip()
        }
        
        logger.info(f"Manual: {medication_name}")
        result = search_drug_online(drug_info)
        
        if not result:
            return {
                "status": "FAILED",
                "message": f"'{medication_name}' not found",
                "threshold_met": False
            }
        
        return {
            "status": "SUCCESS",
            "medicament": result['nom_detecte'],
            "info_web": {
                "titre": result['titre_web'],
                "resume": result['description'],
                "usage": result.get('usage', ''),
                "side_effects": result.get('side_effects', ''),
                "source": result['source']
            },
            "securite": {
                "niveau": result['niveau_risque'],
                "alertes": result['mots_clefs_alertes']
            },
            "threshold_met": result['niveau_risque'] == "ATTENTION"
        }
    except Exception as e:
        logger.error(f"Manual error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/scan/surgery")
async def scan_surgery(file: UploadFile = File(...)):
    """Surgery: Tool & Context Analysis."""
    try:
        from surgery_algo import detect_hemorrhage, check_visibility
        from surgery_copilot import analyze_surgical_context
        
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Failed to decode image")
        
        if model_surgery is None:
            from surgery_copilot import get_surgical_guidance
            
            copilot_result = get_surgical_guidance(
                tool_count=0,
                hand_visible=False,
                hemorrhage_probability=0.0,
                visibility_score=0.8
            )
            
            return {
                "filename": file.filename,
                "tool_count": 0,
                "hands_detected": 0,
                "hemorrhage_detected": False,
                "hemorrhage_confidence": 0.0,
                "visibility_score": 80.0,
                "alert_level": copilot_result["alert_level"],
                "status": copilot_result["status"],
                "suggestion": "YOLO unavailable. " + copilot_result["suggestion"],
                "surgical_phase": copilot_result["phase"],
                "method": "AI Co-Pilot Only"
            }
        
        results = model_surgery.predict(img, classes=[76, 0], conf=0.3, verbose=False)
        
        tool_count = 0
        hand_count = 0
        for box in results[0].boxes:
            cls = int(box.cls)
            if cls == 76:
                tool_count += 1
            elif cls == 0:
                hand_count += 1
        
        img_annotated = results[0].plot()
        
        is_bleeding, blood_pct, mask_blood = detect_hemorrhage(img)
        is_smoke, sharpness = check_visibility(img)
        
        copilot = analyze_surgical_context(tool_count, hand_count, blood_pct, sharpness)
        
        status = copilot['status']
        alert_message = copilot['ai_suggestion']
        alert_level = "green"
        
        if copilot['priority'] in ['critical', 'high']:
            alert_level = "red"
        elif copilot['priority'] == 'medium' or is_smoke:
            alert_level = "orange"
        
        if is_bleeding:
            heatmap_blood = cv2.applyColorMap(mask_blood, cv2.COLORMAP_JET)
            img_annotated = cv2.addWeighted(img_annotated, 0.7, heatmap_blood, 0.3, 0)
        
        _, buffer = cv2.imencode('.jpg', img_annotated)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "status": status,
            "message": alert_message,
            "level": alert_level,
            "phase": copilot['phase_op'],
            "priority": copilot['priority'],
            "data": {
                "ciseaux_visibles": tool_count,
                "mains_visibles": hand_count,
                "taux_sang": f"{blood_pct:.1f}%",
                "visibilite": f"{sharpness:.0f}/1000",
                "blood_level": copilot['blood_level'],
                "visibility_status": copilot['visibility_status']
            },
            "image": f"data:image/jpeg;base64,{img_base64}",
            "threshold_met": alert_level in ["red", "orange"]
        }
        
    except Exception as e:
        logger.error(f"Surgery error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/scan/surgery-video")
async def scan_surgery_video(file: UploadFile = File(...)):
    """Surgery Video Analysis."""
    try:
        from video_processor import extract_video_frames, process_video_frame
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp_file:
            contents = await file.read()
            tmp_file.write(contents)
            video_path = tmp_file.name
        
        logger.info(f"Processing video: {video_path}")
        
        frames = extract_video_frames(video_path, max_frames=30, fps=5)
        
        if not frames:
            os.unlink(video_path)
            return {"status": "FAILED", "message": "No frames extracted"}
        
        results = []
        for i, frame in enumerate(frames):
            frame_result = process_video_frame(frame, model_surgery)
            
            _, buffer = cv2.imencode('.jpg', frame_result['annotated_frame'])
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            
            results.append({
                "frame_number": i + 1,
                "status": frame_result["status"],
                "message": frame_result["message"],
                "level": frame_result["level"],
                "data": frame_result["data"],
                "image": f"data:image/jpeg;base64,{img_base64}"
            })
        
        os.unlink(video_path)
        
        critical_frames = sum(1 for r in results if r['level'] == 'red')
        warning_frames = sum(1 for r in results if r['level'] == 'orange')
        
        return {
            "status": "SUCCESS",
            "total_frames": len(results),
            "critical_frames": critical_frames,
            "warning_frames": warning_frames,
            "frames": results
        }
        
    except Exception as e:
        logger.error(f"Video processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting MediVision 360 API Server...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
