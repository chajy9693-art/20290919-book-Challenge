import { readFileSync } from 'node:fs'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import challenge from '../data/challenge.json' with { type: 'json' }
import missions from '../data/missions.json' with { type: 'json' }
import participantsRaw from '../data/participants.json' with { type: 'json' }
import { getChosung } from '../src/lib/chosung.ts'

const cid = process.env.SEED_CID || process.env.VITE_DEFAULT_CID || 'season-1'
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'demo-book-challenge'

function initAdminApp() {
  if (getApps().length > 0) return
  // 에뮬레이터(FIRESTORE_EMULATOR_HOST 설정)는 자격 증명 없이도 projectId만으로 접속된다.
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (credentialsPath && !process.env.FIRESTORE_EMULATOR_HOST) {
    const serviceAccount = JSON.parse(readFileSync(credentialsPath, 'utf-8'))
    initializeApp({ credential: cert(serviceAccount), projectId })
  } else {
    initializeApp({ projectId })
  }
}

async function main() {
  initAdminApp()
  const db = getFirestore()
  const challengeRef = db.collection('challenges').doc(cid)

  const batch = db.batch()
  batch.set(challengeRef, challenge)

  for (const mission of missions) {
    const { id, ...rest } = mission
    batch.set(challengeRef.collection('missions').doc(id), rest)
  }

  for (const participant of participantsRaw) {
    const displayName = participant.suffix ? `${participant.name}(${participant.suffix})` : participant.name
    batch.set(challengeRef.collection('participants').doc(participant.id), {
      name: participant.name,
      ...(participant.suffix ? { suffix: participant.suffix } : {}),
      displayName,
      chosung: getChosung(participant.name),
      active: true,
    })
  }

  await batch.commit()
  console.log(`✅ 시드 완료: challenges/${cid} (미션 ${missions.length}개, 참여자 ${participantsRaw.length}명)`)
}

main().catch((err) => {
  console.error('❌ 시드 실패:', err)
  process.exit(1)
})
