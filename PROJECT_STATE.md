# PROJECT_STATE

Last updated: 2026-09-06

## Active objective

**2026 모두의 AI 실험실 AI 서비스 경진대회 제출용 MVP와 제출문서/증빙을 완성한다.**

마감: **2026-09-06 18:00 KST**

서비스:

> **시니어 AI 생활매니저 — 안심부터 시작하는 시니어 디지털 동행**

현재 공모전 작업의 최상위 정본은 [`docs/contest/contest-harness.md`](docs/contest/contest-harness.md)다.

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

### Hospital Kiosk Safe Guidance

공모전 확장 장면은 병원 접수 한 장면만 유지한다.

- 접수 시작 안내
- 예약 진료 선택
- 민감정보 단계 HIGH
- 자동 진행 중단
- 직원 도움 안내
- 실제 개인정보 입력/저장 없음
- CV/OCR 완료 주장 없음

## Contest UI/UX completion pass — 2026-09-06

기능 추가 없이 공모전 제출 화면의 제품 정체성과 시니어 사용성을 재구성했다.

- 첫 화면 서비스명을 **시니어 AI 생활매니저**로 명확화
- 핵심 메시지: **위험한 행동 전에 먼저 멈추고, 쉽게 설명하고, 안전한 다음 행동과 사람 확인을 안내**
- Trust Check를 첫 번째이자 가장 강한 행동으로 유지
- 붙여넣기 입력과 확인 버튼을 모바일 기준으로 크게 구성
- 결과 정보 순서를 다음으로 통일
  1. 무슨 뜻인가요?
  2. 위험 확인
  3. 지금 이렇게 하세요
  4. 확실하지 않은 점
  5. 필요하면 사람에게 확인
- HIGH 결과에 별도 `지금 멈추세요` 안전중단 카드와 사람 확인 행동을 가장 강하게 표시
- Hospital Kiosk를 접힌 기술 메뉴가 아니라 **두 번째 생활 장면**으로 자연스럽게 연결
- 큰 글자, 큰 버튼, 적은 선택지, 높은 대비, 충분한 여백, 색상+텍스트 병행 적용
- 안전정책/규칙엔진/AI 경계는 변경하지 않음

변경 파일:

- `prototype/src/main.ts`
- `prototype/src/styles.css`

## Verification

### Previous validated baseline

Prototype CI run #70: **SUCCESS**

- Vitest: 5 files / 35 tests passed
- `tsc --noEmit && vite build`: PASS

### Current UI commit validation

PR #14 current UI head `12fe8cc7b5edceb2ca0b8a6756b24a91dc3ebffd` 기준 Prototype CI run #89: **SUCCESS**.

- dependency install: PASS
- snapshot generator: PASS
- risk policy tests: PASS
- production build: PASS

이전 prototype의 실제 브라우저 QA는 완료됐지만, UI 재구성 커밋의 실제 화면 QA는 새 Vercel Preview에서 별도로 다시 수행한다.

## Deployment status

- root `vercel.json`: `cd prototype && npm install --no-audit --no-fund && npm run build`
- output: `prototype/dist`
- 저장소 공개 전환 후, 기존 무료 Hobby team `redsunjin's projects`에 Git 연동 정식 project `senior-trust-gateway`를 Import했다. Pro Trial/결제는 시작하지 않았다.
- 정식 production URL: `https://senior-trust-gateway.vercel.app` — `main` 배포 `READY`.
- 정식 URL의 실제 브라우저에서 초기 화면 및 Trust Check LOW/MEDIUM/HIGH를 확인했다. LOW는 안전 확정이 아님을 표시하고, MEDIUM은 공식 경로 확인을 안내하며, HIGH는 행동 중단과 사람/공식 대표번호 확인을 안내한다.
- production은 `main` baseline이다. current UI head의 Hospital Kiosk Safe Guidance를 포함한 전체 흐름은 Git 연동 Draft PR #14 Preview에서 검수한다.

## aitestbed role

aitestbed는 **현재 MVP를 대신 만드는 주체가 아니다.**

### Confirmed

- 사용자 로그인
- 클라우드 신청 화면 진입
- vCPU 2 / Memory 4GB / Disk 50GB
- `rocky-8.10-base`
- `AitestbedVibeWorkflow`: 바이브코딩 생성·수정·소스 다운로드·공모전 증빙

### Unverified candidate

`AitestbedModelApiProvider`

공식 AI 추론 API 문서, 호출 계약, 실제 probe가 확인되기 전에는 구현하지 않는다.

## Remaining contest work

### MVP / submission

- [x] Trust Check 기본 실행 흐름
- [x] HIGH 안전정책
- [x] AI context 안전계약/fallback 테스트
- [x] Hospital Kiosk 단일 시나리오 구현
- [x] 공모전용 시니어 AI 생활매니저 UI/UX 재구성
- [x] current UI head CI test/build
- [ ] current UI head 실제 모바일 화면 QA
- [ ] 제출용 MVP 화면 캡처
- [ ] 제출문서와 구현 기능 1:1 매핑
- [ ] 최종 제출 PDF/PPT/PPTX

### Platform evidence

- [x] aitestbed 로그인
- [x] 클라우드 신청 화면 및 사양 확인
- [ ] 신청 완료/승인 상태 확인
- [ ] 플랫폼 활용 화면 최소 3개 확보
- [ ] 바이브코딩 생성 결과/다운로드 증빙 확보

## Next action

**Git 연동 Draft PR #14 Preview에서 current UI head의 Trust Check와 Hospital Kiosk 안전중단을 실제 모바일 브라우저로 검수하고 제출용 화면 캡처를 확보한다.**
