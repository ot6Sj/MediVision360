# Copyright (c) 2025 ot6_j. All Rights Reserved.

import easyocr
import os

print("Downloading EasyOCR models (French + English)...")
print("This will take ~2 minutes and download ~100MB")

os.makedirs('models', exist_ok=True)

reader = easyocr.Reader(['fr', 'en'], gpu=False, download_enabled=True)

print("Models downloaded successfully!")
print(f"Models location: {os.path.expanduser('~/.EasyOCR/model/')}")
print("EasyOCR will use cached models.")
