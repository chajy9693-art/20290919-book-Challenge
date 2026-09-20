import {
  type Timestamp,
  type Unsubscribe,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { getSubmissionId } from '../lib/missions'
import type { Challenge, Mission, Participant, Submission, SubmissionImage } from '../types'
import { db } from './config'

function challengeDocRef(cid: string) {
  return doc(db, 'challenges', cid)
}

function missionsColRef(cid: string) {
  return collection(db, 'challenges', cid, 'missions')
}

function participantsColRef(cid: string) {
  return collection(db, 'challenges', cid, 'participants')
}

function submissionsColRef(cid: string) {
  return collection(db, 'challenges', cid, 'submissions')
}

function submissionDocRef(cid: string, pid: string, missionId: string) {
  return doc(db, 'challenges', cid, 'submissions', getSubmissionId(pid, missionId))
}

export async function fetchChallenge(cid: string): Promise<Challenge> {
  const snap = await getDoc(challengeDocRef(cid))
  if (!snap.exists()) throw new Error(`챌린지(${cid})를 찾을 수 없습니다.`)
  return snap.data() as Challenge
}

export async function fetchMissions(cid: string): Promise<Mission[]> {
  const snap = await getDocs(missionsColRef(cid))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Mission, 'id'>) }))
}

export async function fetchParticipants(cid: string): Promise<Participant[]> {
  const snap = await getDocs(participantsColRef(cid))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Participant, 'id'>) }))
}

interface SubmissionDoc {
  pid: string
  missionId: string
  images: SubmissionImage[]
  reflection: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

function toSubmission(id: string, data: SubmissionDoc): Submission {
  return {
    id,
    pid: data.pid,
    missionId: data.missionId,
    images: data.images,
    reflection: data.reflection,
    createdAt: data.createdAt.toMillis(),
    updatedAt: data.updatedAt.toMillis(),
  }
}

/** 참여자(pid)의 제출 이력을 실시간 구독한다. 다른 브라우저의 제출도 즉시 반영된다. */
export function subscribeSubmissions(
  cid: string,
  pid: string,
  onChange: (submissions: Submission[]) => void,
): Unsubscribe {
  const q = query(submissionsColRef(cid), where('pid', '==', pid))
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => toSubmission(d.id, d.data() as SubmissionDoc)))
  })
}

export interface UpsertSubmissionInput {
  pid: string
  missionId: string
  images: SubmissionImage[]
  reflection: string
}

/** 같은 참여자·같은 미션 제출은 문서 ID(pid_missionId)가 같아 항상 upsert로 처리된다. */
export async function upsertSubmission(cid: string, input: UpsertSubmissionInput): Promise<void> {
  const ref = submissionDocRef(cid, input.pid, input.missionId)
  const existing = await getDoc(ref)

  await setDoc(ref, {
    pid: input.pid,
    missionId: input.missionId,
    images: input.images,
    reflection: input.reflection,
    createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}
