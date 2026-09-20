import { useCallback, useEffect, useState } from 'react'
import { getLocalSubmissions, subscribeLocalSubmissions, upsertLocalSubmission } from '../lib/localSubmissions'
import type { Submission, SubmissionImage } from '../types'

export interface UpsertSubmissionInput {
  pid: string
  missionId: string
  images: SubmissionImage[]
  reflection: string
}

/**
 * 참여자(pid)의 제출 이력을 브라우저(IndexedDB)에서 읽는다. 이 브라우저에 남긴
 * 제출만 보이며, 다른 기기·브라우저와는 동기화되지 않는다.
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

    let cancelled = false
    setLoading(true)

    async function load() {
      const next = await getLocalSubmissions(cid, pid as string)
      if (!cancelled) {
        setSubmissions(next)
        setLoading(false)
      }
    }

    void load()
    const unsubscribe = subscribeLocalSubmissions(() => void load())
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [cid, pid])

  const upsertSubmission = useCallback(
    (input: UpsertSubmissionInput) => upsertLocalSubmission(cid, input),
    [cid],
  )

  return { submissions, loading, upsertSubmission }
}
