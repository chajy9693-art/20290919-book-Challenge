import type { Mission } from '../types'
import { isOnOrBefore } from './kst'

export function isMissionOpen(mission: Mission, today: string): boolean {
  return isOnOrBefore(mission.openDate, today)
}

export function sortByOrder(missions: Mission[]): Mission[] {
  return [...missions].sort((a, b) => a.order - b.order)
}

/** 공개된 미션만, 회차 오름차순 */
export function getOpenMissions(missions: Mission[], today: string): Mission[] {
  return sortByOrder(missions).filter((m) => isMissionOpen(m, today))
}

export type TodayMissionResult =
  | { kind: 'not-started'; startDate: string }
  | { kind: 'mission'; mission: Mission }

/**
 * 오늘의 미션 = 공개일이 오늘 이전(이하)인 미션 중 회차가 가장 큰 것.
 * 공개된 미션이 하나도 없으면(챌린지 시작 전) 첫 미션의 공개일을 안내용으로 반환한다.
 */
export function getTodayMission(missions: Mission[], today: string): TodayMissionResult {
  const open = getOpenMissions(missions, today)
  if (open.length === 0) {
    const first = sortByOrder(missions)[0]
    return { kind: 'not-started', startDate: first?.openDate ?? '' }
  }
  return { kind: 'mission', mission: open[open.length - 1] }
}

export function getSubmissionId(pid: string, missionId: string): string {
  return `${pid}_${missionId}`
}
