# 기대 분개 카탈로그

## 문서 목적

이 문서는 [fixtures/scenarios](/Users/tooning/spc/fixtures/scenarios/index.yaml:1)에 정의한 시나리오에서 공통 분개 규칙을 추출해, 자동분개 엔진이 따라야 할 기대 분개 정답표를 정리한다.

이 문서는 다음 용도로 사용한다.

- 자동분개 엔진 규칙 설계
- fixture 검토 기준
- 회계 정책과 구현 규칙 연결
- 리뷰 시 분개 정당성 검증

## 사용 원칙

- 이 문서는 이벤트 타입 중심으로 본다.
- 실제 금액은 fixture가 source of truth다.
- 이 문서는 계정 방향, 차원, 회계주체, 주의사항을 명시한다.
- 예외 규칙이 생기면 이벤트를 세분화하거나 조건을 추가한다.

## 공통 필수 차원

1차 기준으로 아래 차원은 가능한 한 모든 분개 라인에 포함하는 것을 원칙으로 한다.

- tenant_id
- entity_id
- book_code
- accounting_date
- currency

상품 또는 계약 기반 이벤트에서는 아래를 추가한다.

- product_id
- contract_id

상대방 식별이 필요한 경우에는 아래를 추가한다.

- counterparty_entity_id
- investor_id

## 계정 참조

주요 계정은 [fixtures/master/coa.yaml](/Users/tooning/spc/fixtures/master/coa.yaml:1)를 기준으로 한다.

- `111000` Cash and Cash Equivalents
- `121000` Loan Receivables
- `123000` Equity Investments
- `131000` Accrued Interest Receivable
- `139000` Allowance for Credit Losses
- `211000` Borrowings
- `311000` Paid-in Capital
- `411000` Interest Income
- `412000` Fee Income
- `421000` Fair Value Gain Loss
- `431000` Foreign Exchange Gain Loss
- `513000` Impairment Loss

## EVT-001. fund_subscription_cash_receipt

### 설명

투자자가 펀드에 출자금을 납입할 때 펀드 장부에 인식하는 분개다.

### 회계주체

- 펀드

### 입력 조건

- 이벤트 유형: `fund_subscription_cash_receipt`
- 통화: USD
- 투자자 식별 가능

### 기대 분개

- 차변 `111000` Cash and Cash Equivalents
- 대변 `311000` Paid-in Capital

### 필수 차원

- tenant_id
- entity_id
- book_code
- investor_id
- currency

### 주의사항

- 투자자 출자는 수익이 아니다.
- 펀드 자본과 투자자 배분 정보는 연결되지만 같은 개념은 아니다.

## EVT-002. equity_contribution_to_spc

### 설명

펀드가 SPC에 자본을 투입할 때, 펀드 장부와 SPC 장부에 각각 다른 분개가 생성된다.

### 회계주체

- 펀드
- SPC

### 입력 조건

- 이벤트 유형: `equity_contribution_to_spc`
- 계약 유형: `equity_subscription`

### 기대 분개

펀드 장부:

- 차변 `123000` Equity Investments
- 대변 `111000` Cash and Cash Equivalents

SPC 장부:

- 차변 `111000` Cash and Cash Equivalents
- 대변 `311000` Paid-in Capital

### 필수 차원

- tenant_id
- entity_id
- book_code
- counterparty_entity_id
- contract_id
- currency

### 주의사항

- 같은 경제적 사건이라도 회계주체가 다르면 분개가 다르다.
- 이 이벤트는 멀티북 회계의 핵심 검증 포인트다.

## EVT-003. loan_origination

### 설명

SPC가 대출채권을 실행 또는 취득할 때 대출채권 자산을 인식한다.

### 회계주체

- SPC

### 입력 조건

- 이벤트 유형: `loan_origination`
- 상품 유형: `loan_receivable`
- 계약 식별 가능

### 기대 분개

- 차변 `121000` Loan Receivables
- 대변 `111000` Cash and Cash Equivalents

### 필수 차원

- tenant_id
- entity_id
- book_code
- product_id
- contract_id
- currency

### 주의사항

- 1차에서는 선박 실물자산이 아니라 대출채권으로 단순화한다.
- 취득원가 또는 실행금액을 기준으로 최초 인식한다.

## EVT-004. borrowing_drawdown

### 설명

SPC가 차입금을 실행해 현금을 수령할 때 부채를 인식한다.

### 회계주체

- SPC

### 입력 조건

- 이벤트 유형: `borrowing_drawdown`
- 차입금액 확정

### 기대 분개

- 차변 `111000` Cash and Cash Equivalents
- 대변 `211000` Borrowings

### 필수 차원

- tenant_id
- entity_id
- book_code
- currency

### 주의사항

- 수수료가 붙는 복합 구조는 1차에서 제외한다.
- 차입 실행과 이자비용 인식은 다른 이벤트다.

## EVT-005. interest_accrual

### 설명

대출채권에 대해 기간 경과분 이자를 발생주의 기준으로 인식한다.

### 회계주체

- SPC

### 입력 조건

- 이벤트 유형: `interest_accrual`
- 상품 유형: `loan_receivable`
- 계산 기준: simple interest
- day count: `ACT_360`

### 기대 분개

- 차변 `131000` Accrued Interest Receivable
- 대변 `411000` Interest Income

### 필수 차원

- tenant_id
- entity_id
- book_code
- product_id
- contract_id
- currency

### 주의사항

- 현금 수취와 분리한다.
- accrual 계산 근거는 재현 가능해야 한다.
- 손상 상태에서는 다른 수익 인식 정책이 필요할 수 있다.

## EVT-006. interest_cash_receipt

### 설명

기존에 인식한 미수이자를 실제 현금으로 수취한다.

