const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
]

const HANGUL_BASE = 0xac00
const HANGUL_LAST = 0xd7a3
const JUNGSUNG_COUNT = 21
const JONGSUNG_COUNT = 28

/** 한글 음절은 초성으로, 그 외 문자는 그대로 추출한다. */
export function getChosung(input: string): string {
  let result = ''
  for (const ch of input) {
    const code = ch.charCodeAt(0)
    if (code >= HANGUL_BASE && code <= HANGUL_LAST) {
      const chosungIndex = Math.floor((code - HANGUL_BASE) / (JUNGSUNG_COUNT * JONGSUNG_COUNT))
      result += CHOSUNG_LIST[chosungIndex]
    } else {
      result += ch
    }
  }
  return result
}

function isChosungOnly(query: string): boolean {
  return [...query].every((ch) => CHOSUNG_LIST.includes(ch))
}

/** 이름 문자열 또는 초성으로 검색어를 매칭한다 (검색어가 비어 있으면 항상 true). */
export function matchesNameQuery(name: string, query: string): boolean {
  const trimmed = query.trim()
  if (!trimmed) return true

  const nameChosung = getChosung(name)
  if (isChosungOnly(trimmed)) {
    return nameChosung.includes(trimmed)
  }
  return name.includes(trimmed) || nameChosung.includes(getChosung(trimmed))
}
