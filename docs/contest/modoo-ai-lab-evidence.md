# 모두의 AI 실험실 경진대회 증빙 기록

Last updated: 2026-09-05

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

`시니어 AI 생활매니저`는 고령자가 문자·키오스크·공공/생활 디지털 서비스에서 “이 상황을 믿어도 되는가, 지금 무엇을 해야 하는가”를 이해하도록 돕고, 위험한 행동은 AI의 확신과 관계없이 안전정책과 사람 확인으로 통제하는 서비스다.

핵심 흐름:

```text
이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결
```

핵심 안전 원칙:

- `AI confidence != user authorization`
- `Risk != Verification`
- 공식 목록 미일치 != 안전

## 2. 현재 MVP

### Trust Check

```text
문자/디지털 요청 입력
→ LOW/MEDIUM/HIGH
→ 쉬운 이유
→ 안전한 다음 행동
→ 필요 시 가족/사람 확인
```

구현 근거:

- `prototype/src/ruleBasedAnalyzer.ts`
- `prototype/src/groundedRiskAnalyzer.ts`
- `prototype/src/main.ts`

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

중요: 실제 외부 AIProvider 계약이 확인되지 않아 기본 UI 런타임에는 외부 AI 호출을 연결하지 않았다. AI 안전 레이어는 코드/테스트 준비 상태이며 실제 모델 연동 완료로 표현하지 않는다.

### Hospital Kiosk Safe Guidance

공모전 확장 장면은 병원 접수 1개다.

```text
접수 시작
→ 예약 진료 선택
→ 민감정보 입력 단계
→ HIGH 안전 중단
→ 직원 도움 안내
```

구현 근거:

- `prototype/src/kioskHospitalScenario.ts`
- `prototype/tests/kioskHospitalScenario.test.ts`
- `prototype/src/main.ts`

카메라/CV/OCR이나 실제 개인정보 입력을 구현했다고 주장하지 않는다.

## 3. 자동 검증

PR #14 prototype 기준 Prototype CI run #70: **SUCCESS**.

- snapshot generator: PASS
- Vitest: **5 files / 35 tests passed**
- Grounded Verification: 14 PASS
- contest AI safety: 8 PASS
- rule-based analyzer: 9 PASS
- KISA 131,752-row distribution guard: 1 PASS
- hospital Kiosk safety: 3 PASS
- `tsc --noEmit && vite build`: PASS

run #70 이후 prototype 코드는 변경하지 않았고 하네스/제출 문서만 현행화했다.

## 4. 공모전 평가 관점 대응

| 평가 관점 | 대응 |
| --- | --- |
| 문제 정의 및 제안 필요성 | 고령자가 문자·키오스크 등 디지털 환경의 의미·위험·다음 행동을 판단하기 어려운 문제 |
| 창의성 및 AI 활용 적절성 | AI 문맥 설명과 결정론적 위험/권한 통제를 분리 |
| 실현 가능성 및 완성도 | 실행 가능한 Trust Check + Hospital Kiosk 안전 흐름 + fallback 테스트/CI + 플랫폼 활용 증빙 |

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

다음이 실제 확인되기 전에는 외부 AI 추론 API를 구현하지 않는다.

1. 공식 추론 API 문서
2. base URL / 인증 / 모델 / request-response schema
3. 최소 실제 호출 probe
4. 외부 프로젝트 사용·개인정보·상업 이용 범위

`내 API 키` 화면만으로 추론 API를 추정하지 않는다.

## 7. 플랫폼 증빙

플랫폼 증빙은 MVP 개발보다 우선하지 않는다.

runbook:

`docs/contest/platform-run-sheet.md`

필요 증빙:

- [x] aitestbed 로그인
- [x] 클라우드 신청 화면
- [ ] 신청 완료/승인 상태
- [ ] 플랫폼 활용 화면 3개 이상
- [ ] 바이브코딩 실제 입력/생성 결과
- [ ] 가능하면 소스 다운로드 증거

## 8. 제출용 MVP 캡처

aitestbed 화면과 별개로 **현재 저장소 MVP 자체의 실제 화면**을 제출 증빙으로 확보한다.

필수 후보:

1. 초기 Trust Check 화면
2. HIGH 또는 MEDIUM 결과
3. Hospital Kiosk 안내
4. 민감정보 HIGH 안전중단 + 직원 도움 안내

## 9. 개인정보·보안

- 실제 문자 원문 저장 금지
- 실제 전화번호/주민등록번호/인증번호 사용 금지
- API key/token 저장·캡처 금지
- AI가 HIGH를 낮추는 표현 금지
- 공식 목록 미일치를 안전으로 표현 금지

## 10. 현재 제출 BLOCKER

### MVP/문서

- [ ] 실제 MVP 사용자 흐름 최종 QA
- [ ] MVP 화면 캡처
- [ ] 제출문서와 구현 기능 1:1 매핑
- [ ] 최종 PDF/PPT/PPTX

### 플랫폼 증빙

- [ ] 클라우드 신청 상태 확인
- [ ] aitestbed 활용 화면 3개 이상
- [ ] 바이브코딩 생성 결과/다운로드 증빙

외부 AIProvider 직접 연동은 공식 계약이 확인된 경우에만 진행하며, 현재 제출 MVP의 선행조건으로 두지 않는다.
