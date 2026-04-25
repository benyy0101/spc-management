# 스키마 설계 초안

## 문서 목적

이 문서는 [docs/project-plan.md](/Users/tooning/spc/docs/project-plan.md:1), [docs/development-plan.md](/Users/tooning/spc/docs/development-plan.md:1), [docs/journal-catalog.md](/Users/tooning/spc/docs/journal-catalog.md:1), [fixtures/scenarios/index.yaml](/Users/tooning/spc/fixtures/scenarios/index.yaml:1)를 기준으로 관계형 데이터베이스 스키마 초안을 정의한다.

목표는 세 가지다.

1. fixture와 자동분개 엔진을 수용할 수 있는 최소 정규화 모델을 만든다.
2. 회계 원장과 보고 집계의 source of truth를 분명히 한다.
3. 1차는 `단일 DB + tenant_id`로 구현하되, 향후 schema/DB 분리로 확장 가능한 구조를 만든다.

## 설계 원칙

- 모든 핵심 테이블은 `tenant_id`를 가진다.
- 회계 원천 데이터는 정규화한다.
- 읽기 성능용 집계나 스냅샷은 별도 읽기 모델로 분리한다.
- 분개와 원장은 불변 이력으로 취급한다.
- 삭제보다 상태 전이와 정정 분개를 우선한다.
- 상품, 계약, 이벤트, 분개, 원장은 별도 테이블로 구분한다.
- 회계주체와 장부는 분리한다.
- 저장 시각은 `UTC`, 회계일 해석은 `tenant별 accounting timezone` 기준으로 한다.
- `journal_no`는 내부 PK와 별개로 tenant별 시퀀스를 사용한다.
- 금액 정밀도는 통화 정책을 따라야 하며 1차 기준은 `USD 2자리`, `KRW 0자리`다.
- event posting은 1차부터 idempotent 해야 한다.

## 스키마 개요

```text
Tenant
  ├─ User
  ├─ Entity
  │   └─ Book
  ├─ Account
  ├─ Product
  ├─ Contract
  ├─ Event
  │   └─ Event Calculation
  ├─ Journal
  │   └─ Journal Line
  ├─ Close Period
  ├─ FX Rate
  ├─ Investor
  ├─ Fund Position
  ├─ Investor Allocation
  └─ Audit Log
```

## 멀티테넌시 기준

### 1차 구현

- 단일 DB
- 모든 핵심 테이블에 `tenant_id`
- 모든 unique key는 필요시 `tenant_id` 포함
- 모든 조회는 `tenant_id` 필터를 기본 조건으로 가진다

### 확장 고려

- PK는 전역 UUID 또는 ULID 사용
- 내부 참조는 `id` 기반으로 하고 테이블명/코드에 테넌트 의미를 넣지 않는다
- 향후 schema 분리나 DB 분리 시에도 repository 계층이 같은 인터페이스를 유지할 수 있게 한다

## 핵심 테이블

### 1. tenants

목적:

- SaaS 고객 또는 업무 공간 식별

주요 컬럼:

- `id`
- `code`
- `name`
- `status`
- `base_currency`
- `accounting_timezone`
- `created_at`
- `updated_at`

비고:

- 1차에서 데이터 격리의 최상위 단위다.

### 2. users

목적:

- 사용자 계정과 권한 주체 관리

주요 컬럼:

- `id`
- `tenant_id`
- `email`
- `name`
- `status`
- `auth_subject`
- `created_at`
- `updated_at`

비고:

- 권한 모델은 별도 RBAC 테이블로 확장한다.

### 3. entities

목적:

- 회계주체 관리

예:

- 펀드
- SPC
- 운용사

주요 컬럼:

- `id`
- `tenant_id`
- `code`
- `name`
- `entity_type`
- `functional_currency`
- `status`
- `created_at`
- `updated_at`

제약:

- `unique (tenant_id, code)`

### 4. books

목적:

- 회계 장부 단위 관리

주요 컬럼:

- `id`
- `tenant_id`
- `entity_id`
- `code`
- `name`
- `book_type`
- `accounting_basis`
- `status`

