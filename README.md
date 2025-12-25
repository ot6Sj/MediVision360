# MediVision 360 - Setup Guide

Complete AI-Powered Medical Imaging Analysis Platform with Glassmorphism UI.

## 🎯 Project Overview

**MediVision 360** is a futuristic medical imaging platform featuring:
- 🧠 **Neuro-Radiology** - Brain tumor detection (ResNet50, 75% threshold)
- 🔬 **Dermatology** - Skin lesion classification (EfficientNet, 80% threshold)
- 💊 **Pharmacy** - Prescription OCR (Tesseract, 60% threshold)
- ⚕️ **Surgery** - Surgical tool detection (YOLOv8, 50% threshold)

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Install Tesseract OCR for Pharmacy module
# Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
# Linux: sudo apt-get install tesseract-ocr
# macOS: brew install tesseract

# (Optional) Install YOLO for Surgery module
pip install ultralytics

# Start FastAPI server
python main.py
# Server will run at: http://localhost:8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Application will run at: http://localhost:5173
```

## 📁 Project Structure

```
MediVision 360/
├── backend/
│   ├── main.py                 # FastAPI server with 4 AI endpoints
│   ├── model_loader.py         # Model loading utility
│   ├── requirements.txt        # Python dependencies
│   └── models/
│       ├── README.md           # Model documentation
│       ├── resnet50_brain_tumor.h5    # (Place your trained model here)
│       ├── efficientnet_skin.h5       # (Place your trained model here)
│       └── yolov8_surgery.pt          # (Place your trained model here)
│
└── frontend/
    ├── src/
    │   ├── App.jsx             # Main app with routing
    │   ├── index.css           # Glassmorphism design system
    │   ├── components/
    │   │   ├── HeroPage.jsx            # Landing page with 3D brain
    │   │   ├── FloatingDock.jsx        # macOS-style navigation
    │   │   ├── GlassCard.jsx           # Reusable glass panel
    │   │   ├── ScannerInterface.jsx    # Drag & drop upload
    │   │   ├── ScannerEffect.jsx       # Laser scan animation
    │   │   ├── ComparerSlider.jsx      # Before/after slider
    │   │   ├── SmartReport.jsx         # Chatbot-style report
    │   │   └── departments/
    │   │       ├── NeuroRadiology.jsx
    │   │       ├── Dermatology.jsx
    │   │       ├── Pharmacy.jsx
    │   │       └── Surgery.jsx
    │   └── main.jsx
    └── package.json
```

## 🤖 AI Models

### Demo Mode (Default)
The backend works **without model files** using realistic mock responses. Perfect for:
- UI/UX testing
- Frontend development
- Project demonstrations

### Production Mode
To enable real AI inference:

1. Train or download models for each department
2. Place model files in `backend/models/` with exact names:
   - `resnet50_brain_tumor.h5`
   - `efficientnet_skin.h5`
   - `yolov8_surgery.pt`
3. Restart backend server

See `backend/models/README.md` for training resources and dataset links.

## 🎨 Design Features

### Glassmorphism & Bio-Digital Theme
- **Dark Mode:** Deep Midnight Blue (#0f172a) background
- **Glass Panels:** Semi-transparent with blur effect
- **Accents:** Electric Cyan (#06b6d4) for healthy, Coral Red (#f43f5e) for alerts
- **Custom Cursor:** Glowing cyan effect follows mouse
- **Animations:** Framer Motion for smooth transitions

### Interactive Elements
- ⚡ **Typewriter Effect** - Hero page title
- 🌀 **Rotating 3D Brain** - Animated SVG on landing
- 🔍 **Laser Scanner** - Horizontal line sweeps during analysis
- 🎚️ **Comparison Slider** - Drag to compare original vs AI heatmap
- 💬 **Smart Report** - Chat-style AI diagnosis

## 📡 API Endpoints

### Health Check
```bash
GET http://localhost:8000/
```

### Neuro-Radiology Scan
```bash
POST http://localhost:8000/api/scan/neuro
Content-Type: multipart/form-data
Body: file (JPEG/PNG image)

Response:
{
  "confidence": 0.98,
  "prediction": "Tumor Detected",
  "diagnosis": "Brain MRI analyzed...",
  "recommendation": "Immediate biopsy required...",
  "threshold_met": true
}
```

### Dermatology Scan
```bash
POST http://localhost:8000/api/scan/derma
```

### Pharmacy OCR
```bash
POST http://localhost:8000/api/scan/pharma
```

### Surgery Tool Detection
```bash
POST http://localhost:8000/api/scan/surgery
```

## 🔧 Configuration

### CORS Settings
In `backend/main.py`, update CORS origins for production:
```python
allow_origins=["http://yourdomain.com"],
```

### Port Configuration
- Backend: Edit port in `main.py` (default: 8000)
- Frontend: Edit `vite.config.js` (default: 5173)

## 🧪 Testing

### Test Backend Endpoints
```bash
# Using curl
curl -X POST "http://localhost:8000/api/scan/neuro" \
  -F "file=@test_brain_mri.jpg"

# Using Python
python -c "
import requests
files = {'file': open('test_brain_mri.jpg', 'rb')}
r = requests.post('http://localhost:8000/api/scan/neuro', files=files)
print(r.json())
"
```

### Test Frontend
1. Start both backend and frontend servers
2. Navigate to `http://localhost:5173`
3. Test each department:
   - Upload test images
   - Verify scanner animation
   - Check comparison slider
   - Review AI report

## 🚢 Deployment

### Backend (FastAPI)
```bash
# Using uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000

# Using Docker
docker build -t medivision-backend .
docker run -p 8000:8000 medivision-backend
```

### Frontend (Vite)
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel/Netlify
# Connect your GitHub repo and deploy
```

## 📝 License

Educational and demonstration purposes.

## 🎓 Credits

Built with:
- **Frontend:** React, Vite, Framer Motion
- **Backend:** FastAPI, TensorFlow, Ultralytics YOLO
- **Design:** Glassmorphism, Bio-Digital aesthetic

---

**MediVision 360** - Transforming medical imaging with AI 🧠✨
