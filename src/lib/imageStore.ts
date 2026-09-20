import type { ImageStore, UploadParams, UploadResult } from '../types'

export type { ImageStore, UploadParams, UploadResult }

/**
 * 업로드된 이미지 Blob을 path로 찾을 수 있게 들고 있는 메모리 캐시.
 * localSubmissions.ts가 제출을 저장할 때 이 캐시에서 실제 Blob을 꺼내
 * IndexedDB에 함께 저장한다. 저장소에서 불러온(기존) 이미지도 다시 채워 넣어
 * 재제출 시에도 항상 path -> Blob을 찾을 수 있게 한다.
 */
export const blobCache = new Map<string, Blob>()

/** 브라우저 안에서만 동작하는 이미지 저장 구현체. 실제 파일은 blobCache + IndexedDB에 남는다. */
export class LocalImageStore implements ImageStore {
  async upload({ file, onProgress }: UploadParams): Promise<UploadResult> {
    for (const pct of [40, 80, 100]) {
      await new Promise((r) => setTimeout(r, 60))
      onProgress?.(pct)
    }
    const path = `local/${crypto.randomUUID()}.jpg`
    blobCache.set(path, file)
    return { path, url: URL.createObjectURL(file) }
  }

  async remove(path: string): Promise<void> {
    blobCache.delete(path)
  }
}

export const imageStore: ImageStore = new LocalImageStore()
