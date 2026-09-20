import { useCallback, useState } from 'react'

const STORAGE_KEY = 'book-challenge:selected-pid'

export function useSelectedParticipant() {
  const [pid, setPidState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  })

  const setPid = useCallback((next: string | null) => {
    setPidState(next)
    try {
      if (next) {
        localStorage.setItem(STORAGE_KEY, next)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // 프라이빗 브라우징 등에서 저장이 막혀도 화면 동작에는 지장이 없다.
    }
  }, [])

  return { pid, setPid }
}
