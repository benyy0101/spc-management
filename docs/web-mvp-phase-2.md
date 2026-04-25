# Web MVP Phase 2 계획서

## 문서 목적

이 문서는 [docs/mvp-phase-2.md](/Users/tooning/spc/docs/mvp-phase-2.md:1)와 [docs/server-phase-2-api-roadmap.md](/Users/tooning/spc/docs/server-phase-2-api-roadmap.md:1)를 기준으로,  
`apps/web`의 2차 MVP 범위를 고정한다.

목적은 아래와 같다.

- 이미 구현된 서버 2차 API를 어떤 화면으로 노출할지 정한다.
- 2차 웹 범위를 운영 흐름 기준으로 잘라낸다.
- 어떤 화면부터 붙여야 하는지 우선순위를 정한다.
- 1차 웹과 2차 웹의 경계를 명확히 한다.

---

## 2차 웹의 성격

1차 웹이 `이벤트 입력 -> 이벤트/전표 확인 -> 시산표 검증`을 위한 운영 콘솔이었다면,  
2차 웹은 그 위에 아래 기능을 올리는 **실운영 화면**이다.

- 재무제표 조회
- 마감 운영
- 투자자 배분 운영
- 기준정보 관리
- 전표 운영 예외 처리
- 감사 추적

즉 2차 웹은 “회계 엔진이 동작하는가”를 보는 화면이 아니라,  
**운영자가 회계 SaaS를 실제로 굴릴 수 있게 만드는 화면**이다.

---

## 최상위 원칙

- 서버에 이미 있는 도메인 규칙을 프론트에서 재구현하지 않는다.
- 화면은 API 단위가 아니라 운영 흐름 단위로 설계한다.
- 1차 화면을 버리지 않고, 2차 기능을 섹션과 액션으로 확장한다.
- 회계 상태 전이(`draft`, `approved`, `posted`, `reversed`, `closed`)는 시각적으로 명확해야 한다.
- 한국어 모드와 Pretendard 기준을 유지한다.

---

## 현재 웹에서 이미 되는 것

- 대시보드
- 이벤트 입력
- 이벤트 목록
- 전표 목록
- 전표 상세
- Trial Balance
- Accounts / Products / Contracts / Entities 조회
- 한/영 locale 토글

즉 2차 웹은 빈 프로젝트가 아니라,  
1차 운영 콘솔 위에 기능을 올리는 형태로 진행한다.

---

## 2차 웹 목표

2차 웹의 목표는 아래 6개다.

1. 재무제표를 화면에서 조회하고 검토할 수 있다.
2. 회계 기간을 닫고 다시 열 수 있다.
3. 투자자 배분을 실행하고 결과를 검토할 수 있다.
4. 수기전표, 승인, 역분개, 재처리를 운영 화면에서 실행할 수 있다.
5. 감사 로그를 조회해 운영 이력을 추적할 수 있다.
6. 기준정보를 조회 중심에서 관리 중심으로 확장할 준비를 마친다.

---

## 2차 화면 범위

### 1. 재무제표

라우트 후보:

- `/financial-statements/balance-sheet`
- `/financial-statements/profit-loss`
- `/financial-statements/cash-flow`
- `/statement-mappings`

연결 API:

- `GET /financial-statements/balance-sheet`
- `GET /financial-statements/profit-loss`
- `GET /financial-statements/cash-flow`
- `GET /statement-mappings`
- `POST /statement-mappings`
- `PATCH /statement-mappings/:id`

왜 필요한가:

- 2차 MVP의 가장 큰 목표가 시산표를 재무제표로 연결하는 것이기 때문이다.
- 서버는 이미 재무제표 조회와 매핑 관리가 가능하므로, 웹이 이를 운영 가능한 형태로 노출해야 한다.

핵심 화면 요소:

- tenant / entity / date range 필터
- statement line table
- line amount summary
- statement mapping 목록 및 수정 dialog

---

### 2. 마감 운영

라우트 후보:

- `/close-periods`

연결 API:

- `GET /close-periods`
- `POST /close-periods`
- `PATCH /close-periods/:id/status`

왜 필요한가:

