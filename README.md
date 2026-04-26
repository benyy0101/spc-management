# SPC 구조 금융상품 회계 시스템

SPC, 펀드, 투자자 구조를 전제로 금융상품 lifecycle 이벤트를 회계 분개, 원장, 재무제표까지 연결하는 도메인 중심 회계 시스템 프로젝트다.  
이 저장소는 기획 문서, 회계 도메인 규칙, fixture 기반 시나리오, API, 웹 UI를 한 곳에서 관리하는 모노레포다.

기준 기획 문서: [docs/project-plan.md](/Users/tooning/spc/docs/project-plan.md:1)

## 1. 개요

### 프로젝트 한 줄 정의

금융상품과 계약에서 발생한 사건을 회계주체별로 정확한 분개와 원장으로 전환하고, 기준일 재무제표까지 산출하는 시스템

### 프로젝트 배경

선박 유동화 펀드와 SPC 구조에서는 거래, 계약, 회계 숫자가 서로 강하게 연결된다.  
이 프로젝트는 수기 처리에 의존하던 회계 흐름을 표준화하고, 이벤트부터 분개, 원장, 보고 숫자까지 추적 가능한 구조로 만드는 것을 목표로 한다.

### 핵심 목표

- 금융상품 lifecycle 이벤트를 중심으로 회계 자동화를 구현한다.
- 회계주체별 장부를 독립적으로 유지한다.
- 기준일 잔액과 재무제표를 재현 가능하게 만든다.
- 감사 대응이 가능한 이력과 통제를 제공한다.
- 향후 외화, 평가, 손상, 워터폴, 투자자 배분까지 확장 가능한 구조를 확보한다.

### 주요 사용자와 대상 구조

- 운용사
- 펀드 관리자
- SPC 회계 담당자
- 투자자 배분 및 보고 담당자

주요 관리 대상:

- 펀드
- SPC
- 투자자
- 금융상품 계약
- 회계 이벤트
- 분개 / 원장 / 재무제표

### MVP 범위

현재 문서 기준 MVP는 "전체 회계 시스템 완성"보다 "핵심 회계 경로 검증"에 집중한다.

1차 MVP 핵심 흐름:

1. 회계 이벤트 입력
2. 자동분개 생성
3. 전표 저장
4. 전표 검토
5. 시산표 검증

현재 구현 범위에 포함된 확장 기능:

- 재무상태표 / 손익계산서 / 현금흐름표
- 투자자 배분
- 마감 운영
- 승인 / 수기분개 / 감사 로그
- 재무제표 매핑
- 회계 단위 CRUD

추가 예정 범위:

- 계정과목 / 상품 / 계약 CRUD
- 손상 / 평가 / 외화 / 워터폴

### 도메인 기준

- 회계 기준: 일반기업회계기준
- 기준 통화: USD
- 병행 보고 통화: KRW 확장 고려
- 우선 자산군: `loan_receivable`
- 멀티테넌시: 단일 DB + `tenant_id`

### 문서 체계

- 전체 기획: [docs/project-plan.md](/Users/tooning/spc/docs/project-plan.md:1)
- 1차 MVP: [docs/mvp-phase-1.md](/Users/tooning/spc/docs/mvp-phase-1.md:1)
- 2차 MVP: [docs/mvp-phase-2.md](/Users/tooning/spc/docs/mvp-phase-2.md:1)
- 개발 순서: [docs/development-plan.md](/Users/tooning/spc/docs/development-plan.md:1)
- 프로젝트 구조: [docs/project-structure.md](/Users/tooning/spc/docs/project-structure.md:1)
- 도메인 기준 문서: [docs/domain/README.md](/Users/tooning/spc/docs/domain/README.md:1)

## 2. 프로젝트 폴더 구조

아래 구조는 현재 저장소 기준으로 정리한 것이다.

