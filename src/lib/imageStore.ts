export interface UploadParams {
  cid: string
  pid: string
  missionId: string
  file: File
  onProgress?: (percent: number) => void
}

export interface UploadResult {
  path: string
  url: string
}

/** 캡처 이미지 저장 로직의 추상 인터페이스. 기본 구현체는 Firebase Storage. */
export interface ImageStore {
  upload(params: UploadParams): Promise<UploadResult>
  remove(path: string): Promise<void>
}

/** 목데이터 단계(Firebase 연동 전)에서 쓰는 메모리 구현체. 새로고침하면 사라진다. */
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

export const imageStore: ImageStore = new MockImageStore()
