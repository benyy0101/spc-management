# 대화 타임라인

## 문서 목적

이 문서는 현재 스레드에서 논의하고 구현한 내용을 시간순으로 정리한 기록이다.

주의:

- 실제 시각 로그가 아니라 대화 흐름 기준의 순차 타임라인이다.
- “언제 무엇을 합의했고, 무엇을 만들었는가”를 빠르게 복기하기 위한 문서다.

---

## 1. 프로젝트 주제 정리

시작 주제:

- `SPC 구조 금융상품 관리시 COA, 분개, 원장, 재무제표 생성까지 포괄하는 회계 시스템`
- 대상 도메인:
  - 선박 유동화 펀드
  - SPC
  - 다양한 금융상품

초기 판단:

- 이 프로젝트는 단순 CRUD가 아니라 `금융상품 엔진 + 회계 엔진` 성격을 가진다.
- 핵심은 화면보다 먼저 `거래 이벤트 -> 분개 -> 원장 -> 재무제표` 흐름을 정확히 정의하는 것이다.

---

## 2. 도메인 학습 범위 확정

초기 대화에서 아래를 정리했다.

- 사용자가 바로 아키텍처 질문을 할 준비가 되었는지 판단하는 기준
- 기술보다 먼저 알아야 하는 도메인 체크리스트
- 회계 시스템 개발 전에 필요한 학습 순서

핵심 결론:

- 먼저 도메인과 회계 모델을 이해해야 한다.
- 특히 아래를 설명할 수 있어야 한다.
  - 거래와 분개의 차이
  - COA와 관리차원
  - 원장과 재무제표의 연결
  - SPC / 펀드 / 투자자 / 자산 구조
  - 이자 발생 / 수취 / 상환 / 평가 / 마감

---

## 3. 도메인 문서 세트 작성

사용자 요청에 따라 도메인 이해를 위한 md 문서를 작성했다.

생성 범위:

- 체크리스트 문서 세트
- 용어집
- 도메인 README

핵심 방향:

- 학습 문서이면서 동시에 개발 기준 문서가 되도록 구성
- 각 문서에 `왜 중요한가`, `핵심 이론`, `확인 질문`, `개발 기준` 반영

대표 문서:

- `docs/domain/README.md`
- `docs/domain/00-glossary.md`
- `docs/domain/01-accounting-flow.md`
- `docs/domain/21-core-scenarios.md`

---

## 4. 프로젝트 기획서 작성

도메인 문서를 source of truth로 삼아 프로젝트 기획서를 작성했다.

기획서에 포함된 항목:

- 프로젝트 성격과 주제
- 목표
- 필수 기능
- 취약점 및 고려사항
- 기술 스택
- 추가 운영 요소

이후 사용자와 범위를 구체화했다.

확정된 주요 전제:

- 범위는 최대한 넓게 가져감
- 회계 기준은 `일반기업회계기준`
- 투자자 배분까지 포함
- 운영 기준 통화는 `USD`
- 보고는 `USD 기본 + KRW 병행`
- 재무제표는 `BS / PL / Cash Flow` 모두 포함
- 외부 SaaS 형태
- 범용적 사용 지향

---

## 5. TDD 전략과 fixture 중심 접근 확정

사용자가 예시 데이터 세트를 먼저 만들고 싶다고 제안했고, 이를 채택했다.

결론:

- 이 프로젝트는 일반 seed보다 `fixture-first`가 맞다.
- 핵심은 코드가 아니라 아래 정합성 검증이다.
  - 입력 이벤트
  - 기대 분개
  - 기대 원장
  - 기대 재무제표
  - 기대 투자자 배분

추가로 정한 기준:

- 투자자 배분 1차 방식은 `pro-rata`
- 고급 waterfall / hurdle / carry는 후속 확장
- 현금흐름표는 `간접법`
- fixture 포맷은 `YAML`

---

## 6. fixture와 기대 분개 카탈로그 구축

먼저 공통 마스터와 시나리오 카탈로그를 만들었다.

작성 범위:

- 공통 마스터 데이터
- COA 초안
- 환율 기준
- 시나리오 인덱스
- scenario-001 ~ scenario-013 초안

시나리오 예시:

- 투자자 출자
- 펀드의 SPC 출자
- SPC의 대출채권 취득
- 차입 실행
- 이자 accrual
- 이자 수취
- 원금 상환
- 평가
- 손상
- 외화
- 워터폴
- 월말 결산
- 투자자 배분

이후 자동분개 엔진 기준의 `기대 분개 카탈로그`를 별도 문서로 정리했다.

핵심 목적:

- 이벤트 타입별 분개 규칙 명문화
- 코드보다 먼저 회계 정답표 확보

---

## 7. 스키마와 데이터베이스 전략 확정

초기 스택과 멀티테넌시, 정규화, DB 격리 전략을 논의했다.

합의된 방향:

