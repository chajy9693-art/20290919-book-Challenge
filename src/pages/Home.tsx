import { useMemo, useRef, useState } from 'react'
import { Header } from '../components/Header'
import { MissionCard } from '../components/MissionCard'
import { MyHistory } from '../components/MyHistory'
import { MyProgress } from '../components/MyProgress'
import { SubmitForm } from '../components/SubmitForm'
import { useChallengeData } from '../hooks/useChallengeData'
import { useSelectedParticipant } from '../hooks/useSelectedParticipant'
import { useSubmissions } from '../hooks/useSubmissions'
import { getCid } from '../lib/cid'
import { todayKST } from '../lib/kst'
import { getTodayMission } from '../lib/missions'

export function Home() {
  const cid = useMemo(() => getCid(), [])
  const today = useMemo(() => todayKST(), [])
  const { challenge, missions, participants, loading, error } = useChallengeData(cid)
  const { pid, setPid } = useSelectedParticipant()
  const { submissions, loading: submissionsLoading, upsertSubmission } = useSubmissions(cid, pid)

  const todayMission = useMemo(() => getTodayMission(missions, today), [missions, today])
  const [overrideMissionId, setOverrideMissionId] = useState<string | null>(null)
  const selectedMissionId =
    overrideMissionId ?? (todayMission.kind === 'mission' ? todayMission.mission.id : null)

  const submitCardRef = useRef<HTMLDivElement>(null)
  const selectedMission = missions.find((m) => m.id === selectedMissionId) ?? null
  const existingSubmission = submissions.find((s) => s.missionId === selectedMissionId) ?? null

  function selectMissionAndScroll(missionId: string) {
    setOverrideMissionId(missionId)
    submitCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (loading) {
    return <p className="p-10 text-center text-text-muted">불러오는 중...</p>
  }

  if (error || !challenge) {
    return <p className="p-10 text-center text-error">{error ?? '챌린지를 찾을 수 없습니다.'}</p>
  }

  return (
    <div className="mx-auto max-w-content px-4 pb-16">
      <Header title={challenge.title} subtitle={challenge.subtitle} />

      <div className="space-y-5">
        <MissionCard
          missions={missions}
          selectedMission={selectedMission}
          onSelectMission={setOverrideMissionId}
          today={today}
          startDate={challenge.startDate}
        />

        <div ref={submitCardRef}>
          {!selectedMission ? (
            <section className="rounded-card border border-border bg-card p-5 text-center text-text-muted sm:p-6">
              아직 공개된 미션이 없어요.
            </section>
          ) : pid && submissionsLoading ? (
            <section className="rounded-card border border-border bg-card p-5 text-center text-text-muted sm:p-6">
              불러오는 중...
            </section>
          ) : (
            <SubmitForm
              key={`${pid ?? 'anonymous'}-${selectedMission.id}`}
              cid={cid}
              mission={selectedMission}
              participants={participants}
              pid={pid}
              onSelectPid={setPid}
              existingSubmission={existingSubmission}
              onSubmit={upsertSubmission}
            />
          )}
        </div>

        <MyProgress
          missions={missions}
          submissions={submissions}
          today={today}
          pid={pid}
          onSelectMission={selectMissionAndScroll}
        />

        <MyHistory missions={missions} submissions={submissions} pid={pid} onEdit={selectMissionAndScroll} />
      </div>

      <footer className="mt-10 text-center text-xs text-text-muted">
        {challenge.title} · {challenge.startDate} ~ {challenge.endDate}
      </footer>
    </div>
  )
}
