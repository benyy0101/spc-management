# 프로젝트 구조 정의

## 문서 목적

이 문서는 [docs/stack-strategy.md](/Users/tooning/spc/docs/stack-strategy.md:1), [docs/schema-design.md](/Users/tooning/spc/docs/schema-design.md:1), [docs/development-plan.md](/Users/tooning/spc/docs/development-plan.md:1)를 기준으로 실제 코드베이스의 폴더 구조를 정의한다.

이 구조의 목적은 다음과 같다.

- 1차 MVP를 빠르고 가볍게 시작한다.
- 도메인 로직을 프레임워크 밖에 둔다.
- 이후 `Fastify -> NestJS` 또는 다른 런타임 구조로 이동 가능하게 만든다.
- fixture 기반 TDD와 스키마 자산을 코드와 함께 유지한다.

## 최상위 원칙

- `apps`에는 실행 가능한 애플리케이션만 둔다.
- `packages`에는 재사용 가능한 도메인, DB, 테스트 자산을 둔다.
- 회계 규칙과 유스케이스는 HTTP 프레임워크에 의존하지 않는다.
- fixture는 테스트 전용 자산이 아니라 도메인 정답지로 취급한다.

## 권장 디렉터리 구조

```text
spc/
  apps/
    api/
    web/
  packages/
    domain/
    db/
    application/
    test-fixtures/
    shared/
  docs/
  fixtures/
  expected/
  scripts/
  .env.example
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
```

## 루트 레벨 설명

### `apps/`

- 실행 단위 애플리케이션
- 배포 대상

### `packages/`

- 프레임워크 독립적인 핵심 코드
- 장기적으로 가장 중요한 자산

### `docs/`

- 도메인, 기획, 스키마, 스택, 운영 기준 문서

### `fixtures/`

- YAML 기반 시나리오 입력과 기대 결과의 source of truth

### `expected/`

- 필요 시 fixture의 기대 산출물을 분리 저장하는 디렉터리

### `scripts/`

- 시드, fixture import, 배치 보조, 검증 스크립트

## 앱 구조

### `apps/api`

목적:

- Fastify 기반 API 서버

권장 구조:

```text
apps/api/
  src/
    server.ts
    app.ts
    plugins/
    routes/
    presenters/
    middleware/
    hooks/
    auth/
    config/
  tests/
  package.json
```

설명:

- `routes/`는 HTTP 입출력 처리만 담당
- 도메인 로직은 직접 구현하지 않음
- `presenters/`는 응답 DTO 구성
- `middleware/`, `hooks/`는 tenant, auth, logging 같은 횡단 관심사 처리

### `apps/web`

목적:

- Next.js 기반 웹 앱

권장 구조:

```text
apps/web/
  src/
    app/
    components/
    features/
    lib/
    hooks/
    styles/
  public/
  package.json
```

설명:

- `features/`는 화면 단위 기능 묶음
- `lib/`는 API client, auth helper, formatter
- 보고/조회 화면과 입력/편집 화면을 분리해서 구성

## 패키지 구조

### `packages/domain`

목적:

- 핵심 도메인 모델
- 분개 규칙
- 회계 계산 로직
- 엔터티와 값 객체

권장 구조:

```text
packages/domain/
  src/
    entities/
    value-objects/
    services/
    journal-rules/
    calculations/
    policies/
    errors/
    types/
  package.json
```

설명:

- 이 프로젝트에서 가장 중요한 패키지
- Fastify, Next.js, Drizzle을 몰라도 돌아갈 수 있어야 함

### `packages/application`

목적:

- 유스케이스 계층
- 트랜잭션 경계
- 도메인과 인프라 사이 조정

권장 구조:

```text
packages/application/
  src/
    use-cases/
    dto/
    ports/
    services/
    commands/
    queries/
  package.json
```

설명:

- `use-cases/`는 예: `postEvent`, `postClose`, `generateTrialBalance`
- `ports/`는 repository, fx provider, audit logger 같은 인터페이스

### `packages/db`

목적:

- Drizzle 스키마
- migrations
- repository 구현
- query object

권장 구조:

```text
packages/db/
  src/
    schema/
    repositories/
    queries/
    mappers/
    migrations/
    seeds/
    client/
  drizzle.config.ts
  package.json
```

설명:

- `schema/`는 테이블 정의
- `repositories/`는 application port 구현
- `queries/`는 원장/시산표/보고 전용 정교한 SQL
- `mappers/`는 DB row와 domain model 변환

### `packages/test-fixtures`

목적:

- YAML fixture 로더
- 시나리오 검증 유틸
- 기대값 비교기

권장 구조:

```text
packages/test-fixtures/
  src/
    loader/
    validators/
    comparators/
    generators/
    types/
  package.json
```

설명:

- fixture 파싱 로직을 테스트 코드에 흩뿌리지 않기 위해 별도 패키지로 둔다

