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

## Contest UI/UX — 생활매니저 정보구조

기능 추가 없이 UI 정보구조와 디자인을 제품 기획에 맞게 재구성했다.

기본 제품 흐름:

1. `시니어 AI 생활매니저` 서비스 정체성
2. 생활 도움 전체를 인지
3. 현재 사용할 수 있는 기능을 우선 실행
4. 위험한 순간에는 긴급 행동을 최우선 노출
5. 향후 생활지원 확장 방향 인지

### Latest product-design pass — onboarding + priority home

사용자가 서비스를 처음부터 정확히 이해하고 기억하도록 다음 UI 구조를 추가했다.

#### 첫 진입 온보딩

현재 prototype에는 실제 로그인 기능이 없으므로 로그인 UI를 가장하지 않는다. 대신 **첫 진입 시 2단계 온보딩**을 제공하고, 향후 로그인 구현 시 로그인 직후 동일 컴포넌트를 연결할 수 있게 했다.

1. `어려운 디지털 생활을 옆에서 같이 봐드려요`
   - 문자·카톡 → 병원 접수 → 생활 도움
2. `위험한 순간에는 먼저 멈추겠습니다`
   - 쉽게 이해 → 위험 확인 → 다음 행동 → 사람 확인

- 첫 확인 후 브라우저 localStorage에 안내 확인 상태만 저장
- 개인정보/계정정보 저장 없음
- 메인 상단 `처음 안내` 버튼으로 다시 볼 수 있음

#### 메인 우선순위

1. **긴급 도움** — 링크·송금·인증번호는 잠깐 멈추기 → Trust Check 바로 이동
2. **빠른 도움** — 현재 실제 구현된 기능을 가장 크게 노출
   - 문자·카톡 같이 보기
   - 병원 접수 도움
3. **생활 도움 확장**
   - 예약·일정 챙기기 — 확장 방향
   - 행정·생활 지원 — 확장 방향
   - 가족·사람 연결 — 공통 원칙

즐겨찾기 저장 기능은 새 제품 기능이므로 이번 공모전 UI 패스에서는 구현하지 않았다. 대신 향후 즐겨찾기/사용빈도 기반 정렬이 들어갈 자리를 `빠른 도움` 영역으로 구조화했다.

#### 브랜드 요소

별도 이미지 의존 없이 CSS 기반 작은 `동행 마크`를 추가했다.

- 둥근 말풍선/동행자 형태
- 두 눈과 미소로 부담 없는 안내자 인상
- 작은 노란 포인트로 기억점 형성
- 앱 헤더, 온보딩, 제품 방향 영역에 반복 노출
- 과한 캐릭터보다 시니어 서비스의 신뢰성을 유지하는 소형 브랜드 요소

브라우저 title도 `AI 안심매니저`에서 **`시니어 AI 생활매니저`**로 수정했다.

변경 파일:

- `prototype/src/main.ts`
- `prototype/index.html`
- `prototype/src/product-design.css`
- 기존 `prototype/src/styles.css` 안전/기본 UI 스타일 유지

Trust Check 결과 순서:

1. 무슨 뜻인가요?
2. 위험 확인
3. 지금 이렇게 하세요
4. 확실하지 않은 점
5. 필요하면 사람에게 확인

HIGH는 별도 `지금 멈추세요` 안전중단 UI와 사람 확인 행동을 가장 강하게 표시한다.

## Verification

### Previous validated baseline

- Prototype CI run #70: SUCCESS
- UI 1차 재구성 Prototype CI run #89: SUCCESS
- Product identity UI Prototype CI run #98: SUCCESS

### Onboarding / priority home design

PR #14 code head `918951b18fcc5feb553a5710ecf7f64859ec01a5` 기준 Prototype CI run #105: **SUCCESS**.

- install dependencies: PASS
- snapshot generator: PASS
- risk policy tests: PASS
- production build: PASS

안전정책/규칙엔진은 변경하지 않았다.

## Deployment status

- root `vercel.json`: `cd prototype && npm install --no-audit --no-fund && npm run build`
- output: `prototype/dist`
- production URL: `https://senior-trust-gateway.vercel.app` — `main` baseline `READY`
- Draft PR #14 Preview branch alias: `https://senior-trust-gateway-git-feat-modoo-2238a7-redsunjins-projects.vercel.app`
- 이전 product-identity UI는 모바일 viewport `390 × 844`에서 Trust Check와 Hospital Kiosk 전체 흐름 QA를 통과했다.
- **온보딩/우선순위 홈 추가 후 current head는 실제 모바일 브라우저에서 다시 최종 QA해야 한다.** 이전 화면 QA를 새 UI의 최종 증빙으로 재사용하지 않는다.

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
- [x] 첫 진입 2단계 온보딩
- [x] 긴급 도움 / 빠른 도움 / 확장 영역 우선순위 홈
- [x] 작은 동행 브랜드 마크
- [x] onboarding/current UI CI test/build
- [ ] onboarding/current UI 실제 모바일 화면 QA
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

**Draft PR #14 Preview에서 첫 진입 온보딩 → 메인 긴급/빠른 도움 → Trust Check → Hospital Kiosk 흐름을 390×844 모바일 기준으로 다시 검수하고 제출용 화면을 선별한다.**
