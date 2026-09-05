# PROJECT_STATE

Last updated: 2026-09-05

## Status

**P0 merged / P0.1 Grounded Verification active**

제품 기준선과 P0 Trust Check 프로토타입은 `main`에 병합되었다. 현재 Issue #7 / Draft PR #8에서 공식 근거 확인 레이어를 구현·검증 중이다.

## Repository

- Canonical remote: `Lightning-Public/senior-trust-gateway`
- Default branch: `main`
- Current feature branch: `feat/p0-1-grounded-verification`
- Current PR: #8

## Fixed direction

- Working name: **Senior Trust Gateway**
- Product entry point: **AI 안심매니저**
- Long-term direction: 신뢰를 확보한 뒤 생활매니저로 확장
- Product sequence: **Protect → Trust → Delegate**
- Differentiator: 범용 AI 능력이 아니라 `신뢰 + 보호 + 권한관리 + 인간/가족 에스컬레이션`
- Cost principle: 상시 고성능 Agent가 아니라 단계적 승격 구조
- Trust invariant: **위험도(risk)와 실제 확인 수준(verification)을 분리한다.**
- Official-data invariant: **공식 목록 미일치 != 안전**

## P0 — merged

구현된 기본 흐름:

`문자 입력 → 위험 신호 분석 → LOW/MEDIUM/HIGH → 확인 수준 표시 → 이유 → 다음 행동 → 필요 시 가족 확인`

기술 기준:

- Vite + TypeScript 정적 웹
- 기본 분석은 `RuleBasedRiskAnalyzer`
- 기본 경로의 AI inference 비용 0
- 메시지 저장/로그인/금융 실행 없음
- GitHub Actions에서 테스트 + production build 검증

P0의 `LOW`는 안전 확인 완료를 뜻하지 않는다. 발신자, 기관, 전화번호, URL 또는 주장 자체의 진위는 별도 verification으로 다룬다.

## P0.1 — Grounded Verification

목표:

`위험 신호 검사 → 공식 근거 확인 → 확인 수준 표시`

첫 공식 근거 후보는 공공데이터포털 `한국인터넷진흥원_피싱사이트_20241231`이다.

현재 구현:

- `OfficialSourceVerifier` contract
- URL extraction / normalization
- `GroundedRiskAnalyzer`
- authoritative exact match만 `OFFICIAL_SOURCE` + HIGH 승격
- `NO_MATCH` / `UNAVAILABLE`은 안전으로 승격하지 않음
- 보호나라 공식 확인방법 handoff
- 공공데이터 서비스키를 정적 브라우저 번들에 넣지 않는 정책
- build-time official CSV ingest
- **256-way hash bucket snapshot** 생성
- 작은 manifest + URL별 필요한 bucket만 lazy load
- URL 없는 일반 메시지는 공식 데이터 요청 0회
- manifest/bucket session cache
- manifest 건수와 bucket 실제 건수/URL bucket 일치 무결성 검사
- fixture tests + generator smoke test + production build CI

## Why bucketed snapshot

공식 페이지 기준 데이터는 131,752행이다. 전체 JSON을 한 번에 모바일 브라우저로 로드하지 않고 최대 256개 버킷으로 분할한다.

URL 하나를 확인할 때 일반적으로:

`manifest → 해당 URL의 bucket 1개`

만 읽는다.

따라서 실데이터 전체 크기가 커져도 사용자 한 번의 확인에 필요한 네트워크/메모리 비용은 작은 부분 집합으로 제한된다.

## P0.1 completion still pending

- 실제 KISA 공식 CSV 1회 ingest
- 실제 manifest 총 건수/버킷별 크기 측정
- Preview 배포
- 대표 모바일 기기 UX/성능 QA

공공데이터포털 페이지는 파일데이터가 로그인 없이 다운로드 가능하다고 안내하지만, 다운로드 URL이 동적으로 처리되어 현재 자동화 환경에서는 원문 CSV를 직접 확보하지 못했다.

## Next action

1. PR #8 최신 CI와 리뷰 완료
2. grounded verification 인프라를 `main`에 병합 가능한지 결정
3. 실제 KISA CSV ingest를 별도 data increment로 추적
4. Preview 배포 확보 후 P0/P0.1 모바일 QA 수행
