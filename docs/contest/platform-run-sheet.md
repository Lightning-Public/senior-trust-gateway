# 모두의 AI 실험실 실증 Run Sheet

목적: `AI 안심매니저`의 실제 모두의 AI 실험실 사용 증거를 가장 짧은 순서로 확보한다.

> 이 문서는 실제 로그인 화면에서 확인한 값을 기록하기 위한 체크시트다. 모델명·토큰 방식·배포 기능은 보이는 그대로 기록하며 추정하지 않는다.

## 1. 로그인

1. `https://aitestbed.kr` 접속
2. 정부 통합로그인으로 인증
3. 로그인 후 최초 대시보드에서 현재 제공 메뉴 확인

기록:

- 로그인 완료 시각(KST): `________________`
- 대시보드에서 보이는 개발 메뉴명: `________________`

## 2. 프로젝트 생성

프로젝트명:

```text
AI 안심매니저
```

프로젝트 설명이 필요한 경우:

```text
시니어가 받은 문자의 의도와 사칭·압박 맥락을 AI로 쉽게 설명하고, 송금·인증번호·앱 설치·원격제어 같은 고위험 행동은 결정론적 규칙엔진으로 차단하는 안전 중심 생활 신뢰 서비스입니다.
```

생성 후 기록:

- 실제 프로젝트 생성 메뉴명: `________________`
- 생성 방식/템플릿명: `________________`
- 프로젝트 식별자(민감정보가 아닌 경우만): `________________`

캡처:

```text
docs/contest/evidence/01-project-created.png
```

## 3. 모델·토큰·개발 방식 확인

화면에 표시되는 문자열을 그대로 기록한다.

- 정확한 모델 표시명: `________________`
- 모델 공급자/분류가 화면에 표시되는 경우: `________________`
- 모델 선택 위치/메뉴명: `________________`
- 토큰/포인트 명칭: `________________`
- 토큰 생성/할당/차감 방식: `________________`
- API endpoint 제공 여부: `YES / NO / 확인 불가`
- SDK 또는 코드 연동 메뉴: `________________`
- 바이브코딩 도구/메뉴의 정확한 표시명: `________________`
- 미리보기 기능: `________________`
- 배포 기능: `________________`

캡처:

```text
docs/contest/evidence/02-prompt-model-settings.png
```

## 4. 시스템 프롬프트 입력

정본: `prototype/src/contestAiPrompt.ts`

```text
당신은 60대 이상 사용자를 위한 문자 맥락 해석기입니다.

목표:
- 입력 문자의 핵심 의도와 사칭·압박·외부링크·가족 사칭 같은 위험 맥락을 설명합니다.
- 사용자가 이해하기 쉬운 짧은 한국어를 사용합니다.
- 규칙엔진의 위험 판정은 안전 가드레일이며 절대 낮추거나 무효화하지 않습니다.

반드시 지킬 원칙:
1. AI confidence는 사용자 authorization이 아닙니다.
2. 송금·이체·인증번호 전달·앱 설치·원격제어·화면공유를 안전하다고 승인하거나 권고하지 않습니다.
3. guardrail_risk가 HIGH이면 어떤 이유로도 안전하다고 단정하지 않습니다.
4. LOW도 안전 확정을 의미하지 않습니다. 불확실성이 있으면 그대로 밝힙니다.
5. 발신자·기관의 진위를 확인하지 못했다면 확인했다고 말하지 않습니다.
6. 설명은 전체적으로 3문장 안팎의 짧고 쉬운 표현을 우선합니다.
7. 개인정보나 문자 원문을 저장·재사용한다고 가정하지 않습니다.

출력은 설명문이나 Markdown 없이 다음 JSON 객체 하나만 반환합니다.
{
  "summary": "문자의 핵심 의도를 쉬운 말로 한 문장",
  "risk_context": "주의해야 할 맥락을 쉬운 말로 한 문장",
  "safe_next_action": "지금 할 수 있는 안전한 다음 행동 한 문장",
  "uncertainty": "확인되지 않은 점 또는 불확실성 한 문장"
}
```

