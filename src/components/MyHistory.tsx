import { useState } from 'react'
import { formatDateTimeKST } from '../lib/kst'
import { Lightbox } from './Lightbox'
import type { Mission, Submission } from '../types'

interface MyHistoryProps {
  missions: Mission[]
  submissions: Submission[]
  pid: string | null
  onEdit: (missionId: string) => void
}

export function MyHistory({ missions, submissions, pid, onEdit }: MyHistoryProps) {
  const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null)

  if (!pid) {
    return (
      <section className="rounded-card border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-2 text-lg font-bold text-text">내 제출 이력</h2>
        <p className="text-text-muted">이름을 선택하면 내 제출 이력이 표시됩니다.</p>
      </section>
    )
  }

  const sorted = [...submissions].sort((a, b) => b.updatedAt - a.updatedAt)
  const missionById = new Map(missions.map((m) => [m.id, m]))

  return (
    <section className="rounded-card border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-bold text-text">내 제출 이력</h2>

      {sorted.length === 0 ? (
        <p className="text-text-muted">아직 제출한 실습이 없어요. 첫 실습을 제출해 보세요!</p>
      ) : (
        <ul className="space-y-4">
          {sorted.map((submission) => {
            const mission = missionById.get(submission.missionId)
            if (!mission) return null
            const edited = submission.updatedAt !== submission.createdAt
            const urls = submission.images.map((img) => img.url)

            return (
              <li key={submission.id} className="rounded-lg border border-border bg-card-accent p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
                  <span className="font-semibold text-text">
                    {mission.order}회차 · {mission.title}
                  </span>
                  <span>{formatDateTimeKST(submission.createdAt)} 제출</span>
                  {edited && <span className="rounded-full bg-bg px-2 py-0.5 text-xs text-accent">수정됨</span>}
                </div>

                {urls.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {urls.map((url, i) => (
                      <button
                        key={url}
                        type="button"
                        className="h-16 w-16 overflow-hidden rounded-lg border border-border"
                        onClick={() => setLightbox({ urls, index: i })}
                      >
                        <img src={url} alt="제출 캡처 썸네일" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <p className="mt-3 whitespace-pre-line text-sm text-text">{submission.reflection}</p>

                <button
                  type="button"
                  className="mt-3 rounded-full border border-accent px-4 py-1.5 text-xs font-bold text-accent hover:bg-accent hover:text-accent-fg"
                  onClick={() => onEdit(submission.missionId)}
                >
                  수정
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {lightbox && (
        <Lightbox
          urls={lightbox.urls}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={(index) => setLightbox((prev) => (prev ? { ...prev, index } : prev))}
        />
      )}
    </section>
  )
}
