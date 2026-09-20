import { describe, expect, it } from 'vitest'
import { getChosung, matchesNameQuery } from '../src/lib/chosung'

describe('getChosung', () => {
  it('한글 음절을 초성으로 변환한다', () => {
    expect(getChosung('참가자01')).toBe('ㅊㄱㅈ01')
  })

  it('숫자/영문 등 한글이 아닌 문자는 그대로 유지한다', () => {
    expect(getChosung('abc123')).toBe('abc123')
  })

  it('경계: 빈 문자열은 빈 문자열을 반환한다', () => {
    expect(getChosung('')).toBe('')
  })
})

describe('matchesNameQuery', () => {
  it('초성 검색어 "ㅊㄱㅈ"는 "참가자01"과 매칭된다', () => {
    expect(matchesNameQuery('참가자01', 'ㅊㄱㅈ')).toBe(true)
  })

  it('완성된 이름 일부로도 매칭된다', () => {
    expect(matchesNameQuery('참가자01', '가자')).toBe(true)
  })

  it('경계: 검색어가 비어 있으면 항상 매칭된다', () => {
    expect(matchesNameQuery('참가자01', '')).toBe(true)
    expect(matchesNameQuery('참가자01', '   ')).toBe(true)
  })

  it('일치하지 않는 검색어는 매칭되지 않는다', () => {
    expect(matchesNameQuery('참가자01', 'ㅎㅎㅎ')).toBe(false)
    expect(matchesNameQuery('참가자01', '홍길동')).toBe(false)
  })
})
