# Copyright (c) 2025 ot6_j. All Rights Reserved.

import cv2
import numpy as np
import base64
import tempfile
import os
from surgery_algo import detect_hemorrhage, check_visibility

# Surgical-relevant class IDs in COCO
SURGICAL_CLASSES = [0, 42, 43, 44, 76]
SURGICAL_LABELS = {
    0: 'Hands',
    42: 'Retractor',
    43: 'Scalpel', 
    44: 'Instrument',
    76: 'Scissors'
}

def process_video_frame(frame, model_surgery):
    """Processes a single video frame for surgery monitoring."""
    results = model_surgery.predict(frame, classes=SURGICAL_CLASSES, conf=0.3, verbose=False)
    
    tool_count = 0
    hand_count = 0
    detections = []
    
    for box in results[0].boxes:
        cls_id = int(box.cls)
        conf = float(box.conf)
        xyxy = box.xyxy[0].tolist()
        
        label = SURGICAL_LABELS.get(cls_id, f"Object {cls_id}")
        detections.append({
            "label": label,
            "confidence": round(conf * 100, 1)
        })
        
        if cls_id in [42, 43, 44, 76]:
            tool_count += 1
        elif cls_id == 0:
            hand_count += 1
    
    # Draw annotations on frame
    img_annotated = frame.copy()
    for box in results[0].boxes:
        cls_id = int(box.cls)
        conf = float(box.conf)
        x1, y1, x2, y2 = [int(x) for x in box.xyxy[0].tolist()]
        
        label = SURGICAL_LABELS.get(cls_id, "Object")
        label_text = f"{label} {conf*100:.0f}%"
        
        color = (255, 165, 0) if cls_id == 0 else (0, 255, 0)
        cv2.rectangle(img_annotated, (x1, y1), (x2, y2), color, 2)
        
        (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(img_annotated, (x1, y1 - th - 6), (x1 + tw + 4, y1), color, -1)
        cv2.putText(img_annotated, label_text, (x1 + 2, y1 - 4), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
    
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
            "tools": tool_count,
            "hands": hand_count,
            "blood_pct": round(blood_pct, 1),
            "sharpness": round(sharpness, 0),
            "detections": detections
        },
        "annotated_frame": img_annotated
    }


def process_full_video(video_path, model_surgery, target_fps=10):
    """
    Process entire video and return:
    - Annotated video as WebM (VP9 codec - web compatible)
    - Per-second statistics for synchronized display
    """
    import imageio
    
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        raise ValueError("Could not open video file")
    
    # Get video properties
    original_fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = total_frames / original_fps if original_fps > 0 else 0
    
    # Frame skip for target FPS
    frame_skip = max(1, int(original_fps / target_fps))
    
    # Collect annotated frames and stats
    annotated_frames = []
    timeline = {}
    frame_count = 0
    processed_frames = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # Process every Nth frame
        if frame_count % frame_skip == 0:
            current_time = frame_count / original_fps
            current_second = int(current_time)
            
            # Process frame with YOLO
            result = process_video_frame(frame, model_surgery)
            
            # Convert BGR to RGB for imageio
            frame_rgb = cv2.cvtColor(result["annotated_frame"], cv2.COLOR_BGR2RGB)
            annotated_frames.append(frame_rgb)
            
            # Store stats for this second
            timeline[current_second] = {
                "time": current_second,
                "status": result["status"],
                "message": result["message"],
                "level": result["level"],
                "tools": result["data"]["tools"],
                "hands": result["data"]["hands"],
                "blood_pct": result["data"]["blood_pct"],
                "sharpness": result["data"]["sharpness"],
                "detections": result["data"]["detections"]
            }
            
            processed_frames += 1
        
        frame_count += 1
    
    cap.release()
    
    # Create output video using imageio with ffmpeg
    temp_output = tempfile.NamedTemporaryFile(suffix='.mp4', delete=False)
    temp_output.close()
    
    # Write video with H.264 codec (web compatible)
    writer = imageio.get_writer(
        temp_output.name,
        fps=target_fps,
        codec='libx264',
        pixelformat='yuv420p',
        output_params=['-crf', '23', '-preset', 'fast']
    )
    
    for frame in annotated_frames:
        writer.append_data(frame)
    
    writer.close()
    
    # Read and encode to base64
    with open(temp_output.name, 'rb') as f:
        video_bytes = f.read()
    
    video_base64 = base64.b64encode(video_bytes).decode('utf-8')
    
    # Clean up
    os.unlink(temp_output.name)
    
    # Convert timeline dict to sorted list
    timeline_list = [timeline[s] for s in sorted(timeline.keys())]
    
    # Calculate summary
    critical_count = sum(1 for s in timeline_list if s["level"] == "red")
    warning_count = sum(1 for s in timeline_list if s["level"] == "orange")
    
    return {
        "video_base64": video_base64,
        "video_mime": "video/mp4",
        "duration": round(duration, 1),
        "fps": target_fps,
        "total_seconds": len(timeline_list),
        "processed_frames": processed_frames,
        "timeline": timeline_list,
        "summary": {
            "critical_seconds": critical_count,
            "warning_seconds": warning_count,
            "stable_seconds": len(timeline_list) - critical_count - warning_count
        }
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
