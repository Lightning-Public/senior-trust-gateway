# 시니어 AI 생활매니저 — aitestbed + Kiosk AI 융합 로드맵

Last updated: 2026-09-06

> **Current priority note**
>
> 2026 모두의 AI 실험실 공모전 마감 전에는 이 로드맵보다 `docs/contest/contest-harness.md`와 `PROJECT_STATE.md`가 우선한다.
>
> 제품은 **시니어 AI 생활매니저**이며, 안심/위험 확인은 제품 전체가 아니라 모든 생활 장면에 적용되는 공통 안전 원칙이다.

## 1. 제품 방향

Senior Trust Gateway를 신뢰·보호·권한관리 본체로 유지하고 여러 생활 장면을 하나의 생활매니저 경험으로 연결한다.

```text
문자·카톡 이해
→ 병원/키오스크 이용 도움
→ 예약·일정 챙기기
→ 행정·생활지원
→ 필요 시 가족·직원·공식기관 확인
```

공통 경험:

> `이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결`

공모전 Phase 0에서 실제 구현/시연하는 대표 장면은 두 개다.

- 대표 장면 1: **Trust Check** — 80%
- 대표 장면 2: **Hospital Kiosk Safe Guidance** — 20%

예약·일정 및 행정·생활지원은 제품 확장 방향이며 공모전 MVP 구현 완료로 주장하지 않는다.

## 2. 저장소 책임 경계

- 생활매니저 trust/policy 본체: `Lightning-Public/senior-trust-gateway`
- Kiosk UX 원본: `Lightning-Public/kiosk_ar_assistant@3a7da8f`
- AIProvider: 실제 호출 계약이 확인된 모델 공급자에 대한 공통 경계

Kiosk 원본에서는 큰 안내·포인터·음성형 문구 등 필요한 UX 개념만 선택적으로 사용한다.

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
문자·카톡 도움 UI ───┐
병원 Kiosk UI ────────┼─► Senior Life Manager / Trust Orchestrator
향후 생활지원 UI ─────┘      ├─ deterministic safety rules
                              ├─ official-source verifier
                              ├─ AIProvider interface
                              │    └─ verified provider only
                              └─ HumanEscalation
```

역할:

- 생활매니저: 상황 이해와 다음 행동 안내를 여러 생활 장면에 공통 적용
- 규칙엔진: 고위험 행동 차단
- 공식 데이터: 확인 가능한 근거 제공
- AIProvider: 실제 계약이 확인된 경우 문맥 이해·쉬운 설명
- Kiosk UI: 다음 단계와 안전중단 안내
- 사람/신뢰원: 불확실·고위험 최종 확인

AI 모델의 확신은 사용자 권한이나 안전 판정을 대신하지 않는다. AI는 규칙엔진의 HIGH를 낮출 수 없다.

## 5. 공모전 Phase 0

1. 생활매니저 정체성이 드러나는 MVP 화면 완성
2. Trust Check + Hospital Kiosk 사용자 흐름 QA
3. test/build/CI
4. MVP 화면 캡처
5. 제출문서와 구현 기능 1:1 매핑
6. aitestbed 실제 활용 증빙 확보
7. 최종 PDF/PPT/PPTX

aitestbed 생성 결과는 UI 참고·플랫폼 증빙에 활용하며 현재 제품 전체를 교체하지 않는다.

## 6. AIProvider 채택 Gate

실제 provider는 다음을 모두 확인한 경우에만 연결한다.

1. 공식 AI 추론 API 문서
2. base URL / 인증 / 모델 / request-response schema
3. 최소 실제 호출 probe
4. 외부 프로젝트 사용·개인정보·상업 이용 범위

보안 원칙:

- API 키는 브라우저 번들·Git·로그에 넣지 않는다.
- 원문 메시지와 개인정보를 최소화한다.
- timeout/quota/잘못된 JSON/모델 거부 시 fallback한다.

## 7. 공모전 이후 단계

### Phase 1 — 문맥 이해 강화

검증된 AIProvider를 연결해 문자·생활 상황의 문맥 이해와 쉬운 설명을 실제 runtime에 추가한다.

### Phase 2 — 생활장면 확장

병원 접수에서 검증한 흐름을 예약·일정과 다른 공공/생활 디지털 장면으로 확대한다.

### Phase 3 — Vision/OCR 후보

실제 image input capability와 호출 계약이 확인된 경우에만 진행한다.

### Phase 4 — 공공 프로젝트 공통화

검증된 생활매니저 trust/policy layer와 AIProvider adapter를 재사용 가능한 형태로 정리한다.

## 8. 비범위

공모전 제출 전에는 하지 않는다.

- 여러 Kiosk 업종 추가
- 저장소 전면 병합
- 실제 결제/계정 변경
- 확인되지 않은 CV/OCR
- 확인되지 않은 aitestbed AI endpoint
- 장기 Life OS 기능 개발
- 제출에 필요 없는 구조 리팩터링
