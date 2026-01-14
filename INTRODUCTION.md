# 소개

## 뭘 만들었나요?
**잔소리 AI** - 친한 친구처럼 정해진 시간에 목표 달성을 채찍질해주는 AI 기반 리마인더 서비스입니다.

리마인더 앱들은 맨날 "운동할 시간입니다" 이런 무미건조한 알림만 보내잖아요? 이 서비스는 AI가 직접 사용자의 목표에 맞춰 잔소리를 생성해서, 진짜 친구한테 잔소리 듣는 느낌으로 알림을 보냅니다.

**3단계 강도 조절:**
- 🟢 순한맛 - 부드럽게 응원하는 느낌
- 🟡 중간맛 - 친한 친구처럼 적당히 채찍질
- 🔴 매운맛 - 매우 직설적이고 강하게 압박

---

## 기술 스택

| 분류 | 사용 기술 |
|------|-----------|
| 프레임워크 | Next.js 16 + TypeScript |
| 스타일링 | Tailwind CSS v4 |
| UI 컴포넌트 | shadcn/ui (Radix UI 기반) |
| 인증 | NextAuth 5 + Google OAuth |
| 데이터베이스 | PostgreSQL (Neon) + Prisma 7 |
| LLM | Groq API (Llama 3.3 70B) |
| 푸시 알림 | Web Push API (VAPID) |
| 스케줄링 | GitHub Actions Cron |

---

## 정각 알림은 어떻게 구현했나요?

### 1단계: GitHub Actions가 매 시간 정각에 서버 호출
```yaml
# .github/workflows/send-jansori.yml
schedule:
  - cron: '0 * * * *'  # 매 시간 0분 (UTC)
```
GitHub Actions가 매 시간 정각에 `/api/push/send-jansori` 엔드포인트를 호출합니다.

### 2단계: 사용자 시간대 계산
```
서버는 UTC 기준 → 사용자는 Asia/Seoul 기준
Intl.DateTimeFormat으로 사용자별 현재 시간 계산
```
예: UTC 00시에 호출되면 → 한국 사용자는 09시로 계산

### 3단계: 알림 시간 균등 분배
```
사용자 설정: 오전 9시 ~ 오후 9시, 하루 3번
→ [9시, 15시, 21시] 에 알림

자정 넘어가는 경우도 처리:
설정: 밤 10시 ~ 새벽 2시, 3번
→ [22시, 0시, 2시] 로 계산
```

### 4단계: AI가 잔소리 생성 후 푸시 전송
현재 시간이 알림 시간 목록에 포함되면:
1. Groq LLM이 목표에 맞는 잔소리 생성
2. Web Push API로 사용자 기기에 푸시 전송

---

## 푸시 알림은 어떻게 구현했나요?

### VAPID 기반 Web Push

```
브라우저 ──(구독)──→ 서버에 endpoint, 키 저장
                         ↓
GitHub Actions ──(트리거)──→ 서버
                         ↓
서버 ──(web-push 라이브러리)──→ 푸시 서버 ──→ 브라우저
```

**핵심 파일:**
- `public/sw.js` - Service Worker가 푸시 수신 및 알림 표시
- `src/lib/push.ts` - web-push 라이브러리로 VAPID 서명 후 전송
- `src/components/push/push-permission-button.tsx` - 권한 요청 및 구독 관리

### Service Worker 역할
```javascript
// 푸시 수신 시
self.addEventListener('push', (event) => {
  // 브라우저 알림으로 표시
  self.registration.showNotification(title, { body, vibrate: [100, 50, 100] })
})

// 알림 클릭 시
self.addEventListener('notificationclick', (event) => {
  // 앱으로 포커스 또는 새 탭 열기
})
```

---

## 📋 실제 잔소리 예시

**목표:** "매일 30분 운동하기"

| 강도 | 잔소리 예시 |
|------|------------|
| 순한맛 | "오늘도 30분 운동 화이팅이야, 넌 할 수 있어!" |
| 중간맛 | "야, 운동 안 하면 또 내일로 미룰 거잖아. 당장 일어나." |
| 매운맛 | "30분도 못 빼? 핸드폰 붙잡고 있을 시간에 스쿼트나 해." |

---

## 전체 흐름 요약

```
1. 사용자가 목표 등록 (강도, 빈도, 시간대 설정)
              ↓
2. 브라우저에서 푸시 알림 구독 (VAPID 키 저장)
              ↓
3. 매 시간 정각 GitHub Actions 트리거
              ↓
4. 서버에서 "지금 알림 보낼 사용자" 필터링
              ↓
5. Groq LLM으로 맞춤 잔소리 생성
              ↓
6. Web Push로 알림 전송
              ↓
7. 사용자 핸드폰에 "친구의 잔소리" 도착 📱
```
