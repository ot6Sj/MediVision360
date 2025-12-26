# Copyright (c) 2025 ot6_j. All Rights Reserved.

import cv2
import numpy as np

def detect_hemorrhage(img_bgr, threshold_percent=15.0):
    """Detects active bleeding based on color threshold."""
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    
    lower_red1 = np.array([0, 120, 70])
    upper_red1 = np.array([10, 255, 255])
    lower_red2 = np.array([170, 120, 70])
    upper_red2 = np.array([180, 255, 255])
    
    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    mask_blood = mask1 | mask2
    
    total_pixels = img_bgr.shape[0] * img_bgr.shape[1]
    blood_pixels = cv2.countNonZero(mask_blood)
    blood_percent = (blood_pixels / total_pixels) * 100
    
    is_hemorrhage = blood_percent > threshold_percent
    
    return is_hemorrhage, blood_percent, mask_blood

def check_visibility(img_bgr):
    """Checks image visibility/sharpness."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    is_smoke_or_blur = sharpness < 100
    return is_smoke_or_blur, sharpness
