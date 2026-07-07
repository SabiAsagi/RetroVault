# 🎮 RetroVault (레트로볼트)

**RetroVault**는 비디오 게임의 황금기를 장식했던 클래식 게임, 콘솔(플랫폼), 그리고 제작사들의 역사적인 정보와 개인의 게임 컬렉션을 기록하고 관리할 수 있는 **Next.js 기반의 종합 레트로 게임 아카이브 플랫폼**입니다.

## 🔗 링크

* **서비스:** https://retrovault.kro.kr
* **GitHub:** https://github.com/SabiAsagi/RetroVault
* **개선 계획:** [docs/improvement-plan.md](docs/improvement-plan.md)
* **데이터 정비 기준:** [docs/data-guidelines.md](docs/data-guidelines.md)
* **디자인 시스템 초안:** [docs/design-system-draft.md](docs/design-system-draft.md)

## ✨ 주요 기능 (Key Features)

* **🕹️ 방대한 게임 아카이브 (Game Archive)**
  * 연도별, 장르별, 기종별 레트로 게임 데이터베이스 제공
  * 사용자 기반의 게임 데이터 요청 및 승인 시스템 (관리자 검수)
* **📺 플랫폼 & 제작사 아카이브 (Platforms & Companies)**
  * 가정용/휴대용 콘솔 기기들의 세대별 역사와 스펙 정보
  * 시대를 풍미한 전설적인 게임 제작사들의 상세 정보
* **📚 나만의 컬렉션 & 그룹 컬렉션 (User Collections)**
  * 내가 보유하거나 플레이한 게임들을 나만의 컬렉션에 등록하고 관리
  * 테마별 그룹 컬렉션을 생성하여 다른 유저들과 공유
  * 유저 간 컬렉션 조회수 및 '좋아요(❤️)' 시스템 도입 (계정당 1회)
* **⏱️ 비디오 게임 타임라인 (Timeline)**
  * 비디오 게임 역사에 획을 그은 중요 사건들을 연도별 타임라인으로 탐색
* **🛡️ 커뮤니티 & 소셜 기능**
  * 유저 프로필 및 상태 메시지 설정 (프로필 이미지 지원)
  * 다이렉트 메시지(DM), 친구 추가, 신고 기능, 알림 시스템
* **⚙️ 관리자 대시보드 (Admin Dashboard)**
  * 유저들이 요청한 신규 게임/플랫폼 승인 및 반려
  * 신고된 유저 관리 및 악성 유저 차단(Ban) 기능

## 🛠️ 기술 스택 (Tech Stack)

* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (Custom Vault Theme)
* **Icons:** Lucide React
* **Database & ORM:** PostgreSQL (Neon) & Prisma ORM
* **Storage:** Vercel Blob (유저 프로필, 게임 커버 등 이미지 업로드)
* **Authentication:** NextAuth.js (이메일 및 비밀번호 기반 인증)

## 🚀 배포 (Deployment)

이 프로젝트는 **Vercel** 환경에 최적화되어 있습니다.

* **Frontend Hosting:** Vercel
* **Database:** Vercel Postgres (Neon DB)
* **Image Hosting:** Vercel Blob

## 💻 로컬 개발 환경 세팅 (Getting Started)

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경 변수 설정 (`.env`)
루트 디렉토리에 `.env` 파일을 생성하고 다음 필수 값들을 입력합니다. (Neon DB 및 Vercel Blob 정보 필요)

```env
# Database (Neon / Vercel Postgres)
POSTGRES_PRISMA_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require"
POSTGRES_URL_NON_POOLING="postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require"

# Vercel Blob (Image Storage)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000" # 운영 시 실제 도메인으로 변경
NEXTAUTH_SECRET="your-super-secret-key"

# (선택) 초기 관리자 계정 생성용
ADMIN_INITIAL_EMAIL="admin@retrovault.kr"
ADMIN_INITIAL_PASSWORD="your-admin-password"
```

### 3. 데이터베이스 스키마 적용 및 초기 데이터 세팅(Seed)
아래 명령어를 통해 테이블을 생성하고, `src/data-extended.ts`에 정의된 기본 카탈로그 데이터(게임, 콘솔, 회사 등)를 DB에 밀어 넣습니다.

```bash
npm run db:setup
```
*(이미 스키마가 존재하고 데이터만 덮어씌우려면 `npm run db:seed`를 사용하세요.)*

### 4. 로컬 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.

## 📝 데이터 요청 및 관리 프로세스
1. 일반 유저가 아카이브에 없는 새로운 게임이나 콘솔 기기 추가를 요청합니다.
2. 해당 요청은 관리자(Admin) 대시보드로 전달됩니다.
3. 관리자가 내용을 검토한 후 승인하면 정식 아카이브에 등록되며, 반려할 경우 사유와 함께 유저에게 알림이 전송됩니다.

## 🧭 개선 로드맵

1. README 및 타입 정의 정리
2. 통합 검색 결과 확장
3. 모바일 하단 탭 네비게이션 추가
4. 데이터 정비 기준 및 출처 관리 강화
5. Figma 기반 UI/UX 리디자인과 모바일 앱 프로토타입 제작

---
*RetroVault - 게임의 역사는 계속됩니다.*
