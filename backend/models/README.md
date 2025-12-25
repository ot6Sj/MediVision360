# MediVision 360 - AI Models Directory

This directory should contain the trained AI model files for the 4 medical imaging departments.

## Required Model Files

### 1. Neuro-Radiology Model
**Filename:** `resnet50_brain_tumor.h5`  
**Architecture:** ResNet50 (Transfer Learning with ImageNet weights)  
**Input Shape:** (224, 224, 3)  
**Output:** [Probability_Healthy, Probability_Tumor]  
**Threshold:** 75%  
**Framework:** TensorFlow/Keras  

**Training Notes:**
- Convert grayscale MRI images to 3-channel RGB before feeding to model
- Use binary cross-entropy loss
- Classes: 0 = Healthy, 1 = Tumor

---

### 2. Dermatology Model
**Filename:** `efficientnet_skin.h5`  
**Architecture:** EfficientNetB0 or MobileNetV2  
**Input Shape:** (224, 224, 3)  
**Output:** [Prob_Benign, Prob_Malignant]  
**Threshold:** 80%  
**Framework:** TensorFlow/Keras  

**Training Notes:**
- Handle noisy images (hair, lighting variations)
- Data augmentation: rotation, brightness, contrast
- Classes: 0 = Benign, 1 = Malignant

---

### 3. Surgery Model
**Filename:** `yolov8_surgery.pt`  
**Architecture:** YOLOv8  
**Input Shape:** (640, 640, 3) - auto-resized  
**Output:** Bounding boxes [x_center, y_center, width, height, confidence, class_id]  
**Threshold:** 50%  
**Framework:** Ultralytics YOLO  

**Classes:**
- 0: Scissors
- 1: Scalpel
- 2: Forceps
- 3: Clamp
- 4: Retractor
- (Add more as needed)

**Training Notes:**
- Train on surgical video frames
- Lower confidence threshold for fast-moving objects
- Use non-max suppression (NMS) to avoid duplicates

---

### 4. Pharmacy (OCR)
**Engine:** Tesseract OCR  
**No model file needed** - uses pre-installed Tesseract  
**Threshold:** 60% per word  

**Installation:**
```bash
# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
# Add to PATH

# Linux
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract
```

---

## Demo Mode

If model files are not present, the API will automatically use **mock responses** for demonstration purposes. This allows you to:
- Test the frontend UI/UX
- Verify API integration
- Showcase the application without trained models

To use real AI inference, place your trained `.h5` or `.pt` model files in this directory with the exact filenames listed above.

---

## Model Training Resources

### Datasets
- **Brain Tumors:** [Kaggle Brain MRI Dataset](https://www.kaggle.com/datasets/navoneel/brain-mri-images-for-brain-tumor-detection)
- **Skin Lesions:** [HAM10000 Dataset](https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000)
- **Surgical Tools:** Custom video annotation or [MICCAI Challenge datasets](https://www.synapse.org/)

### Training Frameworks
- TensorFlow/Keras for ResNet50 and EfficientNet
- Ultralytics for YOLOv8: `pip install ultralytics`

---

## File Structure
```
backend/models/
├── README.md (this file)
├── resnet50_brain_tumor.h5 (place here)
├── efficientnet_skin.h5 (place here)
└── yolov8_surgery.pt (place here)
```
