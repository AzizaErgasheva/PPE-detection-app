import { useState } from 'react'
import Header from './components/Header'
import UploadZone from './components/UploadZone'
import DetectionResult from './components/DetectionResult'
import HistoryPanel from './components/HistoryPanel'
import StatsDashboard from './components/StatsDashboard'
import { predictImage } from './api/client'
import type { PredictionResponse } from './types'

type Tab = 'scan' | 'history' | 'stats'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('scan')
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelected = async (file: File) => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await predictImage(file)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-asphalt text-paper font-body">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {activeTab === 'scan' && (
          <div className="space-y-6">
            <UploadZone onFileSelected={handleFileSelected} isLoading={isLoading} />

            {error && (
              <div className="rounded-sm border-l-4 border-alert bg-alert/10 p-4 text-sm text-alert">
                {error}
              </div>
            )}

            {result && <DetectionResult result={result} />}
          </div>
        )}

        {activeTab === 'history' && <HistoryPanel />}
        {activeTab === 'stats' && <StatsDashboard />}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-xs text-steel font-mono border-t border-asphalt-lighter mt-10">
        Site Watch — YOLOv11 PPE compliance detection
      </footer>
    </div>
  )
}
