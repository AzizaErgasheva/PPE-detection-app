type Tab = 'scan' | 'history' | 'stats'

interface Props {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export default function Header({ activeTab, onTabChange }: Props) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'scan', label: 'Scan' },
    { id: 'history', label: 'History' },
    { id: 'stats', label: 'Analytics' },
  ]

  return (
    <header className="border-b border-asphalt-lighter">
      <div className="h-1 bg-hazard-stripes" />
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-safety-yellow flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-asphalt" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 4.5L18.5 19h-13L12 6.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-paper tracking-wide leading-none">
              SITE WATCH
            </h1>
            <p className="text-xs text-steel font-mono">PPE Compliance Detection</p>
          </div>
        </div>

        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-safety-yellow text-asphalt'
                  : 'text-steel hover:text-paper hover:bg-asphalt-light'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
