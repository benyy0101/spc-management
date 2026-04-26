# SPC Web App

`apps/web`는 SPC 회계 시스템의 운영 UI다.  
이 앱에서 아래 기능을 사용한다.

- 회계 이벤트 입력
- 이벤트 / 전표 / 시산표 조회
- 재무제표 조회
- 재무제표 매핑 관리
- 마감 관리
- 투자자 배분
- 투자자 포지션 및 배분 이력 조회
- 전표 운영
- 감사 로그 조회
- 회계 단위 CRUD

## 개발 실행

루트 워크스페이스에서 실행하는 기준 명령:

```bash
pnpm dev:web
```

웹은 기본적으로 `http://localhost:3000` 에서 뜬다.

API 기본 주소는 개발 모드에서 `http://localhost:4000` 이다.  
다른 주소를 쓰려면 아래 환경변수를 지정한다.

```bash
API_BASE_URL=http://localhost:4000
```

## 주요 화면

- `/events/new`
- `/events`
- `/journals`
- `/trial-balance`
- `/financial-statements/balance-sheet`
- `/financial-statements/profit-loss`
- `/financial-statements/cash-flow`
- `/statement-mappings`
- `/close-periods`
- `/allocations`
- `/investor-positions`
- `/operations/journals`
- `/audit-logs`
- `/entities`

## 검증

```bash
pnpm build
```

루트에서 실행하려면:

```bash
npx pnpm --filter @spc/web build
```
