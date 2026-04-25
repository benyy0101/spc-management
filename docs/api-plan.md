# API 계획서

## 문서 목적

이 문서는 [docs/project-plan.md](/Users/tooning/spc/docs/project-plan.md:1), [docs/schema-design.md](/Users/tooning/spc/docs/schema-design.md:1), [docs/journal-catalog.md](/Users/tooning/spc/docs/journal-catalog.md:1)을 기준으로 이 프로젝트에 필요한 API 범위를 정리한다.

이 문서의 목적은 다음과 같다.

- 어떤 API가 실제로 필요한지 범위를 고정한다.
- 엔드포인트를 기능 단위가 아니라 도메인 책임 단위로 묶는다.
- MVP 우선순위를 정한다.
- 각 API가 왜 필요한지 justification을 남긴다.

## 최상위 원칙

- API는 화면 기준이 아니라 도메인 책임 기준으로 설계한다.
- 입력 API와 조회 API를 분리해서 본다.
- 회계 이벤트, 전표, 원장, 재무제표는 서로 다른 조회 단위를 가진다.
- 모든 조회는 `tenant` 문맥을 전제로 한다.
- 1차 MVP는 넓은 업무 범위를 전부 구현하는 것이 아니라, 핵심 회계 흐름을 닫는 API부터 만든다.

## API 도메인 묶음

이 프로젝트의 API는 아래 6개 묶음으로 본다.

1. 기준정보 API
2. 회계 이벤트 API
3. 전표 API
4. 원장 및 잔액 API
5. 결산 및 재무제표 API
6. 투자자 배분 API

---

## 1. 기준정보 API

목적:

- 회계 엔진과 조회 API가 참조하는 마스터 데이터를 제공한다.

### `GET /tenants/:id`

역할:

- 테넌트 기본 정보 조회
- 기준 통화, 회계 timezone, 설정 확인

왜 필요한가:

- 이 시스템은 `tenant-aware` 설계가 전제다.
- 회계일 해석, 전표번호 정책, 통화 기준, 권한 컨텍스트가 모두 tenant 설정에서 시작된다.

### `GET /entities`

역할:

- 법인, 펀드, SPC 등 회계주체 목록 조회

왜 필요한가:

- 이벤트 입력과 보고서 조회의 가장 기본 필터가 회계주체다.
- 같은 거래라도 어느 entity의 장부냐에 따라 의미가 달라지므로, entity 조회는 거의 모든 기능의 선행 조건이다.

### `GET /books`

역할:

- 장부 목록 조회

왜 필요한가:

- 이벤트는 entity만으로 충분하지 않고 실제 posting 대상 장부를 알아야 한다.
- 향후 reporting book, secondary book이 들어오면 장부 조회는 필수다.

### `GET /accounts`

역할:

- COA 조회

왜 필요한가:

- 전표 상세, 원장, 재무제표는 모두 계정과목 체계 위에 서 있다.
- 운영자와 회계 담당자가 분개 결과를 검토하려면 계정코드와 계정명을 API로 볼 수 있어야 한다.

### `GET /products`

역할:

- 금융상품 목록 조회

왜 필요한가:

- 상품은 회계 이벤트와 잔액의 핵심 차원이다.
- 상품 단위 조회가 없으면 상품 lifecycle과 회계 결과를 연결할 수 없다.

### `GET /contracts`

역할:

- 계약 목록 조회

왜 필요한가:

- 회계 분개 규칙은 계약 조건을 참조한다.
- 상품만으로는 이자율, 만기, 상환 조건, day count를 설명할 수 없으므로 계약 조회가 필요하다.

### `GET /investors`

역할:

- 투자자 목록 조회

왜 필요한가:

- 출자, 배분, 현금분배를 투자자 단위로 보기 위해 필요하다.
- 펀드 구조를 다루는 이상 투자자 차원은 선택이 아니라 필수다.

---

## 2. 회계 이벤트 API