```text
spc/
  apps/
    api/                # Fastify 기반 API 서버
    web/                # Next.js 기반 웹 애플리케이션
  packages/
    application/        # 유스케이스, 포트, DTO
    db/                 # Drizzle 스키마, 마이그레이션, 시드
    domain/             # 회계 규칙, 분개 생성 로직
    test-fixtures/      # fixture 로더 및 타입
  docs/                 # 기획, 도메인, 개발 문서
  fixtures/
    master/             # 공통 마스터 데이터
    scenarios/          # 시나리오별 입력/기대 결과
  expected/             # 필요 시 기대 산출물 보관
  docker-compose.yml    # 로컬 PostgreSQL 실행
  package.json          # 루트 워크스페이스 스크립트
  pnpm-workspace.yaml   # pnpm workspace 설정
  turbo.json            # turbo 파이프라인 설정
```

### 디렉터리 역할

#### `apps/api`

- API 엔드포인트 제공
- 회계 이벤트 입력 및 조회
- 원장 / 재무제표 / 배분 / 마감 관련 읽기 모델 제공
- DB 어댑터를 통해 application/domain 계층과 연결

#### `apps/web`

- 운영자가 회계 흐름을 직접 확인하는 UI
- 이벤트 입력, 전표 조회, 시산표 검토, 기준정보 조회
- 재무제표 / 배분 / 마감 / 감사 로그 화면 확장 포함

#### `packages/domain`

- 회계 규칙의 핵심
- 이벤트를 분개로 전환하는 로직
- 도메인 오류와 타입 정의

#### `packages/application`

- 유스케이스 계층
- 저장소 포트, 감사 로그 포트, 입력 DTO 관리

#### `packages/db`

- Drizzle 스키마
- 마이그레이션
- fixture 기반 시드 및 검증

#### `fixtures`

- 코드보다 먼저 고정되는 도메인 정답지
- 마스터 데이터와 시나리오 기대값 보관

#### `docs`

- 기획서
- MVP 범위 문서
- 도메인 설명서
- 스키마 / 스택 / 개발 계획 문서

## 3. 기능 명세

기능 명세는 "현재 구현/노출 중인 기능"과 "계획된 기능"을 함께 관리할 수 있도록 정리했다.  
향후 스크린샷이나 영상 첨부를 고려해 `화면/엔드포인트`, `설명`, `시각 자료` 칼럼을 분리했다.

### 3.1 핵심 회계 흐름

| 기능             | 화면 / 엔드포인트                               | 설명                                                        | 상태 | 시각 자료                |
| ---------------- | ----------------------------------------------- | ----------------------------------------------------------- | ---- | ------------------------ |
| 회계 이벤트 입력 | `POST /accounting-events`, 웹 `New Event`       | 회계 이벤트를 입력하면 도메인 규칙으로 자동분개를 생성한다. | 구현 | 스크린샷 / GIF 추가 예정 |
| 이벤트 목록 조회 | `GET /events`, 웹 `Events`                      | 입력된 이벤트를 기간/테넌트 기준으로 조회한다.              | 구현 | 스크린샷 추가 예정       |
| 이벤트 상세 조회 | `GET /events/:id`                               | 이벤트 원본 데이터와 처리 결과를 추적한다.                  | 구현 | 스크린샷 추가 예정       |
| 전표 목록 조회   | `GET /journals`, 웹 `Journals`                  | 생성된 전표를 목록으로 검토한다.                            | 구현 | 스크린샷 추가 예정       |
| 전표 상세 조회   | `GET /journals/:id`, 웹 `Journal Detail`        | 전표 헤더와 분개 라인을 상세히 확인한다.                    | 구현 | 스크린샷 추가 예정       |
| 시산표 조회      | `GET /ledger/trial-balance`, 웹 `Trial Balance` | 계정별 차변/대변/잔액 정합성을 검토한다.                    | 구현 | 스크린샷 추가 예정       |

### 3.2 기준정보 관리

