# Senior Trust Gateway

시니어가 디지털 서비스를 안심하고 이용하고, 충분한 신뢰가 쌓인 뒤 생활 업무를 맡길 수 있도록 하는 **신뢰·보호·권한관리 레이어**입니다.

제품 방향:

> **Protect → Trust → Delegate**

공모전 서비스명은 **시니어 AI 생활매니저 — 안심부터 시작하는 시니어 디지털 동행**입니다.

## P0 — Trust Check

첫 번째 핵심 기능은 의심 문자·링크의 의미와 위험 신호를 쉽게 설명하고 안전한 다음 행동을 제안하는 Trust Check입니다.

```text
문자 입력 → 위험 신호 분석 → LOW/MEDIUM/HIGH → 확인 수준 → 이유 → 다음 행동 → 필요 시 가족/사람 확인
```

- 명확한 고위험 신호는 결정론적 규칙엔진이 통제합니다.
- AI는 애매한 의도·사칭 맥락과 시니어용 쉬운 설명을 담당합니다.
- `AI confidence != user authorization`: AI는 HIGH 위험을 낮추거나 고위험 행동을 승인할 수 없습니다.
- 모델 장애·지연·잘못된 JSON은 규칙엔진 결과로 fallback합니다.

## P0.1 — Grounded Verification

공식 공개 데이터의 확인 수준을 위험도와 별도로 관리합니다.

- `Risk != Verification`
- 공식 데이터 일치만 근거로 사용
- 공식 목록 미일치 != 안전
- 실제 공식 CSV가 적재되기 전 기본 배포는 `authoritative: false` placeholder manifest를 사용합니다.

## Kiosk Safe Guidance

두 번째 생활장면은 `Lightning-Public/kiosk_ar_assistant@3a7da8f`의 화면·음성·포인터 UX를 활용한 키오스크 안내입니다.

공모전 제출은 **Trust Check 80% + Kiosk 확장 20%**로 제한하고, 키오스크 전체 CV/OCR 통합보다 한 가지 대표 장면에서 다음 공통 흐름을 보여줍니다.

```text
이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결
```

## 모두의 AI 실험실 사용 경계

- `AitestbedVibeWorkflow`: **confirmed** — 바이브코딩 프로토타입 생성·수정·소스 다운로드·공모전 증빙에 사용합니다.
- `AitestbedModelApiProvider`: **unverified candidate** — 외부 AI 추론 API의 공식 호출 문서와 실제 probe가 확인된 경우에만 구현합니다.
- 로그인 전용 API 키 관리 화면의 존재만으로 외부 AI 추론 endpoint를 주장하지 않습니다.
- 실제 AIProvider는 호출 계약이 확인된 공급자만 연결하며 API 키·개인정보는 브라우저 번들/Git/로그에 남기지 않습니다.

## Roadmap

- [`AI 안심동행 — aitestbed + Kiosk AI 융합 로드맵`](docs/roadmap/aitestbed-kiosk-fusion.md)
  - Senior Trust Gateway = 위험·검증·권한정책 본체
  - Kiosk AI = 화면·음성·포인터 UX 원본
  - aitestbed 바이브코딩 = 플랫폼 프로토타입·증빙
  - AIProvider = 검증된 모델 공급자에 대한 공통 계약

## Contest evidence

- [`모두의 AI 실험실 경진대회 증빙`](docs/contest/modoo-ai-lab-evidence.md)
- [`AI 활용 필요성·플랫폼 활용·안전 설계`](docs/contest/ai-use-one-page.md)
- [`플랫폼 실증 Run Sheet`](docs/contest/platform-run-sheet.md)
- [`클라우드 신청 화면 관찰 기록`](docs/contest/platform-cloud-observation.md)

## Local run

```bash
cd prototype
npm install
npm run test
npm run build
npm run dev
```

현재 진행상태는 [`PROJECT_STATE.md`](PROJECT_STATE.md)를 기준으로 확인합니다.
