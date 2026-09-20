import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('#root 엘리먼트를 찾을 수 없습니다.')
const root = createRoot(rootElement)

// App(및 Firebase 초기화)을 동적 import로 감싸, .env 설정 누락 등으로 모듈 로드
// 시점에 에러가 나도 빈 화면 대신 원인을 알 수 있는 안내를 보여준다.
import('./App.tsx')
  .then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
  .catch((err) => {
    console.error(err)
    root.render(
      <div style={{ padding: 24, fontFamily: 'sans-serif', color: '#F2F5FF' }}>
        <p>앱을 불러오지 못했습니다.</p>
        <p style={{ color: '#A3AEDB', fontSize: 14, marginTop: 8 }}>
          Firebase 환경변수(.env)가 올바르게 설정되었는지 확인해 주세요. 배포 시에는 빌드(npm run
          build) 실행 전에 .env가 채워져 있어야 합니다.
        </p>
        <pre style={{ marginTop: 16, fontSize: 12, color: '#F87171', whiteSpace: 'pre-wrap' }}>
          {err instanceof Error ? err.message : String(err)}
        </pre>
      </div>,
    )
  })