제약:

- `unique (tenant_id, code)`
- `foreign key (entity_id) -> entities(id)`

비고:

- 같은 회계주체 아래 여러 book이 생길 수 있는 구조를 허용한다.

### 5. accounts

목적:

- COA 관리

주요 컬럼:

- `id`
- `tenant_id`
- `code`
- `name`
- `account_type`
- `statement_type`
- `normal_balance`
- `is_active`

제약:

- `unique (tenant_id, code)`

비고:

- 1차에서는 계정계층보다 code 중심으로 시작하고, 이후 parent-child 구조를 붙일 수 있다.

### 6. statement_mappings

목적:

- 계정과 재무제표 라인 매핑

주요 컬럼:

- `id`
- `tenant_id`
- `account_id`
- `statement_type`
- `line_code`
- `line_name`
- `display_order`

제약:

- `foreign key (account_id) -> accounts(id)`

### 7. investors

목적:

- 투자자 관리

주요 컬럼:

- `id`
- `tenant_id`
- `code`
- `name`
- `investor_type`
- `default_currency`
- `status`

제약:

- `unique (tenant_id, code)`

### 8. fund_investor_positions

목적:

- 펀드별 투자자 지분과 납입 현황 관리

주요 컬럼:

- `id`
- `tenant_id`
- `fund_entity_id`
- `investor_id`
- `commitment_amount`
- `paid_in_amount`
- `ownership_ratio`
- `effective_from`
- `effective_to`

제약:

- `foreign key (fund_entity_id) -> entities(id)`
- `foreign key (investor_id) -> investors(id)`

비고:

- 1차는 `pro-rata` 기준이므로 ownership_ratio를 유지한다.

### 9. products

목적:

- 금융상품 마스터 관리

주요 컬럼:

- `id`
- `tenant_id`
- `code`
- `name`
- `product_type`
- `currency`
- `status`

제약:

- `unique (tenant_id, code)`

### 10. contracts

목적:

- 상품별 계약과 회계 입력값 관리

주요 컬럼:

- `id`
- `tenant_id`
- `product_id`
- `contract_type`
- `code`
- `currency`
- `effective_date`
- `maturity_date`
- `interest_rate_type`
- `interest_rate`
- `day_count_convention`
- `version_no`
- `status`

제약:

- `unique (tenant_id, code, version_no)`
- `foreign key (product_id) -> products(id)`

비고:

- 계약 변경을 위해 version 구조를 포함한다.

### 11. contract_parties

목적:

- 계약 상대방 연결

주요 컬럼:

- `id`
- `tenant_id`
- `contract_id`
- `party_role`
- `entity_id`
- `external_party_name`

제약:

- `foreign key (contract_id) -> contracts(id)`

비고:

- 내부 entity일 수도 있고 외부 상대방 문자열일 수도 있다.

### 12. fx_rates

목적:

- 환율 관리

주요 컬럼:

- `id`
- `tenant_id`
- `rate_date`
- `from_currency`
- `to_currency`
- `rate`
- `source_name`

제약:

- `unique (tenant_id, rate_date, from_currency, to_currency, source_name)`

### 13. events

목적:

- 회계 이벤트의 원천 기록

주요 컬럼:

- `id`
- `tenant_id`
- `entity_id`
- `book_id`
- `event_type`
- `idempotency_key`
- `status`
- `trade_date`
- `accounting_date`
- `settlement_date`
- `currency`
- `amount`
- `product_id`
- `contract_id`
- `counterparty_entity_id`
- `investor_id`
- `source_reference`
- `created_by`
- `created_at`

제약:

- `foreign key (entity_id) -> entities(id)`
- `foreign key (book_id) -> books(id)`
- `foreign key (product_id) -> products(id)`
- `foreign key (contract_id) -> contracts(id)`
- `foreign key (investor_id) -> investors(id)`

비고:

- 분개보다 앞서는 원천 이벤트다.
- 상태 예시: `draft`, `validated`, `posted`, `reversed`
- `created_at`은 UTC 저장을 기준으로 한다.

