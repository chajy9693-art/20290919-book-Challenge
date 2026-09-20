export interface Challenge {
  title: string
  subtitle: string
  startDate: string // 'YYYY-MM-DD' (KST)
  endDate: string // 'YYYY-MM-DD' (KST)
}

export interface Mission {
  id: string
  order: number
  title: string
  bookPage: string
  description: string
  captureGuide: string
  openDate: string // 'YYYY-MM-DD' (KST)
}

export interface Participant {
  id: string
  name: string
  suffix?: string
  displayName: string
  chosung: string
  active: boolean
}

export interface SubmissionImage {
  path: string
  url: string
}

export interface Submission {
  id: string // `${pid}_${missionId}`
  pid: string
  missionId: string
  images: SubmissionImage[]
  reflection: string
  createdAt: number // epoch ms
  updatedAt: number // epoch ms
}

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
