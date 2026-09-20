import { staticChallenge, staticMissions, staticParticipants } from '../data/staticData'
import type { Challenge, Mission, Participant } from '../types'

export interface ChallengeData {
  challenge: Challenge
  missions: Mission[]
  participants: Participant[]
}

/** 미션·명단·챌린지 정보는 빌드에 번들된 data/*.json에서 그대로 읽는다(백엔드 없음). */
export function useChallengeData(): ChallengeData {
  return { challenge: staticChallenge, missions: staticMissions, participants: staticParticipants }
}
