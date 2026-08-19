export interface BoundingBox {
  class_name: string
  confidence: number
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface Violation {
  person_index: number
  missing: string[]
  box: BoundingBox
}

export interface PredictionResponse {
  detections: BoundingBox[]
  violations: Violation[]
  num_people: number
  num_violations: number
  is_compliant: boolean
  inference_ms: number
  annotated_image_base64: string
}

export interface HistoryItem {
  id: number
  timestamp: string
  filename: string | null
  num_people: number
  num_violations: number
  is_compliant: boolean
  inference_ms: number
}

export interface StatsResponse {
  total_predictions: number
  total_people_detected: number
  total_violations: number
  compliance_rate: number
  class_counts: Record<string, number>
  violations_by_type: Record<string, number>
  timeline: { date: string; predictions: number; violations: number }[]
}
