# Model weights

Place your trained `best.pt` (from the training notebook, e.g.
`runs/detect/ppe_detection/yolov11s_ppe_v2/weights/best.pt`) in this folder.

If hosting on a platform with tight repo size limits (like GitHub or Render's
free tier), upload the weights to Hugging Face Hub instead — same pattern you
used for the cow/sheep classifier — and set `MODEL_WEIGHTS_PATH` in `.env` to
the downloaded local path, or add a small startup download step in
`app/inference.py`.
