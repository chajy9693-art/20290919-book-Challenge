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
