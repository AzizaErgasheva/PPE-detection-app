# Site Watch — PPE Compliance Detection

A full-stack computer vision application that detects personal protective
equipment (hardhats, safety vests) on construction sites from a single
photo, and automatically flags any person missing required gear.

Built on a YOLOv11 object detection model, fine-tuned on a labeled
construction-safety dataset, served through a FastAPI backend, and
presented through a React + TypeScript frontend.

> Live demo: [https://ppe-detection-app.vercel.app]
> **Model training notebook:** [https://www.kaggle.com/code/azizaergasheva/ppe-detection-with-yolov11]

---

## Table of contents

- [Overview](#overview)
- [Demo](#demo)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Model](#model)
- [Project structure](#project-structure)
- [Getting started locally](#getting-started-locally)
- [API reference](#api-reference)
- [Compliance logic](#compliance-logic)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

Construction site safety monitoring is traditionally manual — a supervisor
walking the site checking for hardhats and vests. This project automates
that first pass: upload a site photo, and the system detects every person,
checks for required PPE, and returns an annotated image plus a compliance
verdict in under a second.

**Core features**
- Object detection for people and PPE items (hardhat, vest, mask, and their
  "missing" counterparts) using a fine-tuned YOLOv11 model
- Automatic compliance checking — flags any detected person without a
  hardhat or vest overlapping their bounding box
- Prediction history, stored per-scan in SQLite
- An analytics dashboard: detection counts by class, compliance rate over
  time, scan volume

---

## Demo 


https://github.com/user-attachments/assets/1f4cc83b-60ae-4b03-89c0-5deb770da27c




---

## Architecture

```
┌─────────────────┐        HTTPS         ┌──────────────────────┐
│  React Frontend  │ ───────────────────► │   FastAPI Backend     │
│  (Vercel)         │ ◄─────────────────── │   (Render, Docker)     │
└─────────────────┘     JSON + base64     └──────────┬────────────┘
                                                       │
                                          ┌────────────┴────────────┐
                                          │                          │
                                   ┌──────▼──────┐          ┌────────▼────────┐
                                   │  YOLOv11     │          │  SQLite          │
                                   │  (best.pt)   │          │  (prediction     │
                                   │  Ultralytics │          │  history)         │
                                   └─────────────┘          └─────────────────┘
```

1. User uploads an image in the browser.
2. Frontend sends it as `multipart/form-data` to `POST /api/predict`.
3. Backend runs YOLOv11 inference, draws bounding boxes server-side with
   PIL, checks compliance, and logs the result to SQLite.
4. Backend returns detections + a base64-encoded annotated JPEG.
5. Frontend renders the image and the compliance summary; history/analytics
   tabs query separate endpoints that read from the SQLite log.

---

## Tech stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — REST API framework
- [Ultralytics YOLOv11](https://docs.ultralytics.com/) — object detection model
- [SQLAlchemy](https://www.sqlalchemy.org/) + SQLite — prediction history storage
- [Pillow](https://python-pillow.org/) — server-side box drawing
- Docker — containerized deployment

**Frontend**
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tooling
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Recharts](https://recharts.org/) — analytics charts

**Deployment**
- Backend → [Render](https://render.com/) (Docker Web Service)
- Frontend → [Vercel](https://vercel.com/)

---

## Model

- **Architecture:** YOLOv11-small (`yolo11s.pt`), pretrained on COCO,
  fine-tuned on a PPE-labeled construction dataset
- **Classes (10):** `Hardhat`, `Mask`, `NO-Hardhat`, `NO-Mask`,
  `NO-Safety Vest`, `Person`, `Safety Cone`, `Safety Vest`, `machinery`,
  `vehicle`
- **Dataset:** Construction Site Safety Image Dataset (Roboflow format),
  2,801 images (2,605 train / 114 val / 82 test)
- **Training:** 100 epochs, image size 640, batch size 16, early stopping
  (patience 20) — see the full training notebook for data exploration,
  class-balance analysis, and evaluation plots (confusion matrix, PR curve)

| Metric | Value |
|---|---|
| mAP50 | _fill in from your `results.csv` / final `model.val()` run_ |
| mAP50-95 | _fill in_ |
| Precision | _fill in_ |
| Recall | _fill in_ |

**Training notebook:** [[link to your Kaggle noteboo](https://www.kaggle.com/code/azizaergasheva/ppe-detection-with-yolov11)k] — includes dataset
exploration, class-balance debugging (an earlier 25-class dataset version
had severe class imbalance that was diagnosed and fixed by switching to a
cleaner 10-class dataset version), and full evaluation plots.

---

## Project structure

```
ppe-fullstack/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, routes
│   │   ├── inference.py     # model loading + prediction + box drawing
│   │   ├── compliance.py    # PPE compliance-checking logic
│   │   ├── database.py      # SQLAlchemy models, session setup
│   │   └── schemas.py       # Pydantic request/response models
│   ├── weights/
│   │   └── best.pt          # trained model weights (not committed — see below)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/      # Header, UploadZone, DetectionResult, HistoryPanel, StatsDashboard
│   │   ├── api/client.ts    # backend API calls
│   │   └── types.ts
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
└── README.md
```

---

## Getting started locally

### Prerequisites
- Python 3.11 or 3.12 (3.13 can hit numpy/opencv wheel issues on Windows —
  see [Known limitations](#known-limitations))
- Node.js 18+
- Your trained `best.pt` model weights

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env            # adjust values if needed
```

Place your trained weights at `backend/weights/best.pt`, then:

```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env          # set VITE_API_BASE_URL if different from default
npm run dev
```

App available at `http://localhost:5173`.

---

## API reference

### `POST /api/predict`
Upload an image, run detection + compliance check, log the result.

**Request:** `multipart/form-data`, field `file` (image)

**Response:**
```json
{
  "detections": [
    { "class_name": "Hardhat", "confidence": 0.91, "x1": 120.3, "y1": 45.1, "x2": 210.7, "y2": 130.4 }
  ],
  "violations": [
    { "person_index": 1, "missing": ["Safety Vest"], "box": { "...": "..." } }
  ],
  "num_people": 3,
  "num_violations": 1,
  "is_compliant": false,
  "inference_ms": 84.2,
  "annotated_image_base64": "..."
}
```

### `GET /api/history?limit=50`
Returns the most recent predictions (metadata only, no images).

### `GET /api/stats`
Returns aggregate analytics: total scans, total people detected, total
violations, compliance rate, per-class detection counts, and a daily
timeline of scans/violations.

### `GET /api/health`
Basic health check — returns `{ "status": "ok" }`.

---

## Compliance logic

A detected `Person` box is flagged as **non-compliant** if, for each
required item (`Hardhat`, `Safety Vest`):

- No positive-class box (`Hardhat` / `Safety Vest`) overlaps the person by
  at least 15% of the person's box area, **or**
- An explicit negative-class box (`NO-Hardhat` / `NO-Safety Vest`) does
  overlap by that margin.

This logic lives in `backend/app/compliance.py` — adjust `REQUIRED_PPE` to
add or remove requirements (e.g. include `Mask`), or tune the overlap
threshold for stricter/looser matching.

---

## Deployment

### Backend → Render

1. Push this repo to GitHub. If `best.pt` exceeds GitHub's 100MB limit, use
   [Git LFS](https://git-lfs.com/) or host the weights on
   [Hugging Face Hub](https://huggingface.co/) and download them at startup
   in `inference.py` instead of committing the file directly.
2. In Render: **New → Web Service** → connect this repo → set **Root
   Directory** to `backend`.
3. Render will detect the `Dockerfile` automatically — no build command
   needed.
4. Add environment variables from `.env` in the Render dashboard
   (`MODEL_WEIGHTS_PATH`, `CONFIDENCE_THRESHOLD`, `CORS_ORIGINS`,
   `DATABASE_URL`).
5. Deploy. Note the resulting URL (e.g. `https://site-watch-api.onrender.com`).

**Free-tier memory note:** `yolo11s` runs fine on Render's free tier. If you
trained on a larger checkpoint (`yolo11m`/`l`) and hit an out-of-memory
crash, either upgrade the instance type or keep the smaller model for the
deployed version.

### Frontend → Vercel

1. In Vercel: **New Project** → import this repo → set **Root Directory**
   to `frontend`.
2. Framework preset: **Vite** (auto-detected).
3. Add environment variable `VITE_API_BASE_URL` set to your Render backend
   URL from above.
4. Deploy. Note the resulting URL (e.g. `https://site-watch.vercel.app`).

### Final step — close the CORS loop

Go back to Render, update the `CORS_ORIGINS` env var to include your new
Vercel URL, and redeploy the backend once. Without this step the frontend
will load but every `/api/predict` call will fail with a CORS error in the
browser console.

---

## Known limitations

- **Single-image inference only** — no video/webcam support yet.
- **SQLite** is fine for a portfolio-scale project but isn't built for
  concurrent writes at scale; swap `DATABASE_URL` for Postgres if this
  needs to handle real traffic.
- **Windows + Python 3.13:** `numpy`/`opencv` may not have prebuilt wheels
  for the newest Python versions yet, forcing a source build that requires
  a C compiler. Using Python 3.11 or 3.12 for the backend venv avoids this.
- The compliance check uses simple bounding-box overlap, not pose
  estimation — in dense crowds with overlapping people, PPE items can
  occasionally get attributed to the wrong person.

---

## Roadmap

- [ ] Webcam / live video stream support
- [ ] Batch upload (multiple images at once)
- [ ] Per-site or per-camera grouping in analytics
- [ ] Export compliance reports (PDF/CSV)
- [ ] Auth layer for multi-user deployments

---


## Acknowledgments

- Dataset: [Construction Site Safety Image Dataset](https://universe.roboflow.com/roboflow-universe-projects/construction-site-safety) (Roboflow Universe)
- Base model: [Ultralytics YOLOv11](https://github.com/ultralytics/ultralytics)
- Kaggle notebook: [PPE Detection](https://www.kaggle.com/code/azizaergasheva/ppe-detection-with-yolov11)
