# Contest Development Session Handoff — 2026-09-05

## Mission

`Lightning-Public/senior-trust-gateway`의 **실행 가능한 MVP와 제출 증빙을 완성해 2026 모두의 AI 실험실 AI 서비스 경진대회에 제출**한다.

마감: **2026-09-06 18:00 KST**

서비스:

> **시니어 AI 생활매니저 — 안심부터 시작하는 시니어 디지털 동행**

## 반드시 먼저 읽기

1. `docs/contest/contest-harness.md`
2. `PROJECT_STATE.md`
3. `AGENTS.md`
4. 실행 코드와 테스트
5. `docs/contest/modoo-ai-lab-evidence.md`
6. `docs/contest/platform-run-sheet.md`

하위 로드맵이 위 정본과 충돌하면 위 순서를 따른다.

## MVP 정본

MVP는 **이 저장소의 실행 가능한 prototype**이다.

### Trust Check — 80%

```text
문자/디지털 요청 입력
→ 의미 이해
→ 위험 확인
→ 쉬운 다음 행동
→ 필요 시 가족/사람 확인
```

### Hospital Kiosk Safe Guidance — 20%

```text
진료 접수
→ 예약 진료 선택
→ 민감정보 단계
→ HIGH 안전 중단
→ 직원 도움 안내
```

두 개의 별도 앱을 만들지 않는다.

공통 흐름:

> `이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결`

## 현재 Git 상태

- Repository: `Lightning-Public/senior-trust-gateway`
- Main: 공모전 baseline PR #10 병합 완료
- Follow-up branch: `feat/modoo-ai-lab-contest`
- Active Draft PR: #14
- Kiosk provenance: `Lightning-Public/kiosk_ar_assistant@3a7da8f`
- Latest validated prototype CI: run #70 — SUCCESS
- 5 test files / 35 tests passed

## 현재 구현 상태

### 구현됨

- Trust Check 규칙 기반 LOW/MEDIUM/HIGH
- Grounded Verification 경계
- AI context contract와 안전 fallback
- AI가 HIGH를 낮출 수 없는 테스트
- Hospital Kiosk 구조화 안전 데모
- Kiosk 민감정보 HIGH 중단 + 직원 도움 안내
- production build / CI

### 중요한 런타임 사실

AI context layer는 코드·테스트로 준비돼 있지만 **확인된 실제 AIProvider가 없어 기본 UI 실행 경로에 외부 AI 호출을 연결하지 않았다.**

이를 실제 AI API 연동 완료로 표현하지 않는다.

## aitestbed의 역할

aitestbed는 MVP를 대신 만드는 주체가 아니다.

### Confirmed

- 로그인 및 클라우드 신청 화면 확인
- 바이브코딩 생성·수정·소스 다운로드 활용 가능
- 플랫폼 사용 증빙 확보 가능

### 활용 원칙

- 현재 MVP를 먼저 정본으로 유지한다.
- aitestbed에서 생성한 결과가 있으면 UI/증빙 참고용으로 비교한다.
- 생성 소스 전체로 현재 저장소를 교체하지 않는다.
- 필요한 UI만 최소 포팅한다.

### Unverified

`AitestbedModelApiProvider`

공식 추론 API 문서 + 호출 계약 + 실제 probe + 이용 범위가 확인되기 전에는 구현하지 않는다.

## 세션 실행 순서

1. 현재 MVP를 실제 제출 관점에서 실행·검토한다.
2. 제출 완료 기준에서 가장 큰 빈칸 **1개**만 고른다.
3. 최소 코드/문서 변경으로 빈칸을 메운다.
4. test/build/CI를 확인한다.
5. `PROJECT_STATE.md`와 제출 증빙을 현행화한다.
6. 다음 빈칸 1개로 이동한다.

## 현재 우선 빈칸

1. 실제 MVP 화면/사용 흐름 최종 확인
2. 공모전 제출 설명과 현재 코드 1:1 매핑
3. MVP 화면 캡처
4. aitestbed 실제 활용 증빙
5. 최종 제출 PDF/PPT/PPTX

## 금지

- aitestbed에서 새 제품을 다시 설계
- 새로운 앱/대시보드/관리자 기능 추가
- Kiosk 시나리오 추가
- 두 저장소 전면 통합
- 확인되지 않은 외부 AI endpoint 구현
- CV/OCR/image input 구현
- 장기 Life OS 기능 개발
- 공모전과 직접 관계없는 리팩터링

## 완료 보고

1. 무엇을 변경했는지
2. 변경 파일
3. test/build/CI 결과
4. 공모전 완료 기준에서 채워진 것
5. 실제 플랫폼 확인 blocker
6. 다음 작업 1개
