# IGDB 데이터 동기화

RetroVault의 플랫폼, 회사, 게임 아카이브 데이터는 IGDB API에서 가져옵니다. 기존 예시 데이터는 더 이상 Prisma seed에서 생성하지 않습니다.

## 환경 변수

`.env.local`에 다음 값을 설정합니다.

```env
IGDB_CLIENT_ID="Twitch 애플리케이션 Client ID"
IGDB_CLIENT_SECRET="Twitch 애플리케이션 Client Secret"

# 0은 제한 없음입니다. 처음 테스트할 때만 작은 값으로 설정하세요.
IGDB_SYNC_MAX_PLATFORMS="0"
IGDB_SYNC_MAX_COMPANIES="0"
IGDB_SYNC_MAX_GAMES="0"
IGDB_SYNC_MIN_YEAR="1950"
IGDB_SYNC_INCLUDE_ADULT="false"
```

## 최초 전체 교체

```bash
npm run db:push
npm run sync:fresh
```

`sync:fresh`는 기존 플랫폼, 회사, 게임과 연결된 컬렉션 항목, 리뷰, 스크린샷을 삭제한 뒤 다음 순서로 다시 받습니다.

1. 플랫폼
2. 회사
3. 게임

사용자 계정과 로그인 정보는 삭제하지 않습니다.

## 이후 갱신

```bash
npm run sync:all
```

기존 레코드는 갱신하고 없는 레코드는 추가합니다. 게임은 IGDB의 플랫폼별 출시일을 기준으로 플랫폼마다 별도 레코드로 저장됩니다.

개별 실행도 가능합니다.

```bash
npm run sync:platforms
npm run sync:companies
npm run sync:games
```

IGDB는 요청당 최대 500개와 초당 4개 요청 제한이 있으므로 전체 게임 동기화는 오래 걸릴 수 있습니다. 테스트할 때는 `IGDB_SYNC_MAX_GAMES`를 작은 값으로 지정하고, 실제 전체 동기화 시 `0`으로 되돌리세요.
