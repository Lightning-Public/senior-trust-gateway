# Agent Prompts

반복 가능한 개발/검증 작업의 프롬프트를 저장한다.

## 원칙

- 제품 핵심 규칙을 프롬프트 안에 복제하기보다 `AGENTS.md`와 관련 문서를 먼저 읽도록 한다.
- 긴 만능 프롬프트 하나보다 역할이 분명한 작은 프롬프트를 사용한다.
- 실행 권한이 필요한 프롬프트에는 안전 경계를 명시한다.
- 외부 서비스/보안 판단은 공식 근거 확인을 요구한다.

## Active contest session rule

2026 모두의 AI 실험실 공모전 작업 세션은 별도 프롬프트를 새로 확장하지 말고 먼저 아래 정본을 따른다.

1. `docs/contest/contest-harness.md`
2. `PROJECT_STATE.md`
3. 실행 코드/테스트

공모전 목적은 **현재 저장소의 실행 가능한 MVP 완성 + 제출문서/증빙 완성**이다.

aitestbed 바이브코딩 결과는 MVP 정본이 아니라 플랫폼 활용 증빙과 UI 비교용 참고물이다.

Scope Gate를 통과하지 못하는 아이디어·기능·리팩터링은 공모전 이후 backlog로 넘긴다.

## Planned prompts

- `trust-check-prototype.md`
- `risk-policy-review.md`
- `senior-ux-review.md`
- `integration-source-verification.md`

실제 반복 작업이 생길 때 추가한다. 미리 과도하게 생성하지 않는다.
