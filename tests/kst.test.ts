import { describe, expect, it } from 'vitest'
import {
  compareDateStrings,
  formatDateTimeKST,
  formatMonthDay,
  formatMonthDayWeekday,
  isOnOrBefore,
  todayKST,
} from '../src/lib/kst'

describe('todayKST', () => {
  it('UTC 15:00은 자정을 넘어 KST 다음날로 계산된다', () => {
    // UTC 2026-09-20 15:00 = KST 2026-09-21 00:00
    expect(todayKST(new Date('2026-09-20T15:00:00.000Z'))).toBe('2026-09-21')
  })

  it('경계: UTC 14:59는 아직 KST 같은 날이다', () => {
    // UTC 2026-09-20 14:59 = KST 2026-09-20 23:59
    expect(todayKST(new Date('2026-09-20T14:59:00.000Z'))).toBe('2026-09-20')
  })

  it('UTC 자정 근처(00:00)는 KST 오전 9시로 같은 날짜다', () => {
    expect(todayKST(new Date('2026-01-01T00:00:00.000Z'))).toBe('2026-01-01')
  })
})

describe('isOnOrBefore / compareDateStrings', () => {
  it('과거 날짜는 기준일 이전이다', () => {
    expect(isOnOrBefore('2026-09-01', '2026-09-20')).toBe(true)
  })

  it('경계: 같은 날짜는 이전으로 취급된다(이하)', () => {
    expect(isOnOrBefore('2026-09-20', '2026-09-20')).toBe(true)
  })

  it('미래 날짜는 기준일 이전이 아니다', () => {
    expect(isOnOrBefore('2026-09-21', '2026-09-20')).toBe(false)
  })

  it('compareDateStrings는 순서를 -1/0/1로 반환한다', () => {
    expect(compareDateStrings('2026-01-01', '2026-01-02')).toBe(-1)
    expect(compareDateStrings('2026-01-02', '2026-01-02')).toBe(0)
    expect(compareDateStrings('2026-01-03', '2026-01-02')).toBe(1)
  })
})

describe('formatMonthDayWeekday / formatMonthDay', () => {
  it('9/20(일) 형식으로 포맷한다', () => {
    // 2026-09-20은 일요일
    expect(formatMonthDayWeekday('2026-09-20')).toBe('9/20(일)')
  })

  it('9월 20일 형식으로 포맷한다', () => {
    expect(formatMonthDay('2026-09-20')).toBe('9월 20일')
  })
})

describe('formatDateTimeKST', () => {
  it('epoch ms를 "M. D. HH:mm" 형식(KST)으로 변환한다', () => {
    // UTC 2026-09-20 12:14:00 = KST 2026-09-20 21:14
    const ms = new Date('2026-09-20T12:14:00.000Z').getTime()
    expect(formatDateTimeKST(ms)).toBe('9. 20. 21:14')
  })

  it('경계: 자정을 넘어가는 시각도 올바른 날짜로 표시된다', () => {
    // UTC 2026-09-20 15:30:00 = KST 2026-09-21 00:30
    const ms = new Date('2026-09-20T15:30:00.000Z').getTime()
    expect(formatDateTimeKST(ms)).toBe('9. 21. 00:30')
  })
})