- `단일 DB + tenant_id`로 시작
- 이후 schema / DB 분리로 확장 가능하게 설계
- 원천 데이터는 정규화
- 읽기 모델은 필요 시 비정규화
- RDB를 기본 선택
- 로컬 개발 DB는 Docker PostgreSQL

핵심 이유:

- 회계 시스템은 데이터 중복과 정합성 붕괴가 치명적
- 관계, 트랜잭션, 기준일 집계, 감사 추적이 중요

---

## 8. 백엔드 스택 재정립

초기에는 NestJS/Prisma/TypeORM/Drizzle/Fastify 등을 비교 검토했다.

최종 방향:

- 1차 목표: MVP를 가장 빠르고 가볍게
- 2차 목표: 확장 가능성과 정교한 쿼리
- 언제든 마이그레이션 가능하게 계층 분리

권장 스택으로 정리한 것:

- `Fastify + TypeScript`
- `PostgreSQL`
- `Drizzle`
- `Next.js`
- `Tailwind + shadcn/ui`

---

## 9. Drizzle 스키마, 마이그레이션, seed, fixture 검증

이후 실제 구현에 들어갔다.

진행 순서:

1. Drizzle schema 초안 작성
2. SQL migration 생성
3. fixture seed / loader 작성
4. fixture 검증 테스트 작성

완성된 구조:

- Drizzle schema
- migration SQL
- YAML fixture loader
- DB seed 경로
- fixture 기대값 vs DB 결과 검증

이 단계에서 회계/DB 코어가 실제로 작동하는 기반이 생겼다.

---

## 10. domain / application 계층 구현

다음으로 회계 코어 로직을 프레임워크 밖으로 분리했다.

추가한 계층:

- `packages/domain`
  - journal rules
  - journal draft 생성
- `packages/application`
  - use case orchestration
  - posting 흐름
  - idempotency
  - closed period 차단

이후 아래 테스트를 닫았다.

- fixture vs domain journal 직접 비교 테스트
- application 유스케이스 테스트

핵심 의미:

- 회계 규칙 엔진이 DB, HTTP와 분리된 형태로 자리잡음

---

## 11. Git 초기화와 기준 커밋

프로젝트 구조가 안정된 뒤 git 저장소를 초기화했다.

주요 작업:

- `git init`
- `.gitignore` 정리
- 기준 커밋 생성

목적:

- 이후 서버/웹 기능을 단계적으로 커밋 가능한 상태로 만들기

---

## 12. API 1차 MVP 구축

서버 최소 골격을 만들고 핵심 API를 구현했다.

1차 핵심 API:

- `POST /accounting-events`
- `GET /events`
- `GET /events/:id`
- `GET /journals`
- `GET /journals/:id`
- `GET /ledger/trial-balance`

추가로:

- Swagger `/docs`
- reference 조회 API
  - `GET /tenants`
  - `GET /entities`
  - `GET /accounts`
  - `GET /products`
  - `GET /contracts`

이 단계의 의미:

- 회계 이벤트 입력부터 전표와 시산표 조회까지 서버 코어가 닫힘

---

## 13. 웹 1차 MVP 구축

클라이언트는 `apps/web`로 구성했다.

합의한 원칙:

- Next.js + Tailwind + shadcn/ui
- React Bits는 후순위
- 먼저 운영 콘솔 구조를 안정화

구현한 주요 화면:

- 대시보드
- 이벤트 입력
- 이벤트 목록
- 전표 목록
- 전표 상세
- Trial Balance
- Accounts / Products / Contracts / Entities 조회

추가한 것:

- 좌측 네비게이션
- locale 토글
- 한국어 모드
- Pretendard 한글 폰트 모드

이 시점에 1차 웹 흐름은 완성됐다.

---

## 14. 1차 / 2차 MVP 문서화

이후 제품 범위를 명확히 하기 위해 아래 문서를 정리했다.

- `docs/mvp-phase-1.md`
- `docs/mvp-phase-2.md`
- `docs/web-mvp-plan.md`
- `docs/server-phase-2-api-roadmap.md`

핵심 정의:

- 1차 MVP:
  - 이벤트 -> 전표 -> 시산표 검증
- 2차 MVP:
  - 재무제표
  - 마감
  - 투자자 배분
  - 기준정보 관리
  - 운영 예외 처리
  - 감사

---

## 15. 서버 2차 MVP 구현 시작

2차 서버는 재무제표부터 시작했다.

구현 범위:

- `GET /financial-statements/balance-sheet`
- `GET /financial-statements/profit-loss`
- `GET /financial-statements/cash-flow`
- `GET /statement-mappings`
- `POST /statement-mappings`
- `PATCH /statement-mappings/:id`

핵심 의미:

- trial balance를 실제 보고서 API로 확장

---

## 16. close period / lifecycle 구현

이후 회계 운영 통제를 붙였다.

구현 범위:

- `GET /close-periods`
- `POST /close-periods`
- `PATCH /close-periods/:id/status`