### 회계주체

- SPC

### 입력 조건

- 이벤트 유형: `interest_cash_receipt`
- 관련 accrued interest 존재

### 기대 분개

- 차변 `111000` Cash and Cash Equivalents
- 대변 `131000` Accrued Interest Receivable

### 필수 차원

- tenant_id
- entity_id
- book_code
- product_id
- currency

### 주의사항

- 수취 시점에 이자수익을 다시 잡으면 안 된다.
- accrual 미인식 상태라면 별도 정책 검토가 필요하다.

## EVT-007. principal_repayment

### 설명

차주가 원금을 일부 또는 전부 상환할 때 대출채권 원금을 감소시킨다.

### 회계주체

- SPC

### 입력 조건

- 이벤트 유형: `principal_repayment`
- 상품 유형: `loan_receivable`

### 기대 분개

- 차변 `111000` Cash and Cash Equivalents
- 대변 `121000` Loan Receivables

### 필수 차원

- tenant_id
- entity_id
- book_code
- product_id
- currency

### 주의사항

- 상환 후 원금 잔액이 이후 이자계산 기준이 된다.
- 이자수취와 원금상환을 구분해야 한다.

## EVT-008. fair_value_adjustment

### 설명

평가 기준에 따라 투자 자산의 공정가치 변동을 반영한다.

### 회계주체

- SPC

### 입력 조건

- 이벤트 유형: `fair_value_adjustment`
- 평가 기준 존재
- 평가 입력값 존재

### 기대 분개

- 차변 `123000` Equity Investments
- 대변 `421000` Fair Value Gain Loss

평가손실의 경우 방향이 반대가 될 수 있다.

### 필수 차원

- tenant_id
- entity_id
- book_code
- product_id
- currency

### 주의사항

- 평가손익과 실현손익을 혼동하지 않는다.
- 상품 유형별로 다른 자산 계정을 사용할 수 있다.

## EVT-009. impairment_recognition

### 설명

회수 가능성 저하를 반영해 대손충당금 또는 손상 금액을 인식한다.

### 회계주체

- SPC

### 입력 조건

- 이벤트 유형: `impairment_recognition`
- 손상 판단 근거 존재

### 기대 분개

- 차변 `513000` Impairment Loss
- 대변 `139000` Allowance for Credit Losses

### 필수 차원

- tenant_id
- entity_id
- book_code
- product_id
- currency

### 주의사항

- 직접 자산을 깎는 방식보다 충당금 계정을 우선 사용한다.
- 손상 전 장부가와 순장부가를 모두 추적해야 한다.

## EVT-010. fx_remeasurement

### 설명

USD 기준 잔액을 KRW 보고통화로 환산할 때 환산 차이를 인식한다.

### 회계주체

- SPC

### 입력 조건

- 이벤트 유형: `fx_remeasurement`
- from_currency: USD
- to_currency: KRW
- prior rate와 current rate 존재

### 기대 분개

이 fixture 초안 기준:

- 차변 `111000` Cash and Cash Equivalents
- 대변 `431000` Foreign Exchange Gain Loss

실제 구현에서는 환산 대상 계정 성격에 따라 반대 방향이 가능하다.

### 필수 차원

- tenant_id
- entity_id
- book_code
- from_currency
- to_currency

### 주의사항

- 상품 손익과 환산손익을 섞지 않는다.
- 환율 적용일과 출처를 함께 보존해야 한다.
- 보고통화 산출 로직과 장부 원통화 로직을 구분한다.

## EVT-011. cash_waterfall_allocation

### 설명

계약상 우선순위에 따라 유입 현금을 배분한다.

### 회계주체

- SPC

### 입력 조건

- 이벤트 유형: `cash_waterfall_allocation`
- 워터폴 규칙 존재
- 우선순위별 배분 금액 존재

### 기대 결과

1차에서는 회계 분개보다 배분 결과 검증이 우선이다.

현재 fixture 초안의 단순 분개:

- 차변 `111000` Cash and Cash Equivalents
- 대변 `412000` Fee Income

### 필수 차원

- tenant_id
- entity_id
- book_code
- currency

### 주의사항

- 이 이벤트는 아직 회계 규칙보다 배분 구조 설명에 가깝다.
- 실제 구현 전 비용, 이자, 원금, 준비금, 배당별 세부 분개 규칙으로 분해해야 한다.

## 보고 이벤트

아래는 분개 생성 이벤트라기보다 집계 및 배분 결과 생성 이벤트다.

### month_close

- 시산표 생성
- BS/PL/CF 생성
- 마감 상태 전환

### investor_allocation

- 펀드 손익 또는 분배가능액을 투자자별로 `pro-rata` 배분
- 1차에서는 지분율 기준 고정

## 구현 가이드

- 자동분개 엔진은 `event_type`을 1차 분기 키로 사용한다.
- 2차 분기에는 상품유형, 계약유형, 회계주체, 통화, 평가기준을 사용한다.
- 같은 event_type이라도 회계주체가 다르면 규칙을 별도 관리한다.
- 분개 라인 생성 후에는 반드시 차대 검증을 수행한다.

## 현재 한계

- `cash_waterfall_allocation`은 아직 회계 분해가 충분하지 않다.
- `fx_remeasurement`는 단순 예시 수준이며 실제 계정별 정책 세분화가 필요하다.
- 수수료, 조기상환 페널티, 연체이자, 역분개 규칙은 아직 별도 정의하지 않았다.

## 다음 단계

1. 이 카탈로그를 기준으로 분개 규칙 DSL 또는 테이블 구조를 설계한다.
2. 각 이벤트 규칙에 대해 반례와 예외 규칙을 추가한다.
3. `cash_waterfall_allocation`과 `fx_remeasurement`를 더 세분화한다.
