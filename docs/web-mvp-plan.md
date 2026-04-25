# Web MVP 계획서

## 문서 목적

이 문서는 [docs/api-plan.md](/Users/tooning/spc/docs/api-plan.md:1)와 현재 구현된 `apps/api`를 기준으로 `apps/web`의 1차 범위를 고정한다.

이 문서의 목적은 다음과 같다.

- 웹 클라이언트의 1차 목표를 좁힌다.
- 어떤 화면을 먼저 만들지 우선순위를 정한다.
- 어떤 API를 어떤 화면에서 소비할지 연결한다.
- 퍼블리싱 방향을 구현 전에 고정한다.

## 1차 목표

웹 1차 MVP의 목표는 아래 흐름을 사람이 검토 가능한 화면으로 닫는 것이다.

- 회계 이벤트 입력
- 입력된 이벤트 조회
- 생성된 전표 조회
- 기준일 시산표 조회

즉, 웹 1차 MVP는 “전체 운영 화면”이 아니라 “회계 엔진이 실제로 작동하는지 검토하는 운영 콘솔”이다.

## 1차 이벤트 타입 범위

이벤트 입력 화면에서 바로 지원할 이벤트 타입은 아래 3개로 제한한다.

- `loan_origination`
- `interest_accrual`
- `principal_repayment`

왜 이 3개인가:

- 대출채권 lifecycle의 핵심 입력만으로 회계 흐름을 검증할 수 있다.
- 실행, 발생, 상환이라는 서로 다른 분개 패턴을 모두 포함한다.
- 상품 복잡도를 불필요하게 늘리지 않으면서 입력 화면을 단순하게 유지할 수 있다.

## 1차 화면 범위

### `/`

역할:

- 웹 진입 대시보드
- 주요 화면으로 빠르게 이동하는 허브

화면 요소:

- 시스템 개요 카드
- 최근 이벤트 수 카드
- 최근 전표 수 카드
- Trial Balance 진입 링크
- 빠른 작업 버튼

왜 필요한가:

- 운영 사용자는 단일 입력 폼보다 전체 흐름의 현재 상태를 먼저 보고 싶어한다.
- 대시보드는 나머지 화면의 네비게이션 기준점이 된다.

### `/events/new`

역할:

- 회계 이벤트 입력

연결 API:

- `POST /accounting-events`

필수 입력:

- tenant
- entity
- book
- event type
- accounting date
- trade date
- currency
- amount
- product
- contract

출력:

- 생성된 journal 개수
- duplicate 여부
- 성공 후 이벤트 또는 전표 조회 페이지로 이동

왜 필요한가:

- 서버 코어가 실제 업무 입력으로 작동하는지 확인하는 가장 직접적인 화면이다.
- 이 프로젝트의 핵심은 이벤트를 분개로 바꾸는 것이므로, 입력 화면은 1차 필수다.

### `/events`

역할:

- 이벤트 목록 조회

연결 API:

- `GET /events`

기본 필터:

- tenant
- entity
- event type
- from
- to

왜 필요한가:

- 입력된 사건을 시간순으로 추적해야 한다.
- “무슨 입력이 들어갔는지”를 모르면 전표 결과만 보고 원인을 설명할 수 없다.

### `/journals`

역할:

- 전표 목록 조회

연결 API:

- `GET /journals`

기본 필터:

- tenant
- entity
- from
- to

왜 필요한가:

- 회계 검토는 결국 전표 기준으로 이뤄진다.
- 이벤트와 전표를 나란히 볼 수 있어야 자동분개 결과를 검증할 수 있다.

### `/journals/[id]`

역할:

- 전표 상세 조회

연결 API:

- `GET /journals/:id`

보여줄 내용:

- 전표 헤더
- 회계일
- 전표번호
- 상태
- line items
- 계정코드, 차변, 대변, 통화

왜 필요한가:

- 자동분개 엔진의 정답은 line-level에서 확인된다.
- 전표 상세 화면이 없으면 회계 검토가 불가능하다.

### `/trial-balance`

역할:

- 시산표 조회

연결 API:

- `GET /ledger/trial-balance`

필터:

- tenant
- entity
- as-of date

왜 필요한가:

