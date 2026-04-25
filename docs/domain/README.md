# SPC 구조 금융상품 회계 시스템 도메인 기준

이 디렉터리는 선박 유동화 펀드 및 다양한 금융상품을 다루는 SPC 구조 회계 시스템의 도메인 기준 문서 모음이다.

목적은 두 가지다.

1. 개발 전에 반드시 이해해야 하는 도메인 이론을 정리한다.
2. 실제 구현 시 기능 범위, 데이터 모델, 회계 로직, 검증 기준의 판단 근거로 사용한다.

이 문서 세트는 기술 문서가 아니라 도메인 기준 문서다. 따라서 특정 프레임워크나 데이터베이스보다 아래 질문에 답할 수 있도록 설계했다.

- 어떤 거래가 발생했는가
- 어느 회계주체의 거래인가
- 어떤 계약 또는 상품 조건이 적용되는가
- 어떤 분개가 생성되어야 하는가
- 어떤 원장과 잔액에 반영되는가
- 어떤 기준일 재무제표 숫자로 연결되는가

## 권장 학습 순서

1. [00-glossary.md](/Users/tooning/spc/docs/domain/00-glossary.md)
2. [01-accounting-flow.md](/Users/tooning/spc/docs/domain/01-accounting-flow.md)
3. [02-coa.md](/Users/tooning/spc/docs/domain/02-coa.md)
4. [03-journal-rules.md](/Users/tooning/spc/docs/domain/03-journal-rules.md)
5. [04-ledger-and-balances.md](/Users/tooning/spc/docs/domain/04-ledger-and-balances.md)
6. [05-financial-statements.md](/Users/tooning/spc/docs/domain/05-financial-statements.md)
7. [06-financial-instruments.md](/Users/tooning/spc/docs/domain/06-financial-instruments.md)
8. [07-instrument-lifecycle.md](/Users/tooning/spc/docs/domain/07-instrument-lifecycle.md)
9. [08-interest-and-revenue.md](/Users/tooning/spc/docs/domain/08-interest-and-revenue.md)
10. [09-valuation-and-measurement.md](/Users/tooning/spc/docs/domain/09-valuation-and-measurement.md)
11. [10-impairment-and-credit-loss.md](/Users/tooning/spc/docs/domain/10-impairment-and-credit-loss.md)
12. [11-foreign-currency.md](/Users/tooning/spc/docs/domain/11-foreign-currency.md)
13. [12-spc-structure.md](/Users/tooning/spc/docs/domain/12-spc-structure.md)
14. [13-shipping-securitization.md](/Users/tooning/spc/docs/domain/13-shipping-securitization.md)
15. [14-fund-domain.md](/Users/tooning/spc/docs/domain/14-fund-domain.md)
16. [15-cash-waterfall.md](/Users/tooning/spc/docs/domain/15-cash-waterfall.md)
17. [16-contract-and-accounting.md](/Users/tooning/spc/docs/domain/16-contract-and-accounting.md)
18. [17-time-and-closing.md](/Users/tooning/spc/docs/domain/17-time-and-closing.md)
19. [18-controls-and-audit.md](/Users/tooning/spc/docs/domain/18-controls-and-audit.md)
20. [19-entities-books-and-reporting-units.md](/Users/tooning/spc/docs/domain/19-entities-books-and-reporting-units.md)
21. [20-management-reporting.md](/Users/tooning/spc/docs/domain/20-management-reporting.md)
22. [21-core-scenarios.md](/Users/tooning/spc/docs/domain/21-core-scenarios.md)
23. [22-key-questions.md](/Users/tooning/spc/docs/domain/22-key-questions.md)
24. [23-learning-roadmap.md](/Users/tooning/spc/docs/domain/23-learning-roadmap.md)
25. [24-minimum-readiness.md](/Users/tooning/spc/docs/domain/24-minimum-readiness.md)

## 문서 공통 구조

각 문서는 다음 순서로 정리한다.

- 왜 중요한가
- 핵심 이론
- 반드시 이해해야 하는 개념
- 이 프로젝트에서 확인할 질문
- 개발 기준

## 개발 기준 사용 원칙

- 거래 이벤트는 항상 회계주체와 계약 근거를 동반해야 한다.
- 회계 수치는 원천 거래, 분개, 원장, 보고 숫자까지 추적 가능해야 한다.
- 상품 특성은 분개 규칙, 평가 방식, 보고 축에 직접 반영되어야 한다.
- 재무제표는 집계 화면이 아니라 회계 규칙의 최종 산출물로 취급한다.
- 법인, SPC, 펀드, 투자자 관점 숫자를 섞지 않는다.

## 문서 사용법

- 입문용: 먼저 [00-glossary.md](/Users/tooning/spc/docs/domain/00-glossary.md)를 읽고 낯선 용어를 정리한다.
- 학습용: 위 순서대로 읽고 각 문서의 "이 프로젝트에서 확인할 질문"에 답해본다.
- 설계용: 새 기능을 만들 때 해당 기능과 가장 가까운 문서의 "개발 기준"을 먼저 확인한다.
- 리뷰용: 구현이 문서 기준과 다르면 왜 다른지 명시한다.
