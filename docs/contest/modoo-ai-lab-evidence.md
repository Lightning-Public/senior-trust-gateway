# 모두의 AI 실험실 경진대회 증빙 기록

Last updated: 2026-09-06

## 0. 증빙 기준

공모전 작업의 최상위 정본은 `docs/contest/contest-harness.md`다.

이 문서의 목적은 **현재 실행 가능한 MVP와 실제 플랫폼 증빙을 제출문서에 연결하는 것**이다.

- MVP 정본: `Lightning-Public/senior-trust-gateway` prototype
- aitestbed: 플랫폼 활용 증빙/보조 참고
- `AitestbedModelApiProvider`: 공식 계약과 probe 전까지 미확인 후보

## 1. 제출 서비스

- 공모전 서비스명: **시니어 AI 생활매니저**
- 부제: **안심부터 시작하는 시니어 디지털 동행**
- 제품 본체: Senior Trust Gateway
- Phase 0 대표 장면 1: Trust Check 80%
- Phase 0 대표 장면 2: Hospital Kiosk Safe Guidance 20%

### 제품 정체성 — 제출물 전체에서 유지

**`시니어 AI 생활매니저`가 제품이고, `안심`은 제품 전체가 아니라 모든 생활 도움에 적용되는 안전 원칙이다.**

따라서 제출 설명은 `스미싱 검사 서비스` 또는 `안심매니저`로 축소해서 설명하지 않는다.

생활매니저의 제품 방향:

```text
문자·카톡 이해
→ 병원/키오스크 이용 도움
→ 예약·일정 챙기기
→ 행정·생활 절차 도움
→ 필요 시 가족·직원·공식기관 확인
```

현재 공모전에서 실제 실행/시연되는 범위는 **문자·카톡 도움 + 병원 접수 한 장면**이다. 예약·일정 및 행정·생활지원은 제품 확장 방향으로만 표시하며 구현 완료로 주장하지 않는다.

`시니어 AI 생활매니저`는 사용자를 대신 판단하는 AI가 아니다.

> **디지털 생활에서 막힌 상황을 이해하기 쉽게 설명하고, 지금 할 행동을 알려주며, 위험한 순간에는 먼저 멈추고 필요하면 사람에게 연결하는 생활매니저**다.

공통 흐름:

```text
이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결
```

핵심 안전 원칙:

- `AI confidence != user authorization`
- `Risk != Verification`
- 공식 목록 미일치 != 안전
- 규칙엔진 HIGH는 AI가 낮추거나 승인할 수 없음

## 2. 현재 MVP

### Trust Check — 첫 번째 생활 장면

```text
문자/디지털 요청 입력
→ 의미 이해
→ LOW/MEDIUM/HIGH 위험 확인
→ 쉬운 다음 행동
→ 필요 시 가족/사람 확인
```

구현 근거:

- `prototype/src/ruleBasedAnalyzer.ts`
- `prototype/src/groundedRiskAnalyzer.ts`
- `prototype/src/main.ts`

### 공모전 제출 UI/UX — 생활매니저 정체성 보정

기능 추가 없이 첫 화면의 정보구조를 **생활 도움 전체 → 현재 대표 장면 → 확장 방향** 순서로 재구성했다.

첫 화면에서 바로 확인 가능한 내용:

- 서비스명: `시니어 AI 생활매니저`
- 핵심 메시지: `어려운 디지털 생활, 혼자 하지 마세요.`
- 제품 메시지: 안심은 공통 안전 원칙이며 목표는 일상 속 디지털 생활을 쉽게 만드는 것
- 생활 도움 영역:
  - `문자·카톡 이해` — 지금 사용
  - `병원 접수 도움` — 지금 시연
  - `예약·일정 챙기기` — 확장 방향
  - `행정·생활 지원` — 확장 방향
  - `가족·사람 연결` — 공통 원칙
- 구현 상태를 `지금 사용 / 지금 시연 / 확장 방향 / 공통 원칙`으로 명시해 미구현 기능을 과장하지 않음
- Trust Check와 Hospital Kiosk를 같은 생활매니저의 두 대표 장면으로 연결

Trust Check 결과 정보 순서:

