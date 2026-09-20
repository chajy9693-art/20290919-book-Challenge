import { useEffect } from 'react'

interface LightboxProps {
  urls: string[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function Lightbox({ urls, index, onClose, onNavigate }: LightboxProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNavigate((index + 1) % urls.length)
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + urls.length) % urls.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [index, urls.length, onClose, onNavigate])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button type="button" aria-label="닫기" className="absolute right-4 top-4 text-2xl text-text" onClick={onClose}>
        ✕
      </button>
      <img
        src={urls[index]}
        alt={`캡처 ${index + 1}/${urls.length}`}
        className="max-h-full max-w-full rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      {urls.length > 1 && (
        <p className="absolute bottom-6 text-sm text-text-muted">
          {index + 1} / {urls.length}
        </p>
      )}
    </div>
  )
}
