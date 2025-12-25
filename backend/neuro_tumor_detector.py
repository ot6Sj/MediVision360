import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)

def detect_tumor_regions(img_gray):
    """Detects potential tumor regions using adaptive thresholding."""
    equalized = cv2.equalizeHist(img_gray)
    
    blurred = cv2.GaussianBlur(equalized, (5, 5), 0)
    
    thresh = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 11, 2
    )
    
    kernel = np.ones((3, 3), np.uint8)
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=2)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel, iterations=1)
    
    contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    min_area = 100
    max_area = img_gray.shape[0] * img_gray.shape[1] * 0.3
    
    tumor_regions = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if min_area < area < max_area:
            x, y, w, h = cv2.boundingRect(cnt)
            tumor_regions.append({
                'bbox': (x, y, w, h),
                'area_pixels': area,
                'contour': cnt
            })
    
    tumor_regions.sort(key=lambda r: r['area_pixels'], reverse=True)
    
    return tumor_regions[:3]

def calculate_tumor_metrics(tumor_region, img_shape, pixel_spacing_mm=0.5):
    """Calculates clinical metrics for a detected tumor."""
    x, y, w, h = tumor_region['bbox']
    area_pixels = tumor_region['area_pixels']
    
    width_mm = w * pixel_spacing_mm
    height_mm = h * pixel_spacing_mm
    area_mm2 = area_pixels * (pixel_spacing_mm ** 2)
    area_cm2 = area_mm2 / 100
    
    radius_equivalent_mm = np.sqrt(area_mm2 / np.pi)
    volume_mm3 = (4/3) * np.pi * (radius_equivalent_mm ** 3)
    volume_cm3 = volume_mm3 / 1000
    
    img_h, img_w = img_shape
    margin_top = y
    margin_left = x
    margin_right = img_w - (x + w)
    margin_bottom = img_h - (y + h)
    min_margin = min(margin_top, margin_left, margin_right, margin_bottom) * pixel_spacing_mm
    
    center_x = x + w/2
    center_y = y + h/2
    
    if center_y < img_h / 3:
        region = "Frontal Lobe"
    elif center_y > 2 * img_h / 3:
        region = "Occipital Lobe"
    elif center_x < img_w / 2:
        region = "Left Hemisphere"
    else:
        region = "Right Hemisphere"
    
    return {
        'dimensions_mm': {'width': round(width_mm, 1), 'height': round(height_mm, 1)},
        'surface_cm2': round(area_cm2, 2),
        'volume_cm3': round(volume_cm3, 2),
        'marge_min_mm': round(min_margin, 1),
        'localisation': region,
        'position_pixels': (x, y, w, h)
    }

def predict_risk_score(metrics):
    """Calculates risk score (0-100) based on tumor metrics."""
    score = 0
    risk_factors = []
    
    volume = metrics['volume_cm3']
    if volume > 50:
        score += 40
        risk_factors.append("Very large volume (>50cm³)")
    elif volume > 20:
        score += 25
        risk_factors.append("Large volume (>20cm³)")
    elif volume > 5:
        score += 10
        risk_factors.append("Moderate volume (>5cm³)")
    
    loc = metrics['localisation']
    if "Frontal" in loc or "Occipital" in loc:
        score += 20
        risk_factors.append(f"Critical location: {loc}")
    
    margin = metrics['marge_min_mm']
    if margin < 5:
        score += 30
        risk_factors.append("Very close to margins (<5mm)")
    elif margin < 10:
        score += 15
        risk_factors.append("Close to margins (<10mm)")
    
    ratio = metrics['dimensions_mm']['width'] / max(metrics['dimensions_mm']['height'], 1)
    if ratio > 2 or ratio < 0.5:
        score += 10
        risk_factors.append("Irregular shape")
    
    score = min(score, 100)
    
    if score >= 70:
        level = "HIGH"
        priority = "URGENT"
    elif score >= 40:
        level = "MODERATE"
        priority = "PLAN SOON"
    else:
        level = "LOW"
        priority = "MONITOR"
    
    return {
        'score': score,
        'niveau': level,
        'priorite': priority,
        'facteurs': risk_factors
    }

def recommend_treatment(risk_score, metrics):
    """Generates treatment recommendations based on risk."""
    recommendations = []
    urgency = "standard"
    
    score = risk_score['score']
    volume = metrics['volume_cm3']
    
    if score >= 70:
        urgency = "urgent"
        recommendations.append({
            'action': 'Urgent Neurosurgery Consult',
            'delai': 'Within 48h',
            'raison': 'High risk score'
        })
        recommendations.append({
            'action': 'Contrast MRI',
            'delai': 'Immediate',
            'raison': 'Precise characterization'
        })
        if volume > 30:
            recommendations.append({
                'action': 'Consider surgical resection',
                'delai': 'Plan',
                'raison': 'Large volume'
            })
    
    elif score >= 40:
        urgency = "plan"
        recommendations.append({
            'action': 'Oncology Consult',
            'delai': 'Within 2 weeks',
            'raison': 'In-depth evaluation'
        })
        recommendations.append({
            'action': 'Guided Biobsy',
            'delai': 'Plan',
            'raison': 'Histological confirmation'
        })
        recommendations.append({
            'action': 'Follow-up MRI',
            'delai': '3 months',
            'raison': 'Monitor'
        })
    
    else:
        urgency = "monitor"
        recommendations.append({
            'action': 'Follow-up MRI',
            'delai': '6 months',
            'raison': 'Regular monitoring'
        })
        recommendations.append({
            'action': 'Neurology Consult',
            'delai': '1 month',
            'raison': 'Clinical evaluation'
        })
    
    return {
        'urgence': urgency,
        'recommandations': recommendations
    }

def analyze_brain_mri(img_bgr):
    """Performs complete brain MRI analysis."""
    logger.info("Starting brain MRI analysis...")
    
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    tumor_regions = detect_tumor_regions(img_gray)
    
    if not tumor_regions:
        return {
            'status': 'NO_TUMOR',
            'message': 'No anomalies detected',
            'tumors': []
        }
    
    tumors_analyzed = []
    for i, region in enumerate(tumor_regions):
        metrics = calculate_tumor_metrics(region, img_gray.shape)
        risk = predict_risk_score(metrics)
        treatment = recommend_treatment(risk, metrics)
        
        tumors_analyzed.append({
            'id': i + 1,
            'metrics': metrics,
            'risk': risk,
            'treatment': treatment
        })
    
    img_annotated = img_bgr.copy()
    for i, region in enumerate(tumor_regions):
        x, y, w, h = region['bbox']
        tumor = tumors_analyzed[i]
        
        if tumor['risk']['niveau'] == 'HIGH':
            color = (0, 0, 255)
        elif tumor['risk']['niveau'] == 'MODERATE':
            color = (0, 165, 255)
        else:
            color = (0, 255, 0)
        
        cv2.rectangle(img_annotated, (x, y), (x+w, y+h), color, 2)
        
        label = f"T{i+1}: {tumor['metrics']['volume_cm3']}cm³"
        cv2.putText(img_annotated, label, (x, y-10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    
    main_tumor = tumors_analyzed[0]
    
    logger.info(f"Detected {len(tumors_analyzed)} tumor(s)")
    
    return {
        'status': 'TUMOR_DETECTED',
        'message': f'{len(tumors_analyzed)} anomaly(ies) detected',
        'main_tumor': main_tumor,
        'all_tumors': tumors_analyzed,
        'annotated_image': img_annotated
    }
