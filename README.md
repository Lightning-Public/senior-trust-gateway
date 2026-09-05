# Senior Trust Gateway

시니어가 AI와 디지털 서비스를 **안심하고 사용할 수 있게 하는 신뢰·보호·권한관리 레이어**를 만드는 프로젝트입니다.

## Product thesis

생활매니저는 최종 형태입니다. 시장 진입점은 먼저 사용자를 보호하고 신뢰를 쌓는 `AI 안심매니저`입니다.

**Protect → Trust → Delegate**

1. **Protect** — 문자·링크·전화·요청이 안전한지 확인한다.
2. **Trust** — AI가 무엇을 할 수 있고 언제 사람에게 넘기는지 명확히 한다.
3. **Delegate** — 충분한 신뢰가 쌓인 생활업무부터 대신 처리한다.

## 핵심 원칙

- `Risk != Verification`
- 공식 목록에서 찾지 못했다는 사실은 안전을 의미하지 않는다.
- AI가 확실하지 않은 내용을 확정적으로 말하지 않는다.
- 저위험 업무는 자동화하되, 위험이 커질수록 사용자 확인 또는 신뢰원 승인을 요구한다.
- 결제, 계약, 민감정보 제공 등 고위험 행동은 기본적으로 AI 단독 실행 대상이 아니다.
- 상시 고비용 에이전트보다 규칙·정형 워크플로·공식 데이터·저비용 모델을 먼저 사용한다.
- 외부 공식 서비스의 기능을 중복 구축하기보다 검증된 연계 수단을 사용한다.
- 시니어가 이해하기 쉬운 언어와 흐름을 우선한다.

## 현재 구현

### P0 — Trust Check

문자/카톡 내용을 입력하면 다음 흐름으로 안내합니다.

`입력 → 위험 신호 → LOW/MEDIUM/HIGH → 확인 수준 → 이유 → 다음 행동 → 필요 시 가족 확인`

기본 위험분석은 API 없이 동작하는 TypeScript rule engine입니다.

### P0.1 — Grounded Verification

공식 KISA 피싱 URL 데이터를 연결할 수 있는 검증 레이어를 구성했습니다.

- authoritative exact match만 `OFFICIAL_SOURCE`로 승격
- `NO_MATCH` / `UNAVAILABLE`은 안전으로 승격하지 않음
- 공공데이터 서비스키를 정적 브라우저 번들에 넣지 않음
- 공식 CSV는 build-time에 최대 256개 해시 버킷으로 분할
- URL 검사 시 필요한 버킷만 lazy-load
- manifest와 bucket 파일의 건수/버킷 무결성 검사

실제 공식 CSV가 적재되기 전 기본 배포는 `authoritative: false` placeholder manifest를 사용하므로 공식 판정을 내리지 않습니다.

## Local run

```bash
cd prototype
npm install
npm run dev
```

테스트/빌드:

```bash
npm run test
npm run build
```

공식 KISA CSV를 partitioned snapshot으로 변환:

```bash
cd prototype
node scripts/build-kisa-snapshot.mjs /path/to/official-kisa.csv public/data/kisa-phishing
```

현재 진행상태는 [`PROJECT_STATE.md`](PROJECT_STATE.md)를 기준으로 확인합니다.
