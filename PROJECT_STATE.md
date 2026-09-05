# PROJECT_STATE

Last updated: 2026-09-06

## Active objective

**2026 모두의 AI 실험실 AI 서비스 경진대회 제출용 MVP와 제출문서/증빙을 완성한다.**

마감: **2026-09-06 18:00 KST**

서비스:

> **시니어 AI 생활매니저 — 안심부터 시작하는 시니어 디지털 동행**

현재 공모전 작업의 최상위 정본은 [`docs/contest/contest-harness.md`](docs/contest/contest-harness.md)다.

## Product Boundary

**제품은 `시니어 AI 생활매니저`다. `안심매니저` 또는 Trust Check가 제품 전체가 아니다.**

- 안심/위험 확인 = 생활매니저의 공통 안전 원칙
- Trust Check = 첫 번째 대표 생활 장면
- Hospital Kiosk Safe Guidance = 두 번째 대표 생활 장면
- 제품 방향 = 문자·카톡 → 병원/키오스크 → 예약·일정 → 행정·생활지원 → 가족/사람 연결
- 공모전 MVP에서 실제 구현/시연되는 것은 Trust Check + 병원 접수 1장면
- 예약·일정, 행정·생활지원은 `확장 방향`으로만 표시하고 구현 완료로 주장하지 않음

출품 설명이나 UI가 `안심매니저` 단일 제품처럼 보이면 제품 정체성 오류로 본다.

## MVP definition

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
- `AI confidence != user authorization`
- `Risk != Verification`
- 공식 목록 미일치 != 안전
- 규칙엔진 HIGH는 AI가 낮추거나 승인할 수 없음
- 장기 방향 = `Protect → Trust → Delegate`

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
- 실제 외부 AIProvider는 미확인 상태이므로 기본 UI 런타임에 연결하지 않음

### Hospital Kiosk Safe Guidance

- 접수 시작 안내
- 예약 진료 선택
- 민감정보 단계 HIGH
- 자동 진행 중단
- 직원 도움 안내
- 실제 개인정보 입력/저장 없음
- CV/OCR 완료 주장 없음

## Contest UI/UX pass — 생활매니저 정체성 보정

기능 추가 없이 UI 정보구조와 디자인을 제품 기획에 맞게 재구성했다.

첫 화면 구조:

1. `시니어 AI 생활매니저` 서비스 정체성
2. `어려운 디지털 생활, 혼자 하지 마세요.` 핵심 메시지
3. 생활 도움 영역을 한눈에 표시
   - 문자·카톡 이해 — 지금 사용
   - 병원 접수 도움 — 지금 시연
   - 예약·일정 챙기기 — 확장 방향
   - 행정·생활 지원 — 확장 방향
   - 가족·사람 연결 — 공통 원칙
4. 공통 흐름 `쉽게 이해 → 위험 확인 → 다음 행동 → 사람 확인`
5. Trust Check 실제 사용
6. Hospital Kiosk 실제 시연
7. 향후 생활지원 확장 방향

중요: 기능 카드는 기술 기능 목록이 아니라 **사용자가 어떤 생활 순간에 도움받는지**를 설명한다. 구현 상태를 배지로 구분해 미구현 기능을 완료처럼 보이지 않게 한다.

Trust Check 결과 순서:

1. 무슨 뜻인가요?
2. 위험 확인
3. 지금 이렇게 하세요
4. 확실하지 않은 점
5. 필요하면 사람에게 확인

HIGH는 별도 `지금 멈추세요` 안전중단 UI와 사람 확인 행동을 가장 강하게 표시한다.

변경 파일:

- `prototype/src/main.ts`
- `prototype/src/styles.css`
- `docs/contest/contest-harness.md`
- `docs/contest/modoo-ai-lab-evidence.md`
- `PROJECT_STATE.md`

## Verification

### Previous validated baseline

- Prototype CI run #70: SUCCESS
- UI 1차 재구성 Prototype CI run #89: SUCCESS

### Current product-identity UI

PR #14 current head `c962d7fe305d265f2d981a828173422e069332cf` 기준 Prototype CI run #97: **SUCCESS**.

- install dependencies: PASS
- snapshot generator: PASS
- risk policy tests: PASS
- production build: PASS

안전정책/규칙엔진은 변경하지 않았다.

## Deployment status

- root `vercel.json`: `cd prototype && npm install --no-audit --no-fund && npm run build`
- output: `prototype/dist`
- 저장소 공개 전환 후, 기존 무료 Hobby team `redsunjin's projects`에 Git 연동 정식 project `senior-trust-gateway`를 Import했다. Pro Trial/결제는 시작하지 않았다.
- production URL: `https://senior-trust-gateway.vercel.app` — `main` baseline `READY`.
- 개인정보가 없는 fixture로 정식 URL의 초기 Trust Check와 LOW/MEDIUM/HIGH를 실제 브라우저로 확인했다.
- Draft PR #14 Preview URL: `https://senior-trust-gateway-git-feat-modoo-2238a7-redsunjins-projects.vercel.app`. Vercel 로그인 보호는 해제됐다.
- current UI head의 실제 모바일 화면 QA는 이 Preview에서 새 화면 기준으로 다시 수행한다.

## aitestbed role

aitestbed는 현재 MVP를 대신 만드는 주체가 아니다.

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
- [x] Product Boundary를 생활매니저 기준으로 정정
- [x] 생활 도움 전체가 보이는 UI 정보구조 반영
- [x] Hospital Kiosk를 두 번째 대표 생활 장면으로 적극 노출
- [x] current product-identity UI CI test/build
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

**Draft PR #14 Preview URL을 확보한 뒤 첫 화면의 생활매니저 정체성과 Trust Check → Hospital Kiosk 연결을 실제 모바일 브라우저로 검수하고 제출 캡처를 확보한다.**
