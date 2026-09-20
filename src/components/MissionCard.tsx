import { useState } from 'react'
import { formatMonthDay, formatMonthDayWeekday } from '../lib/kst'
import { isMissionOpen, sortByOrder } from '../lib/missions'
import type { Mission } from '../types'

interface MissionCardProps {
  missions: Mission[]
  selectedMission: Mission | null
  onSelectMission: (missionId: string) => void
  today: string
  startDate: string
}

export function MissionCard({ missions, selectedMission, onSelectMission, today, startDate }: MissionCardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const sorted = sortByOrder(missions)

  return (
    <section className="rounded-card border border-border bg-card p-5 sm:p-6">
      <h2 className="sr-only">오늘의 미션</h2>

      {!selectedMission ? (
        <p className="text-text-muted">챌린지가 {formatMonthDay(startDate)}에 시작해요.</p>
      ) : (
        <div className="space-y-3">
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-fg">
            {selectedMission.order}회차
          </span>
          <h3 className="text-xl font-bold text-text">{selectedMission.title}</h3>
          <p className="text-sm text-text-muted">{selectedMission.bookPage}</p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-text">{selectedMission.description}</p>
          <p className="rounded-lg bg-card-accent px-3 py-2 text-xs text-text-muted">
            📸 이런 화면을 캡처해 주세요: {selectedMission.captureGuide}
          </p>
        </div>
      )}

      <div className="relative mt-4">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border border-border bg-card-accent px-4 py-3 text-left text-sm text-text"
          onClick={() => setDropdownOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
        >
          <span>
            {selectedMission
              ? `${selectedMission.order}회차 · ${selectedMission.title} · ${formatMonthDayWeekday(selectedMission.openDate)}`
              : '미션을 선택해 주세요'}
          </span>
          <span aria-hidden>▾</span>
        </button>

        {dropdownOpen && (
          <ul
            role="listbox"
            className="absolute z-10 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-card-accent shadow-lg"
          >
            {sorted.map((mission) => {
              const open = isMissionOpen(mission, today)
              return (
                <li key={mission.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={mission.id === selectedMission?.id}
                    disabled={!open}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-text disabled:cursor-not-allowed disabled:text-text-muted/50 enabled:hover:bg-bg"
                    onClick={() => {
                      onSelectMission(mission.id)
                      setDropdownOpen(false)
                    }}
                  >
                    <span>
                      {mission.order}회차 · {mission.title} · {formatMonthDayWeekday(mission.openDate)}
                    </span>
                    {!open && <span className="text-xs">공개 전</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
