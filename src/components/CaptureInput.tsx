import { useRef, useState } from 'react'
import { compressImage } from '../lib/imageCompress'
import { imageStore } from '../lib/imageStore'
import type { SubmissionImage } from '../types'

const MAX_IMAGES = 3
const MAX_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface UploadingItem {
  id: string
  previewUrl: string
  progress: number
}

interface CaptureInputProps {
  images: SubmissionImage[]
  onChange: (images: SubmissionImage[]) => void
  cid: string
  pid: string
  missionId: string
  disabled?: boolean
}

export function CaptureInput({ images, onChange, cid, pid, missionId, disabled }: CaptureInputProps) {
  const [uploading, setUploading] = useState<UploadingItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalCount = images.length + uploading.length
  const remainingSlots = MAX_IMAGES - totalCount

  function validate(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) return 'jpg/png/webp 파일만 올릴 수 있어요.'
    if (file.size > MAX_SIZE_BYTES) return '파일 용량은 10MB 이하여야 해요.'
    return null
  }

  async function handleFiles(files: FileList | File[]) {
    setError(null)
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) return

    if (list.length > remainingSlots) {
      setError('캡처는 최대 3장까지 올릴 수 있어요.')
    }
    const toProcess = list.slice(0, Math.max(remainingSlots, 0))
    // images prop은 각 반복의 await 사이에 갱신되지 않으므로, 누적 목록을 직접 들고 있어야
    // 여러 장을 연속 업로드할 때 이전 결과가 다음 onChange 호출에 덮어써지지 않는다.
    let accumulated = images

    for (const file of toProcess) {
      const validationError = validate(file)
      if (validationError) {
        setError(validationError)
        continue
      }

      const localId = crypto.randomUUID()
      const previewUrl = URL.createObjectURL(file)
      setUploading((prev) => [...prev, { id: localId, previewUrl, progress: 0 }])

      try {
        const compressed = await compressImage(file)
        const result = await imageStore.upload({
          cid,
          pid,
          missionId,
          file: compressed,
          onProgress: (pct) => {
            setUploading((prev) => prev.map((item) => (item.id === localId ? { ...item, progress: pct } : item)))
          },
        })
        accumulated = [...accumulated, result]
        onChange(accumulated)
      } catch {
        setError('업로드에 실패했어요. 다시 시도해 주세요.')
      } finally {
        setUploading((prev) => prev.filter((item) => item.id !== localId))
        URL.revokeObjectURL(previewUrl)
      }
    }
  }

  async function handleRemove(image: SubmissionImage) {
    await imageStore.remove(image.path)
    onChange(images.filter((img) => img.path !== image.path))
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-text">캡처 화면 (1~3장)</span>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        className={`rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
          dragActive ? 'border-accent bg-card-accent' : 'border-border'
        } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer text-text-muted hover:border-accent'}`}
        onClick={() => !disabled && remainingSlots > 0 && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click()
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          if (!disabled && e.dataTransfer.files.length > 0) void handleFiles(e.dataTransfer.files)
        }}
        onPaste={(e) => {
          if (disabled) return
          const files = Array.from(e.clipboardData.items)
            .filter((item) => item.type.startsWith('image/'))
            .map((item) => item.getAsFile())
            .filter((f): f is File => f !== null)
          if (files.length > 0) void handleFiles(files)
        }}
      >
        {remainingSlots > 0 ? '클릭, 드래그앤드롭, 또는 Ctrl(⌘)+V로 붙여넣기' : '최대 3장을 모두 올렸어요.'}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      <p className="mt-2 text-xs text-text-muted">이메일·이름·파일명 등 개인정보가 보이면 가려서 올려주세요.</p>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}

      {(images.length > 0 || uploading.length > 0) && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {images.map((image) => (
            <div key={image.path} className="relative aspect-square overflow-hidden rounded-lg border border-border">
              <img src={image.url} alt="업로드된 캡처" className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label="이미지 삭제"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-bg/80 text-xs text-text"
                onClick={() => void handleRemove(image)}
              >
                ✕
              </button>
            </div>
          ))}
          {uploading.map((item) => (
            <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg border border-border">
              <img src={item.previewUrl} alt="업로드 중" className="h-full w-full object-cover opacity-60" />
              <div className="absolute inset-x-0 bottom-0 h-1.5 bg-bg/60">
                <div className="h-full bg-accent transition-all" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
