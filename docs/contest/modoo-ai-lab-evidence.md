# 모두의 AI 실험실 경진대회 증빙 기록

Last updated: 2026-09-05

## 1. 제출 서비스

- 공모전 서비스명: **시니어 AI 생활매니저**
- 부제: **안심부터 시작하는 시니어 디지털 동행**
- 제품 본체: Senior Trust Gateway
- Phase 0 메인: Trust Check 80%
- Phase 0 확장: Kiosk Safe Guidance 20%
- Kiosk 대표 장면: **병원 접수 1개**

`시니어 AI 생활매니저`는 고령자가 문자·키오스크·공공/생활 디지털 서비스에서 “이 상황을 믿어도 되는가, 지금 무엇을 해야 하는가”를 이해하도록 돕고, 위험한 행동은 AI의 확신과 관계없이 안전정책과 사람 확인으로 통제하는 서비스다.

핵심 흐름:

```text
이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결
```

핵심 안전 원칙:

- `AI confidence != user authorization`
- `Risk != Verification`
- 공식 목록 미일치 != 안전

## 2. 저장소·융합 기준

- Repository: `Lightning-Public/senior-trust-gateway`
- Contest baseline: PR #10 / merge `f9129979bb9ab93f1f2021dbd90aadbb9409b8fe`
- Phase 0 follow-up: Draft PR #14
- Kiosk UX source: `Lightning-Public/kiosk_ar_assistant@3a7da8f`
- Roadmap: `docs/roadmap/aitestbed-kiosk-fusion.md`
- aitestbed Vibe build plan: `docs/contest/aitestbed-vibe-build-plan.md`

책임 경계:

- Senior Trust Gateway = 위험등급·검증수준·권한정책·사람 에스컬레이션
- Trust Check = 첫 핵심 기능
- Kiosk Safe Guidance = 같은 신뢰정책을 보여주는 두 번째 생활 장면
- `AIProvider` = 실제 호출 계약이 확인된 모델 공급자에 대한 공통 경계

## 3. 공모전 평가 관점 대응

| 평가 관점 | 시니어 AI 생활매니저 대응 |
| --- | --- |
| 문제 정의 및 제안 필요성 | 고령자가 문자·키오스크 등 디지털 환경의 의미·위험·다음 행동을 판단하기 어려운 문제 |
| 창의성 및 AI 활용 적절성 | AI의 문맥 이해·쉬운 설명과 결정론적 위험/권한 통제를 분리 |
| 실현 가능성 및 완성도 | 동작 Trust Check + Kiosk 병원 접수 구조화 데모 + fallback 테스트/CI + aitestbed 바이브코딩 증빙 계획 |

## 4. 실제 aitestbed 로그인·클라우드 화면 관찰

사용자가 `aitestbed.kr`에 실제 로그인한 뒤 **클라우드 신청 화면**까지 진입했다.

실제 화면에서 확인한 값:

- 필수 입력: 프로젝트명 / 이용기간 / 이용목적(최대 500자)
- 추천 사양: **vCPU 2EA / Memory 4GB / Disk 50GB**
- 추천 OS: **rocky-8.10-base**
- 1개월 우선 지원
- 2026년 클라우드 **1인당 1회 신청** 안내
- 반납 사용자는 연말까지 재신청 불가 안내

프로젝트명:

```text
시니어 AI 생활매니저
```

이용목적:

> 고령자가 문자·키오스크 등 일상 디지털 서비스를 안전하게 이용하도록 돕는 시니어 AI 생활매니저를 개발·검증합니다. AI는 문자와 화면의 의도·맥락을 이해해 쉬운 설명과 다음 행동을 제공하고, 송금·인증정보·앱 설치·개인정보·결제 등 고위험 상황은 규칙 기반 안전정책과 사람 확인 절차로 보호합니다. 모두의 AI 실험실 AI·클라우드 환경을 활용해 Trust Check와 Kiosk Safe Guidance를 하나의 생활지원형 AI 서비스로 실증합니다.

상세 기록: `docs/contest/platform-cloud-observation.md`

## 5. aitestbed 사실 경계

### Confirmed

`AitestbedVibeWorkflow`:

- 바이브코딩 프로토타입 생성·수정
- 생성 소스 다운로드
- 생성 과정/결과의 공모전 활용 증빙

### Unverified candidate

`AitestbedModelApiProvider`.

다음 네 항목이 실제 확인되기 전 외부 AI 추론 API를 구현·사용 가능으로 주장하지 않는다.

1. 공식 추론 API 문서
2. base URL / 인증 방식 / 모델 목록 / request-response schema
3. 최소 실제 호출 probe
4. 외부 프로젝트 사용·개인정보·상업 이용 범위

`내 API 키` 화면 또는 키 관리 endpoint의 존재만으로 추론 endpoint를 추정하지 않는다.

## 6. Trust Check AI 안전계약

정본 프롬프트: `prototype/src/contestAiPrompt.ts`.

출력 JSON:

```json
{
  "summary": "문자의 핵심 의도를 쉬운 말로 한 문장",
  "risk_context": "주의해야 할 맥락을 쉬운 말로 한 문장",
  "safe_next_action": "지금 할 수 있는 안전한 다음 행동 한 문장",
  "uncertainty": "확인되지 않은 점 또는 불확실성 한 문장"
}
```

규칙 안전판:

- 송금·이체
- 인증번호·비밀번호
- 앱 설치·원격제어·화면공유
- 명확한 고위험 압박 패턴

AI가 담당하는 것은 애매한 의도·사칭 맥락·쉬운 설명·불확실성 표시다. AI는 HIGH를 낮추거나 행동을 허가할 수 없다.

### 구현 재검증 결과

PR #10에는 다음이 실제 구현되어 있다.

- `contestAiPrompt.ts`
- `aiAssistedRiskAnalyzer.ts`
- `AiMessageInterpreter` / `AiInterpretation`
- `SafeAiAssistedRiskAnalyzer`
- malformed JSON / exception / timeout fallback
- HIGH downgrade 방지 테스트

그러나 현재 기본 `prototype/src/main.ts` 실행 경로는 `GroundedRiskAnalyzer`를 사용한다. 따라서 **AI 안전 레이어는 코드·테스트로 검증됐지만 확인된 실제 AIProvider가 없어 기본 UI 런타임에는 연결하지 않았다.**

이 상태를 실제 aitestbed 추론 API 연동 완료로 표현하지 않는다.

## 7. Trust Check 대표 입력

### A. 일반 일정 안내

```json
{
  "message": "내일 오후 2시에 주민센터 프로그램이 있습니다.",
  "guardrail_risk": "LOW",
  "guardrail_signals": []
}
```

기대: 쉬운 일정 설명 / 안전 확정 없음 / uncertainty 존재.

### B. 택배 외부 링크

```json
{
  "message": "배송지를 확인해 주세요 https://delivery.example/parcel",
  "guardrail_risk": "MEDIUM",
  "guardrail_signals": [
    {"id":"external-link","label":"외부 링크 포함","level":"MEDIUM"}
  ]
}
```

기대: 문자 링크를 바로 누르지 않고 공식 경로 확인.

### C. 검찰 사칭 + 안전계좌 이체

```json
{
  "message": "검찰입니다. 범죄 연루 확인을 위해 지금 안전계좌로 전액 이체하세요.",
  "guardrail_risk": "HIGH",
  "guardrail_signals": [
    {"id":"money-transfer","label":"송금·입금 요청","level":"HIGH"},
    {"id":"authority-pressure","label":"수사기관·금융기관 사칭 및 압박 가능성","level":"HIGH"}
  ]
}
```

AI 출력 내용과 관계없이 최종 결과는 HIGH 정지 정책을 유지한다.

현재 문서의 AI 예시는 fixture이며, 제출 증빙에서는 aitestbed 실제 실행 결과가 확보된 경우에만 실제 출력으로 교체한다.

## 8. Kiosk Safe Guidance — 병원 접수

공모전 확장 장면은 **병원 접수**로 확정했다.

선정 이유:

- Kiosk 원본의 큰 안내·포인터·음성형 문구 개념을 가장 단순하게 재사용 가능
- 결제/CV/OCR 없이도 단계 안내를 보여줄 수 있음
- 개인정보 단계에서 Senior Trust Gateway의 HIGH/사람 연결 정책을 명확하게 증명 가능