### `packages/shared`

목적:

- 공통 유틸과 타입

권장 구조:

```text
packages/shared/
  src/
    ids/
    dates/
    money/
    result/
    logging/
    constants/
  package.json
```

설명:

- 너무 많은 도메인 코드를 넣지 않는다
- 공통 primitive와 유틸만 둔다

## 모듈 경계 원칙

### 허용 방향

- `apps/api -> packages/application`
- `apps/web -> api contracts`
- `packages/application -> packages/domain`
- `packages/application -> packages/db`의 직접 참조는 피하고 `ports`를 우선
- `packages/db -> packages/domain`의 타입 참조는 최소화

### 금지 방향

- `packages/domain -> apps/api`
- `packages/domain -> packages/db`
- `apps/api -> packages/db` 직접 쿼리 난사
- `apps/web -> packages/domain` 직접 결합

## 테스트 구조

```text
apps/api/tests/
packages/domain/tests/
packages/application/tests/
packages/db/tests/
packages/test-fixtures/tests/
```

원칙:

- 도메인 테스트는 분개 규칙과 계산 검증
- application 테스트는 유스케이스 검증
- db 테스트는 repository와 SQL projection 검증
- fixture 테스트는 YAML과 기대값 정합성 검증

## 설정 파일 권장

루트 권장 파일:

- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `.editorconfig`
- `.gitignore`
- `.env.example`

선택:

- `biome.json` 또는 `eslint.config.js`
- `vitest.workspace.ts`
- `docker-compose.yml`

## 왜 모노레포 구조를 추천하는가

- API, 웹, 도메인, DB, fixture를 함께 버전 관리할 수 있다
- fixture와 schema를 분리된 저장소로 두면 변경 추적이 어려워진다
- 1차 MVP에서도 코드 자산의 경계를 빨리 세울 수 있다

## 1차 최소 구현 구조

가장 가볍게 시작하려면 아래 정도로 줄여도 된다.

```text
apps/
  api/
  web/
packages/
  domain/
  db/
  test-fixtures/
docs/
fixtures/
```

이후 필요하면 `application`, `shared`를 분리한다.

## 지금까지 기준에서 누락되기 쉬운 항목

아래는 지금까지 문서화했지만 실제 구현 단계에서 자주 빠지는 것들이다.

### 1. 회계 기간 캘린더

- 월마감 기준일
- 휴일/영업일 처리
- 재오픈 정책

### 2. 번호 체계

- journal number 규칙
- contract code 규칙
- tenant별 코드 충돌 방지

현재 결정:

- journal number는 `tenant별 시퀀스`로 간다.
- 내부 PK와 별도로 사용자 표시용 `journal_no`를 둔다.

### 3. 금액/반올림 정책

- 소수점 자릿수
- 통화별 반올림
- 보고통화 환산 반올림

현재 결정:

- `USD`는 소수점 2자리
- `KRW`는 소수점 0자리

### 4. 시간대 정책

- 저장 기준 timezone
- 회계일과 시스템 생성일 구분
- SaaS에서 tenant별 timezone 허용 여부

현재 결정:

- 저장 시각은 `UTC`
- 회계일 해석은 `tenant별 accounting timezone`
- 시스템 생성 시각과 회계일은 별도 필드로 유지

### 5. 인증/권한 최소 모델

- 조회자
- 입력자
- 승인자
- 관리자

### 6. 파일/증빙 저장 정책

- tenant별 경로 분리
- 업로드 제한
- 보관 기간

현재 결정:

- 1차 MVP는 파일 업로드 자체보다 `증빙 메타데이터` 저장을 우선한다.
- 실제 파일 저장은 2차 확장으로 둔다.

### 7. 운영 배치 기준

- accrual 실행 시각
- 환율 적재 시각
- 결산 배치 재시도 기준

### 8. 오류 처리 기준

- event validation 실패 시 정책
- partial posting 허용 여부
- idempotency key 필요 여부

현재 결정:

- event posting은 `idempotency key`를 1차부터 포함한다.
- 같은 이벤트의 중복 반영은 기본 금지한다.

## 지금 시점에서 꼭 확인하면 좋은 질문

1. tenant별 accounting timezone을 UI와 배치에서 어떻게 노출할 것인가
2. journal number 포맷을 `JV-YYYYMM-000001`로 할지, book prefix를 포함할지
3. KRW 병행 보고 시 반올림 차이를 어떤 정책으로 정리할지
4. 증빙 메타데이터의 최소 항목을 무엇으로 둘지
5. idempotency key의 유효 범위를 tenant + event_type으로 볼지, 외부 source reference까지 포함할지

## 추천 다음 단계

1. 이 문서를 기준으로 실제 루트 폴더와 워크스페이스 파일을 만든다.
2. Drizzle 스키마 파일 초안을 생성한다.
3. fixture loader와 domain 테스트 러너를 먼저 만든다.
