import { useEffect, useState } from 'react'
import { fetchHistory } from '../api/client'
import type { HistoryItem } from '../types'

export default function HistoryPanel() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory(50)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-steel font-mono text-sm">Loading history…</p>
  if (error) return <p className="text-alert font-mono text-sm">Error: {error}</p>
  if (items.length === 0)
    return (
      <div className="text-center py-16 border border-dashed border-asphalt-lighter rounded-md">
        <p className="text-steel">No scans yet. Run a detection to see it logged here.</p>
      </div>
    )

  return (
    <div className="rounded-md border border-asphalt-lighter overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-asphalt-light text-steel font-mono text-xs uppercase tracking-wider">
            <th className="text-left px-4 py-3">Time</th>
            <th className="text-left px-4 py-3">File</th>
            <th className="text-center px-4 py-3">People</th>
            <th className="text-center px-4 py-3">Violations</th>
            <th className="text-center px-4 py-3">Status</th>
            <th className="text-right px-4 py-3">Latency</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-asphalt-lighter hover:bg-asphalt-light/50">
              <td className="px-4 py-3 text-paper font-mono text-xs">
                {new Date(item.timestamp).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-paper truncate max-w-[180px]">{item.filename || '—'}</td>
              <td className="px-4 py-3 text-center text-paper">{item.num_people}</td>
              <td className="px-4 py-3 text-center text-paper">{item.num_violations}</td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`px-2 py-0.5 rounded-sm text-xs font-medium ${
                    item.is_compliant ? 'bg-safe/20 text-safe' : 'bg-alert/20 text-alert'
                  }`}
                >
                  {item.is_compliant ? 'Compliant' : 'Flagged'}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-steel font-mono text-xs">
                {item.inference_ms.toFixed(0)}ms
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
