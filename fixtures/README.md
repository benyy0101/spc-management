# YAML Fixture Set

이 디렉터리는 SPC 구조 금융상품 회계 시스템의 TDD용 예시 데이터 세트를 담는다.

목표는 다음과 같다.

- 사람이 읽기 쉬운 YAML 기반 시나리오 정의
- 공통 마스터 데이터 재사용
- 입력 이벤트와 기대 회계 결과의 분리
- 시나리오 단위 회귀 테스트 가능 구조

## 디렉터리 구조

```text
fixtures/
  README.md
  master/
    common.yaml
    coa.yaml
    exchange-rates.yaml
  scenarios/
    index.yaml
```

## 원칙

- 모든 시나리오는 공통 마스터를 참조한다.
- 모든 금액은 기본적으로 `USD` 기준으로 작성한다.
- 병행 보고 검증을 위해 `KRW` 환산 결과를 기대값에 포함할 수 있다.
- 투자자 배분 1차 기준은 `pro-rata`다.
- 현금흐름표 1차 기준은 `indirect`다.

## 다음 단계

1. `master/common.yaml` 확정
2. `master/coa.yaml` 확정
3. `scenario-001`부터 `scenario-013`까지 순차 작성
4. `expected/` 산출물 구조 추가