권장 제약:

- `unique (tenant_id, event_type, idempotency_key)`

### 14. event_calculations

목적:

- accrual, 평가, 환산 등 계산 근거 저장

주요 컬럼:

- `id`
- `tenant_id`
- `event_id`
- `calculation_type`
- `input_payload_json`
- `result_payload_json`
- `created_at`

제약:

- `foreign key (event_id) -> events(id)`

비고:

- 계산 재현성 확보를 위한 테이블이다.

### 15. journals

목적:

- 전표 헤더 관리

주요 컬럼:

- `id`
- `tenant_id`
- `entity_id`
- `book_id`
- `source_event_id`
- `journal_no`
- `journal_type`
- `accounting_date`
- `posting_status`
- `description`
- `created_by`
- `approved_by`
- `posted_at`

제약:

- `unique (tenant_id, journal_no)`
- `foreign key (source_event_id) -> events(id)`

비고:

- 자동분개와 수기분개를 모두 담는다.
- `journal_no`는 tenant별 시퀀스 정책으로 생성한다.

### 16. journal_lines

목적:

- 분개 라인 저장

주요 컬럼:

- `id`
- `tenant_id`
- `journal_id`
- `line_no`
- `account_id`
- `debit_amount`
- `credit_amount`
- `currency`
- `amount_scale`
- `fx_rate`
- `amount_in_functional_currency`
- `product_id`
- `contract_id`
- `counterparty_entity_id`
- `investor_id`
- `description`

제약:

- `foreign key (journal_id) -> journals(id)`
- `foreign key (account_id) -> accounts(id)`
- `check ((debit_amount = 0 and credit_amount > 0) or (credit_amount = 0 and debit_amount > 0))`
- `unique (tenant_id, journal_id, line_no)`

비고:

- 1차는 공통 차원을 고정 컬럼으로 둔다.
- 차원이 늘면 generic dimension table 또는 json 확장을 검토한다.
- 금액 자릿수 정책은 currency별 규칙을 따라야 한다.

### 17. ledger_entries

목적:

- 원장 조회 최적화를 위한 분개 라인 투영

주요 컬럼:

- `id`
- `tenant_id`
- `entity_id`
- `book_id`
- `journal_id`
- `journal_line_id`
- `account_id`
- `accounting_date`
- `currency`
- `debit_amount`
- `credit_amount`
- `net_amount`
- `product_id`
- `contract_id`
- `investor_id`
- `counterparty_entity_id`

제약:

- `foreign key (journal_line_id) -> journal_lines(id)`

비고:

- 사실상 `journal_lines`에서 바로 조회할 수도 있다.
- 1차는 별도 테이블 없이 view로 시작하는 것도 가능하다.
- 다만 기준일 원장 조회가 많아질 것을 고려해 분리 후보로 둔다.

### 18. close_periods

목적:

- 월마감, 분기마감, 연마감 상태 관리

주요 컬럼:

- `id`
- `tenant_id`
- `entity_id`
- `book_id`
- `period_type`
- `period_start`
- `period_end`
- `status`
- `closed_at`
- `closed_by`

제약:

- `unique (tenant_id, book_id, period_type, period_start, period_end)`

비고:

- 상태 예시: `open`, `closing`, `closed`, `reopened`

### 19. close_adjustment_journals

목적:

- 결산 조정분개와 역분개 연결

주요 컬럼:

- `id`
- `tenant_id`
- `close_period_id`
- `journal_id`
- `reverse_on_date`
- `reversal_journal_id`

제약:

- `foreign key (close_period_id) -> close_periods(id)`
- `foreign key (journal_id) -> journals(id)`

### 20. investor_allocations

목적:

- 투자자별 손익 또는 현금 배분 결과 저장

주요 컬럼:

- `id`
- `tenant_id`
- `fund_entity_id`
- `period_start`
- `period_end`
- `allocation_method`
- `source_amount_type`
- `source_amount`
- `investor_id`
- `ownership_ratio`
- `allocated_profit_amount`
- `cash_distribution_amount`