1. **무슨 뜻인가요?**
2. **위험 확인**
3. **지금 이렇게 하세요**
4. **확실하지 않은 점**
5. **필요하면 사람에게 확인하세요**

HIGH에서는 별도의 강한 안전중단 UI를 먼저 표시한다.

- `지금 멈추세요`
- 링크 클릭/송금/인증번호·개인정보 전달 중단
- 사람 확인 행동을 가장 강한 버튼으로 표시

시니어 UI 원칙:

- 큰 제목/본문
- 62px 이상 주요 행동 버튼
- 적은 선택지
- 높은 대비
- 넓은 여백
- 위험도 색상 + 텍스트 병행
- 설명보다 지금 할 행동 우선
- 모바일 우선 구성

변경 근거:

- `prototype/src/main.ts`
- `prototype/src/styles.css`

### AI context safety contract

구현:

- `prototype/src/contestAiPrompt.ts`
- `prototype/src/aiAssistedRiskAnalyzer.ts`
- `prototype/tests/aiAssistedRiskAnalyzer.test.ts`

출력 계약:

```json
{
  "summary": "쉬운 핵심 설명",
  "risk_context": "주의할 맥락",
  "safe_next_action": "안전한 다음 행동",
  "uncertainty": "확인되지 않은 점"
}
```

중요: 실제 외부 AIProvider 계약이 확인되지 않아 기본 UI 런타임에는 외부 AI 호출을 연결하지 않았다. 실제 모델 연동 완료로 표현하지 않는다.

### Hospital Kiosk Safe Guidance — 두 번째 생활 장면

공모전에서 실제 시연하는 두 번째 장면은 병원 접수 1개다.

```text
접수 시작
→ 예약 진료 선택
→ 민감정보 입력 단계
→ HIGH 안전 중단
→ 직원 도움 안내
```

기존 기능 범위는 그대로 유지했다.

UI에서는 병원 접수를 기술 데모 메뉴가 아니라 **생활매니저가 옆에서 화면을 이해시키고 행동을 안내하는 실제 생활 장면**으로 적극 노출한다. 이를 통해 제품이 문자 위험 검사 하나에 한정되지 않음을 보여준다.

구현 근거:

- `prototype/src/kioskHospitalScenario.ts`
- `prototype/tests/kioskHospitalScenario.test.ts`
- `prototype/src/main.ts`

카메라/CV/OCR이나 실제 개인정보 입력을 구현했다고 주장하지 않는다.

## 3. 자동 검증

기존 검증 기준선 Prototype CI run #70: **SUCCESS**.

공모전 UI 1차 재구성 head 기준 Prototype CI run #89: **SUCCESS**.

현재 생활매니저 정체성 보정 UI는 별도 current-head CI를 다시 통과해야 한다.

안전정책/규칙엔진을 변경하지 않고 UI 계층과 문구/레이아웃만 변경했다.

## 4. 공모전 평가 관점 대응

| 평가 관점 | 대응 |
| --- | --- |
| 문제 정의 및 제안 필요성 | 고령자가 문자·키오스크·생활 디지털 절차에서 의미와 다음 행동을 판단하기 어려운 문제 |
| 서비스 정체성 | `시니어 AI 생활매니저`가 여러 생활 장면을 돕는다는 점을 첫 화면에서 설명 |
| 창의성 및 AI 활용 적절성 | AI 문맥 설명과 결정론적 위험/권한 통제를 분리 |
| 사용자 완성도 | 큰 글자·큰 행동·적은 선택지·행동 우선 구조 |
| 확장성 | 문자 → 병원 접수 → 예약/일정 → 행정·생활지원으로 이어지는 제품 방향을 구현 상태와 분리해 제시 |
| 실현 가능성 | 실행 가능한 Trust Check + Hospital Kiosk 안전 흐름 + fallback 테스트 + CI |

## 5. aitestbed 실제 확인 사항

사용자가 `aitestbed.kr`에 로그인해 클라우드 신청 화면까지 진입했다.

확인된 값:

- 필수 입력: 프로젝트명 / 이용기간 / 이용목적
- 추천 사양: vCPU 2EA / Memory 4GB / Disk 50GB
- OS: `rocky-8.10-base`
- 1개월 우선 지원
- 2026년 클라우드 1인 1회 신청 안내

