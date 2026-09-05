# PROJECT_STATE

Last updated: 2026-09-05

## Status

**P0 merged / P0.1 Grounded Verification infrastructure merged**

제품 기준선, P0 Trust Check, P0.1 Grounded Verification 인프라는 `main`에 병합되었다. 현재 개발 게이트는 Issue #7의 실제 KISA 공식 데이터 적재와 Preview/모바일 QA다.

## Repository

- Canonical remote: `Lightning-Public/senior-trust-gateway`
- Default branch: `main`
- P0 merge: PR #6
- P0.1 infrastructure merge: PR #8
- Active execution issue: #7 `Grounded Verification — real KISA data & device QA`

## Fixed direction

- Working name: **Senior Trust Gateway**
- Product entry point: **AI 안심매니저**
- Long-term direction: 신뢰를 확보한 뒤 생활매니저로 확장
- Product sequence: **Protect → Trust → Delegate**
- Differentiator: 범용 AI 능력이 아니라 `신뢰 + 보호 + 권한관리 + 인간/가족 에스컬레이션`
- Cost principle: 상시 고성능 Agent가 아니라 단계적 승격 구조
- Trust invariant: **위험도(risk)와 실제 확인 수준(verification)을 분리한다.**
- Official-data invariant: **공식 목록 미일치 != 안전**

## P0 — Trust Check

기본 흐름:

`문자 입력 → 위험 신호 분석 → LOW/MEDIUM/HIGH → 확인 수준 표시 → 이유 → 다음 행동 → 필요 시 가족 확인`

- Vite + TypeScript 정적 웹
- 기본 분석은 `RuleBasedRiskAnalyzer`
- 기본 경로의 AI inference 비용 0
- 메시지 저장/로그인/금융 실행 없음
- `LOW`는 안전 확인 완료를 뜻하지 않음

## P0.1 — Grounded Verification

구현된 인프라:

- `OfficialSourceVerifier`
- URL extraction / normalization
- `GroundedRiskAnalyzer`
- authoritative exact match만 `OFFICIAL_SOURCE` + HIGH 승격
- `NO_MATCH` / `UNAVAILABLE`은 안전으로 승격하지 않음
- 보호나라 공식 확인방법 handoff
- 공공데이터 서비스키를 정적 브라우저 번들에 넣지 않는 정책
- trusted build-time official CSV ingest
- **256-way hash bucket snapshot**
- 작은 manifest + 필요한 bucket만 lazy load
- URL 없는 일반 메시지는 공식 데이터 요청 0회
- manifest/bucket session cache
- manifest/bucket 건수와 URL bucket 무결성 검사
- generator smoke test + policy tests + production build CI

## Official data freshness

2026-09-05 재확인 기준, 공공데이터포털 상세 페이지에서 직접 확인되는 파일은 여전히 `한국인터넷진흥원_피싱사이트_20241231`이며 131,752행이다. 페이지는 연간 갱신과 차기 등록 예정일 2026-04-23을 표시하지만, 현재 검색 가능한 공식 상세 페이지에서 더 최신 2025/2026 파일은 확인하지 못했다.

따라서 특정 `20241231` 파일명을 운영 로직에 고정하지 않는다. 실제 ingest 시점에 공식 포털에서 확인 가능한 최신 파일을 사용하고, 생성 manifest의 `dataDate`로 데이터 기준일을 기록한다.

## Verification

- P0.1 snapshot generator smoke test: pass
- grounded verification policy tests: pass
- production build: pass
- latest code CI before merge: Prototype CI run #32 success
- P0.1 merge commit: `c0197e99aa6647a073a93b691510658d77c19c0c`

## Roadmap decision — aitestbed + Kiosk AI

2026-09-05 기준 다음 융합 방향을 채택했다.

- Senior Trust Gateway를 신뢰·보호·권한관리 본체로 유지한다.
- `Lightning-Public/kiosk_ar_assistant`를 Kiosk Safe Guidance의 UX 원본으로 연결한다.
- 공개 확인된 aitestbed 바이브코딩은 프로토타입 생성·소스 다운로드·공모전 증빙에 사용한다.
- 외부 프로젝트용 aitestbed AI 추론 API는 공개 문서에서 확인되지 않았으므로, 공식 호출 문서와 실제 probe 전까지 `unverified candidate`로만 둔다.
- 규칙엔진은 결제·인증정보·민감정보 등 고위험 행동을 계속 통제하며 AI가 `HIGH`를 낮추지 못하게 한다.
- 단기 범위는 Trust Check 80% + Kiosk 확장 시나리오 20%다.

상세 단계, 저장소 책임 경계, aitestbed 공급자 구조와 사실 경계는 [`docs/roadmap/aitestbed-kiosk-fusion.md`](docs/roadmap/aitestbed-kiosk-fusion.md)를 기준으로 한다.

## Remaining work

- 실제 최신 KISA 공식 CSV 1회 확보/ingest
- real-data `totalRecords` / 버킷 분포 / 총 파일 크기 / 최대 버킷 크기 측정
- Preview 배포
- 대표 모바일 기기 UX/성능 QA
- 공식 match / miss / unavailable UX 실기기 확인
- aitestbed 로그인 후 외부 AI 추론 API 문서·base URL·인증·schema·이용범위 확인
- 공통 `AIProvider` 계약과 mock/안전 fallback 구현
- 실제 호출 probe 전에는 `AitestbedModelApiProvider` 미구현 유지
- `kiosk_ar_assistant@3a7da8f` 재현 빌드 및 선택적 포팅 범위 확정

## Next action

공모전 단기 경로에서는 **aitestbed 바이브코딩 실제 사용·소스 다운로드 증빙 → Kiosk 확장 화면 한 장 → `AIProvider` 계약·fallback 설계** 순서로 진행한다. 외부 추론 API는 공식 문서와 실제 probe가 확보된 경우에만 연결한다. P0.1 KISA 실데이터 적재와 Preview/모바일 QA는 병행 가능한 별도 작업으로 유지한다.
