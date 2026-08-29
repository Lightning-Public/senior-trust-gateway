# PROJECT_STATE

Last updated: 2026-08-30

## Status

**Phase 0 — Product baseline & harness**

저장소 초기 기준선을 구축 중이다. 아직 제품 구현이나 기술 스택은 확정하지 않았다.

## Fixed direction

- Working name: **Senior Trust Gateway**
- Product entry point: **AI 안심매니저**
- Long-term direction: 신뢰를 확보한 뒤 생활매니저로 확장
- Product sequence: **Protect → Trust → Delegate**
- Differentiator: 범용 AI 능력이 아니라 `신뢰 + 보호 + 권한관리 + 인간/가족 에스컬레이션`
- Cost principle: 상시 고성능 Agent가 아니라 단계적 승격 구조

## First user problem

시니어가 다음과 같은 상황에서 누구를 믿어야 할지 판단하기 어렵다.

- “이 문자 눌러도 돼?”
- “은행 직원이라고 하는데 진짜야?”
- “이 앱 설치해도 돼?”
- “지원금을 준다는 연락이 진짜야?”
- “이 요청대로 돈을 보내도 돼?”

첫 제품은 모든 생활업무를 처리하는 대신 **위험한 디지털 행동 직전에 확인받는 경험**을 검증한다.

## MVP hypothesis

사용자가 받은 문자/링크/이미지를 보여주면 시스템이:

1. 내용을 쉬운 말로 설명한다.
2. 위험 신호를 분류한다.
3. 가능한 경우 공식 근거를 확인한다.
4. `괜찮음 / 확인 필요 / 하지 말 것`처럼 단순한 행동 제안을 제공한다.
5. 불확실하거나 고위험이면 가족 등 등록된 신뢰원에게 에스컬레이션한다.

## Not decided yet

- 모바일 앱 / PWA / 전화 중심 인터페이스
- 인증 구조
- 실제 가족 승인 채널
- 모델 공급자
- 외부 서비스 API 목록
- 서버/데이터 저장 방식
- 사업모델 및 가격

이 항목들은 프로토타입 검증 전 과도하게 확정하지 않는다.

## Next milestone

**P0: Trust Check Prototype**

최소 한 가지 의심 메시지 시나리오에서 다음 흐름을 끝까지 검증한다.

`입력 → 설명 → 위험도 → 근거 → 행동 권고 → 필요 시 신뢰원 요청`

## Next action

P0용 Issue를 만들고, UX 흐름과 최소 기술 스택을 결정한다.
