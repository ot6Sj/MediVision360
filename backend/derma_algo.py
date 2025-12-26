# Copyright (c) 2025 ot6_j. All Rights Reserved.

import cv2
import numpy as np

def detect_coin_reference(img_bgr):
    """Detects a coin to calibrate the scale (px to mm)."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gray_blur = cv2.medianBlur(gray, 5)
    
    circles = cv2.HoughCircles(
        gray_blur, 
        cv2.HOUGH_GRADIENT, 
        dp=1.0,           
        minDist=30,       
        param1=100,       
        param2=25,        
        minRadius=20,     
        maxRadius=100     
    )
    
    scale_ratio = None
    coin_info = None

    if circles is not None:
        circles = np.round(circles[0, :]).astype("int")
        valid_circles = []
        for (cx, cy, r) in circles:
            if cx - r < 0 or cy - r < 0 or cx + r >= img_bgr.shape[1] or cy + r >= img_bgr.shape[0]:
                continue
            
            mask = np.zeros(gray.shape, dtype=np.uint8)
            cv2.circle(mask, (cx, cy), r, 255, -1)
            
            roi = cv2.bitwise_and(gray, gray, mask=mask)
            std_dev = np.std(roi[roi > 0])
            
            if std_dev < 40:
                valid_circles.append((cx, cy, r, std_dev))
        
        if valid_circles:
            cx, cy, r, _ = max(valid_circles, key=lambda x: x[2])
            scale_ratio = (r * 2) / 23.0
            coin_info = (cx, cy, r)
        
    return scale_ratio, coin_info


def analyze_lesion_geometry(img_bgr, scale_ratio):
    """Analyzes lesion geometry and severity."""
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    
    lower_skin = np.array([0, 20, 70], dtype=np.uint8)
    upper_skin = np.array([20, 150, 255], dtype=np.uint8)
    skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
    
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel, iterations=1)
    
    contours_skin, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours_skin:
        return {
            "type": "Indeterminate",
            "surface_cm2": 0.0,
            "longueur_mm": 0.0,
            "gravite": "Image unclear",
            "conseil": "No skin detected.",
            "urgence": False
        }
    
    hand_contour = max(contours_skin, key=cv2.contourArea)
    hand_mask = np.zeros(skin_mask.shape, dtype=np.uint8)
    cv2.drawContours(hand_mask, [hand_contour], -1, 255, -1)
    
    lower_red1 = np.array([0, 40, 40], dtype=np.uint8)
    upper_red1 = np.array([10, 255, 255], dtype=np.uint8)
    lower_red2 = np.array([160, 40, 40], dtype=np.uint8)
    upper_red2 = np.array([180, 255, 255], dtype=np.uint8)
    
    red_mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    red_mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    red_mask = red_mask1 | red_mask2
    
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    _, dark_mask = cv2.threshold(gray, 80, 255, cv2.THRESH_BINARY_INV)
    
    lower_bruise = np.array([100, 40, 40], dtype=np.uint8)
    upper_bruise = np.array([140, 255, 200], dtype=np.uint8)
    bruise_mask = cv2.inRange(hsv, lower_bruise, upper_bruise)
    
    color_anomaly_mask = red_mask | dark_mask | bruise_mask
    
    skin_gray = cv2.bitwise_and(gray, gray, mask=hand_mask)
    skin_blur = cv2.GaussianBlur(skin_gray, (5, 5), 0)
    edges = cv2.Canny(skin_blur, threshold1=30, threshold2=100)
    
    kernel_edge = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    edges_dilated = cv2.dilate(edges, kernel_edge, iterations=2)
    
    contours_edge, _ = cv2.findContours(edges_dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    edge_regions_mask = np.zeros(edges.shape, dtype=np.uint8)
    for cnt_edge in contours_edge:
        if cv2.contourArea(cnt_edge) > 50:
            cv2.drawContours(edge_regions_mask, [cnt_edge], -1, 255, -1)
    
    lesion_candidates = cv2.bitwise_and(color_anomaly_mask, edge_regions_mask)
    lesion_candidates = cv2.bitwise_and(lesion_candidates, lesion_candidates, mask=hand_mask)
    
    kernel_clean = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    lesion_mask = cv2.morphologyEx(lesion_candidates, cv2.MORPH_CLOSE, kernel_clean, iterations=2)
    lesion_mask = cv2.morphologyEx(lesion_mask, cv2.MORPH_OPEN, kernel_clean, iterations=1)
    
    contours_lesion, _ = cv2.findContours(lesion_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours_lesion:
        color_only = cv2.bitwise_and(color_anomaly_mask, color_anomaly_mask, mask=hand_mask)
        contours_lesion, _ = cv2.findContours(color_only, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        hand_area = cv2.contourArea(hand_contour)
        contours_lesion = [c for c in contours_lesion if cv2.contourArea(c) < hand_area * 0.3]
        
        if not contours_lesion:
            return {
                "type": "Healthy Skin",
                "surface_cm2": 0.0,
                "longueur_mm": 0.0,
                "gravite": "No lesion detected",
                "conseil": "Skin appears healthy.",
                "urgence": False
            }
    
    hand_area = cv2.contourArea(hand_contour)
    valid_lesions = [c for c in contours_lesion if cv2.contourArea(c) < hand_area * 0.4]
    
    if not valid_lesions:
        return {
            "type": "Imprecise Detection",
            "surface_cm2": 0.0,
            "longueur_mm": 0.0,
            "gravite": "Detected area too large",
            "conseil": "Check lighting.",
            "urgence": False
        }
    
    cnt = max(valid_lesions, key=cv2.contourArea)
    area_px = cv2.contourArea(cnt)
    
    if scale_ratio is None:
        img_width_px = img_bgr.shape[1]
        scale_ratio = img_width_px / 150.0
    
    area_cm2 = (area_px / (scale_ratio ** 2)) / 100
    
    rect = cv2.minAreaRect(cnt)
    (x, y), (w, h), angle = rect
    length_mm = max(w, h) / scale_ratio
    
    aspect_ratio = min(w, h) / max(w, h) if max(w, h) > 0 else 1
    
    mask_roi = np.zeros(img_bgr.shape[:2], dtype=np.uint8)
    cv2.drawContours(mask_roi, [cnt], -1, 255, -1)
    
    roi_gray = cv2.bitwise_and(gray, gray, mask=mask_roi)
    roi_pixels = roi_gray[mask_roi > 0]
    
    if len(roi_pixels) == 0:
        return {
            "type": "Detection Error",
            "surface_cm2": 0.0,
            "longueur_mm": 0.0,
            "gravite": "Empty ROI",
            "conseil": "Retry photo.",
            "urgence": False
        }
    
    mean_intensity = np.mean(roi_pixels)
    std_intensity = np.std(roi_pixels)
    
    laplacian = cv2.Laplacian(roi_gray, cv2.CV_64F)
    laplacian_var = laplacian.var()
    very_dark_ratio = np.sum(roi_pixels < 50) / len(roi_pixels)
    
    kernel_dilate = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
    surrounding_mask = cv2.dilate(mask_roi, kernel_dilate, iterations=1)
    surrounding_mask = cv2.bitwise_and(surrounding_mask, hand_mask)
    surrounding_mask = cv2.bitwise_xor(surrounding_mask, mask_roi)
    
    surrounding_pixels = gray[surrounding_mask > 0]
    
    validation_score = 0
    contrast = 0
    
    if len(surrounding_pixels) > 0:
        mean_surrounding = np.mean(surrounding_pixels)
        contrast = abs(mean_intensity - mean_surrounding)
        
        if contrast > 20:
            validation_score += 3
        elif contrast > 10:
            validation_score += 2
        elif contrast > 5:
            validation_score += 1
    
    red_count = cv2.countNonZero(cv2.bitwise_and(red_mask, red_mask, mask=mask_roi))
    dark_count = cv2.countNonZero(cv2.bitwise_and(dark_mask, dark_mask, mask=mask_roi))
    bruise_count = cv2.countNonZero(cv2.bitwise_and(bruise_mask, bruise_mask, mask=mask_roi))
    
    total_roi_pixels = cv2.countNonZero(mask_roi)
    red_ratio = red_count / total_roi_pixels if total_roi_pixels > 0 else 0
    dark_ratio = dark_count / total_roi_pixels if total_roi_pixels > 0 else 0
    bruise_ratio = bruise_count / total_roi_pixels if total_roi_pixels > 0 else 0
    
    max_color_ratio = max(red_ratio, dark_ratio, bruise_ratio)
    if max_color_ratio > 0.4:
        validation_score += 3
    elif max_color_ratio > 0.25:
        validation_score += 2
    elif max_color_ratio > 0.15:
        validation_score += 1
    
    edge_count = cv2.countNonZero(cv2.bitwise_and(edges, edges, mask=mask_roi))
    edge_density = edge_count / total_roi_pixels if total_roi_pixels > 0 else 0
    
    if edge_density > 0.3:
        validation_score += 2
    elif edge_density > 0.15:
        validation_score += 1
    
    if validation_score < 3:
        return {
            "type": "Normal Skin",
            "surface_cm2": 0.0,
            "longueur_mm": 0.0,
            "gravite": "No lesion",
            "conseil": "Score: {validation_score}/8. Healthy.",
            "urgence": False
        }

    lesion_type = "Indeterminate"
    
    if bruise_count > max(red_count, dark_count):
        lesion_type = "Bruise"
    
    elif aspect_ratio < 0.35 and red_ratio > 0.3:
        lesion_type = "Cut"
    
    elif red_ratio > 0.2 or dark_ratio > 0.2:
        if very_dark_ratio > 0.3 or (mean_intensity < 70 and laplacian_var > 400):
            lesion_type = "3rd Degree Burn"
        elif std_intensity > 25 or (std_intensity > 20 and area_cm2 > 0.5):
            max_intensity = np.max(roi_pixels)
            min_intensity = np.min(roi_pixels)
            intensity_range = max_intensity - min_intensity
            if intensity_range > 80 or laplacian_var > 200:
                lesion_type = "2rd Degree Burn (Blisters)"
            else:
                lesion_type = "2rd Degree Burn"
        elif std_intensity < 25 and mean_intensity > 70:
            lesion_type = "1st Degree Burn"
        else:
            if mean_intensity < 80:
                lesion_type = "2rd Degree Burn (Suspected)"
            else:
                lesion_type = "1st Degree Burn (Suspected)"
    else:
        lesion_type = "Mild Inflammation"
    
    severity = "LOW"
    conseil = "Clean and monitor."
    urgence_flag = False

    if "Cut" in lesion_type:
        if length_mm > 30:
            severity = "HIGH"
            conseil = "Deep wound (>3cm). Stitches likely."
            urgence_flag = True
        elif length_mm > 10:
            severity = "MODERATE"
            conseil = "Use adhesive strips."
        else:
            severity = "LOW"
            conseil = "Clean with soap and water."
    
    elif "3rd Degree" in lesion_type:
        severity = "CRITICAL"
        conseil = "Deep burn. EMERGENCY. Do not cool."
        urgence_flag = True
    
    elif "2nd Degree" in lesion_type or "Blister" in lesion_type:
        if area_cm2 > 10:
            severity = "SEVERE"
            conseil = "Large area. Hospital advised."
            urgence_flag = True
        else:
            severity = "MODERATE"
            conseil = "Cool for 15 min. Do not pop blisters."
    
    elif "1st Degree" in lesion_type:
        severity = "SUPERFICIAL"
        conseil = "Cool, apply soothing cream."
    
    elif lesion_type == "Bruise":
        if area_cm2 > 25:
            severity = "Significant Hematoma"
            conseil = "Ice 20min/h."
        else:
            severity = "Benign"
            conseil = "Rest, ice."
    
    elif "Inflammation" in lesion_type:
        severity = "MINOR"
        conseil = "Mild irritation."
    
    else:
        severity = "UNCERTAIN"
        conseil = "Consult dermatologist."

    return {
        "type": lesion_type,
        "surface_cm2": round(area_cm2, 2),
        "longueur_mm": round(length_mm, 1),
        "gravite": severity,
        "conseil": conseil,
        "urgence": urgence_flag
    }
