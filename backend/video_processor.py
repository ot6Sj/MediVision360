import cv2
import numpy as np
import base64
from surgery_algo import detect_hemorrhage, check_visibility

def process_video_frame(frame, model_surgery):
    """Processes a single video frame for surgery monitoring."""
    results = model_surgery.predict(frame, classes=[76, 0], conf=0.3, verbose=False)
    
    tool_count = 0
    hand_count = 0
    for box in results[0].boxes:
        cls = int(box.cls)
        if cls == 76:
            tool_count += 1
        elif cls == 0:
            hand_count += 1
    
    img_annotated = results[0].plot()
    
    is_bleeding, blood_pct, mask_blood = detect_hemorrhage(frame)
    is_smoke, sharpness = check_visibility(frame)
    
    status = "STABLE"
    alert_message = "Operation in progress"
    alert_level = "green"
    
    if is_bleeding:
        status = "CRITICAL"
        alert_message = f"HEMORRHAGE ({blood_pct:.1f}%)"
        alert_level = "red"
        heatmap_blood = cv2.applyColorMap(mask_blood, cv2.COLORMAP_JET)
        img_annotated = cv2.addWeighted(img_annotated, 0.7, heatmap_blood, 0.3, 0)
        
    elif is_smoke:
        status = "WARNING"
        alert_message = "Reduced visibility"
        alert_level = "orange"
        
    elif tool_count == 0 and hand_count == 0:
        status = "INACTIVE"
        alert_message = "No activity"
        alert_level = "gray"
    
    return {
        "status": status,
        "message": alert_message,
        "level": alert_level,
        "data": {
            "ciseaux_visibles": tool_count,
            "mains_visibles": hand_count,
            "taux_sang": f"{blood_pct:.1f}%",
            "visibilite": f"{sharpness:.0f}/1000"
        },
        "annotated_frame": img_annotated
    }

def extract_video_frames(video_path, max_frames=30, fps=5):
    """Extracts frames from a video file."""
    cap = cv2.VideoCapture(video_path)
    frames = []
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    video_fps = int(cap.get(cv2.CAP_PROP_FPS))
    
    frame_skip = max(1, video_fps // fps)
    
    frame_count = 0
    extracted = 0
    
    while cap.isOpened() and extracted < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
        
        if frame_count % frame_skip == 0:
            frames.append(frame)
            extracted += 1
        
        frame_count += 1
    
    cap.release()
    return frames
