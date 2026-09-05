# PROJECT_STATE

Last updated: 2026-09-05

## Status

**P0 / P0.1 merged / contest baseline merged via PR #10 / Phase 0 submission hardening in Draft PR #14**

2026-09-06 18:00 KST 마감 `모두의 AI 실험실 AI 서비스 경진대회` 제출 후보는 **시니어 AI 생활매니저 — 안심부터 시작하는 시니어 디지털 동행**이다.

공모전 구현 범위는 **Trust Check 80% + Kiosk Safe Guidance 20%**로 유지한다. 두 앱을 합치는 것이 아니라 하나의 생활매니저가 서로 다른 디지털 생활 장면에서 다음 흐름을 제공한다.

`이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결`

## Repository

- Canonical remote: `Lightning-Public/senior-trust-gateway`
- Default branch: `main`
- Contest baseline merge: PR #10 / `f9129979bb9ab93f1f2021dbd90aadbb9409b8fe`
- Follow-up work branch: `feat/modoo-ai-lab-contest`
- Active Draft PR: #14 `feat: complete contest kiosk and aitestbed vibe prep`
- Development handoff: `docs/handoffs/contest-dev-session-2026-09-05.md`
- Kiosk UX reference: `Lightning-Public/kiosk_ar_assistant@3a7da8f`

## Fixed direction

- Contest service: **시니어 AI 생활매니저**
- Subtitle: **안심부터 시작하는 시니어 디지털 동행**
- Product sequence: **Protect → Trust → Delegate**
- Senior Trust Gateway = 위험·검증·권한정책 본체
- Trust Check = 첫 핵심 기능
- Kiosk Safe Guidance = 두 번째 생활장면
- Kiosk Phase 0 scenario = **병원 접수 1개만**
- AI authorization invariant: **AI confidence != user authorization**
- Trust invariant: **Risk != Verification**
- Official-data invariant: **공식 목록 미일치 != 안전**

## P0 / P0.1 implementation

- Vite + TypeScript 정적 웹
- `RuleBasedRiskAnalyzer`
- `OfficialSourceVerifier` / `GroundedRiskAnalyzer`
- authoritative exact match만 공식 근거로 승격
- build-time KISA CSV ingest + 256-way hash bucket snapshot
- folded 32-bit hash bucket selector + distribution regression test

## Contest AI context layer — merged in PR #10

구현됨:

- `AiMessageInterpreter` / `AiInterpretation`
- JSON contract: `summary`, `risk_context`, `safe_next_action`, `uncertainty`
- `CONTEST_AI_SYSTEM_PROMPT`
- `JsonAiMessageInterpreter`
- `SafeAiAssistedRiskAnalyzer`
- 모델 exception / timeout / malformed JSON → 규칙엔진 fallback
- HIGH는 AI 출력으로 하향 또는 승인 불가

### Runtime fact boundary

현재 기본 `prototype/src/main.ts` 실행 경로는 `GroundedRiskAnalyzer`를 사용한다. 즉 **AI 안전 레이어는 코드·테스트로 검증됐지만 확인된 실제 AIProvider가 없어 기본 UI 런타임에는 연결하지 않았다.**

이 상태를 실제 AI 호출 완료로 표현하지 않는다. aitestbed 또는 다른 provider는 공식 호출 계약과 최소 probe를 확인한 뒤에만 연결한다.

## Kiosk Safe Guidance — PR #14

병원 접수 한 장면을 구조화 데모로 구현한다.

```text
진료 접수
→ 예약 진료 선택
→ 본인 확인 정보 입력 화면
→ 민감정보 단계 HIGH
→ 자동 진행 중단
→ 직원 도움 요청
```

구현 파일:

- `prototype/src/kioskHospitalScenario.ts`
- `prototype/tests/kioskHospitalScenario.test.ts`
- `prototype/src/main.ts`의 접힌 보조 장면

원칙:

- `kiosk_ar_assistant@3a7da8f`의 큰 안내·포인터·음성형 문구 개념만 참조
- 카메라/CV/OCR 구현 완료로 주장하지 않음
- 개인정보를 대신 입력·저장하지 않음
- HIGH 단계는 사람 확인으로 안전 중단