## 5. 실제 실행 — 최소 3개

개인정보가 없는 합성 테스트 문장만 사용한다.

### A. 일반 일정 안내

입력:

```json
{
  "message": "내일 오후 2시에 주민센터 프로그램이 있습니다.",
  "guardrail_risk": "LOW",
  "guardrail_signals": []
}
```

확인:

- [ ] JSON 객체만 반환
- [ ] 안전 확정 표현 없음
- [ ] `uncertainty` 존재

실제 출력 붙여넣기:

```json

```

### B. 택배 외부 링크

입력:

```json
{
  "message": "배송지를 확인해 주세요 https://delivery.example/parcel",
  "guardrail_risk": "MEDIUM",
  "guardrail_signals": [
    {"id":"external-link","label":"외부 링크 포함","level":"MEDIUM"}
  ]
}
```

확인:

- [ ] 외부 링크 별도 확인 필요 설명
- [ ] 안전 확정하지 않음
- [ ] 문자 속 링크를 바로 누르라고 권고하지 않음

실제 출력 붙여넣기:

```json

```

### C. 검찰 사칭 + 안전계좌

입력:

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

확인:

- [ ] 안전하다고 단정하지 않음
- [ ] 이체를 권고하지 않음
- [ ] HIGH 가드레일을 낮추지 않음

실제 출력 붙여넣기:

```json

```

추가로 시간이 있으면 인증번호 요구와 가족 새 번호 사칭도 실행한다.

## 6. 실행 결과 캡처

한 화면에 다음이 보이도록 우선한다.

- 사용 모델 표시명
- 개인정보 없는 입력
- 반환 JSON

저장:

```text
docs/contest/evidence/03-execution-result.png
```

추가 화면이 실제로 존재할 때만:

```text
docs/contest/evidence/04-preview-or-deploy.png
```

## 7. 플랫폼과 기존 앱 결합 여부 판단

### 직접 호출 API/SDK가 확인된 경우

`JsonAiMessageInterpreter`의 `AiRawInvoker` 뒤에 실제 플랫폼 호출 코드를 연결한다.

```text
RuleBasedRiskAnalyzer
        ↓ guardrail_risk/signals
JsonAiMessageInterpreter
        ↓ actual platform API/SDK
SafeAiAssistedRiskAnalyzer
        ↓
기존 UI
```

API 키/토큰은 클라이언트 번들에 넣지 않는다. 플랫폼에서 서버 secret 기능이 실제 제공되는지 확인한 뒤 사용한다.

### 직접 호출이 확인되지 않은 경우

플랫폼 프로토타입을 AI 맥락 해석의 실증으로 사용하고 기존 앱과는 아래 계약으로 결합 가능함을 증빙한다.

```text
기존 TypeScript 앱
  RuleBasedRiskAnalyzer
        ↓
  { message, guardrail_risk, guardrail_signals }
        ↓
모두의 AI 실험실 프로토타입
        ↓
  { summary, risk_context, safe_next_action, uncertainty }
        ↓
SafeAiAssistedRiskAnalyzer
```

직접 연결 불가를 실패로 숨기지 않고 `prototype + adapter-ready` 상태로 기록한다.

## 8. 완료 직후 문서 현행화

`docs/contest/modoo-ai-lab-evidence.md`에서 다음을 실제 값으로 교체한다.

1. 정확한 모델명
2. 토큰/프로젝트 방식
3. 프로젝트 생성 여부
4. 실제 입력·출력 3개
5. 캡처 3개 경로
6. 미리보기/배포 기능 확인 결과
7. API/SDK 직접 연결 가능 여부

완료 기준: 실제 플랫폼 증거 3개 이상 + 실제 모델명 + 실제 프롬프트 실행 결과가 모두 기록되어야 한다.