상세 기록: `docs/contest/platform-cloud-observation.md`

## 6. aitestbed 역할 경계

### Confirmed

`AitestbedVibeWorkflow`:

- 바이브코딩 생성/수정
- 소스 다운로드
- 생성 과정/결과의 공모전 증빙

### Unverified

`AitestbedModelApiProvider`

공식 추론 API 문서, 호출 계약, 실제 probe 전에는 구현하지 않는다.

## 7. MVP 배포 및 브라우저 QA

- root `vercel.json`은 `cd prototype && npm install --no-audit --no-fund && npm run build` 후 `prototype/dist`를 배포하도록 설정돼 있다.
- 저장소 공개 전환 후, 기존 무료 Hobby team `redsunjin's projects`에 Git 연동 정식 Vercel project를 Import했다. Pro Trial/결제는 시작하지 않았다.
- 정식 production URL: `https://senior-trust-gateway.vercel.app` (`READY`, `main` 배포).
- 개인정보가 없는 fixture로 정식 URL의 초기 Trust Check와 LOW/MEDIUM/HIGH를 실제 브라우저로 확인했다.
  - LOW: 안전 확정이 아님과 확인 한계 표시
  - MEDIUM: 링크 대신 공식 경로 확인 안내
  - HIGH: 행동 중단과 가족/공식 대표번호 확인 안내
- Draft PR #14 공개 Preview URL: `https://senior-trust-gateway-git-feat-modoo-2238a7-redsunjins-projects.vercel.app` (`READY`). Vercel 로그인 보호를 해제해 심사자가 바로 열 수 있다.
- 개인정보가 없는 fixture로 위 Preview의 모바일 viewport `390 × 844`에서 current product-identity UI를 실제 브라우저로 검수했다.
  - 첫 화면: `시니어 AI 생활매니저`, 문자·카톡 이해와 병원 접수 도움을 MVP 장면으로 표시하고 예약·일정/행정·생활 지원은 확장 방향으로 구분
  - LOW: 안전 확정이 아님과 확인 한계 표시
  - MEDIUM: 외부 링크를 위험 신호로 표시하고 공식 경로 확인 안내
  - HIGH: `지금 멈추세요`, 송금·사칭 압박 위험, 사람/공식 대표번호 확인 안내
  - Hospital Kiosk: 접수 시작 → 예약 진료 → 주민등록번호 입력 요청 단계 `HIGH · 멈춤` → 직원 도움 요청 → `안전 확인 대기`
  - 민감정보를 자동 진행·입력·저장하지 않음
- favicon 404 한 건은 기능 흐름과 무관하다.

## 8. 제출용 MVP 캡처

current UI head 기준 필수 후보:

1. 첫 화면 — `시니어 AI 생활매니저` + 생활 도움 영역 + 구현 상태 구분
2. Trust Check 입력/결과 또는 HIGH `지금 멈추세요`
3. Hospital Kiosk 두 번째 생활 장면
4. 민감정보 HIGH 안전중단 + 직원 도움 안내

## 9. 개인정보·보안

- 실제 문자 원문 저장 금지
- 실제 전화번호/주민등록번호/인증번호 사용 금지
- API key/token 저장·캡처 금지
- AI가 HIGH를 낮추는 표현 금지
- 공식 목록 미일치를 안전으로 표현 금지

## 10. 현재 제출 BLOCKER

### MVP/문서

- [x] Product Boundary를 `생활매니저 제품 / 안심 공통원칙`으로 정정
- [x] 생활 도움 전체가 보이는 UI 정보구조 반영
- [x] Hospital Kiosk를 두 번째 대표 생활 장면으로 적극 노출
- [x] current head CI test/build
- [x] Draft PR #14 current UI head 실제 모바일 화면 QA
- [ ] MVP 화면 캡처
- [ ] 제출문서와 구현 기능 1:1 매핑
- [ ] 최종 PDF/PPT/PPTX

### 플랫폼 증빙

- [ ] 클라우드 신청 상태 확인
- [ ] aitestbed 활용 화면 3개 이상
- [ ] 바이브코딩 생성 결과/다운로드 증빙

외부 AIProvider 직접 연동은 현재 제출 MVP의 선행조건이 아니다.
