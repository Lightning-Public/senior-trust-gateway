# System Architecture — Initial Direction

> Phase 0 architecture. 기술 스택을 확정하는 문서가 아니라 비용·신뢰·권한 원칙을 고정하는 문서다.

## Core flow

```text
Senior input
   │
   ▼
Input normalization
(text / voice / image / link)
   │
   ▼
Risk & intent router
   │
   ├─ LOW ───────► low-cost assist path
   │
   ├─ MEDIUM ────► user confirmation ─► workflow/API
   │
   └─ HIGH ──────► verification ─► Trust Circle / human
                         │
                         └─ unresolved ─► STOP safely
```

## Cost ladder

```text
Rules / deterministic checks
        ↓ only when needed
Cached context / known relationships
        ↓
Small or low-cost model
        ↓
Verified external API / official source
        ↓
Advanced reasoning / browser agent
        ↓
Human / trusted person
```

모든 요청이 최하단까지 내려가지 않는다.

## Proposed logical components

### 1. Client

- 큰 글자와 단순한 선택
- 음성 입력 우선 가능
- 문자/사진/링크 공유
- 위험 상태를 텍스트+음성으로 설명

### 2. Trust Policy Engine

- 위험등급
- 사용자별 권한
- 어떤 경우 누구에게 승인을 요청할지 결정
- 모델 판단과 실제 실행권한을 분리

### 3. Context Store

초기에는 최소 정보만 저장한다.

- Trust Circle
- 승인 정책
- 사용자가 명시한 선호
- 필요한 최소 작업 이력

민감정보를 무분별하게 장기 기억하지 않는다.

### 4. Verification Layer

공식 데이터 또는 검증 서비스를 사용할 수 있는 경우 모델 추측보다 우선한다.

### 5. Workflow / Action Layer

실행은 허용된 도구와 범위 안에서만 수행한다. 외부 서비스마다 별도 adapter를 둬 권한을 제한한다.

### 6. Escalation Layer

AI가 해결하지 못할 때 가족/지원자/전문 인력으로 문맥을 넘긴다. 사용자에게 처음부터 다시 설명하게 하지 않는 것을 목표로 한다.

### 7. Audit Layer

중요한 판단과 승인·실행을 재구성할 수 있도록 구조화된 로그를 남긴다.

## Security defaults

- least privilege
- explicit confirmation for consequential actions
- no secret collection in conversational memory
- fail closed for high-risk unresolved requests
- redact/minimize data sent to external models

## Phase 0 implementation target

실제 온라인 생활비서를 만들기 전에 한 흐름만 구현한다.

```text
의심 메시지 입력
→ 내용 설명
→ 위험 신호 판정
→ 근거 표시
→ 사용자 행동 권고
→ HIGH면 신뢰원에게 확인 요청(mock 가능)
```

이 흐름이 신뢰를 만들지 못하면 생활 대행 기능을 확장하지 않는다.
