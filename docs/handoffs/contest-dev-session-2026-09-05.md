# Contest Development Session Handoff — 2026-09-05

## Goal

`Lightning-Public/senior-trust-gateway`를 2026 모두의 AI 실험실 AI 서비스 경진대회 제출 후보로 완성한다. 마감은 2026-09-06 18:00 KST다.

공모전 서비스명:

> **시니어 AI 생활매니저 — 안심부터 시작하는 시니어 디지털 동행**

현재 제출 범위는 **Trust Check 80% + Kiosk Safe Guidance 20%**다. 문자 피싱 판별 앱이나 키오스크 앱 두 개를 병렬로 만드는 것이 아니라, 하나의 생활매니저가 서로 다른 디지털 생활 장면에서 `이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결`을 제공한다.

## Git baseline

- Repository: `Lightning-Public/senior-trust-gateway`
- Work branch: `feat/modoo-ai-lab-contest`
- Draft PR: #10
- Latest main synchronized: `e1e111a8e310b42de5333886d17023c432e7f21c` (PR #13 포함)
- Sync merge commit on work branch: `6b348dc4138ebcde43668dc8127369c0bb890e8e`
- CI after sync: Prototype CI run #61 — SUCCESS
- Kiosk reference: `Lightning-Public/kiosk_ar_assistant@3a7da8f`

## Read first — canonical sources

아래 문서를 먼저 읽고 현재 사실과 결정은 이 문서를 우선한다.

1. `AGENTS.md`
2. `PROJECT_STATE.md`
3. `README.md`
4. `docs/roadmap/aitestbed-kiosk-fusion.md`
5. `docs/contest/modoo-ai-lab-evidence.md`
6. `docs/contest/platform-run-sheet.md`
7. `docs/contest/platform-cloud-observation.md`
8. `docs/contest/ai-use-one-page.md`

필요 시 Kiosk 저장소 `Lightning-Public/kiosk_ar_assistant@3a7da8f`를 읽되 전체 코드를 복사하거나 저장소를 합치지 말고 필요한 UX 자산만 선택적으로 포팅한다.

## Product / architecture invariants

- Senior Trust Gateway = 위험·검증·권한정책 본체
- Trust Check = 첫 핵심 기능
- Kiosk Safe Guidance = 두 번째 생활장면
- 장기 방향 = `Protect → Trust → Delegate`
- `Risk != Verification`
- 공식 목록 미일치 != 안전
- `AI confidence != user authorization`
- 송금·인증정보·앱 설치·원격제어 등 HIGH를 AI가 낮추거나 승인할 수 없음
- 모델 장애·timeout·quota·잘못된 JSON은 deterministic rule fallback
- 문자 원문·개인정보·API 키/토큰을 Git·클라이언트 번들·로그에 저장하지 않음

## aitestbed fact boundary — 매우 중요

현재 확인된 것과 추정 영역을 섞지 않는다.

### Confirmed

- 사용자가 `aitestbed.kr`에 실제 로그인함
- 클라우드 신청 화면 진입 확인
- 추천 자원: vCPU 2 / Memory 4GB / Disk 50GB
- OS: `rocky-8.10-base`
- 1개월 우선 지원
- 2026년 클라우드 1인 1회 신청 제한
- 공개 확인된 `AitestbedVibeWorkflow`: 바이브코딩 프로토타입 생성·수정·소스 다운로드·공모전 증빙

### Unverified candidate

`AitestbedModelApiProvider`는 아직 구현 대상으로 확정하지 않는다.

외부 프로젝트용 AI 추론 API는 아래 네 조건을 실제로 확인하기 전까지 구현 완료 또는 사용 가능으로 주장하지 않는다.

1. 공식 추론 API 문서
2. base URL / 인증 header / 모델 목록 / request-response schema
3. 최소 실제 호출 probe 성공
4. 외부 프로젝트·개인정보·상업 이용 범위

로그인 전용 `내 API 키` 화면/키 관리 endpoint의 존재만으로 외부 AI 추론 endpoint를 추정하지 않는다. 확인 전에는 mock 또는 다른 승인된 `AIProvider` 경계를 유지한다.

## Current implementation

PR #10에는 이미 다음이 있다.

- `prototype/src/contestAiPrompt.ts`
- `prototype/src/aiAssistedRiskAnalyzer.ts`
- `prototype/src/types.ts`
- `prototype/tests/aiAssistedRiskAnalyzer.test.ts`
- JSON contract: `summary`, `risk_context`, `safe_next_action`, `uncertainty`
- HIGH downgrade 방지
- exception / malformed JSON / timeout fallback 테스트
- 최신 main의 KISA bucket distribution 개선 코드도 sync 완료

## Immediate execution order

1. 먼저 현재 branch와 문서를 읽고 구현 상태를 재확인한다.
2. 사용자가 aitestbed 화면에서 제공하는 실제 관찰값을 `docs/contest/*`에 사실 그대로 반영한다.
3. 공모전 Phase 0에서 aitestbed 바이브코딩 프로젝트 `시니어 AI 생활매니저`를 만들기 위한 프롬프트/구조를 준비한다.
4. 실제 생성 결과와 다운로드 소스가 확보되면 현재 TypeScript prototype과 diff를 비교하고 **최소 포팅**만 한다.
5. Kiosk는 한 장면만 선택한다. 병원 접수 / 복지 신청 / 민원 발급 중 가장 완성도 높은 한 가지를 택해 Kiosk UX가 동일 신뢰정책으로 확장됨을 보여준다.
6. 실제 외부 AI API 계약이 확인되면 그때 `AIProvider` 뒤에 adapter를 추가한다. 확인되지 않으면 구현하지 않는다.
7. 변경 후 반드시 `npm run test`와 `npm run build`를 실행하고 CI를 확인한다.
8. 제출 증빙 3개 이상, 프롬프트/생성 결과, Kiosk 확장 화면, 미구현/추정 항목을 문서화한다.

## Do not do

- 공모전 직전 두 저장소 전면 통합
- 여러 키오스크 업종 동시 구현
- 확인되지 않은 CV/OCR/image input/API 기능을 완료로 주장
- aitestbed 외부 모델 endpoint를 추정해 하드코딩
- 규칙엔진 HIGH를 AI 응답으로 하향
- 실사용 개인정보를 테스트/캡처에 사용

## Definition of done for this development session

- 최신 GitHub 정본과 구현 상태가 일치
- 사용자가 제공한 aitestbed 실제 화면 관찰값이 증빙 문서에 반영
- Phase 0 제출에 필요한 최소 구현/포팅만 수행
- Trust Check 안전 invariant 유지 테스트 통과
- Kiosk 확장 시나리오 1개가 제출자료에서 설명 가능
- 실제 확인되지 않은 aitestbed 기능은 명시적 blocker/candidate
- test/build/CI 결과 기록
- `PROJECT_STATE.md` 현행화
