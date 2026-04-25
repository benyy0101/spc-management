# Server Phase 2 API Roadmap

## 문서 목적

이 문서는 [docs/mvp-phase-2.md](/Users/tooning/spc/docs/mvp-phase-2.md:1)와 [docs/api-plan.md](/Users/tooning/spc/docs/api-plan.md:1)를 기준으로,  
2차 MVP에서 서버에 먼저 추가할 API 목록과 구현 순서를 정리한다.

목적은 아래와 같다.

- 2차 MVP에서 서버 구현 범위를 명확히 고정한다.
- 어떤 API부터 만들어야 하는지 우선순위를 정한다.
- 프론트엔드보다 먼저 필요한 도메인 유스케이스를 식별한다.
- 이미 구현된 1차 API와 새로 추가될 2차 API를 구분한다.

---

## 최상위 원칙

- 2차 MVP는 화면이 아니라 서버 유스케이스 기준으로 구현한다.
- 조회 API보다 먼저 도메인 규칙과 저장 모델이 필요한 경우, 해당 모델을 먼저 만든다.
- 재무제표, 마감, 배분은 각각 별도의 도메인 묶음으로 본다.
- 서버 API는 `tenant-aware`를 유지한다.
- 1차에서 만든 event/journal/ledger 흐름을 깨지 않는 방향으로 확장한다.

---

## 현재 구현된 서버 API

아래 API는 이미 1차 MVP에서 구현되어 있다.

### 입력/조회

- `POST /accounting-events`
- `GET /events`
- `GET /events/:id`
- `GET /journals`
- `GET /journals/:id`
- `GET /ledger/trial-balance`

### 기준정보 조회

- `GET /tenants`
- `GET /entities`
- `GET /accounts`
- `GET /products`
- `GET /contracts`

### 문서화

- `GET /docs`

즉 2차에서는 이 위에 재무제표, 마감, 배분, 관리형 기준정보, 운영 예외 API를 쌓는 구조다.

---

## 2차 MVP에서 추가될 API 묶음

2차 MVP 서버 API는 아래 6개 묶음으로 본다.

1. 재무제표 API
2. 마감 API
3. 투자자 배분 API
4. 기준정보 관리 API
5. 운영 예외 처리 API
6. 권한/감사 API

---

## 1. 재무제표 API

### `GET /financial-statements/balance-sheet`

역할:

- 기준일 현재 재무상태표 조회

필수 쿼리:

- `tenantId`
- `entityId` 또는 전체 entity 범위 정책
- `asOf`
- `bookId` 또는 `bookCode` 확장 여지

왜 필요한가:

- 2차 MVP의 최우선 목적은 시산표를 실제 재무제표로 연결하는 것이다.
- 1차는 trial balance까지만 검증하므로 보고서 수준의 출력이 없다.

### `GET /financial-statements/profit-loss`

역할:

- 기간 기준 손익계산서 조회

필수 쿼리:

- `tenantId`
- `entityId`
- `from`
- `to`

왜 필요한가:

- 수익/비용 흐름을 회계기간 기준으로 검토하려면 PL이 필요하다.

### `GET /financial-statements/cash-flow`

역할:

- 현금흐름표 조회

필수 쿼리:

- `tenantId`
- `entityId`
- `from`
- `to`
- 간접법 기준

왜 필요한가:

- 프로젝트 범위에 현금흐름표가 포함돼 있고, 2차 MVP에서 보고 기능을 완성하려면 필요하다.

### `GET /statement-mappings`

역할:

- 계정과목과 재무제표 라인 매핑 조회

왜 필요한가:

- 재무제표 API는 계정 집계만으로는 완성되지 않고 statement mapping이 필요하다.

### `POST /statement-mappings`

역할:

- 매핑 생성

### `PATCH /statement-mappings/:id`

역할:

- 매핑 수정

---

## 2. 마감 API

### `POST /close-periods`

역할:

- 특정 기간 마감 요청

필수 입력:

- `tenantId`
- `entityId`
- `periodStart`
- `periodEnd`
- `bookCode` 또는 `bookId`

왜 필요한가:

- 2차 MVP부터는 기간 통제가 들어가야 운영형 SaaS로 볼 수 있다.

### `GET /close-periods`

역할:

- 마감 상태 목록 조회

왜 필요한가:

- 현재 어떤 기간이 열려 있고 닫혀 있는지 운영자가 확인해야 한다.

### `GET /close-periods/:id`

역할:

- 특정 마감 상세 조회

왜 필요한가:

- 마감 결과, 조정분개, 상태 이력을 확인하기 위해 필요하다.

### `POST /close-periods/:id/reopen`

역할:

- 마감 해제 또는 reopen

왜 필요한가:

- 운영 중 오마감/조정 필요 상황이 생긴다.

주의:

- 권한과 감사 추적이 반드시 같이 가야 한다.

---

## 3. 투자자 배분 API

### `GET /investor-positions`

역할:

- 투자자별 포지션 조회

필수 쿼리:

- `tenantId`
- `fundEntityId`
- `asOf`

왜 필요한가:

- 배분 전에 투자자 지분과 잔액을 확인해야 한다.

### `POST /allocations/run`

역할:

- 배분 실행

필수 입력:

- `tenantId`
- `fundEntityId`
- `allocationDate`
- `method` (`pro_rata`)

왜 필요한가:

- 2차 MVP에서 투자자 배분을 실제 기능으로 올리는 핵심 API다.

### `GET /allocations`

역할:

- 배분 결과 목록 조회

왜 필요한가:

