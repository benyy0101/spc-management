# Seed 전략

## 목적

이 문서는 이 프로젝트에서 `seed`를 어떤 의미로 사용할지 정의한다.

핵심 원칙은 단순하다.

- 일반적인 더미 데이터 삽입보다 `fixture import`가 우선이다.
- seed는 테스트 자산과 도메인 정답지를 DB로 주입하는 경로여야 한다.

## 현재 구현 방향

현재 1차 seed는 아래 두 단계로 구성된다.

1. 공통 마스터 fixture 적재
2. 시나리오별 expected journal/event 적재

관련 코드:

- [packages/test-fixtures/src/loader.ts](/Users/tooning/spc/packages/test-fixtures/src/loader.ts:1)
- [packages/db/src/seeds/fixture-seed.ts](/Users/tooning/spc/packages/db/src/seeds/fixture-seed.ts:1)
- [packages/db/src/seeds/run-fixture-seed.ts](/Users/tooning/spc/packages/db/src/seeds/run-fixture-seed.ts:1)

## 왜 일반 SQL seed가 아닌가

이 프로젝트의 핵심은 아래 흐름을 검증하는 것이다.

- fixture 입력
- 이벤트 생성
- 기대 분개
- 기대 원장
- 기대 보고서

즉 seed는 단순 샘플 데이터가 아니라 회계 테스트 벡터에 가깝다.

## 현재 seed의 범위

### 포함

- tenant
- entities
- books
- investors
- products
- contracts
- contract parties
- accounts
- fx rates
- fund investor positions
- events
- journals
- journal lines
- investor allocations 일부

### 아직 미흡한 부분

- rerun idempotency는 일부 테이블에만 적용됨
- statement snapshot 저장은 없음
- 증빙 메타데이터 seed는 없음
- close period seed는 아직 없음

## 중요한 구현 메모

fixture의 `ENT-FUND-001`, `INV-001` 같은 값은 DB PK가 아니다.

따라서 현재 seed는:

- fixture symbolic id를 읽고
- code 기반으로 실제 row를 찾거나 생성한 뒤
- alias map으로 실제 DB uuid에 연결한다

이 구조가 필요한 이유:

- DB는 UUID 기반
- fixture는 사람이 읽기 쉬운 symbolic id 기반

## 다음 단계

1. seed rerun 안전성을 더 높인다
2. close period와 audit log seed를 추가한다
3. expected balances 검증기를 seed 이후 테스트로 연결한다
