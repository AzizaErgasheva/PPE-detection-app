import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'
import { fetchStats } from '../api/client'
import type { StatsResponse } from '../types'

const CHART_COLORS = ['#F2C744', '#4C9A6D', '#E4572E', '#6B7280', '#33383D']

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-asphalt-lighter bg-asphalt-light p-5">
      <p className="text-xs font-mono uppercase tracking-wider text-steel mb-1">{label}</p>
      <p className="font-display text-3xl text-paper">{value}</p>
    </div>
  )
}

export default function StatsDashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-steel font-mono text-sm">Loading analytics…</p>
  if (error) return <p className="text-alert font-mono text-sm">Error: {error}</p>
  if (!stats || stats.total_predictions === 0)
    return (
      <div className="text-center py-16 border border-dashed border-asphalt-lighter rounded-md">
        <p className="text-steel">No data yet. Analytics populate after your first scan.</p>
      </div>
    )

  const classData = Object.entries(stats.class_counts).map(([name, count]) => ({ name, count }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total scans" value={stats.total_predictions} />
        <StatCard label="People detected" value={stats.total_people_detected} />
        <StatCard label="Total violations" value={stats.total_violations} />
        <StatCard label="Compliance rate" value={`${(stats.compliance_rate * 100).toFixed(0)}%`} />
      </div>

      <div className="rounded-md border border-asphalt-lighter bg-asphalt-light p-5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-steel mb-4">Detections by class</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={classData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#33383D" />
            <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} angle={-25} textAnchor="end" height={70} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#262A2E', border: '1px solid #33383D', borderRadius: 4 }}
              labelStyle={{ color: '#F3F1EC' }}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {classData.map((_, i) => (
                <Bar key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} dataKey="count" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {stats.timeline.length > 1 && (
        <div className="rounded-md border border-asphalt-lighter bg-asphalt-light p-5">
          <h3 className="text-xs font-mono uppercase tracking-wider text-steel mb-4">Scans over time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#33383D" />
              <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#262A2E', border: '1px solid #33383D', borderRadius: 4 }}
                labelStyle={{ color: '#F3F1EC' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="predictions" stroke="#F2C744" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="violations" stroke="#E4572E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
