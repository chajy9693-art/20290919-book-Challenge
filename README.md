# 구글 워크스페이스 실습 챌린지

책 속 실습을 하나씩 따라 하고, 캡처와 느낀 점을 제출하는 소규모 챌린지용 웹앱입니다.
로그인 없이 명단에서 이름을 골라 제출하고, 제출 후 나의 진행 현황과 이력을 확인할 수 있습니다.

**백엔드가 필요 없는 정적 사이트입니다.** 미션·명단 데이터는 빌드에 그대로 번들되고,
제출한 캡처·느낀 점은 각자의 브라우저(IndexedDB)에만 저장됩니다. 환경변수나 서버 설정
없이 `npm run build` 결과물을 그대로 아무 정적 호스팅에 올리면 됩니다.

## 기술 스택

- Vite + React 18 + TypeScript(strict) + Tailwind CSS
- Vitest
- (선택) Firebase — 기본값은 꺼져 있음. 아래 "선택: Firebase로 전환하기" 참고

## 로컬 실행

```bash
npm install
npm run dev
```

## 빌드 및 Netlify 배포

```bash
npm run build   # dist/ 생성
```

리포에 포함된 `netlify.toml`이 빌드 명령(`npm run build`)과 배포 폴더(`dist`)를 지정합니다.
Netlify에서 이 저장소를 "New site from Git"으로 연결하면 별도 설정 없이 바로 배포됩니다.
환경변수도 필요 없습니다.

다른 정적 호스팅(Vercel, GitHub Pages, Cloudflare Pages 등)도 동일하게 `npm run build`의
`dist/` 폴더만 올리면 됩니다.

## 데이터 모델

- `data/challenge.json` — 챌린지 제목·소개·기간
- `data/missions.json` — 미션(회차, 제목, 쪽수, 안내, 공개일)
- `data/participants.json` — 참여자 명단(동명이인은 `suffix`로 구분)

이 세 파일이 곧 사이트의 데이터베이스입니다. 관리자 화면은 없고, JSON을 직접 수정해서
운영합니다.

## 제출 데이터가 저장되는 곳

- 제출(캡처 이미지 + 느낀 점)은 각 참여자의 **브라우저 IndexedDB**에만 저장됩니다.
- 서버로 전송되지 않으므로, **다른 브라우저·다른 기기에서는 그 사람의 제출 이력이 보이지
  않습니다.** 같은 참여자가 PC와 휴대폰을 오가며 제출한다면 각 기기에 따로 남습니다.
- 브라우저의 사이트 데이터(쿠키/사이트 데이터 삭제, 시크릿 모드 종료 등)를 지우면 제출
  이력도 함께 사라집니다.
- 운영진이 전체 참여자의 제출 현황을 한 곳에서 모아 보고 싶다면(예: 엑셀로 취합) 이
  구조로는 불가능합니다 — 그런 용도가 필요해지면 아래 "선택: Firebase로 전환하기"를
  참고해 서버 저장 방식으로 바꿀 수 있습니다.

## 테스트

```bash
npm test
```

`src/lib` 아래 순수 함수(KST 날짜 계산, 오늘의 미션 선택, 진행률 계산, 초성 검색)를 검증합니다.

## 다음 기수 준비하기

1. `data/challenge.json`, `data/missions.json`, `data/participants.json`을 새 기수 내용으로 수정합니다.
   - `participants.json`에 동명이인이 있으면 `suffix`로 구분하세요.
2. `npm run build` 후 다시 배포합니다.

이전 기수 참여자의 브라우저에 남아 있던 제출 이력은 새 기수 데이터와 섞이지 않도록
`.env`(선택)의 `VITE_DEFAULT_CID` 값을 바꾸는 것을 권장합니다(로컬 저장소 구분용 키로만
쓰입니다. `.env.example` 참고).

## 알려진 한계

- **사칭 가능**: 로그인 없이 명단에서 이름을 선택하는 방식이라, 다른 사람의 이름을 선택해
  대신 제출하거나(같은 브라우저를 쓰는 경우) 타인 행세를 하는 것을 막지 않습니다. 서로
  아는 소규모 신뢰 커뮤니티(스터디, 사내 챌린지 등)를 전제로 설계되었습니다.