| 기능               | 화면 / 엔드포인트                | 설명                                          | 상태      | 시각 자료          |
| ------------------ | -------------------------------- | --------------------------------------------- | --------- | ------------------ |
| 테넌트 조회        | `GET /tenants`                   | 회계 데이터의 상위 업무 구분 단위를 조회한다. | 구현      | 필요 시 추가       |
| 엔터티 조회        | `GET /entities`, 웹 `Entities`   | 펀드, SPC 등 회계주체를 조회한다.             | 구현      | 스크린샷 추가 예정 |
| 엔터티 생성/수정   | `POST /entities`, `PATCH /entities/:id` | 회계주체를 등록, 수정, 비활성화한다.      | 구현      | 스크린샷 추가 예정 |
| 계정과목 조회      | `GET /accounts`, 웹 `Accounts`   | COA 기준 계정과목을 조회한다.                 | 구현      | 스크린샷 추가 예정 |
| 상품 조회          | `GET /products`, 웹 `Products`   | 금융상품 마스터를 조회한다.                   | 구현      | 스크린샷 추가 예정 |
| 계약 조회          | `GET /contracts`, 웹 `Contracts` | 상품별 계약 조건과 구조를 조회한다.           | 구현      | 스크린샷 추가 예정 |
| 계정/상품/계약 CRUD | API 및 웹 확장 예정              | 기준정보를 등록, 수정, 비활성화한다.          | 구현 예정 | 스크린샷 추가 예정 |

### 3.3 재무제표 및 보고

| 기능               | 화면 / 엔드포인트       | 설명                                   | 상태 | 시각 자료          |
| ------------------ | ----------------------- | -------------------------------------- | ---- | ------------------ |
| 재무상태표 조회    | 웹 `Balance Sheet`      | 기준일 자산/부채/자본 잔액을 조회한다. | 구현 | 스크린샷 추가 예정 |
| 손익계산서 조회    | 웹 `Profit & Loss`      | 기간 기준 수익/비용 흐름을 조회한다.   | 구현 | 스크린샷 추가 예정 |
| 현금흐름표 조회    | 웹 `Cash Flow`          | 간접법 기준 현금흐름표를 조회한다.     | 구현 | 스크린샷 추가 예정 |
| 재무제표 매핑 관리 | 웹 `Statement Mappings` | 계정과 재무제표 라인 매핑을 관리한다.  | 구현 | 스크린샷 추가 예정 |

### 3.4 운영 통제 및 후속 기능

| 기능                              | 화면 / 엔드포인트                      | 설명                                                | 상태 | 시각 자료                 |
| --------------------------------- | -------------------------------------- | --------------------------------------------------- | ---- | ------------------------- |
| 마감 관리                         | 웹 `Close Periods`                     | 회계 기간 마감 상태를 조회/관리한다.                | 구현 | 스크린샷 추가 예정        |
| 투자자 배분                       | 웹 `Allocations`                       | pro-rata 기준 배분 실행과 결과 조회를 제공한다.     | 구현 | 스크린샷 / 영상 추가 예정 |
| 투자자 포지션                     | 웹 `Investor Positions`                | 투자자 지분, 약정, 납입금과 배분 이력을 확인한다.   | 구현 | 스크린샷 추가 예정        |
| 감사 로그 조회                    | 웹 `Audit Logs`                        | 변경 및 처리 이력을 확인한다.                       | 구현 | 스크린샷 추가 예정        |
| 수기분개 / 승인 / 역분개 / 재처리 | 웹 `Journal Actions` 및 관련 API       | 내부통제와 운영 보완 기능이다.                      | 구현 | 영상 추가 예정            |

### 3.5 현재 우선 지원 이벤트

문서와 코드 기준으로 우선 지원하거나 fixture로 관리되는 주요 이벤트는 다음과 같다.

- 투자자 출자
- 펀드의 SPC 출자
- SPC의 자산 취득
- 차입 실행
- 이자 발생
- 이자 수취
- 원금 상환
- 월말 마감
- 공정가치 평가
- 손상
- 외화 환산
- 현금 워터폴
- 투자자 배분

