# Expected Outputs

이 디렉터리는 fixture 시나리오가 기대하는 산출물을 저장하기 위한 자리다.

현재는 각 시나리오 YAML 내부에 기대 분개와 기대 보고 값을 함께 두고 있다. 이후 필요하면 아래처럼 분리할 수 있다.

```text
expected/
  journals/
  ledgers/
  statements/
  allocations/
```

1차 단계에서는 시나리오 파일 안의 `expected` 블록을 source of truth로 사용한다.
