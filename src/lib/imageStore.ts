import { FirebaseImageStore } from '../firebase/storage'
import type { ImageStore, UploadParams, UploadResult } from '../types'

export type { ImageStore, UploadParams, UploadResult }

/** 로컬 개발/테스트용 메모리 구현체. 새로고침하면 사라진다. */
export class MockImageStore implements ImageStore {
  async upload({ file, onProgress }: UploadParams): Promise<UploadResult> {
    for (const pct of [30, 65, 100]) {
      await new Promise((r) => setTimeout(r, 80))
      onProgress?.(pct)
    }
    const url = URL.createObjectURL(file)
    return { path: `mock/${crypto.randomUUID()}.jpg`, url }
  }

  async remove(): Promise<void> {
    // 메모리 구현체는 별도 정리가 필요 없다.
  }
}

export const imageStore: ImageStore = new FirebaseImageStore()
