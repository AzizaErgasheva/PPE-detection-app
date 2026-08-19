import type { PredictionResponse, HistoryItem, StatsResponse } from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(detail.detail || 'Request failed')
  }
  return res.json()
}

export async function predictImage(file: File): Promise<PredictionResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: 'POST',
    body: formData,
  })
  return handleResponse<PredictionResponse>(res)
}

export async function fetchHistory(limit = 50): Promise<HistoryItem[]> {
  const res = await fetch(`${BASE_URL}/api/history?limit=${limit}`)
  return handleResponse<HistoryItem[]>(res)
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch(`${BASE_URL}/api/stats`)
  return handleResponse<StatsResponse>(res)
}
