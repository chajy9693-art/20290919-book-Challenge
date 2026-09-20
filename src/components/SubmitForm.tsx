import { useEffect, useState } from 'react'
import { CaptureInput } from './CaptureInput'
import { NameCombobox } from './NameCombobox'
import type { Mission, Participant, Submission, SubmissionImage } from '../types'

const MIN_REFLECTION = 10
const MAX_REFLECTION = 2000

export interface SubmitInput {
  pid: string
  missionId: string
  images: SubmissionImage[]
  reflection: string
}

interface SubmitFormProps {
  cid: string
  mission: Mission
  participants: Participant[]
  pid: string | null
  onSelectPid: (pid: string) => void
  existingSubmission: Submission | null
  onSubmit: (input: SubmitInput) => Promise<void>
}

export function SubmitForm({
  cid,
  mission,
  participants,
  pid,
  onSelectPid,
  existingSubmission,
  onSubmit,
}: SubmitFormProps) {
  const [images, setImages] = useState<SubmissionImage[]>(existingSubmission?.images ?? [])
  const [reflection, setReflection] = useState(existingSubmission?.reflection ?? '')
  const [errors, setErrors] = useState<{ pid?: string; images?: string; reflection?: string; submit?: string }>({})
  const [toast, setToast] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors: typeof errors = {}
    if (!pid) nextErrors.pid = '참여자를 선택해 주세요.'
    if (images.length < 1 || images.length > 3) nextErrors.images = '캡처 화면을 1~3장 올려주세요.'
    if (reflection.trim().length < MIN_REFLECTION || reflection.length > MAX_REFLECTION) {
      nextErrors.reflection = `느낀 점은 ${MIN_REFLECTION}자 이상 ${MAX_REFLECTION}자 이하로 적어주세요.`
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || !pid) return

    setSubmitting(true)
    try {
      await onSubmit({ pid, missionId: mission.id, images, reflection })
      setToast(existingSubmission ? '수정 완료' : '제출 완료')
    } catch {
      setErrors({ submit: '제출에 실패했어요. 다시 시도해 주세요.' })
    } finally {
      setSubmitting(false)
    }
  }

  const isEditing = Boolean(existingSubmission)

  return (
    <section className="relative rounded-card border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-bold text-text">실습 제출</h2>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <NameCombobox participants={participants} pid={pid} onSelect={onSelectPid} />
          {errors.pid && <p className="mt-1 text-sm text-error">{errors.pid}</p>}
        </div>

        <div>
          <CaptureInput
            cid={cid}
            pid={pid ?? 'pending'}
            missionId={mission.id}
            images={images}
            onChange={setImages}
            disabled={!pid}
          />
          {errors.images && <p className="mt-1 text-sm text-error">{errors.images}</p>}
        </div>

        <div>
          <label htmlFor="reflection" className="mb-1 block text-sm font-medium text-text">
            만들고 느낀 점
          </label>
          <textarea
            id="reflection"
            rows={5}
            maxLength={MAX_REFLECTION}
            placeholder="무엇을 만들었고, 해 보니 어땠는지 적어주세요. 짧아도 좋습니다."
            className="w-full rounded-lg border border-border bg-card-accent px-4 py-3 text-sm text-text placeholder:text-text-muted"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          />
          <div className="mt-1 flex items-center justify-between text-xs text-text-muted">
            <span>{errors.reflection && <span className="text-error">{errors.reflection}</span>}</span>
            <span>
              {reflection.length} / {MAX_REFLECTION}
            </span>
          </div>
        </div>

        {errors.submit && <p className="text-center text-sm text-error">{errors.submit}</p>}

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-accent px-10 py-3 text-sm font-bold text-accent-fg hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? '처리 중...' : isEditing ? '수정하기' : '제출하기'}
          </button>
        </div>
      </form>

      {toast && (
        <div className="absolute inset-x-0 -top-4 mx-auto w-fit -translate-y-full rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-fg shadow-lg">
          {toast}
        </div>
      )}
    </section>
  )
}
