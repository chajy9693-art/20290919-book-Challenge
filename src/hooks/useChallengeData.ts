import { mockChallenge, mockMissions, mockParticipants } from '../mocks/data'
import type { Challenge, Mission, Participant } from '../types'

export interface ChallengeData {
  challenge: Challenge
  missions: Mission[]
  participants: Participant[]
  loading: boolean
}

/** 1단계(목데이터) 구현. 2단계에서 Firestore 구독으로 교체된다. */
export function useChallengeData(): ChallengeData {
  return {
    challenge: mockChallenge,
    missions: mockMissions,
    participants: mockParticipants,
    loading: false,
  }
}
