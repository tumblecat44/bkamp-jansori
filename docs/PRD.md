# 잔소리 AI - PRD (Product Requirements Document)

## 📌 프로젝트 개요

**한 줄 요약**: 친한 친구/가족처럼 주기적으로 잔소리를 보내주는 AI 서비스

사용자가 목표나 하고 있는 일을 입력하면, AI가 주기적으로 잔소리 메시지를 웹 푸시 알림으로 보내준다.

---

## 🛠 기술 스택

> **💰 목표: 100% 무료 스택으로 개발 및 운영**
>
> 모든 기술 스택과 배포 인프라를 Vercel 생태계 내 무료 플랜으로 구성하여, 비용 0원으로 서비스 운영을 목표로 한다.

| 구분 | 기술 | 비용 |
|------|------|------|
| 프레임워크 | Next.js | 무료 |
| 스타일링 | Tailwind CSS | 무료 |
| UI 컴포넌트 | shadcn/ui | 무료 |
| 알림 | Web Push API + web-push | 무료 |
| AI | **Groq API** (Llama 4) | 무료 (14,400 req/day) |
| DB | **Neon Postgres** (Vercel Marketplace) | 무료 (0.5GB) |
| 인증 | **Auth.js** + Google OAuth | 무료 |
| 크론 | **Vercel Cron Jobs** | 무료 |
| 배포 | **Vercel Hobby Plan** | 무료 |

### Vercel Hobby 플랜 제한 (참고)
| 항목 | 무료 범위 |
|------|-----------|
| Serverless 함수 | 100GB-hours, 10초 타임아웃 |
| Bandwidth | 100GB/월 |
| Neon Postgres | 0.5GB 스토리지 |
| Cron Jobs | Serverless 시간에서 차감 |

---

## 🎯 핵심 기능 (MVP)

### 1. 목표 등록
- 사용자가 목표/하고 있는 일 입력
- 예: "다이어트", "토익 900점", "이직 준비"

### 2. 잔소리 설정
- 하루에 몇 번 받을지 설정
- 시간대 설정 (예: 오전 9시 ~ 오후 10시)
- 방해금지 시간 설정

### 3. 웹 푸시 알림
- 설정된 주기에 따라 잔소리 푸시 알림 전송
- 브라우저 푸시 알림 권한 요청

### 4. 잔소리 생성 (AI)
- 목표에 맞는 잔소리 메시지 생성
- 톤: 직설적, 반복적, 걱정 기반, 약간의 압박

### 5. 잔소리 강도 조절
- 사용자가 잔소리 강도 선택 가능
- **레벨 1 (순한맛)**: 부드러운 리마인더 스타일
  - "오늘 운동 계획 있어? 화이팅!"
- **레벨 2 (중간맛)**: 기본 잔소리
  - "야 오늘 운동 했어? 안 했으면 지금이라도 해"
- **레벨 3 (매운맛)**: 강한 압박
  - "또 운동 빼먹었어? 진짜 맨날 내일부터라며"

### 6. 로그인/인증
- Auth.js 기반 소셜 로그인
- **Google 로그인**

---

## 💬 잔소리 톤 & 스타일

### 특징
- **직설적** - 돌려 말하지 않음
- **반복적** - 같은 주제로 계속 찔러줌
- **걱정 기반** - 결국 잘 되라고 하는 말
- **약간의 압박** - 편하게 놔두지 않음

### 예시

**다이어트**
```
"야 오늘 운동 했어? 안 했으면 지금이라도 해"
"어제 치킨 먹었다며? 오늘은 좀 참아봐"
"체중 쟀어? 현실 직시해야 달라지지"
"헬스장 등록만 하고 안 가면 뭐하냐"
```

**토익 900점**
```
"오늘 단어 몇 개 외웠어?"
"유튜브 볼 시간에 LC 한 세트 풀어"
"시험 D-30인데 아직도 그 점수야?"
"모르는 문제 그냥 넘기지 말고 정리해"
```

**이직 준비**
```
"오늘 지원서 몇 개 넣었어?"
"포트폴리오 업데이트는 했고?"
"링크드인 프로필 아직도 그대로야?"
```

---

## 📱 화면 구성 (예상)

### 1. 메인 페이지
- 현재 등록된 목표 리스트
- 목표 추가 버튼
- 각 목표별 잔소리 설정 현황

### 2. 목표 등록/수정 페이지
- 목표 입력
- 잔소리 주기 설정
- 시간대 설정

### 3. 설정 페이지
- 푸시 알림 권한 관리
- 전체 방해금지 시간

---

## 🔧 기술 구현 상세

### 웹 푸시 알림 구현

#### 필요 요소
| 요소 | 설명 |
|------|------|
| Service Worker | 백그라운드에서 푸시 수신 담당 |
| VAPID Keys | 서버 인증용 공개/비공개 키 쌍 |
| web-push | 서버에서 푸시 전송하는 라이브러리 |

#### 동작 흐름
```
1. 사용자가 알림 권한 허용
2. 브라우저가 구독 정보(endpoint, keys) 생성
3. 구독 정보를 서버(DB)에 저장
4. 잔소리 시간이 되면 서버에서 web-push로 전송
5. Service Worker가 알림 표시
```

#### 핵심 코드 예시

**VAPID 키 생성**
```bash
npx web-push generate-vapid-keys
```

**브라우저 - 푸시 구독**
```js
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: VAPID_PUBLIC_KEY
});
// subscription을 서버로 전송 → DB 저장
```

**서버 - 푸시 전송**
```js
import webpush from 'web-push';

webpush.sendNotification(subscription, JSON.stringify({
  title: "잔소리 도착",
  body: "야 오늘 운동 했어?"
}));
```

