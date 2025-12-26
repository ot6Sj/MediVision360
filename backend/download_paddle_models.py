# Copyright (c) 2025 ot6_j. All Rights Reserved.

from paddleocr import PaddleOCR
import os

print("Downloading PaddleOCR models (French + English)...")
print("Models will be saved to: ./models/paddle_models/")

os.makedirs('models/paddle_models', exist_ok=True)

ocr = PaddleOCR(
    use_angle_cls=True,
    lang='fr'
)

print("French model downloaded!")

ocr_en = PaddleOCR(
    use_angle_cls=True,
    lang='en'
)

print("English model downloaded!")
print("Models are cached in: ~/.paddleocr/whl/")
print("Ready to use!")