- 2차부터는 숫자를 만드는 것뿐 아니라 기간을 통제해야 한다.
- 마감 상태가 화면에서 보이지 않으면 운영자가 posting 차단 이유를 설명할 수 없다.

핵심 화면 요소:

- 기간 목록
- status badge
- `open`, `closing`, `closed`, `reopened` 상태 전이 버튼
- entity / book / status 필터
- close create form

주의:

- 상태 전이는 강한 destructive action이 아니지만 운영 의미가 크므로 확인 dialog가 필요하다.

---

### 3. 투자자 배분

라우트 후보:

- `/allocations`
- `/allocations/[id]`
- `/investor-positions`

연결 API:

- `GET /investor-positions`
- `POST /allocations/run`
- `GET /allocations`
- `GET /allocations/:id`
- `GET /investors/:id/allocation-history`

왜 필요한가:

- 프로젝트 요구사항에 투자자 배분이 포함돼 있고, 서버도 `pro_rata` 기준으로 이미 구현돼 있다.
- 2차 웹에서는 “실행”과 “결과 검토”가 모두 가능해야 한다.

핵심 화면 요소:

- fund entity 선택
- 기간 선택
- source amount 입력
- run allocation 버튼
- 배분 결과 테이블
- investor history drill-down

주의:

- 2차는 `pro_rata`만 지원한다는 점을 UI에 명시해야 한다.

---

### 4. 전표 운영 예외 처리

라우트 후보:

- `/journals/manual/new`
- `/operations/journals`
- 기존 `/journals/[id]` 확장
- 기존 `/events/[id]` 확장 여지

연결 API:

- `POST /journals/manual`
- `POST /journals/:id/approve`
- `POST /journals/:id/reverse`
- `POST /events/:id/reprocess`

왜 필요한가:

- 2차 웹은 읽기 화면을 넘어서 운영 액션을 실행할 수 있어야 한다.
- manual / approve / reverse / reprocess는 회계 운영 예외 처리의 핵심이다.

핵심 화면 요소:

- 수기전표 입력 폼
- 전표 상태 badge
- approve 버튼
- reverse 버튼
- source event 기준 reprocess 버튼
- 실행 후 결과 toast / refresh

주의:

- 현재 approve는 `draft -> approved`만 허용한다.
- 현재 manual journal은 생성 즉시 `posted`다.
- 즉 approve UI는 장기적으로 draft manual journal과 연결될 예정이지만, 2차 현재 범위에서는 서버 동작을 노출하는 수준으로 둔다.

---

### 5. 감사 로그

라우트 후보:

- `/audit-logs`

연결 API:

- `GET /audit-logs`

왜 필요한가:

- 수기전표, 승인, 역분개, 재처리, posting 이력을 운영자가 확인해야 한다.
- 서버는 이미 `post_accounting_event`, `create_manual_journal`, `approve_journal`, `reverse_journal`, `reprocess_event`를 기록한다.

핵심 화면 요소:

- action type 필터
- resource type / resource id 필터
- 시간순 로그 목록
- before/after payload view dialog

---

### 6. 기준정보 관리 준비

라우트 후보:

- 기존 `/accounts`, `/products`, `/contracts`, `/entities` 확장

연결 API:

- 현재는 read API 중심
- 추후 create/update API 추가 시 이어서 연결

왜 필요한가:

- 2차 MVP 전체 흐름에서 기준정보는 운영 기반이기 때문이다.
- 다만 서버 write API가 완전히 닫히기 전까지는 웹도 먼저 “조회 강화 + 편집 준비 구조”로 간다.

핵심 화면 요소:

- list/detail pattern
- 향후 create/edit drawer를 수용할 수 있는 레이아웃

---

## 화면 우선순위

2차 웹의 구현 우선순위는 아래 순서를 권장한다.

1. 재무제표
2. close periods
3. allocations
4. manual journal / approve / reverse / reprocess
5. audit logs
6. reference management enhancement

이 순서가 맞는 이유:

- 재무제표는 2차 MVP의 대표 기능이다.
- close는 운영 통제의 핵심이다.
- allocation은 프로젝트 요구사항에서 비중이 크다.
- 운영 예외 처리는 그 다음 실무 완성도를 올린다.

---

## 좌측 네비 확장 계획

