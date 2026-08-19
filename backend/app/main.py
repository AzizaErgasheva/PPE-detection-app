import io
import json
import os
from collections import Counter, defaultdict
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from sqlalchemy.orm import Session
from sqlalchemy import func

from .database import init_db, get_db, PredictionRecord
from .schemas import PredictionResponse, HistoryItem, StatsResponse
from .inference import run_inference
from .compliance import check_compliance

app = FastAPI(title="PPE Detection API", version="1.0.0")

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents))
        image.load()
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image file.")

    try:
        boxes, annotated_b64, inference_ms = run_inference(image)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))

    violations = check_compliance(boxes)
    num_people = sum(1 for b in boxes if b.class_name == "Person")
    is_compliant = len(violations) == 0

    record = PredictionRecord(
        filename=file.filename,
        detections_json=json.dumps([b.model_dump() for b in boxes]),
        num_people=num_people,
        num_violations=len(violations),
        is_compliant=is_compliant,
        inference_ms=inference_ms,
    )
    db.add(record)
    db.commit()

    return PredictionResponse(
        detections=boxes,
        violations=violations,
        num_people=num_people,
        num_violations=len(violations),
        is_compliant=is_compliant,
        inference_ms=inference_ms,
        annotated_image_base64=annotated_b64,
    )


@app.get("/api/history", response_model=list[HistoryItem])
def get_history(limit: int = 50, db: Session = Depends(get_db)):
    records = (
        db.query(PredictionRecord)
        .order_by(PredictionRecord.timestamp.desc())
        .limit(limit)
        .all()
    )
    return records


@app.get("/api/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    records = db.query(PredictionRecord).all()

    total_predictions = len(records)
    total_people = sum(r.num_people for r in records)
    total_violations = sum(r.num_violations for r in records)
    compliant_count = sum(1 for r in records if r.is_compliant)
    compliance_rate = (compliant_count / total_predictions) if total_predictions else 0.0

    class_counts = Counter()
    violation_type_counts = Counter()
    for r in records:
        try:
            dets = json.loads(r.detections_json)
        except Exception:
            dets = []
        for d in dets:
            class_counts[d["class_name"]] += 1
            if d["class_name"].startswith("NO-"):
                violation_type_counts[d["class_name"]] += 1

    timeline_map: dict = defaultdict(lambda: {"predictions": 0, "violations": 0})
    for r in records:
        day = r.timestamp.strftime("%Y-%m-%d") if r.timestamp else "unknown"
        timeline_map[day]["predictions"] += 1
        timeline_map[day]["violations"] += r.num_violations
    timeline = [
        {"date": day, **vals} for day, vals in sorted(timeline_map.items())
    ]

    return StatsResponse(
        total_predictions=total_predictions,
        total_people_detected=total_people,
        total_violations=total_violations,
        compliance_rate=round(compliance_rate, 4),
        class_counts=dict(class_counts),
        violations_by_type=dict(violation_type_counts),
        timeline=timeline,
    )