## aitestbed fact boundary

### Confirmed

- `AitestbedVibeWorkflow`: 바이브코딩 프로토타입 생성·수정·소스 다운로드·공모전 증빙
- 사용자가 `aitestbed.kr` 로그인 후 클라우드 신청 화면 진입
- 추천 자원: vCPU 2 / Memory 4GB / Disk 50GB
- OS: `rocky-8.10-base`
- 1개월 우선 지원
- 2026년 클라우드 1인 1회 신청 제한

### Unverified candidate

- `AitestbedModelApiProvider`

외부 AI 추론 API는 다음 게이트를 모두 통과하기 전 구현·사용 가능으로 주장하지 않는다.

1. 공식 AI 추론 API 문서
2. base URL / 인증 방식 / 모델 목록 / request-response schema
3. 최소 실제 호출 probe
4. 외부 프로젝트 사용·개인정보·상업 이용 범위

로그인 전용 `내 API 키` 화면이나 키 관리 endpoint만으로 추론 API를 추정하지 않는다.

## aitestbed Vibe Phase 0 plan — PR #14

정본: `docs/contest/aitestbed-vibe-build-plan.md`

준비됨:

- `시니어 AI 생활매니저` 1차 생성 프롬프트
- Trust Check 80% + 병원 Kiosk 20% 화면 구조
- API endpoint/CV/OCR를 추정하지 않는 생성 제약
- 생성 후 수정 프롬프트
- 다운로드 소스와 현재 TypeScript prototype 비교 기준
- 최소 포팅/비포팅 기준
- 캡처해야 할 플랫폼 증빙 목록

## Contest evidence

- `docs/contest/modoo-ai-lab-evidence.md`
- `docs/contest/ai-use-one-page.md`
- `docs/contest/platform-run-sheet.md`
- `docs/contest/platform-cloud-observation.md`
- `docs/contest/aitestbed-vibe-build-plan.md`
- `docs/handoffs/contest-dev-session-2026-09-05.md`

## Verification

PR #10 head 기준 Prototype CI run #63: **SUCCESS**.

PR #14 변경 후에는 다음을 다시 통과해야 한다.

- snapshot generator smoke test
- 기존 Trust Check / Grounded Verification tests
- AI safety tests
- hospital Kiosk policy tests
- `tsc --noEmit`
- Vite production build

## Remaining contest work

- [x] aitestbed 로그인
- [x] 클라우드 신청 화면 진입 및 사양 확인
- [x] Trust Check + AI safety contract 구현/테스트
- [x] Kiosk 시나리오를 병원 접수 1개로 고정
- [x] 병원 Kiosk 구조화 안전 데모 구현
- [x] aitestbed 바이브코딩 생성 프롬프트/소스 비교 계획 준비
- [ ] 클라우드 신청 완료/승인 상태 확인
- [ ] aitestbed 바이브코딩 프로젝트 `시니어 AI 생활매니저` 생성
- [ ] 프로젝트/프롬프트/생성 결과 화면 캡처 3개 이상
- [ ] 생성 소스 다운로드
- [ ] 생성 소스와 현재 TypeScript prototype 비교 후 필요한 UI만 최소 포팅
- [ ] 실제 모델 표시명이 있으면 정확한 문자열 기록
- [ ] 외부 AI 추론 API 문서 및 호출 probe 여부 확인
- [ ] 최종 제출 PDF/PPT/PPTX 정리

## Next action

**`docs/contest/aitestbed-vibe-build-plan.md`의 1차 프롬프트로 aitestbed 바이브코딩 프로젝트를 생성하고, 생성 결과 화면과 다운로드 소스를 확보한다.**

소스가 확보되면 현재 TypeScript prototype과 diff를 비교해 제출 완성도에 필요한 UI만 포팅한다. 외부 AI 추론 API는 공식 계약과 실제 probe가 확인된 경우에만 adapter 작업으로 진행한다.