현재 1차 네비에 아래 섹션을 추가한다.

### `Core`

- `Dashboard`
- `New Event`
- `Events`
- `Journals`
- `Trial Balance`

### `Financial`

- `Balance Sheet`
- `Profit & Loss`
- `Cash Flow`
- `Statement Mappings`

### `Operations`

- `Close Periods`
- `Allocations`
- `Investor Positions`
- `Audit Logs`

### `Reference`

- `Accounts`
- `Products`
- `Contracts`
- `Entities`

원칙:

- 1차의 흐름을 깨지 않는다.
- 2차는 새 섹션을 추가하는 방식으로 확장한다.

---

## 공통 UI/상태 패턴

2차 웹에서 반드시 공통화할 패턴은 아래다.

- `PageHeader`
- `FilterBar`
- `DataTableShell`
- `StatusBadge`
- `ConfirmDialog`
- `MutationToolbar`
- `EmptyState`
- `JSONPreviewDialog`

왜 필요한가:

- 2차 화면은 조회와 액션이 섞인다.
- 각 페이지마다 상태 badge, 필터, 실행 버튼, 확인 dialog가 반복된다.

---

## 데이터 계층 계획

### `src/lib/api`

추가될 모듈:

- `financial-statements.ts`
- `close-periods.ts`
- `allocations.ts`
- `operations.ts`
- `audit-logs.ts`

원칙:

- API 호출 함수와 UI 변환 로직을 분리한다.
- 회계 계산은 클라이언트에서 하지 않는다.
- 날짜/통화 포맷만 화면용으로 처리한다.

### `src/features`

추가될 기능 묶음:

- `features/financial-statements`
- `features/close-periods`
- `features/allocations`
- `features/operations`
- `features/audit-logs`

원칙:

- 페이지는 얇게 유지한다.
- 필터, 테이블, 다이얼로그, 폼을 feature 내부로 캡슐화한다.

---

## 상태 관리 원칙

- 2차도 글로벌 상태를 무겁게 두지 않는다.
- URL query를 가능한 필터 상태 source of truth로 사용한다.
- mutation 후에는 명시적으로 revalidate / refresh 한다.
- approval, close, reverse 같은 액션은 optimistic update보다 서버 응답 재조회가 안전하다.

---

## 퍼블리싱 방향

- 1차에서 잡은 shadcn/ui + Tailwind 구조를 유지한다.
- 한국어 모드에서 Pretendard를 기본으로 유지한다.
- 2차 화면은 “금융 운영 콘솔”처럼 밀도 있게 설계한다.
- decorative motion보다 상태 변화와 위험 액션 강조가 중요하다.

시각 원칙:

- `approved`, `posted`, `reversed`, `closed` 상태는 색과 텍스트로 분명히 구분
- destructive / irreversible 성격의 액션은 dialog와 설명 문구 제공
- 재무제표와 시산표는 표의 가독성 우선

---

## 제외 범위

2차 웹에서 당장 하지 않는 것:

- 권한/인증 UI 전체
- 복잡한 waterfall 배분 UI
- 고급 차트 중심 대시보드
- 모바일 전용 별도 UX 최적화
- 대량 일괄 편집

---

## 완료 기준

2차 웹은 아래 조건을 만족하면 완료로 본다.

1. 재무제표 3종을 화면에서 조회할 수 있다.
2. close period를 생성하고 상태를 변경할 수 있다.
3. allocation을 실행하고 결과를 확인할 수 있다.
4. 수기전표, 승인, 역분개, 재처리 액션을 화면에서 실행할 수 있다.
5. audit log를 필터링해서 조회할 수 있다.
6. 1차 웹 흐름과 2차 웹 흐름이 같은 네비게이션 체계 안에서 연결된다.

---

## 2차 웹 요약

2차 웹은  
1차의 “검증용 운영 콘솔”을  
“재무제표, 마감, 배분, 운영 예외 처리, 감사 추적이 가능한 실운영 화면”으로 확장하는 단계다.

즉 2차 웹의 핵심은 예쁜 대시보드가 아니라,  
**서버에 이미 구현된 회계 운영 기능을 사람이 안전하게 다룰 수 있게 만드는 것**이다.
