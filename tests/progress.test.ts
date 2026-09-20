import { describe, expect, it } from 'vitest'
import { computeMissionChips, computeProgress } from '../src/lib/progress'
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

describe('computeProgress', () => {
  it('공개된 미션 중 일부만 제출했을 때 통계를 계산한다', () => {
    const submitted = new Set(['mission-1'])
    const stats = computeProgress(missions, submitted, '2026-09-20')
    expect(stats).toEqual({
      openCount: 3,
      totalCount: 4,
      submittedCount: 1,
      notSubmittedCount: 2,
      completionRate: 33, // 1/3 = 33.33% -> 반올림 33
    })
  })

  it('경계: 공개된 미션이 0개면 달성률은 0%다(0으로 나누기 방지)', () => {
    const stats = computeProgress(missions, new Set(), '2026-01-01')
    expect(stats.openCount).toBe(0)
    expect(stats.completionRate).toBe(0)
  })

  it('공개된 미션을 모두 제출하면 달성률은 100%다', () => {
    const submitted = new Set(['mission-1', 'mission-2', 'mission-3'])
    const stats = computeProgress(missions, submitted, '2026-09-20')
    expect(stats.completionRate).toBe(100)
    expect(stats.notSubmittedCount).toBe(0)
  })

  it('실패 케이스: 미공개 미션을 제출한 것으로 넣어도 공개된 미션 수에는 반영되지 않는다', () => {
    const submitted = new Set(['mission-4']) // 아직 공개 전
    const stats = computeProgress(missions, submitted, '2026-09-20')
    expect(stats.submittedCount).toBe(0)
    expect(stats.completionRate).toBe(0)
  })
})

describe('computeMissionChips', () => {
  it('제출/미제출/미공개 상태를 회차 순으로 매긴다', () => {
    const submitted = new Set(['mission-1'])
    const chips = computeMissionChips(missions, submitted, '2026-09-20')
    expect(chips.map((c) => c.status)).toEqual(['submitted', 'not-submitted', 'not-submitted', 'unopened'])
  })

  it('경계: 모두 미공개면 전부 unopened다', () => {
    const chips = computeMissionChips(missions, new Set(), '2026-01-01')
    expect(chips.every((c) => c.status === 'unopened')).toBe(true)
  })
})
