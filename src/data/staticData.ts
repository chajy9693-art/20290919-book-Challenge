import challengeJson from '../../data/challenge.json'
import missionsJson from '../../data/missions.json'
import participantsJson from '../../data/participants.json'
import { getChosung } from '../lib/chosung'
import type { Challenge, Mission, Participant } from '../types'

export const staticChallenge: Challenge = challengeJson

export const staticMissions: Mission[] = missionsJson

export const staticParticipants: Participant[] = participantsJson.map((p) => {
  const displayName = p.suffix ? `${p.name}(${p.suffix})` : p.name
  return {
    id: p.id,
    name: p.name,
    suffix: p.suffix,
    displayName,
    chosung: getChosung(p.name),
    active: true,
  }
})
