# 환경변수 설정 가이드

잔소리 AI 서비스를 실행하기 위해 필요한 환경변수들을 설정하는 방법입니다.

---

## 1. DATABASE_URL (Neon Postgres)

> Neon에서 무료 PostgreSQL 데이터베이스 생성

### 설정 방법

1. [Neon Console](https://console.neon.tech) 접속
2. **Sign Up** (GitHub 계정 추천)
3. **Create a project** 클릭
   - Project name: `jansori-ai`
   - Region: `Asia Pacific (Singapore)` 선택 (한국에서 가장 빠름)
4. 생성 완료 후 **Dashboard**에서 Connection string 복사

### 형식
```
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
```

### 예시
```
DATABASE_URL="postgresql://your-user:your-password@ep-xxxxx-xxxxx-123456.ap-southeast-1.aws.neon.tech/your-database?sslmode=require"
```

---

## 2. NEXTAUTH_URL

> 앱이 실행되는 URL

### 설정 방법
- **로컬 개발**: `http://localhost:3000`
- **Vercel 배포**: `https://your-app.vercel.app`

```
NEXTAUTH_URL="http://localhost:3000"
```

---

## 3. NEXTAUTH_SECRET

> 세션 암호화용 비밀 키

### 설정 방법

터미널에서 실행:
```bash
openssl rand -base64 32
```

### 예시
```
NEXTAUTH_SECRET="K7xJ3mN9pQ2rS5tU8vW1yZ4bC6dE0fG3hI6jL9mN2oP5"
```

---

## 4. GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET

> Google OAuth 로그인용 인증 정보

### 설정 방법

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 왼쪽 메뉴 → **APIs & Services** → **OAuth consent screen**
   - User Type: **External** 선택
   - App name: `잔소리 AI`
   - User support email: 본인 이메일
   - Developer contact: 본인 이메일
   - **Save and Continue** (나머지는 기본값)
4. 왼쪽 메뉴 → **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Jansori AI Web`
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
   - **Authorized redirect URIs**: 
     - `http://localhost:3000/api/auth/callback/google`
5. **Create** 클릭 후 Client ID와 Client Secret 복사

### 예시
```
GOOGLE_CLIENT_ID="123456789-abcdefghijk.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz"
```

> ⚠️ Vercel 배포 시 redirect URI에 `https://your-app.vercel.app/api/auth/callback/google` 추가 필요

---

## 5. GROQ_API_KEY

> AI 잔소리 생성용 Groq API 키

### 설정 방법

1. [Groq Console](https://console.groq.com) 접속
2. Google 또는 GitHub으로 회원가입
3. 왼쪽 메뉴 → **API Keys**
4. **Create API Key** 클릭
   - Name: `jansori-ai`
5. 생성된 키 복사 (한 번만 표시됨!)

### 예시
```
GROQ_API_KEY="gsk_ABCDefghIJKLmnopQRSTuvwxYZ1234567890abcdefgh"
```

### 무료 제한
- 14,400 requests/day
- Rate limit: 30 req/min

---

## 6. VAPID Keys (웹 푸시)

> 웹 푸시 알림 서버 인증용 키 쌍

### 설정 방법

터미널에서 실행:
```bash
npx web-push generate-vapid-keys
```

### 출력 예시
```
=======================================

Public Key:
BEl62iUYgUiv...긴문자열...xQR

Private Key:
_8zNYs5w...긴문자열...3mA

=======================================
```

### 환경변수 설정
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BEl62iUYgUiv...긴문자열...xQR"
VAPID_PRIVATE_KEY="_8zNYs5w...긴문자열...3mA"
VAPID_SUBJECT="mailto:your-email@example.com"
```

> `VAPID_SUBJECT`는 본인 이메일 주소 (문제 발생 시 연락처)

---

## 최종 .env 파일 예시

```env
# Database (Neon Postgres)
DATABASE_URL="postgresql://your-user:your-password@your-host.neon.tech/your-database?sslmode=require"

# Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Groq AI
GROQ_API_KEY="gsk_your-api-key"

# Web Push VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key"
VAPID_PRIVATE_KEY="your-private-key"
VAPID_SUBJECT="mailto:your-email@example.com"
```

---

## 설정 완료 후

```bash
# 1. DB 스키마 적용
npx prisma db push

# 2. 개발 서버 실행
npm run dev
```

http://localhost:3000 접속하여 Google 로그인 테스트
