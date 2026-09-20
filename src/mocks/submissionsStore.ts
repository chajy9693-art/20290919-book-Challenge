import { getSubmissionId } from '../lib/missions'
import type { Submission, SubmissionImage } from '../types'

export interface UpsertSubmissionInput {
  pid: string
  missionId: string
  images: SubmissionImage[]
  reflection: string
}

/**
 * Firebase 연동 전(1단계) 임시 저장소. localStorage에 남겨 새로고침에도 유지되게 한다.
 * 실제 서버 저장은 2단계에서 firebaseRepository로 대체된다.
 */
class MockSubmissionsStore {
  private submissions = new Map<string, Submission>()
  private cache = new Map<string, Submission[]>()
  private listeners = new Set<() => void>()

  constructor(private readonly cid: string) {
    this.load()
  }

  private storageKey(): string {
    return `book-challenge:mock-submissions:${this.cid}`
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(this.storageKey())
      if (!raw) return
      const list: Submission[] = JSON.parse(raw)
      list.forEach((s) => this.submissions.set(s.id, s))
    } catch {
      // 저장된 값이 없거나 손상된 경우 빈 상태로 시작한다.
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify([...this.submissions.values()]))
    } catch {
      // 저장 실패는 목데이터 단계에서 무시해도 무방하다.
    }
  }

  private notify(): void {
    this.cache.clear()
    this.listeners.forEach((cb) => cb())
  }

  subscribe = (callback: () => void): (() => void) => {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  getAll = (pid: string): Submission[] => {
    const cached = this.cache.get(pid)
    if (cached) return cached
    const result = [...this.submissions.values()].filter((s) => s.pid === pid)
    this.cache.set(pid, result)
    return result
  }

  upsert(input: UpsertSubmissionInput): Submission {
    const id = getSubmissionId(input.pid, input.missionId)
    const existing = this.submissions.get(id)
    const now = Date.now()
    const submission: Submission = {
      id,
      pid: input.pid,
      missionId: input.missionId,
      images: input.images,
      reflection: input.reflection,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    this.submissions.set(id, submission)
    this.persist()
    this.notify()
    return submission
  }
}

let instance: MockSubmissionsStore | null = null

export function getMockSubmissionsStore(cid: string): MockSubmissionsStore {
  if (!instance) instance = new MockSubmissionsStore(cid)
  return instance
}
