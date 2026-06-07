# RetroVault

RetroVault는 레트로 게임, 플랫폼, 제작사, 유저 컬렉션을 관리하는 Next.js 기반 아카이브 앱입니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- Vercel Postgres / Neon: 기본 데이터와 유저 데이터 저장
- Vercel Blob: 업로드 이미지 저장
- NextAuth: 이메일 로그인 및 OAuth 로그인

## Vercel 배포 구조

RetroVault는 Vercel 배포를 기준으로 구성되어 있습니다.

- 앱 호스팅: Vercel
- 관계형 데이터베이스: Vercel Postgres / Neon
- 이미지 업로드 저장소: Vercel Blob
- 기본 카탈로그 데이터: Prisma seed로 Neon에 저장
- 유저 업로드 이미지: Vercel Blob에 파일 저장 후, 공개 Blob URL을 Neon DB에 저장

## 환경 변수

로컬에서는 `.env.example`을 복사해 `.env`를 만들고, Vercel 프로젝트 설정에도 같은 값을 넣어주세요.

필수:

```bash
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
```

운영 배포에서는 `NEXTAUTH_URL`을 실제 도메인으로 설정합니다.

```bash
NEXTAUTH_URL="https://retrovault.kr"
```

선택:

```bash
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
ADMIN_INITIAL_EMAIL="admin@retrovault.kr"
ADMIN_INITIAL_PASSWORD="change-this-password"
SEED_DEMO_USERS="false"
```

## 로컬 실행

```bash
npm install
npm run db:setup
npm run dev
```

`npm run db:setup`은 스키마 적용과 기본 데이터 입력을 함께 실행합니다.

```bash
npm run db:push
npm run db:seed
```

## Vercel / Neon 초기 설정

1. GitHub 저장소를 Vercel에 연결합니다.
2. Vercel Postgres / Neon 연동을 추가합니다.
3. Vercel Blob 연동을 추가합니다.
4. Vercel 환경 변수에 아래 값이 있는지 확인합니다.
   `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `BLOB_READ_WRITE_TOKEN`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
5. 앱을 배포합니다.
6. 첫 배포 후 Neon DB에 스키마와 기본 데이터를 한 번 넣습니다.

```bash
npm run db:setup
```

이미 스키마가 있고 기본 카탈로그 데이터만 다시 넣고 싶다면 아래 명령만 실행합니다.

```bash
npm run db:seed
```

## Seed 동작

seed 스크립트는 `src/data-extended.ts`에 있는 플랫폼/게임 데이터를 사용합니다.

기본으로 생성되는 데이터:

- 플랫폼
- 제작사
- 게임
- 타임라인 이벤트
- `ADMIN_INITIAL_EMAIL`, `ADMIN_INITIAL_PASSWORD`가 있을 때 관리자 계정

데모 유저는 기본으로 만들지 않습니다. 필요하면 아래처럼 설정합니다.

```bash
SEED_DEMO_USERS="true"
```

## 이미지 업로드

이미지는 아래 API를 통해 업로드됩니다.

```text
/api/upload
```

업로드는 로그인된 사용자만 가능하며, 파일은 Vercel Blob에 저장됩니다. 앱 DB에는 Blob에서 반환한 공개 URL이 저장됩니다.
