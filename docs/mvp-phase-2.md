# MVP Phase 2

## 1. 목적

2차 MVP의 목적은 1차에서 검증한 회계 엔진을 바탕으로,  
실제 운영 가능한 금융상품 회계 SaaS의 형태로 확장하는 것이다.

1차가 "이벤트 -> 전표 -> 시산표"를 닫는 단계였다면,  
2차는 그 위에 아래 운영 기능을 올리는 단계다.

- 재무제표
- 마감
- 투자자 배분
- 기준정보 관리
- 운영 예외 처리

---

## 2. 목표

2차 MVP의 목표는 다음과 같다.

- 시산표를 넘어 실제 재무제표를 생성한다.
- 회계 기간 통제와 마감 운영을 도입한다.
- 투자자 배분 로직을 실제 기능으로 구현한다.
- 기준정보를 조회만이 아니라 관리 가능한 상태로 만든다.
- 예외 상황 대응을 위한 수기분개/역분개/재처리 기반을 마련한다.

---

## 3. 범위

### 포함 범위

- 재무제표
  - balance sheet
  - profit & loss
  - cash flow
- statement mapping 관리
- close period 운영
- adjustment / closing journal
- investor allocation
  - pro-rata 1차 운영형 기능
- investor position / allocation history
- reference master 관리
  - accounts
  - products
  - contracts
  - entities
- 운영 기능
  - manual journal
  - reversal
  - reprocess
- 권한/감사 강화

### 제외 범위

- 복잡한 waterfall 우선/후순위 구조 완전 구현
- carry / hurdle / class 구조
- 연결회계
- 고도화된 파생상품 회계
- 대규모 외부 ERP 연동

---

## 4. 기능 목록

### 재무제표

- `GET /financial-statements/balance-sheet`
- `GET /financial-statements/profit-loss`
- `GET /financial-statements/cash-flow`
- statement mapping 설정

### 마감

- `POST /close-periods`
- `GET /close-periods`
- close status 조회
- close adjustment journal

### 투자자 배분

- `GET /investor-positions`
- `POST /allocations/run`
- `GET /allocations`
- `GET /investors/:id/allocation-history`

### 기준정보 관리

- accounts create/update/deactivate
- products create/update/deactivate
- contracts create/update/versioning
- entities create/update/deactivate

### 운영 예외 처리

- manual journal create
- journal reverse
- event reprocess
- duplicate/idempotency 운영 조회

### 권한/감사

- role-based access
- 수기분개 권한 분리
- audit log 조회 화면

---

## 5. 도메인 확장

2차 MVP에서는 1차의 loan 중심 범위를 넘어 아래를 검토한다.

- bond
- equity
- beneficiary certificate
- fx remeasurement 고도화
- impairment 고도화
- fair value adjustment 고도화

단, 자산군 확장은 "핵심 운영 기능"보다 후순위다.  
2차 MVP의 중심은 새로운 상품 수를 늘리는 것보다,  
실제 회계 운영 기능을 붙이는 것이다.

---

## 6. 기술 범위

2차 MVP에서도 기본 스택은 유지한다.

- Fastify
- PostgreSQL
- Drizzle
- Next.js
- Tailwind + shadcn/ui

대신 아래 기술 범위가 추가된다.

- richer application use cases
- statement mapping model
- close period state handling
- allocation engine/application layer
- authorization model
- audit query capability

---

## 7. 완료 기준

2차 MVP는 아래 조건을 만족하면 완료로 본다.

1. 시산표를 기반으로 재무제표를 조회할 수 있다.
2. 회계 기간을 마감하고 통제할 수 있다.
3. 투자자 배분을 실행하고 결과를 조회할 수 있다.
4. 기준정보를 화면에서 관리할 수 있다.
5. 예외 상황에서 수기분개, 역분개, 재처리가 가능하다.
6. 사용자 권한과 감사 추적이 기본 수준으로 동작한다.

---

## 8. 우선순위

2차 MVP 내부 우선순위는 아래 순서를 권장한다.

1. 재무제표
2. close period
3. investor allocation
4. reference master management
5. manual journal / reversal / reprocess
6. authorization / audit
7. additional product classes

---

## 9. 리스크

- statement mapping이 불완전하면 재무제표 신뢰도가 떨어진다.
- close/reopen 정책이 모호하면 운영 통제가 무너진다.
- allocation 규칙이 단순하지 않은 고객에서는 2차 범위를 넘길 수 있다.
- manual journal과 reversal을 넣는 순간 권한/감사 설계가 중요해진다.

---

## 10. 2차 MVP 요약

2차 MVP는  
"검증용 회계 엔진 MVP"를  
"재무제표, 마감, 배분, 기준정보 관리가 가능한 운영형 SaaS"로 확장하는 단계다.

이 단계부터는 단순 조회보다  
회계 운영 통제와 보고 기능이 중심이 된다.
