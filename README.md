# Senior Trust Gateway

`Senior Trust Gateway`는 **시니어 AI 생활매니저**의 신뢰·보호·권한관리 기반입니다.

공모전 서비스:

> **시니어 AI 생활매니저 — 안심부터 시작하는 시니어 디지털 동행**

제품의 목표는 스미싱이나 위험 문자만 검사하는 것이 아니라, 시니어가 문자·키오스크·예약·행정·생활 서비스처럼 어려운 디지털 생활 상황에서 **무슨 뜻인지 이해하고, 지금 무엇을 해야 하는지 알 수 있도록 돕는 것**입니다.

안심/위험 확인은 제품 전체가 아니라 모든 생활 도움에 적용되는 공통 안전 원칙입니다.

제품 방향:

> **Protect → Trust → Delegate**

생활 확장 방향:

```text
문자·카톡 이해
→ 병원/키오스크 이용 도움
→ 예약·일정 챙기기
→ 행정·생활지원
→ 필요 시 가족·직원·공식기관 확인
```

## 현재 최우선 목표

2026 모두의 AI 실험실 AI 서비스 경진대회 제출용 **실행 가능한 MVP + 제출문서/증빙 완성**이 최우선입니다.

공모전 작업은 먼저 [`Contest Submission Harness`](docs/contest/contest-harness.md)를 따릅니다.

### Product Boundary

- 제품: **시니어 AI 생활매니저**
- Trust Check: 첫 번째 대표 생활 장면
- Hospital Kiosk Safe Guidance: 두 번째 대표 생활 장면
- 안심/위험 확인: 모든 생활 장면에 적용되는 공통 안전 원칙
- 예약·일정 / 행정·생활지원: 제품 확장 방향이며 현재 공모전 MVP 구현 완료로 주장하지 않음

출품 설명이나 UI가 `안심매니저` 또는 `문자 위험 검사 앱`으로 축소돼 보이면 제품 정체성 오류로 봅니다.

## 공모전 MVP — 대표 장면 1: 문자·카톡 도움 80%

현재 가장 완성도가 높은 생활 장면은 받은 문자·카톡 내용을 쉽게 이해하고 위험 신호와 다음 행동을 확인하는 Trust Check입니다.

```text
문자 입력
→ 무슨 뜻인지 이해
→ LOW/MEDIUM/HIGH 위험 확인
→ 지금 할 행동
→ 확실하지 않은 점
→ 필요 시 가족/사람 확인
```

- 명확한 고위험 신호는 결정론적 규칙엔진이 통제합니다.
- `AI confidence != user authorization`: AI는 HIGH 위험을 낮추거나 고위험 행동을 승인할 수 없습니다.
- 모델 장애·지연·잘못된 JSON은 규칙엔진 결과로 fallback합니다.
- 실제 AIProvider 호출 계약이 확인되지 않아 기본 UI 런타임에는 외부 AI 호출을 연결하지 않았습니다.

## 공모전 MVP — 대표 장면 2: 병원 접수 도움 20%

두 번째 생활 장면은 병원 키오스크 접수입니다.

```text
접수 시작 안내
→ 예약 진료 선택
→ 민감정보 입력 화면
→ HIGH 안전중단
→ 직원 도움 요청
```

- 큰 안내·포인터·쉬운 문구로 다음 행동을 알려줍니다.
- 민감정보 단계에서는 자동 진행하지 않고 사람 확인으로 전환합니다.
- 키오스크 전체 CV/OCR 통합은 하지 않습니다.
- 개인정보를 대신 입력하거나 저장하지 않습니다.

두 대표 장면은 동일한 생활매니저 흐름을 공유합니다.

> `이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결`

## Grounded Verification

공식 공개 데이터의 확인 수준을 위험도와 별도로 관리합니다.

- `Risk != Verification`
- 공식 데이터 일치만 근거로 사용
- 공식 목록 미일치 != 안전
- 실제 공식 CSV가 적재되기 전 기본 배포는 `authoritative: false` placeholder manifest를 사용합니다.

## 모두의 AI 실험실 사용 경계

- `AitestbedVibeWorkflow`: **confirmed** — 바이브코딩 생성·수정·소스 다운로드·공모전 증빙에 사용합니다.
- `AitestbedModelApiProvider`: **unverified candidate** — 공식 AI 추론 API 문서와 실제 probe가 확인된 경우에만 구현합니다.
- API 키·개인정보는 브라우저 번들/Git/로그에 남기지 않습니다.

## Contest documents

- [`Contest Submission Harness`](docs/contest/contest-harness.md)
- [`PROJECT_STATE`](PROJECT_STATE.md)
- [`모두의 AI 실험실 경진대회 증빙`](docs/contest/modoo-ai-lab-evidence.md)
- [`AI 활용 필요성·플랫폼 활용·안전 설계`](docs/contest/ai-use-one-page.md)
- [`플랫폼 실증 Run Sheet`](docs/contest/platform-run-sheet.md)

장기 로드맵:

- [`시니어 AI 생활매니저 — aitestbed + Kiosk AI 융합 로드맵`](docs/roadmap/aitestbed-kiosk-fusion.md)

## Local run

```bash
cd prototype
npm install
npm run test
npm run build
npm run dev
```

현재 진행상태는 [`PROJECT_STATE.md`](PROJECT_STATE.md)를 기준으로 확인합니다.
