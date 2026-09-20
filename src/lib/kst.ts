const KST_OFFSET_MS = 9 * 60 * 60 * 1000
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

/**
 * epoch ms를 KST 벽시계 기준으로 취급할 수 있도록 이동시킨 Date.
 * UTC getter로 읽으면 로컬 시스템 타임존과 무관하게 KST 값이 나온다.
 */
function toKstShifted(date: Date): Date {
  return new Date(date.getTime() + KST_OFFSET_MS)
}

/** 'YYYY-MM-DD' (KST 기준 오늘) */
export function todayKST(now: Date = new Date()): string {
  return formatDateKST(now)
}

export function formatDateKST(date: Date): string {
  const kst = toKstShifted(date)
  const y = kst.getUTCFullYear()
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0')
  const d = String(kst.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 'YYYY-MM-DD' 문자열은 사전식 정렬이 곧 날짜 순서와 같다 */
export function isOnOrBefore(dateStr: string, referenceDateStr: string): boolean {
  return dateStr <= referenceDateStr
}

export function compareDateStrings(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/** "9/20(일)" 형식 */
export function formatMonthDayWeekday(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const weekday = WEEKDAY_LABELS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return `${m}/${d}(${weekday})`
}

/** "9월 20일" 형식 */
export function formatMonthDay(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number)
  return `${m}월 ${d}일`
}

/** epoch ms -> "9. 20. 21:14" 형식 (KST) */
export function formatDateTimeKST(epochMs: number): string {
  const kst = toKstShifted(new Date(epochMs))
  const m = kst.getUTCMonth() + 1
  const d = kst.getUTCDate()
  const hh = String(kst.getUTCHours()).padStart(2, '0')
  const mm = String(kst.getUTCMinutes()).padStart(2, '0')
  return `${m}. ${d}. ${hh}:${mm}`
}
