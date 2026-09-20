/** 기수(cid)는 URL의 ?c= 쿼리를 우선하고, 없으면 환경변수 기본값을 쓴다. */
export function getCid(): string {
  if (typeof window !== 'undefined') {
    const fromQuery = new URLSearchParams(window.location.search).get('c')
    if (fromQuery) return fromQuery
  }
  return import.meta.env.VITE_DEFAULT_CID ?? 'default'
}
