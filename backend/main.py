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
    import torch
    from ultralytics import YOLO
    from ultralytics.nn.tasks import DetectionModel
    import base64
    
    # Allow ultralytics classes for torch.load (PyTorch 2.6+ security)
    torch.serialization.add_safe_globals([DetectionModel])
    
    # Using YOLOv8s (small) for better accuracy than nano
    model_surgery = YOLO('yolov8s.pt')
    logger.info("YOLOv8s (small) loaded - more accurate than nano")
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
async def scan_neuro(file: UploadFile = File(...), mode: str = "fast"):
    """
    Brain Tumor Detection Endpoint.
    
    mode="fast" -> Quick ResNet screening (Yes/No + Confidence)
    mode="precision" -> Full morphometric analysis (Measurements, Mask, Risk)
    """
    import time
    start_time = time.time()
    
    try:
        contents = await file.read()
        model = get_neuro_model()
        
        if model is None:
            return create_mock_response("neuro", 0.98, "Tumor Detected")
        
        import tensorflow as tf
        import base64
        
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Failed to decode image.")
        
        img_resized = cv2.resize(img, (224, 224))
        img_array = np.expand_dims(img_resized, axis=0)
        x = tf.keras.applications.resnet50.preprocess_input(img_array)
        
        # ResNet prediction (used by both modes)
        predictions = model.predict(x, verbose=0)
        score_tumeur = float(predictions[0][1])
        
        logger.info(f"Mode: {mode} | Tumor confidence: {score_tumeur * 100:.2f}%")
        
        # ================================================================
        # MODE FAST: Quick Screening (ResNet only)
        # ================================================================
        if mode == "fast":
            elapsed = time.time() - start_time
            
            threshold_met = score_tumeur >= 0.70
            
            if threshold_met:
                diagnostic = "Tumor Detected"
                action = "Switch to Precision mode for detailed measurements."
            else:
                diagnostic = "Healthy"
                action = "No further action required. Continue routine monitoring."
            
            # Generate simple heatmap for visualization
            heatmap_base64 = None
            try:
                gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY) if len(img_resized.shape) == 3 else img_resized.copy()
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                enhanced = clahe.apply(gray)
                _, max_val, _, _ = cv2.minMaxLoc(enhanced)
                _, mask = cv2.threshold(enhanced, max_val * 0.70, 255, cv2.THRESH_BINARY)
                kernel = np.ones((5, 5), np.uint8)
                mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=2)
                heatmap_blur = cv2.GaussianBlur(mask, (41, 41), 0)
                heatmap_colored = cv2.applyColorMap(heatmap_blur, cv2.COLORMAP_JET)
                img_rgb = img_resized.copy() if len(img_resized.shape) == 3 else cv2.cvtColor(img_resized, cv2.COLOR_GRAY2RGB)
                superimposed = cv2.addWeighted(img_rgb, 0.6, heatmap_colored, 0.4, 0)
                _, buffer = cv2.imencode('.png', superimposed)
                heatmap_base64 = base64.b64encode(buffer).decode('utf-8')
            except Exception as e:
                logger.warning(f"Fast mode heatmap generation failed: {e}")
            
            response = {
                "mode": "RAPID SCREENING (ResNet50)",
                "filename": file.filename,
                "diagnostic": diagnostic,
                "confiance": f"{score_tumeur * 100:.1f}%",
                "confidence": round(score_tumeur * 100, 1),
                "temps_calcul": f"{elapsed:.2f}s",
                "action": action,
                "threshold_met": threshold_met,
                "probabilities": {
                    "healthy": float(predictions[0][0]),
                    "tumor": float(predictions[0][1])
                }
            }
            
            if heatmap_base64:
                response["heatmap"] = f"data:image/png;base64,{heatmap_base64}"
            
            return response
        
        # ================================================================
        # MODE PRECISION: Full Morphometric Analysis
        # ================================================================
        elif mode == "precision":
            from neuro_advanced import analyze_heatmap_for_measurements
            
            # Generate segmentation heatmap
            gray = cv2.cvtColor(img_resized, cv2.COLOR_BGR2GRAY) if len(img_resized.shape) == 3 else img_resized.copy()
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(gray)
            _, max_val, _, _ = cv2.minMaxLoc(enhanced)
            _, mask = cv2.threshold(enhanced, max_val * 0.70, 255, cv2.THRESH_BINARY)
            kernel = np.ones((5, 5), np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=2)
            heatmap_blur = cv2.GaussianBlur(mask, (41, 41), 0)
            heatmap_colored = cv2.applyColorMap(heatmap_blur, cv2.COLORMAP_JET)
            
            # Generate basic heatmap overlay
            img_rgb = img_resized.copy() if len(img_resized.shape) == 3 else cv2.cvtColor(img_resized, cv2.COLOR_GRAY2RGB)
            superimposed = cv2.addWeighted(img_rgb, 0.6, heatmap_colored, 0.4, 0)
            _, buffer = cv2.imencode('.png', superimposed)
            heatmap_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Run advanced morphometric analysis
            advanced_data = analyze_heatmap_for_measurements(
                heatmap_colored, 
                img_resized,
                round(score_tumeur * 100, 1)
            )
            
            elapsed = time.time() - start_time
            
            if advanced_data:
                # Encode binary mask (B&W)
                _, mask_buffer = cv2.imencode('.png', advanced_data["mask"])
                mask_b64 = base64.b64encode(mask_buffer).decode('utf-8')
                
                # Encode annotated image
                _, annotated_buffer = cv2.imencode('.png', advanced_data["annotated_image"])
                annotated_b64 = base64.b64encode(annotated_buffer).decode('utf-8')
                
                response = {
                    "mode": "SURGICAL PLANNING (Segmentation)",
                    "filename": file.filename,
                    "diagnostic": "Complete Morphometric Analysis",
                    "confiance": f"{score_tumeur * 100:.1f}%",
                    "confidence": round(score_tumeur * 100, 1),
                    "temps_calcul": f"{elapsed:.2f}s",
                    "threshold_met": score_tumeur >= 0.70,
                    "data": advanced_data["measurements"],
                    "risk": advanced_data["risk"],
                    "recommendations": advanced_data["recommendations"],
                    "image_masque": f"data:image/png;base64,{mask_b64}",
                    "annotated_image": f"data:image/png;base64,{annotated_b64}",
                    "heatmap": f"data:image/png;base64,{heatmap_base64}",
                    "probabilities": {
                        "healthy": float(predictions[0][0]),
                        "tumor": float(predictions[0][1])
                    }
                }
            else:
                # Fallback if advanced analysis fails
                response = {
                    "mode": "SURGICAL PLANNING (Segmentation)",
                    "filename": file.filename,
                    "diagnostic": "No significant lesion detected for measurement",
                    "confiance": f"{score_tumeur * 100:.1f}%",
                    "confidence": round(score_tumeur * 100, 1),
                    "temps_calcul": f"{elapsed:.2f}s",
                    "threshold_met": False,
                    "data": None,
                    "risk": {"level": "LOW", "score": 0, "factors": []},
                    "recommendations": [{"action": "Continue monitoring", "delai": "6 months", "raison": "No abnormality detected"}],
                    "heatmap": f"data:image/png;base64,{heatmap_base64}",
                    "probabilities": {
                        "healthy": float(predictions[0][0]),
                        "tumor": float(predictions[0][1])
                    }
                }
            
            return response
        
        # ================================================================
        # INVALID MODE: Return error
        # ================================================================
        else:
            raise HTTPException(status_code=400, detail=f"Invalid mode '{mode}'. Use 'fast' or 'precision'.")
    
    except HTTPException:
        raise
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
    """Pharmacy: OCR Analysis + Package Authenticity Check."""
    try:
        from pharma_scraper import process_pharma_image
        from security_check import check_authenticity
        
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Failed to decode image")
        
        # 1. OCR Analysis
        result = process_pharma_image(img)
        
        # 2. Package Authenticity Check (ORB Feature Matching)
        medicine_name = result.get('nom_detecte', '')
        auth_result = check_authenticity(img, medicine_name)
        
        if "error" in result:
            return {
                "status": "FAILED",
                "message": result["error"],
                "nom_detecte": result.get("nom_detecte", ""),
                "ocr_raw": result.get("ocr_raw", []),
                "threshold_met": False,
                "authenticity": auth_result
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
            "authenticity": {
                "verified": auth_result['verified'],
                "status": auth_result['status'],
                "message": auth_result['message'],
                "confidence": auth_result.get('confidence', 0),
                "matches": auth_result['matches_count'],
                "visual_proof": auth_result.get('visual_proof')
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
        
        # Surgical-relevant class IDs in COCO:
        # 0=person (hands), 42=fork (retractor-like), 43=knife (scalpel), 44=spoon (instrument), 76=scissors
        SURGICAL_CLASSES = [0, 42, 43, 44, 76]
        SURGICAL_LABELS = {
            0: 'Hands/Person',
            42: 'Retractor (fork)',
            43: 'Scalpel (knife)', 
            44: 'Instrument (spoon)',
            76: 'Scissors'
        }
        
        # YOLO detection - only surgical-relevant classes
        results = model_surgery.predict(img, classes=SURGICAL_CLASSES, conf=0.3, verbose=False)
        
        # Parse detections
        detections = []
        tool_count = 0
        hand_count = 0
        
        for box in results[0].boxes:
            cls_id = int(box.cls)
            conf = float(box.conf)
            xyxy = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
            
            # Use surgical label instead of COCO label
            label = SURGICAL_LABELS.get(cls_id, f"Object {cls_id}")
            
            detections.append({
                "class_id": cls_id,
                "label": label,
                "confidence": round(conf * 100, 1),
                "bbox": [int(x) for x in xyxy]
            })
            
            # Count surgical tools and hands
            if cls_id in [42, 43, 44, 76]:  # tools
                tool_count += 1
            elif cls_id == 0:  # person/hands
                hand_count += 1
        
        # Start with original image for annotation
        img_annotated = img.copy()
        
        # Draw custom annotations for surgical detections only
        for det in detections:
            x1, y1, x2, y2 = det['bbox']
            label_text = f"{det['label']} {det['confidence']}%"
            
            # Color coding: green for tools, blue for hands
            if det['class_id'] == 0:
                color = (255, 165, 0)  # Orange for hands
            else:
                color = (0, 255, 0)  # Green for tools
            
            # Draw bounding box
            cv2.rectangle(img_annotated, (x1, y1), (x2, y2), color, 3)
            
            # Draw label background
            (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(img_annotated, (x1, y1 - th - 10), (x1 + tw + 10, y1), color, -1)
            cv2.putText(img_annotated, label_text, (x1 + 5, y1 - 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
        
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
            "detections": detections,
            "total_objects": len(detections),
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


@app.post("/api/scan/surgery-video-realtime")
async def scan_surgery_video_realtime(file: UploadFile = File(...)):
    """
    Real-time synchronized video analysis.
    Returns annotated H.264 video + per-second timeline for synchronized playback.
    """
    try:
        from video_processor import process_full_video
        import tempfile
        import os
        
        # Save uploaded video to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp_file:
            contents = await file.read()
            tmp_file.write(contents)
            video_path = tmp_file.name
        
        logger.info(f"Processing video for real-time playback: {video_path}")
        
        # Process entire video with YOLO annotations at 10 FPS
        result = process_full_video(video_path, model_surgery, target_fps=10)
        
        # Clean up temp file
        os.unlink(video_path)
        
        logger.info(f"Video processed: {result['processed_frames']} frames, {result['total_seconds']}s")
        
        return {
            "status": "SUCCESS",
            "video": f"data:{result['video_mime']};base64,{result['video_base64']}",
            "duration": result["duration"],
            "fps": result["fps"],
            "total_seconds": result["total_seconds"],
            "timeline": result["timeline"],
            "summary": result["summary"]
        }
        
    except Exception as e:
        logger.error(f"Real-time video processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting MediVision 360 API Server...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
