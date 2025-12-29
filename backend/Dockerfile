# OPython 3.9
FROM python:3.9-slim

# 1. Installer les dépendances système (Pour OpenCV et Pyzbar)
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libzbar0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN mkdir -p /app/assets

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod -R 777 /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
