import { useCallback, useState, useRef } from 'react'

interface Props {
  onFileSelected: (file: File) => void
  isLoading: boolean
}

export default function UploadZone({ onFileSelected, isLoading }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) onFileSelected(file)
    },
    [onFileSelected]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelected(file)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative overflow-hidden rounded-md border-2 border-dashed cursor-pointer
        transition-colors duration-200 flex flex-col items-center justify-center gap-3 py-16 px-6
        ${isDragging ? 'border-safety-yellow bg-asphalt-light' : 'border-asphalt-lighter bg-asphalt-light/40 hover:border-steel'}
      `}
    >
      {/* corner brackets — scanner motif, echoes bounding-box detection */}
      <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-safety-yellow/60" />
      <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-safety-yellow/60" />
      <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-safety-yellow/60" />
      <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-safety-yellow/60" />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {isLoading ? (
        <>
          <div className="w-10 h-10 border-4 border-safety-yellow border-t-transparent rounded-full animate-spin" />
          <p className="text-paper font-medium">Scanning image…</p>
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-steel" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 16V4m0 0L7 9m5-5l5 5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-paper font-medium">Drop a site photo here, or click to browse</p>
          <p className="text-xs text-steel font-mono">JPG or PNG — checks for hardhats and safety vests</p>
        </>
      )}
    </div>
  )
}
