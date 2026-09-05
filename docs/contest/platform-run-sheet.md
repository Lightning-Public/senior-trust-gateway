# 모두의 AI 실험실 실증 Run Sheet

목적: `시니어 AI 생활매니저`의 실제 모두의 AI 실험실 사용 증거를 가장 짧은 순서로 확보한다.

> 화면에 보이는 값만 기록한다. 모델명·토큰·API·image input·배포 기능은 추정하지 않는다.

## 1. 서비스 기준

- 프로젝트명: **시니어 AI 생활매니저**
- 부제: **안심부터 시작하는 시니어 디지털 동행**
- Trust Check 80%
- Kiosk Safe Guidance 20%
- Kiosk 장면: **병원 접수 1개**
- 공통 흐름: `이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결`

## 2. 클라우드 신청 상태 확인

`aitestbed.kr` 로그인 후 클라우드 신청 또는 마이스튜디오에서 현재 상태를 확인한다.

이미 실제 화면에서 확인된 추천값:

- vCPU 2EA
- Memory 4GB
- Disk 50GB
- OS: `rocky-8.10-base`
- 1개월 우선 지원
- 2026년 1인 1회 신청 제한

기록:

```text
신청 완료/대기/승인 상태:
신청일시(KST):
실제 이용기간:
```

캡처:

```text
docs/contest/evidence/01-cloud-project.png
```

## 3. aitestbed 바이브코딩 프로젝트 생성

정본: `docs/contest/aitestbed-vibe-build-plan.md`.

프로젝트명:

```text
시니어 AI 생활매니저
```

1차 생성에는 위 문서의 `aitestbed에 붙여 넣을 1차 생성 프롬프트`를 그대로 사용한다.

중요:

- 외부 AI API endpoint를 요청하지 않는다.
- API key를 코드에 넣지 않는다.
- CV/OCR/image input을 완료 기능으로 만들지 않는다.
- HIGH를 AI가 낮출 수 없는 구조를 요구한다.
- Kiosk는 병원 접수 1개만 만든다.

캡처:

```text
docs/contest/evidence/02-vibe-prompt.png
```

확인할 값:

```text
바이브코딩 메뉴/도구의 정확한 표시명:
프로젝트 생성 시각(KST):
화면에 모델 표시명이 실제로 보이는가: YES / NO
보인다면 정확한 문자열:
```

## 4. 생성 결과 확인

Trust Check 화면에서 최소 다음이 보이는지 확인한다.

- `이 문자, 믿어도 될까요?`
- 문자 입력 영역
- LOW / MEDIUM / HIGH 행동 문구
- `무슨 뜻인가요?`
- `위험 확인`
- `지금 이렇게 하세요`
- `확실하지 않은 점`
- HIGH에서 사람 확인 경로

생성본이 AI가 위험을 직접 결정하는 것처럼 보이면 build plan의 수정 프롬프트를 사용해 `규칙 안전판`과 `AI 설명`을 분리한다.

캡처:

```text
docs/contest/evidence/03-vibe-trust-check-result.png
```

## 5. 병원 Kiosk Safe Guidance 확인

Kiosk는 아래 흐름 하나만 확인한다.

```text
진료 접수
→ 접수 시작
→ 예약 진료 선택
→ 본인 확인 정보 입력 화면
→ 주민등록번호 전체 입력 요청 예시에서 HIGH
→ 자동 진행 중단
→ 직원 도움 요청
```

확인 조건:

- 큰 글씨/큰 버튼
- 노란 포인터 또는 명확한 다음 위치 강조
- HIGH에서 계속 진행 버튼이 없음
- 개인정보를 대신 입력하거나 저장하지 않음
- `구조화된 화면 데모이며 실제 CV/OCR이 아님` 표시

캡처:

```text
docs/contest/evidence/04-kiosk-hospital-guidance.png
```

## 6. 생성 소스 다운로드

바이브코딩 생성 소스를 다운로드한다.

기록:

```text
다운로드 파일명:
다운로드 시각(KST):
주요 프레임워크/파일 구조:
```

캡처 또는 파일 목록 증빙:

```text
docs/contest/evidence/05-source-download.png
```

원본 다운로드 소스를 제공받으면 `senior-trust-gateway`의 현재 TypeScript prototype과 비교한다.

비교 우선순위:

1. 레이아웃/시니어 UX
2. Trust Check 결과 카드
3. 병원 Kiosk 단계/포인터 표현
4. 접근성

가져오지 않는 것:

- 추정 AI endpoint
- client-side API key
- AI가 HIGH를 낮추는 코드
- 실제 개인정보 저장
- 확인되지 않은 CV/OCR
- 기존 `RuleBasedRiskAnalyzer` / `GroundedRiskAnalyzer`를 대체하는 생성 로직

## 7. Trust Check 실제 AI 출력 — 조건부

외부 AI 추론 API 또는 플랫폼 내부 실제 모델 실행 기능이 **실제 화면에서 확인된 경우에만** 수행한다.

정본 프롬프트: `prototype/src/contestAiPrompt.ts`.

### A. 일반 일정 안내

```json
{
  "message": "내일 오후 2시에 주민센터 프로그램이 있습니다.",
  "guardrail_risk": "LOW",
  "guardrail_signals": []
}
```

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

### C. 검찰 사칭 + 안전계좌

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

실제 출력은 `summary`, `risk_context`, `safe_next_action`, `uncertainty` JSON인지 확인한다. HIGH에서는 안전 단정/이체 권고가 없어야 한다.

실제 모델 실행 기능이 확인되지 않으면 이 단계는 **BLOCKED/UNVERIFIED**로 남기고 fixture를 실제 출력으로 바꾸지 않는다.

## 8. API/모델 capability 확인 — 조건부

화면에 실제로 보이는 경우에만 기록한다.

```text
정확한 모델 표시명:
모델 공급자/분류:
토큰/포인트 명칭:
AI API endpoint 제공 여부: YES / NO / 확인 불가
인증 방식:
SDK/코드 연동 메뉴:
image input: YES / NO / 확인 불가
미리보기 기능:
배포 기능:
```

`내 API 키` 화면만으로 외부 추론 API가 있다고 결론내리지 않는다.

## 9. 완료 기준

Phase 0 플랫폼 증빙 완료 조건:

- [ ] 클라우드 신청/상태 화면
- [ ] 바이브코딩 프로젝트 생성
- [ ] 생성 프롬프트 화면
- [ ] 생성된 Trust Check 화면
- [ ] 병원 Kiosk 확장 화면
- [ ] 생성 소스 다운로드
- [ ] 다운로드 소스와 현재 prototype 비교 기록
- [ ] 실제 모델/API 기능은 확인된 것과 미확인 항목을 분리 기록

최소 제출 증거: **플랫폼 화면 3개 이상 + 실제 생성 프롬프트/결과 + 다운로드 소스 + 병원 Kiosk 장면 + 안전정책 테스트 결과**.
