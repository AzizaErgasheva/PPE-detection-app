from typing import List

from .schemas import BoundingBox, Violation

# Which detected classes count as "this piece of PPE is present/missing"
REQUIRED_PPE = ["Hardhat", "Safety Vest"]
NEGATIVE_CLASSES = {"Hardhat": "NO-Hardhat", "Safety Vest": "NO-Safety Vest"}


def _overlap_ratio(a: BoundingBox, b: BoundingBox) -> float:
    """Fraction of box b's area that overlaps with box a (intersection / area_b)."""
    ix1, iy1 = max(a.x1, b.x1), max(a.y1, b.y1)
    ix2, iy2 = min(a.x2, b.x2), min(a.y2, b.y2)
    if ix2 <= ix1 or iy2 <= iy1:
        return 0.0
    inter = (ix2 - ix1) * (iy2 - iy1)
    area_b = max(1e-6, (b.x2 - b.x1) * (b.y2 - b.y1))
    return inter / area_b


def check_compliance(boxes: List[BoundingBox]) -> List[Violation]:
    """
    For every detected Person, checks whether each required PPE item overlaps
    their box. An item is 'missing' if there's no positive-class box overlapping
    the person by a meaningful margin, OR an explicit NO-* box does overlap.
    """
    people = [b for b in boxes if b.class_name == "Person"]
    violations: List[Violation] = []

    for idx, person in enumerate(people):
        missing = []
        for item in REQUIRED_PPE:
            positive_hits = [
                b for b in boxes
                if b.class_name == item and _overlap_ratio(person, b) > 0.15
            ]
            negative_class = NEGATIVE_CLASSES.get(item)
            negative_hits = [
                b for b in boxes
                if negative_class and b.class_name == negative_class and _overlap_ratio(person, b) > 0.15
            ]
            if negative_hits or not positive_hits:
                missing.append(item)

        if missing:
            violations.append(Violation(person_index=idx, missing=missing, box=person))

    return violations
