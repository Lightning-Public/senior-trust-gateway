# Senior Trust Gateway

시니어가 디지털 서비스를 안심하고 이용하고, 충분한 신뢰가 쌓인 뒤 생활 업무를 맡길 수 있도록 하는 **신뢰·보호·권한관리 레이어**입니다.

제품 방향:

> **Protect → Trust → Delegate**

공모전 서비스 표현은 **시니어 AI 생활매니저 — 안심부터 시작하는 시니어 디지털 동행**입니다.

## P0 — Trust Check

첫 번째 기능은 의심 문자·링크의 의미와 위험 신호를 쉽게 설명하고, 안전한 다음 행동을 제안하는 Trust Check입니다.

기본 흐름:

```text
문자 입력 → 위험 신호 분석 → LOW/MEDIUM/HIGH → 확인 수준 → 이유 → 다음 행동 → 필요 시 가족/사람 확인
```

- 명확한 고위험 신호는 결정론적 규칙엔진이 통제합니다.
- AI는 애매한 의도·사칭 맥락과 시니어용 쉬운 설명을 담당합니다.
- `AI confidence != user authorization` 원칙에 따라 AI는 HIGH 위험을 낮추거나 고위험 행동을 승인할 수 없습니다.
- 모델 장애·지연·잘못된 JSON은 규칙엔진 결과로 fallback합니다.

## P0.1 — Grounded Verification

공식 공개 데이터와의 검증 수준을 위험도와 별도로 관리합니다.

- `Risk != Verification`
- 공식 데이터 일치만 근거로 사용
- 공식 목록 미일치 != 안전
- 실제 공식 CSV가 적재되기 전 기본 배포는 `authoritative: false` placeholder manifest를 사용하므로 공식 판정을 내리지 않습니다.

## Kiosk Safe Guidance

공모전의 두 번째 생활장면은 `Lightning-Public/kiosk_ar_assistant@3a7da8f`의 화면·음성·포인터 UX를 활용한 키오스크 안내입니다.

이번 제출에서는 Trust Check 80% + Kiosk 확장 20%로 제한하고, 키오스크 전체 CV/OCR 통합보다 한 가지 대표 장면에서 다음 흐름을 보여줍니다.

```text
이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결
```

## Roadmap

- [`AI 안심동행 — aitestbed + Kiosk AI 융합 로드맵`](docs/roadmap/aitestbed-kiosk-fusion.md)
  - Senior Trust Gateway를 위험·검증·권한정책 본체로 유지합니다.
  - `kiosk_ar_assistant`의 시니어용 화면·음성·포인터 UX를 선택적으로 연결합니다.
  - aitestbed AI는 공통 `AIProvider`를 통해 문맥 이해와 쉬운 설명을 제공합니다.
  - 모델/API 호출은 서버 측 경로를 우선하며 quota/timeout/잘못된 응답에 fallback합니다.

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