- **기기 간 동기화 없음**: 위 "제출 데이터가 저장되는 곳" 참고.
- 마감·지각 개념이 없어 지난 미션도 언제든 제출/수정할 수 있습니다.

## 폴더 구조

```
data/               미션·명단·챌린지 원본 JSON (앱이 빌드 시 그대로 번들)
src/lib/            순수 함수(KST 날짜, 미션 선택, 진행률, 초성 검색, 이미지 압축)
                     + imageStore.ts(이미지 저장 추상화), localSubmissions.ts(IndexedDB)
src/data/           빌드에 번들된 JSON을 앱이 쓰는 형태로 가공
src/hooks/          화면에서 쓰는 데이터 훅
src/components/     UI 컴포넌트
src/pages/Home.tsx  전체 화면 조립
src/firebase/       (미사용) Firebase 클라이언트 설정 — 아래 참고
firestore.rules, storage.rules, scripts/seed.ts  (미사용) Firebase 보안 규칙·시드 스크립트
```

## 선택: Firebase로 전환하기

여러 기기·브라우저에서 제출 이력을 공유하거나, 운영진이 전체 제출 현황을 한 곳에서 보고
싶다면 Firebase(Firestore + Storage + 익명 인증) 백엔드로 바꿀 수 있습니다. 필요한 코드는
이미 리포에 있지만(`src/firebase/`, `firestore.rules`, `storage.rules`, `scripts/seed.ts`)
현재는 어디에서도 import되지 않는 상태입니다. 전환하려면:

1. `src/hooks/useChallengeData.ts`, `src/hooks/useSubmissions.ts`를 `src/firebase/firestore.ts`의
   `fetchChallenge`/`fetchMissions`/`fetchParticipants`/`subscribeSubmissions`/`upsertSubmission`을
   쓰도록 되돌립니다.
2. `src/lib/imageStore.ts`의 `imageStore` 싱글턴을 `src/firebase/storage.ts`의
   `FirebaseImageStore`로 바꿉니다.
3. [Firebase 콘솔](https://console.firebase.google.com/)에서 프로젝트를 만들고, Authentication에서
   **익명 로그인**을 켜고, Firestore/Storage를 만든 뒤 `.env.example`을 참고해 `.env`에
   `VITE_FIREBASE_*` 값을 채웁니다.
   - ⚠️ Storage는 무료(Spark) 요금제에서 막혀 있을 수 있습니다. **프로젝트 설정 > 사용량 및
     결제**에서 결제 계정(Blaze 요금제) 연결 여부를 먼저 확인하세요. 이 정도 규모(참여자
     수십 명, 미션당 최대 3장, 2MB 이하)면 무료 한도 안에서 충분합니다.
4. 규칙 배포 및 시드:
   ```bash
   npx firebase login
   npx firebase use --add   # .firebaserc의 default를 본인 프로젝트 ID로 변경
   npx firebase deploy --only firestore:rules,storage:rules
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json FIREBASE_PROJECT_ID=your-project npm run seed
   ```
5. 로컬 에뮬레이터로 먼저 검증하고 싶다면:
   ```bash
   npm run emulators   # 별도 터미널: auth/firestore/storage 에뮬레이터
   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_PROJECT_ID=demo-book-challenge npm run seed
   ```
   `.env`에 `VITE_USE_FIREBASE_EMULATOR=true`를 추가하면 앱이 에뮬레이터에 연결됩니다.

⚠️ **다시 켜는 경우 배포 전 확인**: Vite는 `VITE_*` 환경변수를 **빌드 시점**에 결과물에
박아 넣습니다. 호스팅 대시보드에서 환경변수를 설정/수정한 뒤에는 반드시 새로 빌드(재배포)해야
반영됩니다. 배포 후 화면이 비거나 `auth/invalid-api-key` 같은 에러가 보이면 이 문제입니다.
