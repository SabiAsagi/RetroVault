# RetroVault - 실서비스 MVP

RetroVault는 레트로 게임 콜렉터를 위한 디지털 아카이브 플랫폼입니다.
단순 프로토타입을 넘어 실제 데이터베이스 연동, 인증, 권한, 관리자 기능을 포함하는 MVP로 업그레이드 되었습니다.

## 기술 스택
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Database**: Prisma ORM, SQLite (로컬 MVP용) / PostgreSQL (프로덕션 배포용)
- **Authentication**: NextAuth.js (Email Credentials, OAuth)

## 배포 아키텍처 및 도메인 라우팅 설정
실제 운영 시 Vercel 등 Next.js 호스팅 환경에 배포하며, 도메인 라우팅을 지원합니다.
- `retrovault.kr` (운영)
- `admin.retrovault.kr` (관리자 전용 - `next.config.mjs`의 rewrites 및 middleware 설정 참조)

## 환경 변수 설정
최초 프로젝트 설정 시 `.env.example` 파일을 복사하여 `.env` 파일을 생성하세요.
```bash
cp .env.example .env
```
필수 환경 변수:
- `DATABASE_URL`: Prisma 데이터베이스 연결 (예: `file:./dev.db`)
- `NEXTAUTH_URL`: 로컬의 경우 `http://localhost:3000`
- `NEXTAUTH_SECRET`: 무작위 문자열 (예: `openssl rand -base64 32`)

## 실행 방법

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **데이터베이스 마이그레이션 (SQLite)**
   ```bash
   npx prisma db push
   ```

3. **초기 관리자 계정 및 더미 데이터 시딩**
   ```bash
   npx tsx prisma/seed.ts
   ```
   이 명령은 플랫폼, 샘플 게임 데이터, 그리고 다음 계정을 생성합니다:
   - Admin: `admin@retrovault.kr` / `admin1234`
   - Demo: `demo@retrovault.kr` / `demo1234`

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

## 핵심 기능 (MVP)
- **인증 시스템**: 회원가입 및 이메일 로그인, Middleware 기반의 페이지 보호
- **컬렉션 관리**: 유저별 소장 게임(컬렉션) 추가/수정, 상태 관리
- **마스터 데이터**: 관리자(Admin) 전용 페이지 제공 및 데이터베이스 관리
- **App Router 전환**: React SPA에서 Next.js App Router 구조로 마이그레이션

## 추후 개발 과제
- RAWG / IGDB 외부 API 연동하여 마스터 데이터 자동 수집
- Supabase Storage 연동하여 유저 게임 표지 이미지 업로드 기능
- 바코드 스캔 기능을 통한 컬렉션 자동 인식 기능
