# PROJECT_STATE

Last updated: 2026-09-06

## Active objective

**2026 모두의 AI 실험실 AI 서비스 경진대회 제출용 MVP와 제출문서/증빙을 완성한다.**

마감: **2026-09-06 18:00 KST**

서비스:

> **시니어 AI 생활매니저 — 안심부터 시작하는 시니어 디지털 동행**

현재 공모전 작업의 최상위 정본은 [`docs/contest/contest-harness.md`](docs/contest/contest-harness.md)다.

장기 제품 방향이나 플랫폼 실험이 이 목표보다 앞서면 안 된다.

## MVP definition

MVP 정본은 `Lightning-Public/senior-trust-gateway`의 실행 가능한 prototype이다.

### Trust Check — 80%

```text
문자/디지털 요청 입력
→ 의미 이해
→ LOW/MEDIUM/HIGH 위험 확인
→ 쉬운 다음 행동
→ 필요 시 가족/사람 확인
```

### Hospital Kiosk Safe Guidance — 20%

```text
진료 접수
→ 예약 진료 선택
→ 민감정보 단계
→ HIGH 안전 중단
→ 직원 도움 안내
```

두 기능은 별도 앱이 아니다.

공통 제품 흐름:

> `이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결`

## Repository

- Canonical remote: `Lightning-Public/senior-trust-gateway`
- Default branch: `main`
- Contest baseline: PR #10 merged / `f9129979bb9ab93f1f2021dbd90aadbb9409b8fe`
- Active follow-up branch: `feat/modoo-ai-lab-contest`
- Active Draft PR: #14
- Kiosk UX provenance: `Lightning-Public/kiosk_ar_assistant@3a7da8f`

## Product / safety invariants

- Senior Trust Gateway = 위험·검증·권한정책 본체
- Trust Check = 첫 핵심 기능
- Hospital Kiosk Safe Guidance = 두 번째 생활장면
- 장기 방향 = `Protect → Trust → Delegate`
- `AI confidence != user authorization`
- `Risk != Verification`
- 공식 목록 미일치 != 안전
- 규칙엔진 HIGH는 AI가 낮추거나 승인할 수 없음

## Implemented MVP foundation

### Trust Check

- Vite + TypeScript 정적 웹
- `RuleBasedRiskAnalyzer`
- `OfficialSourceVerifier` / `GroundedRiskAnalyzer`
- LOW / MEDIUM / HIGH
- 쉬운 이유/다음 행동
- KISA snapshot 검증 인프라
- HIGH fail-safe

### AI context safety layer

- `AiMessageInterpreter` / `AiInterpretation`
- JSON contract: `summary`, `risk_context`, `safe_next_action`, `uncertainty`
- `SafeAiAssistedRiskAnalyzer`
- malformed JSON / exception / timeout fallback
- HIGH 하향 금지 테스트

중요: **AI context layer는 코드·테스트로 준비돼 있지만 확인된 실제 AIProvider가 없어 기본 UI 런타임에 외부 AI 호출을 연결하지 않았다.**

실제 AI API 연동 완료로 표현하지 않는다.

### Hospital Kiosk Safe Guidance

PR #14에서 병원 접수 한 장면을 구조화 데모로 구현했다.

- 접수 시작 안내
- 예약 진료 선택
- 민감정보 단계 HIGH
- 자동 진행 중단
- 직원 도움 안내
- 실제 개인정보 입력/저장 없음
- CV/OCR 완료 주장 없음

## Verification

PR #14 prototype 기준 Prototype CI run #70: **SUCCESS**.

- snapshot generator: PASS
- Vitest: **5 files / 35 tests passed**
- Grounded Verification: 14 PASS
- contest AI safety: 8 PASS
- rule-based analyzer: 9 PASS
- KISA 131,752-row distribution guard: 1 PASS
- hospital Kiosk safety: 3 PASS
- `tsc --noEmit && vite build`: PASS

run #70 이후 prototype 코드는 변경하지 않았고 현재 하네스/제출 문서만 정리 중이다.

## Deployment and browser QA — 2026-09-06 KST

