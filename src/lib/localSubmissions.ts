import { blobCache } from './imageStore'
import { getSubmissionId } from './missions'
import type { Submission, SubmissionImage } from '../types'

const DB_NAME = 'book-challenge'
const DB_VERSION = 1
const STORE_NAME = 'submissions'

interface StoredImage {
  path: string
  blob: Blob
}

interface StoredSubmission {
  id: string
  cid: string
  pid: string
  missionId: string
  images: StoredImage[]
  reflection: string
  createdAt: number
  updatedAt: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode)
    const request = run(tx.objectStore(STORE_NAME))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const listeners = new Set<() => void>()

/** 같은 탭에서 제출/수정이 일어나면 구독자에게 알린다(다른 탭 간 동기화는 지원하지 않는다). */
export function subscribeLocalSubmissions(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function notify(): void {
  listeners.forEach((cb) => cb())
}

function toSubmission(stored: StoredSubmission): Submission {
  const images: SubmissionImage[] = stored.images.map((img) => {
    blobCache.set(img.path, img.blob)
    return { path: img.path, url: URL.createObjectURL(img.blob) }
  })
  return {
    id: stored.id,
    pid: stored.pid,
    missionId: stored.missionId,
    images,
    reflection: stored.reflection,
    createdAt: stored.createdAt,
    updatedAt: stored.updatedAt,
  }
}

export async function getLocalSubmissions(cid: string, pid: string): Promise<Submission[]> {
  const all = await withStore<StoredSubmission[]>('readonly', (store) => store.getAll())
  return all.filter((s) => s.cid === cid && s.pid === pid).map(toSubmission)
}

export interface UpsertLocalSubmissionInput {
  pid: string
  missionId: string
  images: SubmissionImage[]
  reflection: string
}

export async function upsertLocalSubmission(cid: string, input: UpsertLocalSubmissionInput): Promise<void> {
  const id = getSubmissionId(input.pid, input.missionId)
  const existing = await withStore<StoredSubmission | undefined>('readonly', (store) => store.get(id))

  const images: StoredImage[] = input.images.map((img) => {
    const blob = blobCache.get(img.path)
    if (!blob) throw new Error(`이미지를 찾을 수 없습니다: ${img.path}`)
    return { path: img.path, blob }
  })

  const record: StoredSubmission = {
    id,
    cid,
    pid: input.pid,
    missionId: input.missionId,
    images,
    reflection: input.reflection,
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  }

  await withStore('readwrite', (store) => store.put(record))
  notify()
}