#### 브라우저 지원
- Chrome, Firefox, Edge, Safari 지원
- **iOS 16.4+** PWA 모드에서 지원 (홈 화면 추가 필요)

#### 주의사항
- Service Worker는 **HTTPS**에서만 동작 (localhost 예외)
- 사용자가 알림 권한 거부하면 재요청 불가 → UX 고려 필요

---

### 주기적 잔소리 전송 방식

#### 옵션 비교
| 방식 | 장점 | 단점 |
|------|------|------|
| **Vercel Cron Jobs** | 설정 간단, 무료 | 최소 1분 간격 |
| External Cron (예: cron-job.org) | 세밀한 스케줄링 | 외부 의존성 |
| DB 기반 스케줄러 | 유연함 | 구현 복잡 |

#### 추천: Vercel Cron Jobs
```js
// vercel.json
{
  "crons": [{
    "path": "/api/send-jansori",
    "schedule": "0 * * * *"  // 매 시간 정각
  }]
}
```

매 시간마다 API 호출 → 해당 시간에 잔소리 받아야 할 사용자 조회 → 푸시 전송

---

## 🗄 DB 스키마

### ERD 개요
```
┌─────────────┐       ┌─────────────┐
│   users     │───1:N─│   goals     │
└─────────────┘       └─────────────┘
       │
       │1:N
       ▼
┌──────────────────┐
│ push_subscriptions│
└──────────────────┘
```

### 테이블 상세

#### 1. users (Auth.js 자동 생성)
Auth.js가 자동으로 관리하는 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| name | VARCHAR | 사용자 이름 |
| email | VARCHAR | 이메일 (unique) |
| emailVerified | TIMESTAMP | 이메일 인증 시간 |
| image | VARCHAR | 프로필 이미지 URL |

#### 2. accounts (Auth.js 자동 생성)
OAuth 계정 정보 (Google 등)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| userId | UUID | FK → users.id |
| type | VARCHAR | oauth |
| provider | VARCHAR | google |
| providerAccountId | VARCHAR | 제공자 계정 ID |
| access_token | TEXT | 액세스 토큰 |
| refresh_token | TEXT | 리프레시 토큰 |
| expires_at | INT | 만료 시간 |

#### 3. goals (목표)
사용자가 등록한 목표

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| title | VARCHAR(100) | 목표 이름 ("다이어트", "토익 900점") |
| description | TEXT | 상세 설명 (선택) |
| intensity | INT | 잔소리 강도 (1: 순한맛, 2: 중간맛, 3: 매운맛) |
| frequency | INT | 하루 잔소리 횟수 |
| start_hour | INT | 시작 시간 (0-23) |
| end_hour | INT | 종료 시간 (0-23) |
| is_active | BOOLEAN | 활성화 여부 (default: true) |
| created_at | TIMESTAMP | 생성일 |
| updated_at | TIMESTAMP | 수정일 |

#### 4. push_subscriptions (푸시 구독)
웹 푸시 구독 정보

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| endpoint | TEXT | 푸시 엔드포인트 URL |
| p256dh | TEXT | 암호화 키 |
| auth | TEXT | 인증 키 |
| created_at | TIMESTAMP | 생성일 |

#### 5. jansori_logs (잔소리 기록) - 선택
전송된 잔소리 기록 (분석/디버깅용)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| goal_id | UUID | FK → goals.id |
| message | TEXT | 전송된 잔소리 내용 |
| sent_at | TIMESTAMP | 전송 시간 |

---

### 인덱스

```sql
-- 잔소리 전송 시 조회 최적화
CREATE INDEX idx_goals_user_active ON goals(user_id, is_active);
CREATE INDEX idx_goals_schedule ON goals(is_active, start_hour, end_hour);

-- 푸시 구독 조회
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
```

---

### Prisma 스키마 (예시)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  goals         Goal[]
  pushSubscriptions PushSubscription[]
}

model Goal {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?
  intensity   Int      @default(2)
  frequency   Int      @default(3)
  startHour   Int      @default(9)
  endHour     Int      @default(22)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  logs        JansoriLog[]
}

model PushSubscription {
  id        String   @id @default(cuid())
  userId    String
  endpoint  String
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model JansoriLog {
  id      String   @id @default(cuid())
  goalId  String
  message String
  sentAt  DateTime @default(now())
  goal    Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)
}
```

---

## 🗓 TODO

- [ ] 프로젝트 초기 설정 (Next.js + Tailwind + shadcn)
- [x] DB 선택 및 스키마 설계
- [ ] 웹 푸시 알림 구현
- [ ] AI 잔소리 생성 로직
- [ ] UI 구현

---

## 📝 미결정 사항

- [x] AI API 선택 → **Groq API (Llama 4)**
- [x] DB 선택 → **Neon Postgres (Vercel Marketplace)**
- [x] 인증 → **Auth.js (소셜 로그인)**
- [x] 잔소리 강도 조절 → **3단계 (순한맛/중간맛/매운맛)**
- [x] 소셜 로그인 → **Google**

---

## 📅 업데이트 로그

| 날짜 | 내용 |
|------|------|
| 2025-01-14 | 초기 PRD 작성 |
| 2025-01-14 | 기술 스택 확정 - Groq API, Neon Postgres, Vercel |
| 2025-01-14 | 인증(Auth.js) 추가, 잔소리 강도 3단계 기능 확정 |
| 2025-01-14 | 소셜 로그인 Google로 확정 |
| 2025-01-14 | 웹 푸시 알림 기술 구현 상세 추가 |
| 2025-01-14 | 100% 무료 스택 목표 명시, Vercel 제한 사항 정리 |
| 2025-01-14 | DB 스키마 설계 완료 (5개 테이블, Prisma 스키마 포함) |