목적:

- 업무 사건을 입력하고 자동분개를 발생시키는 원천 API 묶음

### `POST /accounting-events`

역할:

- 이벤트 입력
- 자동분개 생성
- 전표와 원장라인 저장

왜 필요한가:

- 이 프로젝트의 핵심 입력점이다.
- 계약과 거래에서 발생한 사건을 회계로 전환하는 시스템이므로, 이벤트 입력 API가 없으면 시스템의 본질이 성립하지 않는다.

현재 상태:

- 구현됨

### `GET /events`

역할:

- 회계 이벤트 목록 조회
- event type, entity, accounting date 기준 필터링

왜 필요한가:

- 입력된 사건이 무엇인지 추적할 수 있어야 한다.
- 전표만 보면 원인을 알기 어렵고, 이벤트 목록이 있어야 거래와 회계를 연결해서 볼 수 있다.

권장 필터:

- `tenantId`
- `entityId`
- `eventType`
- `from`
- `to`
- `status`

### `GET /events/:id`

역할:

- 이벤트 단건 조회

왜 필요한가:

- 감사 대응과 디버깅의 기본 단위다.
- “이 전표가 왜 생겼나”를 보려면 source event 조회가 필요하다.

현재 상태:

- 구현됨

### `POST /events/:id/reverse`

역할:

- 이벤트 기준 역분개 요청

왜 필요한가:

- 회계 시스템은 잘못된 입력을 삭제하지 않고 반대분개나 reversal로 처리해야 한다.
- 이후 승인/통제 체계가 붙으면 필수 API가 된다.

MVP 우선순위:

- 2차

### `POST /events/:id/reprocess`

역할:

- 분개 규칙 변경 또는 오류 수정 후 이벤트 재처리

왜 필요한가:

- 평가, 외화, 손상처럼 규칙이 바뀔 여지가 있는 도메인에서는 재처리 기능이 필요하다.
- 다만 1차 MVP에서는 운영 복잡도를 올리므로 뒤로 미룬다.

MVP 우선순위:

- 3차

---

## 3. 전표 API

목적:

- 자동분개 결과를 회계 관점에서 조회하고 검토하는 API 묶음

### `GET /journals`

역할:

- 전표 목록 조회

왜 필요한가:

- 회계 담당자는 이벤트보다 전표를 더 자주 본다.
- 기준일, 회계주체, 장부, 상태 기준으로 전표를 훑어볼 수 있어야 마감 검토가 가능하다.

권장 필터:

- `tenantId`
- `entityId`
- `bookId`
- `from`
- `to`
- `postingStatus`

현재 상태:

- 구현됨

### `GET /journals/:id`

역할:

- 전표 헤더와 라인 상세 조회

왜 필요한가:

- 자동분개 결과가 맞는지 검증하려면 line-level 조회가 필요하다.
- 계정코드, 차변/대변, 상품, 계약, 투자자 차원을 같이 봐야 한다.

현재 상태:

- 구현됨

### `POST /journals/manual`

역할:

- 수기분개 생성

왜 필요한가:

- 실제 회계 운영에서는 자동분개만으로 모든 케이스를 처리할 수 없다.
- 조정분개, 예외분개, 초기 이행 분개를 위해 필요하다.

MVP 우선순위:

- 2차

### `POST /journals/:id/approve`

역할:

- 전표 승인

왜 필요한가:

- 내부통제와 역할 분리를 위해 필요하다.
- 특히 수기분개나 결산분개는 승인 흐름이 없으면 운영 리스크가 커진다.

MVP 우선순위:

- 3차

### `POST /journals/:id/reverse`

역할:

- 전표 역분개

왜 필요한가:

- 삭제 대신 회계적으로 정정해야 하기 때문이다.
- 결산 통제와 audit trail을 유지하려면 reversal API가 필요하다.

MVP 우선순위:

- 2차

---

