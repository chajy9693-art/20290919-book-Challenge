# 구글 워크스페이스 실습 챌린지

책 속 실습을 하나씩 따라 하고, 캡처와 느낀 점을 제출하는 소규모 챌린지용 웹앱입니다.
로그인 없이 명단에서 이름을 골라 제출하고, 제출 후 나의 진행 현황과 이력을 확인할 수 있습니다.

## 기술 스택

- Vite + React 18 + TypeScript(strict) + Tailwind CSS
- Firebase 10 (Firestore, Authentication 익명 로그인, Storage)
- Vitest

## 로컬 실행

```bash
npm install
cp .env.example .env   # 아래 "Firebase 설정" 참고해서 값 채우기
npm run dev
```

## Firebase 설정

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 프로젝트를 만듭니다.
2. **Authentication** > 로그인 방법에서 **익명** 로그인을 사용 설정합니다.
3. **Firestore Database**를 만듭니다(프로덕션 모드, 원하는 리전 선택).
4. **Storage**를 만듭니다.
   - ⚠️ Storage는 무료(Spark) 요금제에서 막혀 있을 수 있습니다. 콘솔에서 "시작하기"를
     눌렀을 때 결제 계정(Blaze 요금제) 연결을 요구하면, **프로젝트 설정 > 사용량 및 결제**
     에서 결제 계정이 연결되어 있는지 먼저 확인하세요. 소규모 스터디 규모(참여자 수십 명,
     미션당 최대 3장, 2MB 이하)라면 무료 한도 내에서 충분히 운영할 수 있습니다.
5. **프로젝트 설정 > 일반 > 내 앱**에서 웹 앱을 추가하고 나오는 설정 값을 `.env`에 채웁니다.

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

6. 보안 규칙과 인덱스를 배포합니다.

```bash
npx firebase login
npx firebase use --add   # .firebaserc의 default를 본인 프로젝트 ID로 변경
npx firebase deploy --only firestore:rules,storage:rules
```

## 데이터 시드

미션·명단 원본은 `data/challenge.json`, `data/missions.json`, `data/participants.json`에 있고,
`scripts/seed.ts`가 이 JSON을 Firestore에 반영합니다. **콘솔/시드 스크립트로만 데이터를 쓸 수
있고, 앱 자체에는 관리자 화면이 없습니다.**

실제 프로젝트에 시드하기:

```bash
# 서비스 계정 키(JSON)를 발급받아 경로를 지정합니다.
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
export FIREBASE_PROJECT_ID=your-firebase-project-id
npm run seed
```

## 로컬 에뮬레이터로 실행

Firebase 프로젝트 없이도 로컬에서 전체 기능을 테스트할 수 있습니다.

```bash
npm run emulators   # 별도 터미널에서: auth/firestore/storage 에뮬레이터 실행
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_PROJECT_ID=demo-book-challenge npm run seed
```

`.env`에서 `VITE_USE_FIREBASE_EMULATOR=true`로 설정하면 앱이 에뮬레이터에 연결됩니다.
에뮬레이터 UI는 http://127.0.0.1:4000 에서 확인할 수 있습니다.

## 빌드 및 배포

```bash
npm run build
npx firebase deploy --only hosting
```

⚠️ **`.env`는 `npm run build`를 실행하기 전에 채워져 있어야 합니다.** Vite는 `VITE_*`
환경변수를 빌드 시점에 결과물(JS 파일)에 그대로 박아 넣습니다. 나중에 호스팅
대시보드에서 환경변수를 설정하거나 `.env`를 수정해도, **다시 빌드하지 않으면 반영되지
않습니다.** 배포된 링크를 열었을 때 다크 네이비 배경만 보이고 아무 내용도 안 뜨면
(브라우저 개발자 도구 콘솔에 `auth/invalid-api-key` 같은 에러가 보인다면) 거의 항상
이 문제입니다 — `.env`를 채운 뒤 `npm run build`를 다시 실행하고 재배포하세요.

## 테스트

```bash
npm test
```

`src/lib` 아래 순수 함수(KST 날짜 계산, 오늘의 미션 선택, 진행률 계산, 초성 검색)를 검증합니다.

## 다음 기수 준비하기

1. `data/challenge.json`, `data/missions.json`, `data/participants.json`을 새 기수 내용으로 수정합니다.
   - `participants.json`에 동명이인이 있으면 `suffix`로 구분하세요.
2. 새 기수를 구분할 `cid`를 정합니다(예: `season-2`).
3. 아래처럼 해당 `cid`로 시드를 실행합니다.

```bash
SEED_CID=season-2 GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json FIREBASE_PROJECT_ID=your-project npm run seed
```

4. 참여자는 URL에 `?c=season-2`를 붙여 접속하거나, `.env`의 `VITE_DEFAULT_CID`를
   `season-2`로 바꿔 배포하면 됩니다. 이전 기수 데이터는 그대로 남아 있습니다.

## 알려진 한계

- **사칭 가능**: 로그인 없이 명단에서 이름을 선택하는 방식이라, 다른 사람의 이름을 선택해
  대신 제출하거나 타인의 제출 이력을 열람하는 것을 막지 않습니다. 서로 아는 소규모 신뢰
  커뮤니티(스터디, 사내 챌린지 등)를 전제로 설계되었습니다.
- 마감·지각 개념이 없어 지난 미션도 언제든 제출/수정할 수 있습니다.

## 폴더 구조

```
data/            미션·명단·챌린지 원본 JSON (시드 소스)
scripts/seed.ts  data/*.json을 Firestore에 반영하는 스크립트
src/lib/         순수 함수(KST 날짜, 미션 선택, 진행률, 초성 검색, 이미지 압축/저장 인터페이스)
src/firebase/    Firebase 클라이언트 설정, 인증, Firestore/Storage 헬퍼
src/hooks/       화면에서 쓰는 데이터 훅(챌린지 데이터, 제출 이력, 참여자 선택)
src/components/  UI 컴포넌트
src/pages/Home.tsx  전체 화면 조립
firestore.rules, storage.rules  보안 규칙
```
