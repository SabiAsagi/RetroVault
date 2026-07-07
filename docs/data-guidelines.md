# RetroVault 데이터 정비 기준

이 문서는 RetroVault에 게임, 플랫폼, 회사 데이터를 추가하거나 수정할 때 사용하는 기준이다. 데이터의 목적은 단순 목록 확장이 아니라, 사용자가 게임 역사를 신뢰하고 탐색할 수 있는 아카이브를 만드는 것이다.

## 공통 원칙

- 공식 명칭을 우선 사용하고, 지역별 명칭은 별도 필드나 설명에 기록한다.
- 연도만 확실한 경우 `releaseYear`를 우선 입력하고, 정확한 날짜가 확인된 경우 `releaseDate`를 함께 입력한다.
- 설명문은 복사 붙여넣기보다 직접 요약해 작성한다.
- 이미지, 로고, 스크린샷은 출처와 사용 가능 여부를 확인한다.
- 불확실한 정보는 임의로 채우지 않고 `불명`, 빈 값, 또는 관리자 검토 상태로 남긴다.
- 한국어 번역은 원문 의미를 유지하되, UI에서 읽기 쉬운 표현으로 다듬는다.

## 게임 데이터 기준

### 필수 항목

- `title`: 대표 게임명
- `releaseYear`: 최초 또는 기준 지역 출시 연도
- `genre`: 대표 장르
- `platformId`: 연결 플랫폼
- `status`: 관리자 승인 상태

### 권장 항목

- `releaseDate`: YYYY-MM-DD 형식의 출시일
- `originalTitle`: 원제 또는 일본어/영문 원제
- `developerId`: 개발사
- `publisherId`: 배급사
- `country`: 기준 출시 국가 또는 지역
- `coverImageUrl`: 커버 이미지
- `shortDescription`: 카드/목록용 짧은 설명
- `description`: 상세 설명
- `historicalContext`: 게임사적 의의
- `referenceUrl`: 근거 자료 링크

### 점검 체크리스트

- 같은 제목, 같은 플랫폼, 같은 출시연도 데이터가 중복되지 않는가?
- 장르명이 기존 장르 표기와 일관되는가?
- 커버 이미지가 깨지지 않고 세로형 카드에 어울리는가?
- 개발사/배급사가 회사 아카이브 데이터와 연결되는가?

## 플랫폼 데이터 기준

### 필수 항목

- `name`: 대표 플랫폼명
- `manufacturer`: 제조사
- `releaseYear`: 출시 연도
- `type`: HOME, HANDHELD, HYBRID, ARCADE, PC 등 플랫폼 타입
- `status`: 관리자 승인 상태

### 권장 항목

- `name_ko`: 한국어 표기
- `generation`: 콘솔 세대
- `releaseDate`: 정확한 출시일
- `imageUrl`: 기기 이미지
- `logoUrl`: 로고 이미지
- `launchPrice`: 출시 가격
- `totalSales`: 누적 판매량
- `mediaFormat`: 사용 매체
- `specs_cpu`, `specs_gpu`, `specs_memory`: 주요 사양
- `description`: 플랫폼 설명
- `innovationPoint`: 기술적/역사적 특징

### 점검 체크리스트

- 같은 플랫폼의 지역명과 모델명이 혼동되지 않는가?
- 세대 구분이 기존 플랫폼 데이터와 일치하는가?
- 단종 여부와 현재 생산 상태가 실제 정보와 맞는가?
- 대표 이미지가 제품을 명확하게 보여주는가?

## 회사 데이터 기준

### 필수 항목

- `name`: 대표 회사명
- `type`: DEVELOPER, PUBLISHER, BOTH
- `status`: 관리자 승인 상태

### 권장 항목

- `name_ko`: 한국어 표기
- `country`: 국가
- `foundedAt`: 설립 연도 또는 설립일
- `companyStatus`: ACTIVE, DEFUNCT, ACQUIRED 등 현재 상태
- `logoUrl`: 로고 이미지
- `websiteUrl`: 공식 웹사이트
- `flagshipFranchises`: 대표 프랜차이즈
- `keyFigures`: 주요 인물
- `subsidiaries`: 산하 스튜디오
- `description`: 회사 설명

### 점검 체크리스트

- 회사명 변경, 합병, 인수 이력이 설명에 반영되어 있는가?
- 개발사와 배급사 역할이 구분되어 있는가?
- 대표작 정보가 실제 게임 데이터와 연결될 수 있는가?

## 출처 표기 규칙

- 공식 웹사이트, 매뉴얼, 보도자료, 플랫폼 홀더 자료를 우선한다.
- Wikipedia, 팬덤 위키, IGDB 등은 보조 자료로 사용하고, 서로 다른 자료와 교차 확인한다.
- 이미지 URL은 가능한 공식 또는 라이선스 확인이 가능한 출처를 사용한다.
- 출처가 불명확한 이미지는 포트폴리오 공개용 화면에서 사용하지 않는다.
- 데이터 요청/수정 건의에는 사용자가 참고한 URL을 함께 받는다.

## 승인 전 최종 확인

- 필수 항목이 모두 입력되어 있는가?
- 중복 데이터가 없는가?
- 상세 페이지에서 이미지와 텍스트가 깨지지 않는가?
- 검색, 필터, 정렬 결과에 자연스럽게 포함되는가?
- 관리자 승인/반려 사유를 남길 수 있는가?
