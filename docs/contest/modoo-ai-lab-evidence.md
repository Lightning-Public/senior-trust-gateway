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
- Phase 0 메인: Trust Check 80%
- Phase 0 확장: Hospital Kiosk Safe Guidance 20%

`시니어 AI 생활매니저`는 사용자를 대신 판단하는 AI가 아니다.

> **위험한 행동 전에 멈춰주고, 상황을 이해하기 쉽게 설명하고, 안전한 다음 행동을 알려주며, 필요하면 사람에게 확인하도록 연결하는 생활매니저**다.

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

### Trust Check

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

### 공모전 제출 UI/UX — 2026-09-06

기능 추가 없이 첫 화면과 결과 흐름을 **시니어 AI 생활매니저** 중심으로 재구성했다.

첫 화면에서 바로 확인 가능한 내용:

- 서비스명: `시니어 AI 생활매니저`
- 핵심 메시지: `위험한 행동 전에 먼저 멈춰드려요.`
- 역할: 쉽게 이해 → 위험 확인 → 다음 행동 → 필요 시 사람 확인
- 첫 행동: 받은 문자/카톡 붙여넣기 → `이 내용 안심 확인하기`

결과 정보 순서:

1. **무슨 뜻인가요?** — 문자 의미를 쉬운 문장으로 설명
2. **위험 확인** — LOW/MEDIUM/HIGH와 위험 근거
3. **지금 이렇게 하세요** — 즉시 실행 가능한 안전 행동
4. **확실하지 않은 점** — verification 수준과 공식 자료 확인 한계
5. **필요하면 사람에게 확인하세요** — 가족/공식 기관 확인 안내

HIGH에서는 별도의 강한 안전중단 UI를 먼저 표시한다.

- `지금 멈추세요`
- 링크 클릭/송금/인증번호·개인정보 전달 중단
- 사람 확인 행동을 강한 버튼으로 표시

시니어 UI 원칙 반영:

- 큰 제목/본문
- 62px 이상 주요 행동 버튼
- 적은 선택지
- 높은 대비
- 넓은 여백
- 위험도는 색상 + 텍스트 동시 표시
- 설명보다 지금 할 행동 우선
- 모바일 우선 단일 컬럼

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

### Hospital Kiosk Safe Guidance

공모전 확장 장면은 병원 접수 1개다.

```text
접수 시작
→ 예약 진료 선택
→ 민감정보 입력 단계
→ HIGH 안전 중단
→ 직원 도움 안내
```

기존 기능 범위는 그대로 유지했다.

UI에서는 접힌 기술 메뉴가 아니라 **두 번째 생활 장면**으로 배치하여 Trust Check와 같은 생활매니저 경험으로 이어지게 했다.

구현 근거:

- `prototype/src/kioskHospitalScenario.ts`
- `prototype/tests/kioskHospitalScenario.test.ts`
- `prototype/src/main.ts`

카메라/CV/OCR이나 실제 개인정보 입력을 구현했다고 주장하지 않는다.

## 3. 자동 검증

### 기존 검증 기준선

Prototype CI run #70: **SUCCESS**

- Vitest: 5 files / 35 tests passed
- Grounded Verification: 14 PASS
- contest AI safety: 8 PASS
- rule-based analyzer: 9 PASS
- KISA 131,752-row distribution guard: 1 PASS
- hospital Kiosk safety: 3 PASS
- `tsc --noEmit && vite build`: PASS

### 공모전 UI 재구성 후 검증

UI 코드 head `12fe8cc7b5edceb2ca0b8a6756b24a91dc3ebffd` 기준 Prototype CI run #89: **SUCCESS**.

- install dependencies: PASS
- snapshot generator: PASS
- risk policy tests: PASS
- production build: PASS

안전정책/규칙엔진을 변경하지 않고 UI 계층과 문구/레이아웃만 변경했다.

## 4. 공모전 평가 관점 대응

| 평가 관점 | 대응 |
| --- | --- |
| 문제 정의 및 제안 필요성 | 고령자가 문자·키오스크 등 디지털 환경에서 의미·위험·다음 행동을 빠르게 판단하기 어려운 문제 |
| 서비스 정체성 | 첫 화면에서 `시니어 AI 생활매니저`와 보호 역할을 즉시 설명 |
| 창의성 및 AI 활용 적절성 | AI 문맥 설명과 결정론적 위험/권한 통제를 분리 |
| 사용자 완성도 | Trust Check를 첫 행동으로 두고 HIGH 안전중단과 사람 확인을 가장 강하게 표시 |
| 확장성 | 병원 키오스크를 별도 앱이 아닌 같은 안전정책의 두 번째 생활 장면으로 제시 |
| 실현 가능성 | 실행 가능한 Trust Check + Hospital Kiosk 안전 흐름 + fallback 테스트 + CI |

## 5. aitestbed 실제 확인 사항

사용자가 `aitestbed.kr`에 로그인해 클라우드 신청 화면까지 진입했다.

확인된 값:

- 필수 입력: 프로젝트명 / 이용기간 / 이용목적
- 추천 사양: vCPU 2EA / Memory 4GB / Disk 50GB
- OS: `rocky-8.10-base`
- 1개월 우선 지원
- 2026년 클라우드 1인 1회 신청 안내

상세 기록:

`docs/contest/platform-cloud-observation.md`

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
- 개인정보가 없는 fixture로 정식 URL에서 초기 Trust Check와 LOW/MEDIUM/HIGH를 실제 브라우저로 다시 확인했다.
  - LOW: 안전 확정이 아님과 확인 한계 표시
  - MEDIUM: 링크 대신 공식 경로 확인 안내
  - HIGH: 행동 중단과 가족/공식 대표번호 확인 안내
- `main`에는 current UI head의 Hospital Kiosk Safe Guidance가 아직 포함되지 않는다. Draft PR #14는 Git 연동 Preview로 배포해 Trust Check와 키오스크 전체 흐름을 새 화면 기준으로 재검수한다.

## 8. 제출용 MVP 캡처

current UI head 기준 필수 후보:

1. 첫 화면 — `시니어 AI 생활매니저` + 핵심 메시지 + Trust Check 입력
2. HIGH 결과 — `지금 멈추세요` + 5단계 결과 + 사람 확인
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

- [x] 공모전용 시니어 AI 생활매니저 UI/UX 재구성
- [x] current UI code test/build CI
- [x] 무료 Vercel team project import 및 정식 URL Trust Check QA
- [ ] Draft PR #14 current UI head 실제 모바일 화면 QA
- [ ] MVP 화면 캡처
- [ ] 제출문서와 구현 기능 1:1 매핑
- [ ] 최종 PDF/PPT/PPTX

### 배포

- [x] 무료 Vercel team의 Git 연동 정식 production URL 확보
- [ ] Draft PR #14 Preview URL 및 해당 URL의 최종 모바일 QA

### 플랫폼 증빙

- [ ] 클라우드 신청 상태 확인
- [ ] aitestbed 활용 화면 3개 이상
- [ ] 바이브코딩 생성 결과/다운로드 증빙

외부 AIProvider 직접 연동은 현재 제출 MVP의 선행조건이 아니다.
