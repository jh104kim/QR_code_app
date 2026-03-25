# QR 코드 생성기

Supabase 인증 기반의 QR 코드 생성 웹 애플리케이션입니다. Next.js App Router와 shadcn/ui(Twitter 테마)로 구현되었으며, Vercel 배포를 목표로 합니다.

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS v4 |
| UI 컴포넌트 | [shadcn/ui](https://ui.shadcn.com) — Twitter 테마 (tweakcn) |
| 인증 / DB | [Supabase](https://supabase.com) |
| QR 생성 | [qrcode](https://www.npmjs.com/package/qrcode) |
| 알림 | [Sonner](https://sonner.emilkowal.ski/) |

---

## 📁 프로젝트 구조

```
src/
├── proxy.ts                      # 라우트 보호 (Next.js 16 Proxy)
├── lib/
│   └── supabase/
│       ├── client.ts             # 브라우저용 Supabase 클라이언트
│       └── server.ts             # 서버용 Supabase 클라이언트
└── app/
    ├── layout.tsx                # 루트 레이아웃 (Toaster 포함)
    ├── page.tsx                  # / → /auth/login 리디렉션
    ├── actions/
    │   └── auth.ts               # 서버 액션 (login / register / logout)
    ├── auth/
    │   ├── login/page.tsx        # 로그인 페이지
    │   ├── register/page.tsx     # 회원가입 페이지
    │   └── callback/route.ts     # 이메일 인증 콜백 처리
    └── dashboard/
        └── page.tsx              # QR 코드 생성 대시보드 (인증 필요)
```

---

## ✨ 주요 기능

- **회원가입 / 로그인 / 로그아웃** — Supabase Auth (이메일 + 비밀번호)
- **이메일 인증** — 가입 시 인증 메일 발송, 콜백 자동 처리
- **라우트 보호** — 미인증 시 `/dashboard` 접근 불가, 로그인 사용자는 auth 페이지 접근 불가
- **QR 코드 생성** — URL 또는 텍스트 입력 → 즉시 QR 생성
- **QR 커스터마이징** — 크기(128~512px), 전경색, 배경색 조정
- **PNG 다운로드** — 생성된 QR 코드 이미지 저장

---

## 🚀 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example`을 복사해 `.env.local`을 생성하고 Supabase 키를 입력합니다:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> ⚠️ `SERVICE_ROLE_KEY`는 절대 클라이언트 코드에 노출하지 마세요. 서버 전용으로만 사용합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 `/auth/login`으로 리디렉션됩니다.

---

## 🔐 Supabase 설정

1. [Supabase 대시보드](https://supabase.com/dashboard) → 프로젝트 선택
2. **Authentication > Providers** → Email 활성화
3. **Authentication > URL Configuration** 설정:
   - Site URL: `http://localhost:3000` (개발) / `https://your-app.vercel.app` (운영)
   - Redirect URLs에 `http://localhost:3000/auth/callback` 추가

---

## 📦 Vercel 배포

1. [Vercel](https://vercel.com)에서 이 저장소를 import
2. **Environment Variables**에 아래 세 키 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`
3. Supabase 대시보드 URL Configuration에 Vercel 배포 URL 등록
4. Deploy!

> 참고: 이 프로젝트는 NextAuth를 사용하지 않으므로 `NEXTAUTH_URL`, `NEXTAUTH_SECRET`는 필요하지 않습니다.

---

## 💡 확장 아이디어

### 기능 확장
- **QR 히스토리 저장** — 생성한 QR 코드를 Supabase DB에 저장하고, 사용자별 목록 조회
- **QR 로고 삽입** — 중앙에 브랜드 로고 이미지를 오버레이하는 기능
- **SVG 다운로드** — PNG 외 벡터 포맷(SVG) 내보내기 지원
- **QR 스캔 통계** — 단축 URL 기반으로 스캔 횟수, 지역, 시간대 분석
- **일괄 생성** — CSV 파일 업로드로 여러 QR 코드를 한 번에 생성 후 ZIP 다운로드
- **QR 템플릿** — 자주 쓰는 설정을 템플릿으로 저장 및 재사용
- **WiFi / vCard QR** — URL 외 WiFi 접속 정보, 연락처(vCard), 이메일 등 다양한 QR 타입 지원

### 인증 확장
- **소셜 로그인** — Google, GitHub, Kakao OAuth 연동
- **OTP 로그인** — 이메일 또는 SMS 인증코드 로그인
- **팀 / 조직 기능** — 조직 단위로 QR 코드 공유 및 관리

### UX / 성능
- **다크모드** — `next-themes`를 활용한 라이트/다크 테마 전환
- **모바일 앱** — Capacitor 또는 React Native로 모바일 앱 변환
- **PWA** — 오프라인 지원 및 홈 화면 설치 가능한 PWA 설정
- **다국어 지원** — `next-intl`로 한국어/영어 등 다국어 처리

### 비즈니스 확장
- **요금제 / 사용량 제한** — Supabase RLS와 연동한 무료/유료 플랜 구분
- **API 제공** — 외부 서비스에서 QR 코드를 생성할 수 있는 REST API 엔드포인트
- **화이트라벨** — 커스텀 도메인 및 브랜딩으로 SaaS 형태 제공