- Vercel 설정 확인: root `vercel.json`의 `buildCommand`는 `cd prototype && npm install --no-audit --no-fund && npm run build`, `outputDirectory`는 `prototype/dist`다.
- 실제 Vercel temporary deployment가 `READY` 상태로 생성됐다: `https://temporary-rushing-indigo-rde96e8.vercel.app`.
- 이 temporary deployment는 Vercel CLI 기준 60분 뒤 만료되며, team claim 전에는 Git 연동된 정식 project가 아니다.
- `redsunjins-projects` team에서 GitHub repository import를 시작했다. 현재 Vercel GitHub App에 `Lightning-Public/senior-trust-gateway` 접근 권한이 없어, GitHub Mobile 재인증 후 최소 repository access를 부여해야 한다.
- 실제 배포 URL을 브라우저로 검수했다. 초기 화면, Trust Check LOW/MEDIUM/HIGH, Hospital Kiosk 안내, 민감정보 HIGH 중단과 직원 확인 대기까지 모두 의도대로 표시됐다.
- 이 세션 재검증: `npm test` 5 files / 35 tests PASS, `npm run build` (`tsc --noEmit && vite build`) PASS.

## aitestbed role

aitestbed는 **현재 MVP를 대신 만드는 주체가 아니다.**

### Confirmed

- 사용자 로그인
- 클라우드 신청 화면 진입
- vCPU 2 / Memory 4GB / Disk 50GB
- `rocky-8.10-base`
- `AitestbedVibeWorkflow`: 바이브코딩 생성·수정·소스 다운로드·공모전 증빙

### Current use

- 플랫폼 활용 증빙 확보
- 바이브코딩 사용 이력 확보
- 생성 결과가 있으면 UI 비교 참고
- 필요한 UI만 최소 포팅

### Unverified candidate

`AitestbedModelApiProvider`

다음이 확인되기 전에는 구현하지 않는다.

1. 공식 AI 추론 API 문서
2. base URL / 인증 / 모델 / request-response schema
3. 최소 실제 호출 probe
4. 외부 프로젝트 사용·개인정보·상업 이용 범위

## Contest harness priority

현재 작업 순서:

1. **실행 가능한 MVP의 제출 관점 최종 점검**
2. **MVP 화면/사용자 흐름 캡처**
3. **제출문서와 현재 코드 1:1 매핑**
4. test/build/CI 상태 유지
5. aitestbed 실제 활용 증빙 확보
6. 최종 PDF/PPT/PPTX 완성

aitestbed 생성·추가 플랫폼 기능 탐색이 1~3보다 앞서면 안 된다.

## Remaining contest work

### MVP / submission

- [x] Trust Check 기본 실행 흐름
- [x] HIGH 안전정책
- [x] AI context 안전계약/fallback 테스트
- [x] Hospital Kiosk 단일 시나리오 구현
- [x] test/build/CI
- [x] 실제 MVP 화면/사용 흐름 최종 QA (local browser)
- [ ] 제출용 MVP 화면 캡처
- [ ] 제출문서와 구현 기능 1:1 매핑
- [ ] 최종 제출 PDF/PPT/PPTX

### Platform evidence

- [x] aitestbed 로그인
- [x] 클라우드 신청 화면 및 사양 확인
- [ ] 신청 완료/승인 상태 확인
- [ ] 플랫폼 활용 화면 최소 3개 확보
- [ ] 바이브코딩 생성 결과/다운로드 증빙 확보
- [ ] 실제 모델/API 관련 정보가 화면에 존재하면 정확한 사실만 기록

실제 외부 AIProvider 연동은 **공모전 MVP를 깨지 않으면서 공식 계약이 확인된 경우에만** 진행한다.

## Next action

**GitHub Mobile 재인증을 완료하고 Vercel GitHub App에 `Lightning-Public/senior-trust-gateway`의 최소 접근 권한을 부여한 뒤, `redsunjins-projects` team project로 정식 import한다.**

그 다음 MVP 화면을 캡처하고 제출문서 작성을 진행한다.