## 4. 원장 및 잔액 API

목적:

- 전표를 사람이 검증 가능한 숫자로 집계하는 API 묶음

### `GET /ledger/entries`

역할:

- 원장 엔트리 목록 조회

왜 필요한가:

- 전표 단위보다 더 세밀한 계정별 흐름 확인이 필요하다.
- 계정원장과 전표를 이어보는 실무 조회의 기본이다.

### `GET /ledger/balances`

역할:

- 계정/차원 기준 잔액 조회

왜 필요한가:

- 전표 목록만으로는 현재 잔액을 바로 볼 수 없다.
- 기준일 잔액 조회는 회계 검증, 관리보고, 재무제표의 선행 단계다.

### `GET /ledger/trial-balance`

역할:

- 시산표 조회

왜 필요한가:

- 회계 시스템의 최소 집계 산출물이다.
- 차대 일치와 기말잔액 검증을 하려면 trial balance가 반드시 필요하다.

MVP 우선순위:

- 1차 필수

### `GET /ledger/account-summary`

역할:

- 특정 계정의 기간 요약 조회

왜 필요한가:

- 현금, 대출채권, 미수수익, 충당금 같은 핵심 계정을 기간 기준으로 검토하려면 필요하다.

MVP 우선순위:

- 2차

### `GET /ledger/product-balances`

역할:

- 상품별 잔액 조회

왜 필요한가:

- 금융상품 시스템에서는 계정만이 아니라 상품 단위 잔액도 중요하다.
- 상품 lifecycle과 회계 잔액을 연결하려면 별도 API가 필요하다.

MVP 우선순위:

- 2차

---

## 5. 결산 및 재무제표 API

목적:

- 마감과 공식 보고 숫자를 산출하는 API 묶음

### `POST /close-periods`

역할:

- 특정 기간 마감 실행

왜 필요한가:

- 마감은 단순 조회가 아니라 상태 전환이다.
- 월마감, 분기마감, 연마감 통제를 시스템으로 가져가려면 실행 API가 필요하다.

MVP 우선순위:

- 3차

### `GET /close-periods`

역할:

- 마감 상태 조회

왜 필요한가:

- 현재 어떤 기간이 열려 있고 닫혀 있는지 알아야 입력과 수정 가능 범위를 판단할 수 있다.

MVP 우선순위:

- 3차

### `GET /financial-statements/balance-sheet`

역할:

- 재무상태표 조회

왜 필요한가:

- 이 프로젝트 목표 자체가 COA, 원장, 재무제표 생성까지 포함한다.
- BS는 자산/부채/자본 상태를 보여주는 핵심 산출물이다.

MVP 우선순위:

- 2차

### `GET /financial-statements/profit-loss`

역할:

- 손익계산서 조회

왜 필요한가:

- 수익/비용 인식 결과를 보여주는 핵심 산출물이다.
- 이자수익, 평가손익, 손상비용이 제대로 반영됐는지 확인하려면 필요하다.

MVP 우선순위:

- 2차

### `GET /financial-statements/cash-flow`

역할:

- 현금흐름표 조회

왜 필요한가:

- 요구사항에 현금흐름표가 포함돼 있다.
- 다만 구현 난이도가 가장 높아 1차보다는 뒤에 두는 것이 현실적이다.

MVP 우선순위:

- 3차

### `GET /financial-statements/trial-balance`

역할:

- 시산표 기반 재무제표 검증용 조회

왜 필요한가:

- trial balance를 ledger API에도 둘 수 있지만, 재무제표 묶음에서도 검증 관점으로 제공하면 운영상 편하다.
- 다만 중복 책임이 되지 않도록 내부 구현은 공유해야 한다.

MVP 우선순위:

- 2차

---

## 6. 투자자 배분 API

목적:

- 펀드 성과와 현금분배를 투자자 단위로 계산하고 제공하는 API 묶음

### `GET /investor-positions`

역할:

