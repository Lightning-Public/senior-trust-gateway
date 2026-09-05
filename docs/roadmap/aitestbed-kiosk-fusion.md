# AI 안심동행 — aitestbed + Kiosk AI 융합 로드맵

Last updated: 2026-09-05

> **Current priority note**
>
> 2026 모두의 AI 실험실 공모전 마감 전에는 이 로드맵보다 `docs/contest/contest-harness.md`와 `PROJECT_STATE.md`가 우선한다.
>
> 현재 정본은 **기존 `senior-trust-gateway` MVP 완성 + 제출문서/증빙 완성**이며, aitestbed 바이브코딩은 MVP를 대신 만드는 개발 경로가 아니라 플랫폼 활용 증빙·보조 참고다.

## 1. 결정

Senior Trust Gateway를 신뢰·보호·권한관리 본체로 유지하고, Kiosk AI를 두 번째 사용 장면으로 연결한다.

- 제출/제품 본체: **Senior Trust Gateway / 시니어 AI 생활매니저**
- 핵심 기능: **Trust Check**
- 확장 기능: **Hospital Kiosk Safe Guidance**
- 단기 범위: Trust Check 80% + Kiosk 확장 20%

두 앱을 한 번에 전면 통합하지 않는다. 먼저 공통 흐름을 검증한다.

`이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결`

## 2. 저장소 책임 경계

- Trust/policy 본체: `Lightning-Public/senior-trust-gateway`
- Kiosk UX 원본: `Lightning-Public/kiosk_ar_assistant@3a7da8f`
- AIProvider: 실제 호출 계약이 확인된 모델 공급자에 대한 공통 경계

현재 MVP의 정본은 `senior-trust-gateway`다. Kiosk 원본에서는 큰 안내·포인터·음성형 문구 등 필요한 UX 개념만 선택적으로 사용한다.

## 3. 현재 사실 경계

### Senior Trust Gateway

- Trust Check 실행 프로토타입
- LOW/MEDIUM/HIGH 결정론적 안전정책
- Grounded Verification
- AI context contract/fallback 테스트
- Hospital Kiosk 구조화 안전 데모

### Kiosk reference

- 큰 안내·포인터·음성형 UX 참고 가능
- 실제 카메라 CV/OCR 완료로 주장하지 않음
- 저장소 전체 통합하지 않음

### aitestbed

Confirmed:

- 로그인/클라우드 신청 화면 확인
- `AitestbedVibeWorkflow`: 바이브코딩 생성·수정·소스 다운로드·증빙

Unverified:

- `AitestbedModelApiProvider`

외부 AI 추론 API는 공식 문서와 실제 probe 전에는 구현하지 않는다.

## 4. 목표 아키텍처

```text
Trust Check UI ───────┐
                      ├─► Senior Trust Orchestrator
Hospital Kiosk UI ────┘      ├─ deterministic safety rules
                             ├─ official-source verifier
                             ├─ AIProvider interface
                             │    └─ verified provider only
                             └─ HumanEscalation
```

역할:

- 규칙엔진: 고위험 행동 차단
- 공식 데이터: 확인 가능한 근거 제공
- AIProvider: 실제 계약이 확인된 경우 문맥 이해·쉬운 설명
- Kiosk UI: 다음 단계와 안전중단 안내
- 사람/신뢰원: 불확실·고위험 최종 확인

AI 모델의 확신은 사용자 권한이나 안전 판정을 대신하지 않는다. AI는 규칙엔진의 HIGH를 낮출 수 없다.

## 5. 공모전 Phase 0

공모전 단계에서는 아래 순서를 따른다.

1. 현재 `senior-trust-gateway` MVP 실행 흐름 완성
2. Trust Check + Hospital Kiosk 사용자 흐름 QA
3. test/build/CI
4. MVP 화면 캡처
5. 제출문서와 구현 기능 1:1 매핑
6. aitestbed 실제 활용 증빙 확보
7. 최종 PDF/PPT/PPTX

aitestbed 바이브코딩 생성 결과가 있으면 현재 MVP와 비교해 UI 참고만 한다. 생성 소스 전체로 현재 제품을 교체하지 않는다.

## 6. AIProvider 채택 Gate

실제 provider는 다음을 모두 확인한 경우에만 연결한다.

1. 공식 AI 추론 API 문서
2. base URL / 인증 / 모델 / request-response schema
3. 최소 실제 호출 probe
4. 외부 프로젝트 사용·개인정보·상업 이용 범위

위 조건을 충족하지 못하면 기본 MVP의 결정론적 경로를 유지한다.

보안 원칙:

- API 키는 브라우저 번들·Git·로그에 넣지 않는다.
- 원문 메시지와 개인정보를 최소화한다.
- timeout/quota/잘못된 JSON/모델 거부 시 fallback한다.

## 7. 공모전 이후 단계

### Phase 1 — Text Trust Assistant

검증된 AIProvider를 연결해 문맥 이해와 쉬운 설명을 실제 runtime에 추가한다.

### Phase 2 — Kiosk Structured Guidance 확장

병원 접수에서 검증한 정책을 다른 공공 키오스크 장면으로 확대한다.

### Phase 3 — Vision/OCR 후보

실제 image input capability와 호출 계약이 확인된 경우에만 진행한다.

### Phase 4 — 공공 프로젝트 공통화

검증된 AIProvider adapter를 다른 공공 프로젝트에서 재사용 가능한 형태로 분리한다.

## 8. 비범위

공모전 제출 전에는 하지 않는다.

- 여러 Kiosk 업종 추가
- 저장소 전면 병합
- 실제 결제/계정 변경
- 확인되지 않은 CV/OCR
- 확인되지 않은 aitestbed AI endpoint
- 장기 Life OS 기능
- 제출에 필요 없는 구조 리팩터링
