import io
import base64
import uvicorn
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from PIL import Image
import numpy as np

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

model = YOLO("best.pt")
CLASS_NAMES = {
    0: 'Hardhat',
    1: 'Mask', 
    2: 'NO-Hardhat',
    3: 'NO-Mask',
    4: 'NO-Safety Vest',
    5: 'Person',
    6: 'Safety Cone',
    7: 'Safety Vest',
    8: 'machinery',
    9: 'vehicle'
}

DANGER_CLASSES = [2, 3, 4]  # NO-Hardhat, NO-Mask, NO-Safety Vest
print("YOLO model loaded! Classes:", model.names)

@app.get("/yolo/classes")
def get_classes():
    return {"classes": model.names, "num_classes": len(model.names)}

@app.post("/yolo/detect")
async def detect(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    results = model(image, conf=0.25)
    result = results[0]

    detections = []
    for box in result.boxes:
        cls_id = int(box.cls[0])
        conf = float(box.conf[0])
        xyxy = box.xyxy[0].tolist()
        detections.append({
            "class_id": cls_id,
            "class_name": model.names[cls_id],
            "confidence": round(conf, 3),
            "bbox": {
                "x1": round(xyxy[0]),
                "y1": round(xyxy[1]),
                "x2": round(xyxy[2]),
                "y2": round(xyxy[3])
            }
        })

    annotated = result.plot()
    annotated_pil = Image.fromarray(annotated)
    buf = io.BytesIO()
    annotated_pil.save(buf, format="JPEG", quality=85)
    img_b64 = base64.b64encode(buf.getvalue()).decode()

    return JSONResponse({
        "detections": detections,
        "count": len(detections),
        "annotated_image": f"data:image/jpeg;base64,{img_b64}"
    })

@app.get("/health")
def health():
    return {"status": "running", "model": "YOLOv8", "classes": len(model.names)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)