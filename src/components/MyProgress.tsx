import { computeMissionChips, computeProgress } from '../lib/progress'
import type { Mission, Submission } from '../types'

interface MyProgressProps {
  missions: Mission[]
  submissions: Submission[]
  today: string
  pid: string | null
  onSelectMission: (missionId: string) => void
}

export function MyProgress({ missions, submissions, today, pid, onSelectMission }: MyProgressProps) {
  if (!pid) {
    return (
      <section className="rounded-card border border-border bg-card p-5 sm:p-6">
        <h2 className="mb-2 text-lg font-bold text-text">내 진행 현황</h2>
        <p className="text-text-muted">이름을 선택하면 내 진행 현황이 표시됩니다.</p>
      </section>
    )
  }

  const submittedMissionIds = new Set(submissions.map((s) => s.missionId))
  const stats = computeProgress(missions, submittedMissionIds, today)
  const chips = computeMissionChips(missions, submittedMissionIds, today)
  const overallPercent = stats.totalCount === 0 ? 0 : Math.round((stats.submittedCount / stats.totalCount) * 100)

  return (
    <section className="rounded-card border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-bold text-text">내 진행 현황</h2>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="제출 완료" value={stats.submittedCount} />
        <Stat label="미제출" value={stats.notSubmittedCount} />
        <Stat label="달성률" value={`${stats.completionRate}%`} />
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-card-accent">
          <div className="h-full bg-accent transition-all" style={{ width: `${overallPercent}%` }} />
        </div>
        <p className="mt-2 text-center text-xs text-text-muted">
          전체 {stats.totalCount}개 중 {stats.submittedCount}개 완료
        </p>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-6">
        {chips.map(({ mission, status }) => (
          <button
            key={mission.id}
            type="button"
            disabled={status === 'unopened'}
            onClick={() => onSelectMission(mission.id)}
            className="flex flex-col items-center gap-1"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${
                status === 'submitted'
                  ? 'border-accent bg-accent text-accent-fg'
                  : status === 'not-submitted'
                    ? 'border-border text-text'
                    : 'border-border text-text-muted'
              }`}
            >
              {status === 'submitted' ? '✓' : status === 'unopened' ? '·' : ''}
            </span>
            <span className="text-xs text-text-muted">{mission.order}회</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-card-accent py-3">
      <p className="text-xl font-bold text-text">{value}</p>
      <p className="mt-1 text-xs text-text-muted">{label}</p>
    </div>
  )
}
