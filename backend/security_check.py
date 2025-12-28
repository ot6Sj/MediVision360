# Copyright (c) 2025 ot6_j. All Rights Reserved.

"""
Security Module - Package Authenticity Check using ORB Feature Matching
Validates medicine packaging by comparing logos/holograms with reference images.
Uses ORB (Oriented FAST and Rotated BRIEF) - faster alternative to SIFT.
"""

import cv2
import numpy as np
import os
import base64
import logging

logger = logging.getLogger(__name__)

# Reference logos directory
LOGOS_DIR = os.path.join(os.path.dirname(__file__), "assets", "logos")


def get_available_logos():
    """Returns list of available reference logos."""
    if not os.path.exists(LOGOS_DIR):
        return []
    return [f.replace("_logo.jpg", "").replace("_logo.png", "") 
            for f in os.listdir(LOGOS_DIR) 
            if f.endswith(("_logo.jpg", "_logo.png"))]


def check_authenticity(input_img_numpy, medicine_name=None):
    """
    Uses ORB (Feature Matching) to verify if an official logo
    is present on the medicine package.
    
    Args:
        input_img_numpy: BGR image as numpy array
        medicine_name: Optional name to find specific reference logo
    
    Returns:
        dict with verification results
    """
    # 1. Find reference logo
    reference_logo_path = None
    
    if medicine_name:
        # Try to find logo matching medicine name
        for ext in [".jpg", ".png"]:
            path = os.path.join(LOGOS_DIR, f"{medicine_name.upper()}_logo{ext}")
            if os.path.exists(path):
                reference_logo_path = path
                break
    
    # If no specific logo, try generic pharma logo
    if not reference_logo_path:
        for name in ["GENERIC", "PHARMA", "SANOFI", "DOLIPRANE"]:
            for ext in [".jpg", ".png"]:
                path = os.path.join(LOGOS_DIR, f"{name}_logo{ext}")
                if os.path.exists(path):
                    reference_logo_path = path
                    break
            if reference_logo_path:
                break
    
    if not reference_logo_path or not os.path.exists(reference_logo_path):
        return {
            "verified": None,  # Cannot verify - no reference
            "status": "NO_REFERENCE",
            "message": "Aucun logo de référence disponible pour ce médicament.",
            "matches_count": 0,
            "visual_proof": None
        }

    # 2. Load reference image
    ref_img = cv2.imread(reference_logo_path, cv2.IMREAD_GRAYSCALE)
    if ref_img is None:
        return {
            "verified": None,
            "status": "LOAD_ERROR",
            "message": "Erreur de chargement du logo de référence.",
            "matches_count": 0,
            "visual_proof": None
        }
    
    # 3. Convert input to grayscale
    if len(input_img_numpy.shape) == 3:
        input_gray = cv2.cvtColor(input_img_numpy, cv2.COLOR_BGR2GRAY)
    else:
        input_gray = input_img_numpy

    # 4. Initialize ORB detector with more features
    orb = cv2.ORB_create(nfeatures=2000, scaleFactor=1.2, nlevels=8)

    # 5. Detect keypoints and compute descriptors
    kp1, des1 = orb.detectAndCompute(ref_img, None)     # Reference logo
    kp2, des2 = orb.detectAndCompute(input_gray, None)  # User photo

    if des1 is None or des2 is None:
        return {
            "verified": False,
            "status": "LOW_FEATURES",
            "message": "Pas assez de détails détectés sur l'image.",
            "matches_count": 0,
            "keypoints_ref": len(kp1) if kp1 else 0,
            "keypoints_input": len(kp2) if kp2 else 0,
            "visual_proof": None
        }

    # 6. KNN Matching with Lowe's ratio test (more robust)
    bf = cv2.BFMatcher(cv2.NORM_HAMMING)
    raw_matches = bf.knnMatch(des1, des2, k=2)
    
    # Apply ratio test (Lowe's paper)
    good_matches = []
    for m_n in raw_matches:
        if len(m_n) == 2:
            m, n = m_n
            if m.distance < 0.75 * n.distance:  # Ratio test
                good_matches.append(m)
        elif len(m_n) == 1:
            if m_n[0].distance < 60:  # Fallback for single matches
                good_matches.append(m_n[0])
    
    # Sort by distance
    good_matches = sorted(good_matches, key=lambda x: x.distance)
    
    # 7. Security decision threshold (lowered for real photos)
    GOOD_MATCH_THRESHOLD = 10  # Lowered from 15
    is_authentic = len(good_matches) >= GOOD_MATCH_THRESHOLD
    
    # 10. Determine status and message
    if is_authentic:
        status = "VERIFIED"
        message = f"✅ Logo authentique détecté ({len(good_matches)} correspondances)"
        confidence = min(100, int((len(good_matches) / 30) * 100))
    elif len(good_matches) >= 8:
        status = "UNCERTAIN"
        message = f"⚠️ Vérification incertaine ({len(good_matches)} correspondances)"
        confidence = int((len(good_matches) / 15) * 50)
    else:
        status = "SUSPICIOUS"
        message = f"🚨 Logo non reconnu ({len(good_matches)} correspondances)"
        confidence = max(0, int((len(good_matches) / 8) * 30))

    # 11. Draw matches visualization
    img_matches = cv2.drawMatches(
        ref_img, kp1, 
        input_gray, kp2, 
        good_matches[:20], None, 
        matchColor=(0, 255, 0),
        singlePointColor=(255, 0, 0),
        flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
    )
    
    # Encode visualization to base64
    _, buffer = cv2.imencode('.jpg', img_matches)
    visual_proof_b64 = base64.b64encode(buffer).decode('utf-8')

    logger.info(f"Authenticity check: {status} with {len(good_matches)} matches")

    return {
        "verified": is_authentic,
        "status": status,
        "message": message,
        "confidence": confidence,
        "matches_count": len(good_matches),
        "total_matches": len(raw_matches),
        "keypoints_ref": len(kp1),
        "keypoints_input": len(kp2),
        "reference_used": os.path.basename(reference_logo_path),
        "visual_proof": f"data:image/jpeg;base64,{visual_proof_b64}"
    }


def add_reference_logo(medicine_name, logo_image_numpy):
    """
    Saves a new reference logo for future authenticity checks.
    
    Args:
        medicine_name: Name of the medicine (will be uppercased)
        logo_image_numpy: Logo image as numpy array
    
    Returns:
        dict with save status
    """
    # Ensure directory exists
    os.makedirs(LOGOS_DIR, exist_ok=True)
    
    # Save logo
    filename = f"{medicine_name.upper()}_logo.jpg"
    filepath = os.path.join(LOGOS_DIR, filename)
    
    try:
        cv2.imwrite(filepath, logo_image_numpy)
        logger.info(f"Reference logo saved: {filepath}")
        return {
            "success": True,
            "message": f"Logo '{medicine_name}' enregistré avec succès.",
            "path": filepath
        }
    except Exception as e:
        logger.error(f"Failed to save logo: {e}")
        return {
            "success": False,
            "message": f"Erreur lors de l'enregistrement: {str(e)}"
        }