제약:

- `foreign key (fund_entity_id) -> entities(id)`
- `foreign key (investor_id) -> investors(id)`

비고:

- 1차는 `pro_rata`만 지원한다.

### 21. audit_logs

목적:

- 주요 변경 이력 기록

주요 컬럼:

- `id`
- `tenant_id`
- `actor_user_id`
- `action_type`
- `resource_type`
- `resource_id`
- `before_payload_json`
- `after_payload_json`
- `created_at`

제약:

- `foreign key (actor_user_id) -> users(id)`

## 권장 인덱스

### events

- `(tenant_id, entity_id, accounting_date)`
- `(tenant_id, event_type, accounting_date)`
- `(tenant_id, contract_id)`
- `(tenant_id, product_id)`
- `(tenant_id, event_type, idempotency_key)`

### journals

- `(tenant_id, entity_id, accounting_date)`
- `(tenant_id, source_event_id)`
- `(tenant_id, posting_status, accounting_date)`

### journal_lines

- `(tenant_id, account_id, journal_id)`
- `(tenant_id, product_id, accounting_date)`는 직접 컬럼이 없으므로 ledger projection에서 처리

### ledger_entries

- `(tenant_id, entity_id, account_id, accounting_date)`
- `(tenant_id, book_id, accounting_date)`
- `(tenant_id, product_id, accounting_date)`
- `(tenant_id, investor_id, accounting_date)`

### close_periods

- `(tenant_id, book_id, status)`

## 정규화와 비정규화 경계

### 정규화 유지 대상

- entities
- books
- accounts
- investors
- products
- contracts
- events
- journals
- journal_lines

이유:

- 원천 데이터
- 회계 정합성 핵심
- 중복 불일치 방지

### 비정규화 허용 대상

- ledger_entries projection
- trial balance snapshot
- statement snapshot
- investor allocation snapshot

이유:

- 읽기 성능
- 기준일 반복 조회
- 보고서 재사용

## 읽기 모델 후보

1차는 원천 테이블 중심으로 시작하되, 아래는 projection 또는 materialized view 후보로 본다.

- `trial_balance_snapshots`
- `statement_snapshots`
- `daily_account_balances`
- `product_position_snapshots`

## 스키마와 fixture 연결

현재 fixture의 주요 필드는 아래 테이블과 직접 연결된다.

- `tenant_id` -> 모든 핵심 테이블
- `entity_id` -> entities
- `book_code` -> books.code
- `investor_id` -> investors
- `product_id` -> products
- `contract_id` -> contracts
- `event_type` -> events.event_type
- `expected.journals` -> journals / journal_lines
- `expected.balances` -> ledger_entries 또는 projection
- `expected.statements` -> statement snapshots 또는 집계 결과

## 1차 구현 단순화 제안

아래는 의도적으로 단순화해도 된다.

1. `ledger_entries`
   - 초기에는 별도 테이블 없이 `journal_lines` 기반 query/view로 시작 가능

2. dimension generic model
   - 초기에는 `product_id`, `contract_id`, `investor_id`, `counterparty_entity_id`를 고정 컬럼으로 사용

3. statement snapshots
   - 초기에는 저장하지 않고 요청 시 집계 가능

4. contract_parties
   - 초기에는 최소 컬럼만 두고 외부상대방은 문자열 허용

## 오픈 이슈

1. 계정 계층 구조를 1차에 넣을지
2. journal_lines만으로 원장 조회를 충분히 처리할지
3. investor allocation을 보고 결과로만 둘지 저장할지
4. close adjustment와 reversal을 어떤 단위로 강제할지
5. reporting currency snapshot을 저장할지 매번 계산할지
6. journal_no 포맷에 book prefix를 포함할지
7. 증빙 메타데이터 전용 테이블을 1차에 둘지

## 다음 단계

1. 이 문서를 기준으로 ERD 초안을 만든다.
2. Fastify + Drizzle 기준 실제 테이블 정의 초안을 만든다.
3. fixture 시나리오를 각 테이블 insert 흐름으로 매핑한다.
