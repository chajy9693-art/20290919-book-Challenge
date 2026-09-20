import { useEffect, useState } from 'react'
import { ensureAnonymousAuth } from '../firebase/auth'
import { fetchChallenge, fetchMissions, fetchParticipants } from '../firebase/firestore'
import type { Challenge, Mission, Participant } from '../types'

export interface ChallengeData {
  challenge: Challenge | null
  missions: Mission[]
  participants: Participant[]
  loading: boolean
  error: string | null
}

export function useChallengeData(cid: string): ChallengeData {
  const [state, setState] = useState<ChallengeData>({
    challenge: null,
    missions: [],
    participants: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        await ensureAnonymousAuth()
        const [challenge, missions, participants] = await Promise.all([
          fetchChallenge(cid),
          fetchMissions(cid),
          fetchParticipants(cid),
        ])
        if (!cancelled) setState({ challenge, missions, participants, loading: false, error: null })
      } catch (err) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.',
          }))
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [cid])

  return state
}