PR #14 구현 흐름:

```text
병원 진료 접수
→ 접수 시작 위치 안내 (LOW)
→ 예약 진료 선택 안내 (LOW)
→ 주민등록번호 전체 입력 요청 예시 (HIGH)
→ 생활매니저 자동 진행 중단
→ 직원 도움 요청
```

구현:

- `prototype/src/kioskHospitalScenario.ts`
- `prototype/tests/kioskHospitalScenario.test.ts`
- `prototype/src/main.ts`의 접힌 보조 장면

이 데모는 사전 정의 화면 구조를 사용한다. **카메라/CV/OCR/image input 완료로 주장하지 않는다.** 실제 개인정보를 입력·저장하지 않고 HIGH 단계에서 안전 중단한다.

## 9. aitestbed 바이브코딩 Phase 0

실행 정본: `docs/contest/aitestbed-vibe-build-plan.md`.

준비된 항목:

- `시니어 AI 생활매니저` 1차 생성 프롬프트
- Trust Check 80% + 병원 Kiosk 20% 구조
- 외부 AI endpoint를 추정하지 않는 기술 제약
- 생성 결과가 장황할 때의 수정 프롬프트
- CV/OCR 과장 생성 시 제거 프롬프트
- 다운로드 소스 비교/최소 포팅 기준

실제 플랫폼에서 다음을 확보해야 한다.

1. 프로젝트 생성/프로젝트명 화면
2. 프롬프트가 보이는 화면
3. 생성된 Trust Check 결과 화면
4. 가능하면 병원 Kiosk 화면
5. 생성 소스 다운로드 결과

## 10. 자동 검증

PR #10 최신 head 기준 Prototype CI run #63: **SUCCESS**.

- 기존 snapshot generator tests: PASS
- Trust Check / Grounded Verification tests: PASS
- contest AI safety suite: PASS
- `tsc --noEmit`: PASS
- Vite production build: PASS

PR #14에서는 추가로 병원 Kiosk HIGH 안전중단 테스트와 동적 결과 HTML escape 하드닝을 검증한다. 최종 CI 결과는 PR #14 완료 시 이 문서에 기록한다.

## 11. 개인정보·보안

- 실제 문자 원문을 저장소에 커밋하지 않는다.
- 캡처에는 전화번호, 이름, 인증번호, 실주소 등 개인정보를 사용하지 않는다.
- API 키/토큰을 Git·클라이언트 번들·로그에 남기지 않는다.
- 실제 AIProvider는 공식 호출 계약이 확인된 경우에만 server-side 경계로 연결한다.
- HIGH 위험을 AI가 낮추지 못하게 한다.
- 공식 목록 미일치 != 안전.
- 병원 Kiosk 데모는 개인정보 입력을 수행하지 않는다.

## 12. 증빙 캡처 경로

실제 화면 확보 후 저장한다.

```text
docs/contest/evidence/01-cloud-project.png
docs/contest/evidence/02-vibe-prompt.png
docs/contest/evidence/03-vibe-trust-check-result.png
docs/contest/evidence/04-kiosk-hospital-guidance.png
docs/contest/evidence/05-source-download.png
```

파일에 실제 개인정보나 API key가 보이면 저장하지 않는다.

## 13. 현재 BLOCKER

- [ ] 클라우드 신청 완료/승인 상태
- [ ] aitestbed 바이브코딩 프로젝트 실제 생성
- [ ] 플랫폼 화면 캡처 최소 3개
- [ ] 생성 소스 다운로드
- [ ] 생성 소스와 현재 TypeScript prototype 비교
- [ ] 필요한 UI 최소 포팅
- [ ] 실제 화면에 모델 표시명이 있으면 정확한 문자열 기록
- [ ] 외부 AI 추론 API 공식 문서/호출 probe 여부 확인
- [ ] 미리보기/배포 기능 확인
- [ ] 최종 제출 PDF/PPT/PPTX 정리

현재 Phase 0 완료 기준은 **aitestbed 바이브코딩 실제 사용 증거 + 생성 프롬프트/결과 + 다운로드 소스 + 병원 Kiosk 확장 장면 + 안전 invariant 테스트**다.
