from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class BoundingBox(BaseModel):
    class_name: str
    confidence: float
    x1: float
    y1: float
    x2: float
    y2: float


class Violation(BaseModel):
    person_index: int
    missing: List[str]  # e.g. ["Hardhat", "Safety Vest"]
    box: BoundingBox


class PredictionResponse(BaseModel):
    detections: List[BoundingBox]
    violations: List[Violation]
    num_people: int
    num_violations: int
    is_compliant: bool
    inference_ms: float
    annotated_image_base64: str


class HistoryItem(BaseModel):
    id: int
    timestamp: datetime
    filename: Optional[str]
    num_people: int
    num_violations: int
    is_compliant: bool
    inference_ms: float

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    total_predictions: int
    total_people_detected: int
    total_violations: int
    compliance_rate: float
    class_counts: dict
    violations_by_type: dict
    timeline: List[dict]  # [{date, predictions, violations}]