- 1차 MVP에서 가장 중요한 집계 화면이다.
- 이벤트와 전표가 쌓였을 때 차대 합계와 계정 잔액이 어떻게 보이는지 검증할 수 있어야 한다.

## 라우트 우선순위

1. `/`
2. `/events/new`
3. `/events`
4. `/journals`
5. `/journals/[id]`
6. `/trial-balance`

이 순서가 맞는 이유:

- 입력 경로를 먼저 열고
- 입력 결과를 이벤트와 전표로 확인한 뒤
- 마지막에 집계 결과를 시산표로 검증할 수 있기 때문이다.

## 데이터 계층 계획

### `src/lib/api`

역할:

- 서버 API 호출 래퍼

구성:

- `events.ts`
- `journals.ts`
- `ledger.ts`
- `client.ts`

원칙:

- 프론트에서 회계 로직을 재구현하지 않는다.
- 서버 응답을 그대로 쓰되, 화면용 formatter만 둔다.

### `src/lib/types`

역할:

- 웹에서 쓰는 API 응답 타입

원칙:

- 1차는 수동 타입으로 시작한다.
- 이후 OpenAPI 기반 타입 생성 도입 가능하도록 구조를 열어둔다.

## 컴포넌트 계획

### 1차 필수 shadcn/ui 컴포넌트

- `button`
- `card`
- `input`
- `label`
- `select`
- `table`
- `badge`
- `textarea`
- `separator`
- `dialog`

### 공통 커스텀 컴포넌트

- `PageHeader`
- `StatCard`
- `FilterBar`
- `EmptyState`
- `DataTableShell`
- `EventTypeBadge`

왜 공통 컴포넌트를 먼저 두는가:

- 같은 패턴이 이벤트, 전표, 시산표에 반복되기 때문이다.
- 초반부터 화면 밀도를 통일해야 나중에 확장 비용이 줄어든다.

## 퍼블리싱 방향

### 기본 방향

- `Next.js App Router`
- `Tailwind CSS`
- `shadcn/ui`

### 시각 방향

- 일반적인 회색 SaaS 화면보다 더 분명한 정보 밀도
- 금융/회계 화면답게 표와 숫자 중심
- 과한 장식보다 대비가 분명한 카드, 표, 필터 배치
- 모바일 대응은 하되 1차 우선순위는 데스크톱

### React Bits 사용 방향

1차 원칙:

- React Bits는 초기 필수 의존성이 아니라 “선택적 시각 강화 레이어”로 둔다.

적용 후보:

- 대시보드 상단 hero 또는 summary motion
- empty state
- section transition

왜 바로 깊게 넣지 않는가:

- 지금 단계에서 더 중요한 건 정보 구조와 API 연결이다.
- React Bits는 구조가 안정된 뒤 적용해도 늦지 않다.

## 기술 원칙

- 서버 컴포넌트 우선
- 입력 폼과 인터랙티브 테이블만 클라이언트 컴포넌트 사용
- API 호출 실패 시 empty/error state 명확히 표시
- 임시 mock 데이터 대신 실제 API 우선
- 단, 서버 미구현 구간은 placeholder state로 처리

## 구현 순서

1. 루트 레이아웃과 네비게이션
2. 대시보드 기본 화면
3. `lib/api` 클라이언트
4. 이벤트 입력 화면
5. 이벤트 목록 화면
6. 전표 목록 및 상세 화면
7. Trial Balance 화면
8. 마지막에 시각 강화

## 현재 상태

완료:

- `apps/web` Next.js 스캐폴드
- Tailwind 설정
- shadcn/ui 초기화
- 1차 필수 UI primitive 추가

아직 남은 일:

- 루트 모노레포 기준 정리
- 공통 레이아웃
- 화면 라우트 생성
- API client 작성
- 1차 화면 구현

## 다음 작업 추천

다음 구현은 아래 순서가 맞다.

1. `apps/web` 기본 레이아웃과 좌측 네비게이션
2. `/events/new`
3. `/events`
4. `/journals`
5. `/trial-balance`

이유:

- 1차 핵심 업무 흐름을 가장 빨리 화면으로 확인할 수 있기 때문이다.
