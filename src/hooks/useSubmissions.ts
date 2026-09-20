import { useCallback, useEffect, useState } from 'react'
import { subscribeSubmissions, upsertSubmission as upsertSubmissionInFirestore } from '../firebase/firestore'
import type { Submission, SubmissionImage } from '../types'

export interface UpsertSubmissionInput {
  pid: string
  missionId: string
  images: SubmissionImage[]
  reflection: string
}

/**
 * 참여자(pid)의 제출 이력을 실시간 구독한다. 다른 브라우저의 제출도 즉시 반영된다.
 * loading은 pid가 바뀐 뒤 첫 스냅샷이 도착하기 전까지 true다. 제출 폼이 이 값을 보고
 * 기존 제출 데이터가 도착하기 전에 빈 폼으로 마운트되는 것을 막는다.
 */
export function useSubmissions(cid: string, pid: string | null) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!pid) {
      setSubmissions([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeSubmissions(cid, pid, (next) => {
      setSubmissions(next)
      setLoading(false)
    })
    return unsubscribe
  }, [cid, pid])

  const upsertSubmission = useCallback(
    (input: UpsertSubmissionInput) => upsertSubmissionInFirestore(cid, input),
    [cid],
  )

  return { submissions, loading, upsertSubmission }
}