- 배분 실행 이력과 결과를 검토해야 한다.

### `GET /allocations/:id`

역할:

- 배분 상세 조회

왜 필요한가:

- 어떤 투자자에게 얼마가 배분되었는지 line-level 검토가 필요하다.

### `GET /investors/:id/allocation-history`

역할:

- 투자자 단위 배분 이력 조회

왜 필요한가:

- 투자자 관점 보고와 검증에 필요하다.

---

## 4. 기준정보 관리 API

1차는 기준정보 조회만 있었다. 2차는 관리형 API가 필요하다.

### Accounts

- `POST /accounts`
- `PATCH /accounts/:id`
- `POST /accounts/:id/deactivate`

### Products

- `POST /products`
- `PATCH /products/:id`
- `POST /products/:id/deactivate`

### Contracts

- `POST /contracts`
- `PATCH /contracts/:id`
- `POST /contracts/:id/version`

### Entities

- `POST /entities`
- `PATCH /entities/:id`
- `POST /entities/:id/deactivate`

왜 필요한가:

- 2차부터는 seed 기반이 아니라 운영자가 기준정보를 직접 관리해야 한다.

주의:

- 계약은 단순 수정이 아니라 versioning 전략이 필요하다.

---

## 5. 운영 예외 처리 API

### `POST /journals/manual`

역할:

- 수기분개 생성

왜 필요한가:

- 운영 시스템은 자동분개만으로 닫히지 않는다.
- 조정분개, 예외분개가 필요하다.

### `POST /journals/:id/reverse`

역할:

- 특정 전표 역분개

왜 필요한가:

- 삭제보다 reversal이 회계적으로 맞다.

### `POST /events/:id/reverse`

역할:

- 이벤트 기준 reversal 요청

왜 필요한가:

- source event 기준 예외 처리가 필요하다.

### `POST /events/:id/reprocess`

역할:

- 규칙 변경/오류 수정 후 이벤트 재처리

왜 필요한가:

- 손상, 평가, 매핑 변경 같은 경우 재처리가 필요할 수 있다.

### `GET /idempotency-keys`

역할:

- duplicate 처리 상태 조회

왜 필요한가:

- 운영자가 중복 차단 상태를 추적할 수 있어야 한다.

---

## 6. 권한/감사 API

### `GET /audit-logs`

역할:

- 감사 로그 조회

왜 필요한가:

- 2차부터는 마감, 수기분개, 역분개가 들어오므로 감사 추적이 중요하다.

### `GET /users`

역할:

- 사용자 조회

### `GET /roles`

역할:

- 역할 조회

### `POST /roles`

역할:

- 역할 생성

### `POST /role-assignments`

역할:

- 사용자 역할 할당

왜 필요한가:

- 수기분개와 마감은 권한 분리가 필요하다.

---

## 서버 구현 우선순위

2차 MVP에서 서버는 아래 순서로 구현하는 것을 권장한다.

### 1순위: 재무제표

- `GET /financial-statements/balance-sheet`
- `GET /financial-statements/profit-loss`
- `GET /financial-statements/cash-flow`
- `GET /statement-mappings`
- `POST /statement-mappings`
- `PATCH /statement-mappings/:id`

이유:

- 2차 MVP의 가장 큰 가치가 시산표를 재무제표로 올리는 것이기 때문이다.

### 2순위: 마감

- `POST /close-periods`
- `GET /close-periods`
- `GET /close-periods/:id`
- `POST /close-periods/:id/reopen`

이유:

- 재무제표가 생기면 바로 기간 통제가 따라와야 한다.

### 3순위: 투자자 배분

- `GET /investor-positions`
- `POST /allocations/run`
- `GET /allocations`
- `GET /allocations/:id`
- `GET /investors/:id/allocation-history`

이유:

- 프로젝트 요구사항에 이미 포함된 핵심 범위다.

### 4순위: 기준정보 관리

- accounts/products/contracts/entities write API

이유:

- 운영자가 seed 없이 직접 관리할 수 있어야 한다.

### 5순위: 운영 예외 처리

- manual journal
- reverse
- reprocess

이유:

- 운영 단계에서 필요하지만, 보고/마감/배분보다 먼저는 아니다.

### 6순위: 권한/감사

- audit / roles / assignments

이유:

- 기능이 늘어날수록 중요해지지만, 앞선 핵심 도메인 기능이 먼저다.

---

## 서버 구현 시 바로 필요한 도메인 모델

API보다 먼저 또는 같이 필요한 모델은 아래다.

- statement_mappings
- financial_statement_projection 또는 equivalent read model
- close_periods
- close_adjustment_journals
- investor_allocations
- allocation_runs
- user_roles / permissions
- manual_journal workflow model

즉 2차 서버 구현은 단순 라우트 추가가 아니라,  
새로운 회계 운영 모델을 데이터 구조와 유스케이스로 확장하는 작업이다.

---

## 요약

2차 MVP에서 서버에 추가될 핵심 API는 아래 순서로 보면 된다.

1. 재무제표 API
2. 마감 API
3. 투자자 배분 API
4. 기준정보 관리 API
5. 운영 예외 처리 API
6. 권한/감사 API

서버부터 구현한다면 가장 먼저 시작할 API는:

- `GET /financial-statements/balance-sheet`
- `GET /financial-statements/profit-loss`
- `GET /financial-statements/cash-flow`

이다.

이유는 1차 MVP가 이미 시산표까지 닫혀 있어서,  
그 다음 가장 자연스러운 서버 확장은 재무제표이기 때문이다.