- 투자자 지분율, commitment, paid-in 상태 조회

왜 필요한가:

- 배분 결과는 지분 구조 위에 서 있다.
- 배분 이전에 투자자 포지션을 볼 수 있어야 계산 근거를 설명할 수 있다.

MVP 우선순위:

- 2차

### `POST /allocations/run`

역할:

- 특정 기간의 투자자 배분 실행

왜 필요한가:

- 투자자 배분은 단순 조회가 아니라 계산 작업이다.
- 입력된 손익과 소유비율을 기준으로 allocation snapshot을 생성해야 한다.

MVP 우선순위:

- 3차

### `GET /allocations`

역할:

- 배분 결과 목록 조회

왜 필요한가:

- 특정 기간 배분 결과를 재확인하고, 회계 숫자와 투자자 숫자를 연결해서 보여줘야 한다.

MVP 우선순위:

- 3차

### `GET /allocations/:id`

역할:

- 배분 결과 상세 조회

왜 필요한가:

- 투자자별 비율, 배분 손익, 현금 분배액을 자세히 봐야 하기 때문이다.

MVP 우선순위:

- 3차

### `GET /investors/:id/allocation-history`

역할:

- 특정 투자자의 누적 배분 이력 조회

왜 필요한가:

- 투자자 관점 리포트의 기본이다.
- 펀드 운영사나 투자자 대응 시 자주 필요한 조회가 된다.

MVP 우선순위:

- 3차

---

## MVP 우선순위 정리

## 1차 필수 API

- `POST /accounting-events`
- `GET /events`
- `GET /events/:id`
- `GET /journals`
- `GET /journals/:id`
- `GET /ledger/trial-balance`

왜 이 6개가 먼저인가:

- 입력이 가능해야 한다.
- 생성된 분개를 회계 담당자가 볼 수 있어야 한다.
- 집계 결과를 trial balance로 검증할 수 있어야 한다.

## 2차 API

- `GET /accounts`
- `GET /products`
- `GET /contracts`
- `GET /ledger/account-summary`
- `GET /ledger/product-balances`
- `GET /financial-statements/balance-sheet`
- `GET /financial-statements/profit-loss`
- `GET /investor-positions`

왜 2차인가:

- 운영 편의와 실무 조회에 필요하지만, 1차 핵심 회계 흐름을 닫는 데 절대 선행 조건은 아니다.

## 3차 API

- `POST /events/:id/reverse`
- `POST /events/:id/reprocess`
- `POST /journals/manual`
- `POST /journals/:id/approve`
- `POST /journals/:id/reverse`
- `POST /close-periods`
- `GET /close-periods`
- `GET /financial-statements/cash-flow`
- `POST /allocations/run`
- `GET /allocations`
- `GET /allocations/:id`
- `GET /investors/:id/allocation-history`

왜 3차인가:

- 운영 통제, 예외 처리, 결산, 배분처럼 업무적으로 중요하지만 구현 복잡도가 높다.
- 1차와 2차가 안정된 뒤 붙이는 것이 안전하다.

---

## 현재 구현 상태

현재 구현된 API:

- `GET /health`
- `POST /accounting-events`
- `GET /events/:id`
- `GET /journals`
- `GET /journals/:id`

아직 구현되지 않은 1차 필수 API:

- `GET /events`
- `GET /ledger/trial-balance`

즉 현재는 입력 API와 기본 조회 API까지는 들어왔고, 다음 핵심은 목록형 이벤트 조회와 trial balance 조회다.

---

## 다음 구현 추천

다음으로 가장 먼저 구현할 API는 아래 두 개다.

1. `GET /events`
2. `GET /ledger/trial-balance`

이유:

- `GET /events`가 있어야 입력된 사건을 시간순/유형별로 관리할 수 있다.
- `GET /ledger/trial-balance`가 있어야 회계 시스템으로서 최소한의 집계 결과를 검증할 수 있다.
