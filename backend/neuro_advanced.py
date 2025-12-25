import cv2
import numpy as np

def analyze_heatmap_for_measurements(heatmap_colored, img_resized, confidence_score):
    """Extracts clinical measurements from heatmap."""
    if len(heatmap_colored.shape) == 3:
        heatmap_gray = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2GRAY)
    else:
        heatmap_gray = heatmap_colored
    
    _, mask = cv2.threshold(heatmap_gray, 150, 255, cv2.THRESH_BINARY)
    
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours or len(contours) == 0:
        return None
    
    cnt = max(contours, key=cv2.contourArea)
    
    surface_px = cv2.contourArea(cnt)
    
    (x, y), radius = cv2.minEnclosingCircle(cnt)
    diametre_px = radius * 2
    center = (int(x), int(y))
    
    x_box, y_box, w_box, h_box = cv2.boundingRect(cnt)
    
    PIXEL_TO_MM = 0.5
    
    surface_cm2 = (surface_px * (PIXEL_TO_MM ** 2)) / 100
    diametre_mm = diametre_px * PIXEL_TO_MM
    largeur_mm = w_box * PIXEL_TO_MM
    hauteur_mm = h_box * PIXEL_TO_MM
    
    volume_cm3 = (4/3) * np.pi * ((diametre_mm/2) ** 3) / 1000
    
    img_h, img_w = img_resized.shape[:2]
    img_center_y = img_h // 2
    img_center_x = img_w // 2
    
    if center[1] < img_h / 3:
        region = "Frontal Lobe"
    elif center[1] > 2 * img_h / 3:
        region = "Occipital Lobe"  
    elif center[0] < img_w / 2:
        region = "Left Hemisphere"
    else:
        region = "Right Hemisphere"
    
    dist_center_px = np.sqrt((center[0] - img_center_x)**2 + (center[1] - img_center_y)**2)
    dist_center_mm = dist_center_px * PIXEL_TO_MM
    
    margin_top = y_box
    margin_left = x_box  
    margin_right = img_w - (x_box + w_box)
    margin_bottom = img_h - (y_box + h_box)
    marge_min_mm = min(margin_top, margin_left, margin_right, margin_bottom) * PIXEL_TO_MM
    
    risk_score = 0
    risk_factors = []
    
    if volume_cm3 > 50:
        risk_score += 40
        risk_factors.append(f"Very large volume ({volume_cm3:.1f}cm³)")
    elif volume_cm3 > 20:
        risk_score += 25
        risk_factors.append(f"Large volume ({volume_cm3:.1f}cm³)")
    elif diametre_mm > 30:
        risk_score += 15
        risk_factors.append(f"Significant diameter ({diametre_mm:.1f}mm)")
    
    if confidence_score > 95:
        risk_score += 25
        risk_factors.append(f"High AI confidence ({confidence_score:.1f}%)")
    elif confidence_score > 85:
        risk_score += 15
        risk_factors.append(f"Clear AI signature ({confidence_score:.1f}%)")
    
    if dist_center_mm < 30 and surface_px > 100:
        risk_score += 30
        risk_factors.append("Deep/central location")
    elif "Frontal" in region or "Occipital" in region:
        risk_score += 20
        risk_factors.append(f"Critical location: {region}")
    
    if marge_min_mm < 5:
        risk_score += 20
        risk_factors.append(f"Very close to margins ({marge_min_mm:.1f}mm)")
    elif marge_min_mm < 10:
        risk_score += 10
        risk_factors.append(f"Close to margins ({marge_min_mm:.1f}mm)")
    
    if risk_score >= 70:
        risk_level = "HIGH"
        priority = "URGENT"
    elif risk_score >= 40:
        risk_level = "MODERATE"  
        priority = "PLAN SOON"
    else:
        risk_level = "LOW"
        priority = "MONITOR"
    
    recommendations = []
    
    if risk_level == "HIGH":
        recommendations.append({
            "action": "Urgent Neurosurgery Consult",
            "delai": "Within 48h",
            "raison": "High risk score"
        })
        recommendations.append({
            "action": "Contrast MRI",
            "delai": "Immediate",
            "raison": "Precise characterization needed"
        })
        if volume_cm3 > 30:
            recommendations.append({
                "action": "Consider surgical resection",
                "delai": "Plan",
                "raison": "Large volume"
            })
    elif risk_level == "MODERATE":
        recommendations.append({
            "action": "Oncology Consult",
            "delai": "Within 2 weeks",
            "raison": "In-depth evaluation"
        })
        recommendations.append({
            "action": "Guided Biopsy",
            "delai": "Plan",
            "raison": "Histological confirmation"
        })
        recommendations.append({
            "action": "Follow-up MRI",
            "delai": "3 months",
            "raison": "Monitor evolution"
        })
    else:
        recommendations.append({
            "action": "Follow-up MRI",
            "delai": "6 months",
            "raison": "Regular monitoring"
        })
        recommendations.append({
            "action": "Neurology Consult",
            "delai": "1 month",
            "raison": "Clinical evaluation"
        })
    
    img_annotated = img_resized.copy()
    
    if risk_level == "HIGH":
        color = (0, 0, 255)
    elif risk_level == "MODERATE":
        color = (0, 165, 255)
    else:
        color = (0, 255, 0)
    
    cv2.rectangle(img_annotated, (x_box, y_box), (x_box+w_box, y_box+h_box), color, 2)
    
    label = f"{volume_cm3:.1f}cm³"
    cv2.putText(img_annotated, label, (x_box, y_box-10), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
    
    return {
        "mask": mask,
        "annotated_image": img_annotated,
        "measurements": {
            "surface_cm2": round(surface_cm2, 2),
            "diametre_mm": round(diametre_mm, 1),
            "volume_cm3": round(volume_cm3, 2),
            "dimensions_mm": {
                "largeur": round(largeur_mm, 1),
                "hauteur": round(hauteur_mm, 1)
            },
            "localisation": region,
            "marge_min_mm": round(marge_min_mm, 1),
            "distance_centre_mm": round(dist_center_mm, 1)
        },
        "risk": {
            "score": risk_score,
            "level": risk_level,
            "priority": priority,
            "factors": risk_factors
        },
        "recommendations": recommendations
    }
