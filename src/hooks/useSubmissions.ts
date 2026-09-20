import { useCallback, useSyncExternalStore } from 'react'
import { getCid } from '../lib/cid'
import { getMockSubmissionsStore, type UpsertSubmissionInput } from '../mocks/submissionsStore'
import type { Submission } from '../types'

const EMPTY: Submission[] = []

/** 1단계(목데이터) 구현. 2단계에서 Firestore 구독으로 교체된다. */
export function useSubmissions(pid: string | null) {
  const store = getMockSubmissionsStore(getCid())

  const submissions = useSyncExternalStore(store.subscribe, () => (pid ? store.getAll(pid) : EMPTY))

  const upsertSubmission = useCallback(
    (input: UpsertSubmissionInput) => store.upsert(input),
    [store],
  )

  return { submissions, upsertSubmission }
}
