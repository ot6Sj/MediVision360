# Copyright (c) 2025 ot6_j. All Rights Reserved.

import os
import requests
from tqdm import tqdm

models_dir = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(models_dir, exist_ok=True)

dest_path = os.path.join(models_dir, "yolov8n.pt")

if os.path.exists(dest_path):
    print(f"YOLOv8n already exists at {dest_path}")
    print(f"Size: {os.path.getsize(dest_path) / 1024 / 1024:.1f} MB")
    exit(0)

url = "https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8n.pt"

print(f"Downloading YOLOv8n model from GitHub...")
print(f"URL: {url}")
print(f"Destination: {dest_path}")

try:
    response = requests.get(url, stream=True)
    response.raise_for_status()
    
    total_size = int(response.headers.get('content-length', 0))
    block_size = 8192
    
    with open(dest_path, 'wb') as f:
        if total_size:
            pbar = tqdm(total=total_size, unit='iB', unit_scale=True)
            for chunk in response.iter_content(block_size):
                f.write(chunk)
                pbar.update(len(chunk))
            pbar.close()
        else:
            f.write(response.content)
    
    print(f"YOLOv8n model downloaded successfully!")
    print(f"Size: {os.path.getsize(dest_path) / 1024 / 1024:.1f} MB")
    print(f"Saved at: {dest_path}")
    
except Exception as e:
    print(f"Download failed: {e}")
    if os.path.exists(dest_path):
        os.remove(dest_path)
    exit(1)
