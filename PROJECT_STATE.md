# PROJECT_STATE

Last updated: 2026-08-30

## Status

**P0 — Trust Check Prototype active**

제품 기준선과 개발 하네스는 `main`에 병합되었다. 현재 Issue #5 / Draft PR #6에서 첫 실행 가능한 Trust Check 프로토타입을 개발·검증 중이다.

## Fixed direction

- Working name: **Senior Trust Gateway**
- Product entry point: **AI 안심매니저**
- Long-term direction: 신뢰를 확보한 뒤 생활매니저로 확장
- Product sequence: **Protect → Trust → Delegate**
- Differentiator: 범용 AI 능력이 아니라 `신뢰 + 보호 + 권한관리 + 인간/가족 에스컬레이션`
- Cost principle: 상시 고성능 Agent가 아니라 단계적 승격 구조
- Trust invariant: **위험도(risk)와 실제 확인 수준(verification)을 분리한다.**

## First user problem

시니어가 다음과 같은 상황에서 누구를 믿어야 할지 판단하기 어렵다.

- “이 문자 눌러도 돼?”
- “은행 직원이라고 하는데 진짜야?”
- “이 앱 설치해도 돼?”
- “지원금을 준다는 연락이 진짜야?”
- “이 요청대로 돈을 보내도 돼?”

첫 제품은 모든 생활업무를 처리하는 대신 **위험한 디지털 행동 직전에 확인받는 경험**을 검증한다.

## P0 implementation

현재 브랜치: `feat/p0-trust-check-prototype`

구현된 흐름:

`문자 입력 → 위험 신호 분석 → LOW/MEDIUM/HIGH → 확인 수준 표시 → 이유 → 다음 행동 → 필요 시 가족 확인`

현재 기술 기준:

- Vite + TypeScript 정적 웹
- 기본 분석은 `RuleBasedRiskAnalyzer`
- 기본 경로의 AI inference 비용 0
- `RiskAnalyzer` 인터페이스로 향후 공식 데이터/AI 어댑터 교체 가능
- 메시지 저장/로그인/금융 실행 없음
- GitHub Actions에서 테스트 + production build 검증

## Trust behavior

P0에서 `LOW`는 **안전 확인 완료**를 뜻하지 않는다.

현재 확인 수준은 `RULES_ONLY`이며 다음만 의미한다.

> 정의된 문장 위험 신호를 찾았는지 확인했다.

발신자, 기관, 전화번호, URL 또는 주장 자체의 진위는 아직 공식 확인하지 않는다. 이 구분은 향후에도 제품 핵심 원칙으로 유지한다.

## Current coverage

대표 시나리오:

1. 일반 일정 안내 — LOW
2. 택배 외부 링크 — MEDIUM
3. 수사기관 + 범죄 + 안전계좌 이체 — HIGH
4. 인증번호 요구 — HIGH
5. 지원금 + 긴급 링크 — MEDIUM
6. 가족 새 번호 사칭 가능성 — MEDIUM
7. 단순 경찰청 정보 안내 — 기관명만으로 HIGH 처리하지 않음

## CI

초기 P0 `Prototype CI`는 성공했다. 후속 trust-copy / risk-policy 수정 후 재실행 결과를 확인해야 한다.

## Still not decided

- 실제 모바일 앱 / PWA / 전화 중심 인터페이스의 최종 형태
- 인증 구조
- 실제 가족 승인 채널
- 모델 공급자
- 서버/데이터 저장 방식
- 사업모델 및 가격

## Next milestone

**P0.1 — Grounded Verification**

규칙 판정과 별개로 최소 한 종류의 공식 출처 확인을 연결해 다음 경험을 검증한다.

`위험 신호 검사 → 공식 근거 확인 가능 여부 → 확인 수준 표시`

후보는 KISA/보호나라 등 공식 보안정보 연계이며, 실제 제공 API/이용 조건을 확인한 뒤 결정한다.

## Next action

1. PR #6 최신 커밋 CI 결과 확인
2. CI 통과 시 모바일 실제 사용 QA를 위한 Preview 배포 방식 결정
3. 공식 출처 어댑터 후보 조사 및 P0.1 Issue 분리
