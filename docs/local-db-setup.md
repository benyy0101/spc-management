# 로컬 DB 설정

## 목적

이 문서는 로컬 개발과 migration/seed 검증을 위해 Docker 기반 PostgreSQL을 설정하는 방법을 정의한다.

현재 이 프로젝트의 개발용 DB 기준은 다음과 같다.

- 로컬 개발 DB는 Docker PostgreSQL을 사용한다.
- DB는 기능 개발 중 계속 켜두고 사용할 수 있다.
- 필요하면 언제든 초기화해서 migration과 seed를 다시 검증할 수 있어야 한다.

## 왜 Docker PostgreSQL인가

- 로컬 환경 재현이 쉽다.
- Postgres 버전 고정이 쉽다.
- migration과 fixture seed를 반복 검증하기 좋다.
- DB가 꼬였을 때 초기화가 쉽다.
- Supabase 같은 플랫폼 선택 이슈를 지금 단계에 끌고 오지 않아도 된다.

즉, 지금은 플랫폼보다 `회계 스키마와 seed 검증`이 우선이라 Docker가 더 적합하다.

## 파일

- [docker-compose.yml](/Users/tooning/spc/docker-compose.yml:1)
- [.env.db.example](/Users/tooning/spc/.env.db.example:1)

## 기본 설정

- DB 이름: `spc`
- 사용자: `postgres`
- 비밀번호: `postgres`
- 포트: `5432`

연결 문자열:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/spc
```

## 실행 방법

### DB 시작

```bash
docker compose up -d
```

### 상태 확인

```bash
docker compose ps
```

### 로그 확인

```bash
docker compose logs -f postgres
```

### DB 중지

```bash
docker compose down
```

### 볼륨까지 삭제하고 초기화

```bash
docker compose down -v
```

## 검증 순서

권장 순서는 아래와 같다.

1. Docker Postgres 시작
2. `DATABASE_URL` 설정
3. migration 적용
4. fixture seed 실행
5. DB 데이터 확인

## 현재 기준 실행 흐름

예시:

```bash
docker compose up -d
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/spc
cd packages/db
npx drizzle-kit migrate
npm run db:seed:fixtures
```

## 운영 원칙

- 로컬 개발 중에는 DB를 계속 켜둬도 된다.
- migration을 수정하거나 fixture를 크게 바꿀 때는 `down -v` 후 재검증이 쉽다.
- 검증용 DB와 운영/스테이징 DB를 혼동하지 않는다.

## 주의사항

- 현재 seed 실행은 workspace 의존성을 사용하므로, 패키지 매니저 환경 정리가 필요할 수 있다.
- root workspace 설치 전략이 확정되면 실행 명령도 함께 정리해야 한다.

## 다음 단계

1. Docker DB 기동
2. migration 실제 적용
3. seed 실행 검증
4. fixture 기준 데이터 조회 검증
