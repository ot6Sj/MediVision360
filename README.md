# MediVision 360 - Setup Guide

Copyright (c) 2025 ot6_j. All Rights Reserved.

## Project Overview

MediVision 360 is a medical imaging platform featuring:
- Neuro-Radiology: Brain tumor detection (ResNet50)
- Dermatology: Skin lesion classification (EfficientNet)
- Pharmacy: Prescription OCR (Tesseract)
- Surgery: Surgical tool detection (YOLOv8)

## Quick Start

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

## Project Structure

```
MediVision 360/
├── backend/
│   ├── main.py                 # FastAPI server
│   ├── model_loader.py         # Model loading utility
│   ├── requirements.txt        # Python dependencies
│   └── models/                 # Model files directory
│
└── frontend/
    ├── src/
    │   ├── App.jsx             # Main app with routing
    │   ├── index.css           # Design system
    │   ├── components/         # UI Components
    │   │   ├── departments/    # Department specific views
    │   └── main.jsx
    └── package.json
```

## API Endpoints

### Health Check
GET http://localhost:8000/

### Scan Endpoints
- POST http://localhost:8000/api/scan/neuro
- POST http://localhost:8000/api/scan/derma
- POST http://localhost:8000/api/scan/pharma
- POST http://localhost:8000/api/scan/surgery

## Deployment

### Backend
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
npm run build
npm run preview
```

## License

Copyright (c) 2025 ot6_j. All Rights Reserved.
Unauthorized copying of this file, via any medium is strictly prohibited.
Proprietary and confidential.