### 3.6 기능 명세 작성 규칙 제안

향후 README 또는 별도 문서에서 기능을 계속 확장할 때는 아래 형식을 권장한다.

| 항목      | 내용 예시                             |
| --------- | ------------------------------------- |
| 기능명    | `전표 상세 조회`                      |
| 사용자    | 회계 담당자                           |
| 목적      | 분개 라인과 원장 반영 결과 검토       |
| 입력      | tenant, journal id                    |
| 출력      | journal header, lines, source event   |
| 규칙      | 차변/대변 합계 일치, tenant 범위 강제 |
| 예외      | 존재하지 않는 전표, tenant 불일치     |
| 화면 자료 | 스크린샷 1장, 30초 데모 영상          |

## Demo

README에서 가장 먼저 보여줄 데모는 "이벤트 입력 → 자동분개 생성 → 전표 검토 → 시산표 검증" 흐름이다.  
현재 구현 상태와 프로젝트 목표를 가장 짧고 명확하게 설명할 수 있는 데모 시나리오이기도 하다.

### 1. 회계 이벤트 입력

가장 먼저 보여줄 화면은 웹의 `New Event` 화면이다.  
사용자가 어떤 입력을 넣는지, 그리고 이 시스템이 어떤 회계 문맥을 기준으로 동작하는지 보여주는 시작점이다.

권장 캡처 포인트:

- 이벤트 유형 선택
- tenant / entity / product / contract 선택
- accounting date / trade date / amount 입력
- posting context 영역

권장 설명 문구:

> 운용/회계 담당자가 회계 이벤트를 입력하면 시스템이 도메인 규칙에 따라 자동분개를 생성한다.

스크린샷 자리:

```md
![Demo - New Event](./docs/images/demo-new-event.png)
```

### 2. 자동분개 결과 확인

가장 중요한 메인 스크린샷 후보는 `Journal Detail` 화면이다.  
이 프로젝트의 핵심 가치인 "이벤트가 회계 전표로 변환된다"는 점을 가장 직접적으로 보여준다.

권장 캡처 포인트:

- journal no, accounting date, entity, book, status

## 실행 방법

로컬 개발 기준 포트는 아래와 같다.

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

주요 실행 명령:

| 명령어           | 설명                          |
| ---------------- | ----------------------------- |
| `pnpm dev`       | 웹과 API 개발 서버를 함께 실행 |
| `pnpm dev:web`   | 웹 개발 서버 실행             |
| `pnpm dev:api`   | API 개발 서버 실행            |
| `pnpm build`     | 전체 빌드                     |
| `pnpm test`      | 전체 테스트                   |
| `pnpm db:migrate`| DB 마이그레이션 적용          |

웹이 API를 찾지 못하는 경우 아래 환경변수를 명시하면 된다.

```bash
API_BASE_URL=http://localhost:4000
```
- source event 연결 정보
- 차변/대변 분개 라인
- description 또는 posting traceability 정보

권장 설명 문구:

> 입력된 이벤트는 회계 엔진을 통해 전표 헤더와 분개 라인으로 변환되며, 사용자는 생성 결과를 바로 검토할 수 있다.

스크린샷 자리:

```md
![Demo - Journal Detail](./docs/images/demo-journal-detail.png)
```

### 3. 시산표 검증

세 번째 데모 화면은 `Trial Balance`다.  
개별 전표가 끝나는 것이 아니라 계정별 집계 결과까지 이어진다는 점을 보여줘야 시스템의 완결성이 전달된다.

권장 캡처 포인트:

- tenant / entity / as-of date 필터
- 계정별 debit / credit / balance 컬럼
- 합계 행

권장 설명 문구:

> 생성된 전표는 시산표에 반영되며, 회계 담당자는 계정별 차변/대변과 기준일 잔액을 즉시 검증할 수 있다.

스크린샷 자리:

```md
![Demo - Trial Balance](./docs/images/demo-trial-balance.png)
```

