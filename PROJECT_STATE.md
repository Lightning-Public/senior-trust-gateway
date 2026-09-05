# PROJECT_STATE

Last updated: 2026-09-05

## Status

**P0 baseline merged / P0.1 Grounded Verification active**

- Repository transferred to `Lightning-Public/senior-trust-gateway`
- P0 Trust Check baseline merged through PR #6
- P0 mobile/browser device QA remains open because no preview deployment project is connected yet
- Current implementation branch: `feat/p0-1-grounded-verification`
- Current tracking issue: #7

## Fixed direction

- Working name: **Senior Trust Gateway**
- Product entry point: **AI 안심매니저**
- Long-term direction: 신뢰를 확보한 뒤 생활매니저로 확장
- Product sequence: **Protect → Trust → Delegate**
- Differentiator: 범용 AI 능력이 아니라 `신뢰 + 보호 + 권한관리 + 인간/가족 에스컬레이션`
- Cost principle: 상시 고성능 Agent가 아니라 단계적 승격 구조
- Trust invariant: **위험도(risk)와 실제 확인 수준(verification)을 분리한다.**
- Grounding invariant: **공식 목록 미일치는 안전 판정이 아니다.**

## P0 — merged baseline

구현된 흐름:

`문자 입력 → 위험 신호 분석 → LOW/MEDIUM/HIGH → 확인 수준 표시 → 이유 → 다음 행동 → 필요 시 가족 확인`

기술 기준:

- Vite + TypeScript 정적 웹
- 기본 분석은 `RuleBasedRiskAnalyzer`
- 기본 경로 AI inference 비용 0
- 메시지 저장/로그인/금융 실행 없음
- GitHub Actions test + production build 검증

P0의 `LOW`는 안전 확인 완료를 뜻하지 않는다. 기본 확인 수준은 `RULES_ONLY`다.

## P0.1 — Grounded Verification

목표:

`위험 신호 검사 → 공식 근거 대조 → 확인 수준 표시`

현재 구현:

- `OfficialSourceVerifier` contract
- HTTP URL extraction / normalization
- `KisaPhishingSnapshotVerifier`
- `GroundedRiskAnalyzer`
- authoritative 공식 URL match만 `OFFICIAL_SOURCE` + HIGH로 승격
- NO_MATCH / UNAVAILABLE은 기존 위험도 유지
- 보호나라 공식 스미싱 확인방법 handoff
- API key 없는 fixture 기반 테스트

## Official-source policy

### KISA 보호나라

공식 대국민 스미싱 확인서비스로 수동 handoff만 제공한다. 공식 개발 API 계약이 확인되지 않은 상태에서 scraping/비공식 자동화를 하지 않는다.

### KISA phishing-site public data

공공데이터포털의 `한국인터넷진흥원_피싱사이트`를 첫 공식 데이터 후보로 사용한다.

- 공개 데이터는 연간 스냅샷으로 취급
- 실시간 안전 판별로 표현하지 않음
- Open API 서비스키를 정적 브라우저 번들에 넣지 않음
- 운영 연동은 서버 adapter 또는 신뢰된 build-time snapshot 방식만 허용

## Remaining P0 gate

- 실제 Preview URL 확보
- 모바일/브라우저 실사용 QA

Vercel 연결 계정에는 현재 프로젝트가 없어 자동 Preview를 만들지 못했다. 저장소에는 `vercel.json`이 있으므로 프로젝트 Import 후 Preview QA 가능하다.

## Next gate

1. P0.1 Draft PR CI 확인
2. 공식 스냅샷 miss가 안전으로 승격되지 않는지 리뷰
3. snapshot ingest/server adapter 중 첫 운영 방식 결정
4. Preview 확보 시 P0 device QA 완료 및 Issue #5 종료 판단
