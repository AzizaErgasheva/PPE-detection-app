import base64
import io
import os
import time
from typing import List

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from ultralytics import YOLO

from .schemas import BoundingBox

MODEL_WEIGHTS_PATH = os.getenv("MODEL_WEIGHTS_PATH", "weights/best.pt")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.4"))

# Palette keyed by class name — falls back to a default color for unknown classes.
CLASS_COLORS = {
    "Hardhat": (76, 154, 109),        # safe green
    "Safety Vest": (76, 154, 109),
    "Mask": (76, 154, 109),
    "NO-Hardhat": (228, 87, 46),       # alert red
    "NO-Safety Vest": (228, 87, 46),
    "NO-Mask": (228, 87, 46),
    "Person": (242, 199, 68),          # safety yellow
    "Safety Cone": (110, 130, 150),
    "machinery": (110, 130, 150),
    "vehicle": (110, 130, 150),
}
DEFAULT_COLOR = (242, 199, 68)

_model = None


def get_model() -> YOLO:
    """Lazily load the model once per process."""
    global _model
    if _model is None:
        if not os.path.exists(MODEL_WEIGHTS_PATH):
            raise FileNotFoundError(
                f"Model weights not found at '{MODEL_WEIGHTS_PATH}'. "
                "Copy your trained best.pt into the backend/weights folder, "
                "or set MODEL_WEIGHTS_PATH in your .env file."
            )
        _model = YOLO(MODEL_WEIGHTS_PATH)
    return _model


def run_inference(image: Image.Image):
    """Runs YOLO detection on a PIL image. Returns (boxes, annotated_image_b64, inference_ms)."""
    model = get_model()

    start = time.time()
    results = model.predict(source=image, conf=CONFIDENCE_THRESHOLD, verbose=False)
    inference_ms = (time.time() - start) * 1000

    result = results[0]
    names = result.names

    boxes: List[BoundingBox] = []
    for box in result.boxes:
        cls_id = int(box.cls.item())
        conf = float(box.conf.item())
        x1, y1, x2, y2 = [float(v) for v in box.xyxy[0].tolist()]
        boxes.append(
            BoundingBox(
                class_name=names[cls_id],
                confidence=conf,
                x1=x1, y1=y1, x2=x2, y2=y2,
            )
        )

    annotated_b64 = _draw_boxes(image, boxes)
    return boxes, annotated_b64, inference_ms


def _draw_boxes(image: Image.Image, boxes: List[BoundingBox]) -> str:
    img = image.convert("RGB").copy()
    draw = ImageDraw.Draw(img)

    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", size=max(14, img.width // 80))
    except Exception:
        font = ImageFont.load_default()

    for b in boxes:
        color = CLASS_COLORS.get(b.class_name, DEFAULT_COLOR)
        draw.rectangle([b.x1, b.y1, b.x2, b.y2], outline=color, width=3)

        label = f"{b.class_name} {b.confidence:.0%}"
        text_bbox = draw.textbbox((0, 0), label, font=font)
        text_w = text_bbox[2] - text_bbox[0]
        text_h = text_bbox[3] - text_bbox[1]
        draw.rectangle(
            [b.x1, max(0, b.y1 - text_h - 6), b.x1 + text_w + 8, b.y1],
            fill=color,
        )
        draw.text((b.x1 + 4, max(0, b.y1 - text_h - 4)), label, fill=(20, 20, 20), font=font)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return base64.b64encode(buf.getvalue()).decode("utf-8")