### 4. README 배치 권장안

README에 이미지를 넣을 때는 아래 순서를 권장한다.

1. `New Event`
2. `Journal Detail`
3. `Trial Balance`

이 순서를 따르면 사용자는 README만 읽어도 아래 메시지를 자연스럽게 이해할 수 있다.

- 어떤 이벤트를 입력하는 시스템인지
- 입력 결과가 어떻게 전표로 생성되는지
- 최종적으로 어떤 회계 검증 화면까지 연결되는지

## 기술 스택

- Monorepo: `pnpm workspace`, `turbo`
- API: `Fastify`, `TypeScript`
- Web: `Next.js`, `React`, `TypeScript`
- DB: `PostgreSQL`, `Drizzle ORM`
- 테스트/검증: Node test runner, fixture 기반 시나리오 검증

## 실행 방법

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 로컬 DB 실행

```bash
docker compose up -d
```

기본 연결 문자열:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/spc
```

### 3. 마이그레이션 적용

```bash
pnpm db:migrate
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

개별 실행:

```bash
pnpm dev:api
pnpm dev:web
```

## 주요 스크립트

| 명령어             | 설명                      |
| ------------------ | ------------------------- |
| `pnpm dev`         | 전체 개발 서버 실행       |
| `pnpm dev:api`     | API 서버 실행             |
| `pnpm dev:web`     | 웹 앱 실행                |
| `pnpm build`       | 전체 빌드                 |
| `pnpm lint`        | 타입/린트 검증            |
| `pnpm test`        | 전체 테스트               |
| `pnpm db:migrate`  | DB 마이그레이션 적용      |
| `pnpm db:generate` | Drizzle 마이그레이션 생성 |

## Railway 배포

이 저장소는 `pnpm workspace` 기반 shared monorepo이므로 Railway에서 웹과 API를 별도 서비스로 분리해 배포하는 구성을 권장한다.

- API 서비스 config file: `/apps/api/railway.json`
- Web 서비스 config file: `/apps/web/railway.json`

Railway 서비스 설정에서 각 서비스의 Config as Code 경로를 위 절대 경로로 지정하면 된다.

권장 서비스 구성:

1. PostgreSQL
2. API
3. Web

필수 환경변수:

- API: `DATABASE_URL`
- Web: `API_BASE_URL` 또는 `NEXT_PUBLIC_API_BASE_URL`

현재 API 서비스 설정은 deploy 전에 `npx pnpm db:migrate`를 실행하도록 되어 있다.

## 검증 전략

- fixture를 도메인 정답지로 사용한다.
- 이벤트 입력보다 기대 분개와 기대 잔액 정의를 우선한다.
- API, 도메인 규칙, DB seed가 같은 시나리오를 기준으로 검증된다.

관련 문서:

- [docs/test-fixture-strategy.md](/Users/tooning/spc/docs/test-fixture-strategy.md:1)
- [fixtures/README.md](/Users/tooning/spc/fixtures/README.md:1)

## 로드맵

### Phase 1

- 회계 이벤트 입력
- 자동분개
- 전표 조회
- 시산표 검증

### Phase 2

- 재무제표
- 마감
- 투자자 배분
- 운영 통제 강화

### 이후 확장

- 외화
- 평가
- 손상
- 워터폴
- 고도화된 감사 및 승인 체계

## 참고 문서

- [docs/project-plan.md](/Users/tooning/spc/docs/project-plan.md:1)
- [docs/mvp-phase-1.md](/Users/tooning/spc/docs/mvp-phase-1.md:1)
- [docs/mvp-phase-2.md](/Users/tooning/spc/docs/mvp-phase-2.md:1)
- [docs/development-plan.md](/Users/tooning/spc/docs/development-plan.md:1)
- [docs/project-structure.md](/Users/tooning/spc/docs/project-structure.md:1)
- [docs/local-db-setup.md](/Users/tooning/spc/docs/local-db-setup.md:1)