추가 동작:

- closed period에 대한 posting 차단
- close lifecycle 상태 전이
  - `open`
  - `closing`
  - `closed`
  - `reopened`

핵심 의미:

- 숫자를 만드는 것에서 끝나지 않고, 기간을 통제할 수 있게 됨

---

## 17. investor allocation 구현

다음으로 투자자 배분 API를 추가했다.

구현 범위:

- `GET /investor-positions`
- `POST /allocations/run`
- `GET /allocations`
- `GET /allocations/:id`
- `GET /investors/:id/allocation-history`

구현 기준:

- `pro_rata`만 지원

핵심 의미:

- 프로젝트 요구사항에 포함된 투자자 배분이 실제 기능으로 올라옴

---

## 18. 운영 예외 처리 API 구현

이후 운영 예외 처리 기능을 서버에 붙였다.

구현 범위:

- `POST /journals/:id/reverse`
- `POST /events/:id/reprocess`
- `POST /journals/manual`
- `POST /journals/:id/approve`

추가한 것:

- `GET /audit-logs`
- 운영 액션 감사 로그 적재

감사 로그 대상 예시:

- `post_accounting_event`
- `create_manual_journal`
- `approve_journal`
- `reverse_journal`
- `reprocess_event`

핵심 의미:

- 서버 2차 MVP의 실무 운영 API가 대부분 닫힘

---

## 19. 2차 웹 계획 수립

서버 2차 API가 자리잡은 뒤, 웹 2차 계획서를 작성했다.

문서:

- `docs/web-mvp-phase-2.md`

웹 2차 목표:

- 재무제표 화면
- close period 운영 화면
- allocation 운영 화면
- 전표 운영 예외 처리 화면
- audit log 화면
- 기준정보 관리 준비

---

## 20. 2차 웹 네비 확장

이후 웹 네비게이션을 2차 범위까지 확장했다.

새 섹션:

- `Financial`
- `Operations`

추가된 주요 진입 페이지 골격:

- Balance Sheet
- Profit & Loss
- Cash Flow
- Statement Mappings
- Close Periods
- Allocations
- Investor Positions
- Journal Actions
- Audit Logs

---

## 21. 재무제표 3종 웹 연결

웹 2차 구현은 재무제표부터 시작했다.

연결된 화면:

- `/financial-statements/balance-sheet`
- `/financial-statements/profit-loss`
- `/financial-statements/cash-flow`

연결 API:

- `GET /financial-statements/balance-sheet`
- `GET /financial-statements/profit-loss`
- `GET /financial-statements/cash-flow`

추가한 것:

- 공통 financial statement API 래퍼
- 공통 재무제표 테이블

---

## 22. statement mappings 웹 연결

이후 재무제표 매핑 관리 화면을 실제 기능으로 바꿨다.

구현 범위:

- tenant별 매핑 목록 조회
- 매핑 생성 dialog
- 매핑 수정 dialog

연결 API:

- `GET /statement-mappings`
- `POST /statement-mappings`
- `PATCH /statement-mappings/:id`

추가한 것:

- Next.js 프록시 route
- statement mapping API 래퍼
- 클라이언트 mutation + `router.refresh()`

---

## 23. 제품 문구 정리

마지막으로 사용자가 제품 화면에서 `MVP`, `1차`, `2차`, `Phase` 같은 내부 개발 용어가 보이지 않게 해달라고 요청했다.

정리한 내용:

- sidebar badge
- app shell header
- dashboard 문구
- 재무제표/운영 공통 shell
- 이벤트 입력 설명

결과:

- 제품 화면에서는 내부 단계 용어를 제거
- 사용자 관점 문구로 통일

---

## 24. 현재 상태 요약

현재 기준으로 프로젝트는 아래 단계까지 왔다.

### 도메인/문서

- 도메인 체크리스트
- 용어집
- 기획서
- MVP 1차/2차 문서
- 서버/웹 계획서

### 데이터/회계 코어

- Drizzle schema
- SQL migration
- fixture / seed
- 기대 분개 카탈로그
- domain / application 계층
- fixture 검증 테스트

### 서버

- 1차 회계 흐름 API
- 2차 재무제표
- close lifecycle
- investor allocation
- reverse / reprocess / manual / approve
- audit logs

### 웹

- 1차 운영 콘솔
- 한국어 모드 + Pretendard
- 2차 네비 확장
- 재무제표 3종
- statement mappings 관리

---

## 25. 다음 자연스러운 작업

현재 다음으로 가장 자연스러운 작업은 아래다.

1. `close-periods` 웹 실제 연결
2. `allocations` 웹 실제 연결
3. `audit-logs` 웹 실제 연결
4. `journal operations` 웹 실제 연결

즉 현재 시점의 중심축은

- 서버 신규 구현보다는
- **이미 만든 서버 기능을 웹 운영 화면으로 붙이는 일**

이다.
