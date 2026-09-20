import type { Mission } from '../types'
import { getOpenMissions, isMissionOpen, sortByOrder } from './missions'

export interface ProgressStats {
  openCount: number
  totalCount: number
  submittedCount: number
  notSubmittedCount: number
  /** 공개된 미션 대비 달성률(정수 %), 공개된 미션이 0개면 0 */
  completionRate: number
}

export function computeProgress(
  missions: Mission[],
  submittedMissionIds: ReadonlySet<string>,
  today: string,
): ProgressStats {
  const open = getOpenMissions(missions, today)
  const openCount = open.length
  const totalCount = missions.length
  const submittedCount = open.filter((m) => submittedMissionIds.has(m.id)).length
  const notSubmittedCount = openCount - submittedCount
  const completionRate = openCount === 0 ? 0 : Math.round((submittedCount / openCount) * 100)

  return { openCount, totalCount, submittedCount, notSubmittedCount, completionRate }
}

export type MissionChipStatus = 'submitted' | 'not-submitted' | 'unopened'

export interface MissionChip {
  mission: Mission
  status: MissionChipStatus
}

/** 전체 미션을 회차 순으로 훑으며 제출/미제출/미공개 상태를 매긴다. */
export function computeMissionChips(
  missions: Mission[],
  submittedMissionIds: ReadonlySet<string>,
  today: string,
): MissionChip[] {
  return sortByOrder(missions).map((mission) => {
    if (!isMissionOpen(mission, today)) {
      return { mission, status: 'unopened' as const }
    }
    return {
      mission,
      status: submittedMissionIds.has(mission.id) ? ('submitted' as const) : ('not-submitted' as const),
    }
  })
}
