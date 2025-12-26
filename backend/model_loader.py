# Copyright (c) 2025 ot6_j. All Rights Reserved.

import os
import logging
from typing import Optional, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_model_cache: Dict[str, Any] = {}

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATHS = {
    "neuro": os.path.join(MODELS_DIR, "neuro_radiologie_resnet50.h5"),
    "derma": os.path.join(MODELS_DIR, "dermatologie_mobilenetv2.h5"),
    "surgery": os.path.join(MODELS_DIR, "yolov8n.pt"),
}


def load_tensorflow_model(model_path: str, model_name: str) -> Optional[Any]:
    """Loads a TensorFlow model from path."""
    try:
        from tensorflow import keras
        
        if model_name in _model_cache:
            return _model_cache[model_name]
        
        if not os.path.exists(model_path):
            logger.warning(f"Model not found: {model_path}")
            return None
        
        logger.info(f"Loading {model_name}...")
        model = keras.models.load_model(model_path)
        _model_cache[model_name] = model
        return model
    
    except Exception as e:
        logger.error(f"Error loading {model_name}: {e}")
        return None


def load_yolo_model(model_path: str) -> Optional[Any]:
    """Loads a YOLO model from path."""
    try:
        import torch
        
        if "yolo" in _model_cache:
            return _model_cache["yolo"]
        
        if not os.path.exists(model_path):
            logger.warning(f"Model not found: {model_path}")
            return None
        
        logger.info(f"Loading YOLO...")
        
        original_load = torch.load
        def patched_load(*args, **kwargs):
            kwargs['weights_only'] = False
            return original_load(*args, **kwargs)
        
        torch.load = patched_load
        
        try:
            from ultralytics import YOLO
            model = YOLO(model_path)
            _model_cache["yolo"] = model
            return model
        finally:
            torch.load = original_load
    
    except Exception as e:
        logger.error(f"Error loading YOLO: {e}")
        return None


def get_neuro_model() -> Optional[Any]:
    """Gets the Neuro model."""
    return load_tensorflow_model(MODEL_PATHS["neuro"], "neuro")


def get_derma_model() -> Optional[Any]:
    """Gets the Derma model."""
    return load_tensorflow_model(MODEL_PATHS["derma"], "derma")


def get_surgery_model() -> Optional[Any]:
    """Gets the Surgery model."""
    return load_yolo_model(MODEL_PATHS["surgery"])


def get_tesseract_config() -> Dict[str, str]:
    """Gets Tesseract config."""
    return {
        "lang": "eng",
        "config": "--psm 6"
    }


def clear_model_cache():
    """Clears the model cache."""
    global _model_cache
    _model_cache.clear()
