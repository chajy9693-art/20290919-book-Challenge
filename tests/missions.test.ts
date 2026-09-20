import { describe, expect, it } from 'vitest'
import { getOpenMissions, getSubmissionId, getTodayMission, isMissionOpen } from '../src/lib/missions'
import type { Mission } from '../src/types'

function mission(order: number, openDate: string): Mission {
  return {
    id: `mission-${order}`,
    order,
    title: `실습 ${order}`,
    bookPage: `${order}쪽`,
    description: '설명',
    captureGuide: '안내',
    openDate,
  }
}

const missions: Mission[] = [
  mission(1, '2026-09-06'),
  mission(2, '2026-09-13'),
  mission(3, '2026-09-20'),
  mission(4, '2026-09-27'),
]

describe('isMissionOpen', () => {
  it('공개일이 오늘 이전이면 공개된 것으로 본다', () => {
    expect(isMissionOpen(mission(1, '2026-09-06'), '2026-09-20')).toBe(true)
  })

  it('경계: 공개일이 오늘과 같으면 공개된 것으로 본다', () => {
    expect(isMissionOpen(mission(3, '2026-09-20'), '2026-09-20')).toBe(true)
  })

  it('공개일이 오늘 이후면 아직 공개되지 않은 것이다', () => {
    expect(isMissionOpen(mission(4, '2026-09-27'), '2026-09-20')).toBe(false)
  })
})

describe('getOpenMissions', () => {
  it('공개된 미션만 회차 오름차순으로 반환한다', () => {
    expect(getOpenMissions(missions, '2026-09-20').map((m) => m.order)).toEqual([1, 2, 3])
  })

  it('경계: 공개된 미션이 없으면 빈 배열을 반환한다', () => {
    expect(getOpenMissions(missions, '2026-01-01')).toEqual([])
  })
})

describe('getTodayMission', () => {
  it('시작 전: 공개된 미션이 없으면 not-started와 첫 미션의 공개일을 반환한다', () => {
    const result = getTodayMission(missions, '2026-08-01')
    expect(result).toEqual({ kind: 'not-started', startDate: '2026-09-06' })
  })

  it('진행 중: 공개된 미션 중 회차가 가장 큰 것을 오늘의 미션으로 반환한다', () => {
    const result = getTodayMission(missions, '2026-09-20')
    expect(result.kind).toBe('mission')
    if (result.kind === 'mission') {
      expect(result.mission.order).toBe(3)
    }
  })

  it('종료 후: 모든 미션이 공개되었으면 마지막 미션을 반환한다', () => {
    const result = getTodayMission(missions, '2026-12-31')
    expect(result.kind).toBe('mission')
    if (result.kind === 'mission') {
      expect(result.mission.order).toBe(4)
    }
  })

  it('실패 케이스: 미션이 비어 있으면 not-started와 빈 startDate를 반환한다', () => {
    expect(getTodayMission([], '2026-09-20')).toEqual({ kind: 'not-started', startDate: '' })
  })
})

describe('getSubmissionId', () => {
  it('pid와 missionId를 언더스코어로 연결한다', () => {
    expect(getSubmissionId('p01', 'mission-1')).toBe('p01_mission-1')
  })

  it('같은 참여자·같은 미션이면 항상 같은 문서 ID를 생성한다(재제출 = 수정)', () => {
    const first = getSubmissionId('p01', 'mission-1')
    const second = getSubmissionId('p01', 'mission-1')
    expect(first).toBe(second)
  })

  it('참여자 또는 미션이 다르면 문서 ID도 달라진다', () => {
    expect(getSubmissionId('p01', 'mission-1')).not.toBe(getSubmissionId('p02', 'mission-1'))
    expect(getSubmissionId('p01', 'mission-1')).not.toBe(getSubmissionId('p01', 'mission-2'))
  })
})
