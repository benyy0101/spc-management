# MVP Phase 1

## 1. 목적

1차 MVP의 목적은 이 프로젝트의 가장 핵심적인 회계 흐름을 실제로 검증 가능한 제품 형태로 만드는 것이다.

이 단계에서 닫아야 하는 최소 흐름은 아래다.

- 회계 이벤트 입력
- 자동분개 생성
- 전표 저장
- 전표 검토
- 시산표 검증

즉 1차 MVP는 "금융상품 회계 SaaS의 전체 완성본"이 아니라,  
"이벤트에서 분개와 시산표까지 이어지는 회계 엔진의 핵심 경로를 운영자가 직접 확인할 수 있는 상태"를 목표로 한다.

---

## 2. 목표

1차 MVP의 목표는 다음과 같다.

- SPC 구조 금융상품 회계 시스템의 핵심 원장 흐름을 검증한다.
- loan receivable 중심의 이벤트 처리와 자동분개를 구현한다.
- 웹 클라이언트에서 이벤트 입력부터 전표 검토까지 직접 확인할 수 있게 한다.
- fixture 기반 테스트와 실DB 통합 테스트로 회계 결과를 검증한다.
- 이후 2차 MVP에서 재무제표, 마감, 투자자 배분으로 확장 가능한 구조를 확보한다.

---

## 3. 범위

### 포함 범위

- 멀티테넌시 기본 구조
  - 단일 DB + tenant_id
  - tenant-aware API/조회
- 회계 엔진 코어
  - event -> journals -> journal_lines
- 지원 이벤트
  - loan_origination
  - interest_accrual
  - principal_repayment
- 기준정보 조회
  - tenants
  - entities
  - accounts
  - products
  - contracts
- 조회/검토 화면
  - events
  - journals
  - journal detail
  - trial balance
  - reference screens
- 한국어/영어 UI 모드
  - locale cookie
  - ko mode
  - Pretendard font mode

### 제외 범위

- 재무상태표/손익계산서/현금흐름표 실제 화면
- close period 운영 기능
- investor allocation 실제 UI
- manual journal 입력
- approval workflow
- reversal/reprocess 운영 UI
- 첨부파일 업로드
- bond/equity/beneficiary certificate 등 자산군 확장

---

## 4. 도메인 범위

1차 MVP는 아래 도메인 전제를 기준으로 한다.

- 회계 기준: 일반기업회계기준
- 기준 통화: USD
- 보고 통화 확장 여지: KRW
- 주요 회계주체: tenant / fund / spc
- 핵심 자산 클래스: loan_receivable
- 배분 정책: 문서/fixture 수준의 pro-rata 기준만 준비

---

## 5. 기능 목록

### 백엔드

- `POST /accounting-events`
- `GET /events`
- `GET /events/:id`
- `GET /journals`
- `GET /journals/:id`
- `GET /ledger/trial-balance`
- `GET /tenants`
- `GET /entities`
- `GET /accounts`
- `GET /products`
- `GET /contracts`
- Swagger 문서

### 웹

- Dashboard
- New Event
- Events
- Journals
- Journal Detail
- Trial Balance
- Accounts
- Products
- Contracts
- Entities
- Locale toggle (`en` / `ko`)

### 테스트

- fixture 검증 테스트
- domain rule 테스트
- API 단위 테스트
- API 통합 테스트
- core accounting workflow end-to-end smoke test

---

## 6. 기술 범위

- Backend: Fastify + TypeScript
- DB: PostgreSQL + Drizzle
- Web: Next.js App Router
- UI: Tailwind CSS + shadcn/ui
- Local DB: Docker PostgreSQL
- 패키지 구조: monorepo

---

## 7. 완료 기준

1차 MVP는 아래 조건을 만족하면 완료로 본다.

1. 사용자가 웹에서 이벤트를 입력할 수 있다.
2. 입력된 이벤트가 자동분개로 저장된다.
3. 사용자가 웹에서 생성된 전표 목록과 상세를 볼 수 있다.
4. 사용자가 시산표에서 결과 잔액을 확인할 수 있다.
5. 기준정보 화면에서 필요한 참조 데이터를 조회할 수 있다.
6. 주요 흐름이 테스트로 검증된다.
7. 한국어/영어 모드를 전환할 수 있다.

---

## 8. 1차 MVP 산출물

- domain docs
- fixture set
- journal catalog
- schema and SQL migrations
- seed/fixture loader
- domain/application/api layers
- web MVP screens
- localization baseline

---

## 9. 리스크

- 아직 재무제표가 없으므로 법정 보고 관점의 완결성은 부족하다.
- 아직 close period가 없으므로 기간 통제가 미완성이다.
- 아직 allocation UI가 없으므로 펀드/투자자 관점의 운영 범위는 제한적이다.
- 아직 수기분개/역분개가 없으므로 예외 처리 운영은 제한적이다.

---

## 10. 1차 MVP 요약

1차 MVP는  
"회계 이벤트를 입력하고 자동분개를 생성해 전표와 시산표까지 검증하는 웹 기반 회계 엔진 MVP"다.

이 단계의 핵심은 기능 수를 늘리는 것이 아니라,  
회계 시스템으로서 가장 중요한 원장 흐름을 안정적으로 닫는 것이다.
