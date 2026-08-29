# Senior Trust Gateway

시니어가 AI와 디지털 서비스를 **안심하고 사용할 수 있게 하는 신뢰·보호·권한관리 레이어**를 만드는 프로젝트입니다.

## Product thesis

생활매니저는 최종 형태입니다. 시장 진입점은 먼저 사용자를 보호하고 신뢰를 쌓는 `AI 안심매니저`입니다.

**Protect → Trust → Delegate**

1. **Protect** — 문자·링크·전화·요청이 안전한지 확인한다.
2. **Trust** — AI가 무엇을 할 수 있고 언제 사람에게 넘기는지 명확히 한다.
3. **Delegate** — 충분한 신뢰가 쌓인 생활업무부터 대신 처리한다.

## 핵심 원칙

- AI가 확실하지 않은 내용을 확정적으로 말하지 않는다.
- 저위험 업무는 자동화하되, 위험이 커질수록 사용자 확인 또는 신뢰원 승인을 요구한다.
- 결제, 계약, 민감정보 제공 등 고위험 행동은 기본적으로 AI 단독 실행 대상이 아니다.
- 상시 고비용 에이전트보다 규칙·정형 워크플로·저비용 모델을 먼저 사용한다.
- 외부 공식 서비스의 기능을 중복 구축하기보다 검증된 연계 수단을 사용한다.
- 시니어가 이해하기 쉬운 언어와 흐름을 우선한다.

## 저장소 구조

```text
.
├─ AGENTS.md
├─ PROJECT_STATE.md
├─ docs/
│  ├─ architecture/system-architecture.md
│  ├─ handoffs/README.md
│  └─ product/
│     ├─ product-brief.md
│     ├─ trust-model.md
│     └─ ecosystem-map.md
├─ .agent/prompts/README.md
└─ prototype/README.md
```

## 현재 단계

제품 기준선과 개발 하네스를 구축하는 단계입니다. 첫 프로토타입은 **의심 문자/링크 확인 + 위험도 설명 + 가족 신뢰원 에스컬레이션** 경험을 검증하는 것을 우선합니다.

현재 진행상태는 [`PROJECT_STATE.md`](PROJECT_STATE.md)를 기준으로 확인합니다.
