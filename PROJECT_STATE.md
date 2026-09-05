# PROJECT_STATE

Last updated: 2026-09-05

## Status

**P0 merged / P0.1 Grounded Verification infrastructure merged / aitestbed + Kiosk fusion roadmap merged / contest hardening in Draft PR #10**

제품 기준선, P0 Trust Check, P0.1 Grounded Verification 인프라와 `docs/roadmap/aitestbed-kiosk-fusion.md` 융합 로드맵은 `main`에 병합되었다. 기존 개발 게이트는 Issue #7의 실제 KISA 공식 데이터 적재와 Preview/모바일 QA다.

2026-09-06 18:00 KST 마감인 `모두의 AI 실험실 AI 서비스 경진대회` 대응을 위해 `feat/modoo-ai-lab-contest` / Draft PR #10에서 AI 맥락 해석 어댑터, 안전 fallback, 필수 시나리오 테스트, 제출 증빙 문서를 우선 보완 중이다.

사용자는 `aitestbed.kr`에 실제 로그인하여 클라우드 신청 화면까지 진입했다. 현재까지 실제 화면에서 클라우드 신청 필드, 추천 사양(vCPU 2 / Memory 4GB / Disk 50GB), `rocky-8.10-base`, 1개월 우선 지원 및 2026년 1인 1회 신청 제한을 확인했다. 정확한 모델 표시명·AI API 승인 상태·토큰 방식·실제 모델 출력은 아직 확인되지 않았으므로 추정하지 않는다.

공개 공식 자료 재검증으로 다음은 확인 완료했다.

- `aitestbed.kr` 로그인 진입은 **정부 통합로그인** 안내를 사용
- 모두의 AI 실험실은 자연어 기반 바이브코딩, 생성형 AI 모델 이용 토큰, 민간 클라우드, 개발지원도구를 지원
- 공공·민간 데이터 약 9만 9천 건, API 약 1만 3천 건 지원 안내
- 경진대회 서면평가는 **문제 정의 및 제안 필요성 / 창의성 및 AI 활용 적절성 / 실현 가능성 및 완성도**를 종합 평가

## Repository

- Canonical remote: `Lightning-Public/senior-trust-gateway`
- Default branch: `main`
- P0 merge: PR #6
- P0.1 infrastructure merge: PR #8
- aitestbed + Kiosk fusion roadmap: PR #12 / main merge `7553cfe9490ca1daec69cca03baafeaaa5495432`
- Contest hardening: Draft PR #10 `feat/modoo-ai-lab-contest`
- Active grounded-verification issue: #7 `Grounded Verification — real KISA data & device QA`
- Kiosk UX reference: `Lightning-Public/kiosk_ar_assistant@3a7da8f`

## Fixed direction

- Working name: **Senior Trust Gateway**
- Product entry point: **AI 안심매니저**
- Integrated service expression: **AI 안심동행 — 문자부터 키오스크까지, 행동 전에 확인하는 시니어 디지털 신뢰 게이트웨이**
- Long-term direction: 신뢰를 확보한 뒤 생활매니저와 공공 디지털 안내로 확장
- Product sequence: **Protect → Trust → Delegate**
- Differentiator: 범용 AI 능력이 아니라 `신뢰 + 보호 + 권한관리 + 인간/가족 에스컬레이션`
- Cost principle: 상시 고성능 Agent가 아니라 단계적 승격 구조
- Trust invariant: **위험도(risk)와 실제 확인 수준(verification)을 분리한다.**
- Official-data invariant: **공식 목록 미일치 != 안전**
- AI authorization invariant: **AI confidence != user authorization**
- Contest scope: **Trust Check 80% + Kiosk 확장 시나리오 20%**

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

## Contest hardening — AI context layer

Draft PR #10에서 다음 구조를 추가했다.

- `AiMessageInterpreter` / `AiInterpretation` 계약
- JSON 출력 필드: `summary`, `risk_context`, `safe_next_action`, `uncertainty`
- `CONTEST_AI_SYSTEM_PROMPT`
- `JsonAiMessageInterpreter` 호출 어댑터 경계
- `SafeAiAssistedRiskAnalyzer`
- 모델 장애·지연·잘못된 JSON → 규칙엔진 fallback
- AI는 LOW/MEDIUM 설명을 쉽게 바꿀 수 있지만 위험도와 최종 행동 권고 권한은 없음
- HIGH는 AI 출력과 무관하게 결정론적 정지 메시지/행동 권고 유지
- 플랫폼 API/SDK가 확인되지 않아 endpoint는 하드코딩하지 않음
- `docs/contest/modoo-ai-lab-evidence.md`
- `docs/contest/ai-use-one-page.md`
- `docs/contest/platform-run-sheet.md`
- `docs/contest/platform-cloud-observation.md`

PR #12에서 확정한 `AIProvider` 방향과 PR #10의 `JsonAiMessageInterpreter`는 충돌하지 않는다. PR #10의 호출 함수 주입 경계를 공통 `AIProvider`/`AitestbedProvider`의 선행 구현으로 보고, 실제 aitestbed API 규격을 확인한 뒤 서버 측 provider로 구체화한다.

## Contest evaluation fit

공식 서면평가 관점에 현재 산출물을 대응한다.

- **문제 정의 및 제안 필요성**: 시니어의 디지털 신뢰 판단 문제와 피해 예방
- **창의성 및 AI 활용 적절성**: 규칙으로 처리하기 어려운 애매한 문자 의도·사칭 맥락을 AI가 담당하고, 결정론적 안전 권한과 분리
- **실현 가능성 및 완성도**: 동작 프로토타입 + 안전 어댑터 + fallback + 자동 테스트/CI + 실제 aitestbed 클라우드 신청 단계 진입
- **확장성**: 같은 신뢰정책과 AIProvider를 `kiosk_ar_assistant`의 화면·음성·포인터 UX에 선택적으로 연결하는 단계형 로드맵

## Official data freshness

2026-09-05 재확인 기준, 공공데이터포털 상세 페이지에서 직접 확인되는 파일은 여전히 `한국인터넷진흥원_피싱사이트_20241231`이며 131,752행이다. 페이지는 연간 갱신과 차기 등록 예정일 2026-04-23을 표시하지만, 현재 검색 가능한 공식 상세 페이지에서 더 최신 2025/2026 파일은 확인하지 못했다.

따라서 특정 `20241231` 파일명을 운영 로직에 고정하지 않는다. 실제 ingest 시점에 공식 포털에서 확인 가능한 최신 파일을 사용하고, 생성 manifest의 `dataDate`로 데이터 기준일을 기록한다.

## Verification

- P0.1 snapshot generator smoke test: pass
- grounded verification policy tests: pass
- production build: pass
- latest code CI before merge: Prototype CI run #32 success
- P0.1 merge commit: `c0197e99aa6647a073a93b691510658d77c19c0c`
- Contest PR #10 Prototype CI run #53: **success**
- Contest test result: **3 files / 31 tests passed** (`aiAssistedRiskAnalyzer.test.ts` 8 tests)
- Contest production build: **pass** (`tsc --noEmit && vite build`)
- aitestbed authenticated login + cloud application screen: **partially evidenced by user observation**
- Authenticated AI model execution: **not yet evidenced**

## Roadmap decision — aitestbed + Kiosk AI

2026-09-05 기준 다음 융합 방향을 채택했다.

- Senior Trust Gateway를 신뢰·보호·권한관리 본체로 유지한다.
- `Lightning-Public/kiosk_ar_assistant`를 Kiosk Safe Guidance의 UX 원본으로 연결한다.
- aitestbed AI는 의도·문맥 이해와 시니어용 쉬운 설명에 사용한다.
- 규칙엔진은 결제·인증정보·민감정보 등 고위험 행동을 계속 통제하며 AI가 `HIGH`를 낮추지 못하게 한다.
- 단기 범위는 Trust Check 80% + Kiosk 확장 시나리오 20%다.

상세 단계, 저장소 책임 경계, aitestbed 공급자 구조와 사실 경계는 [`docs/roadmap/aitestbed-kiosk-fusion.md`](docs/roadmap/aitestbed-kiosk-fusion.md)를 기준으로 한다.

## Remaining work

- 실제 최신 KISA 공식 CSV 1회 확보/ingest
- real-data `totalRecords` / 버킷 분포 / 총 파일 크기 / 최대 버킷 크기 측정
- Preview 배포
- 대표 모바일 기기 UX/성능 QA
- 공식 match / miss / unavailable UX 실기기 확인
- aitestbed 계정의 실제 API 승인 상태·모델·한도·image input capability 확인
- 공통 `AIProvider` 계약과 안전 fallback 구현
- `kiosk_ar_assistant@3a7da8f` 재현 빌드 및 선택적 포팅 범위 확정

### Contest deadline priority

`docs/contest/platform-run-sheet.md` 순서대로 진행한다.

- [x] 정부 통합로그인으로 `aitestbed.kr` 인증
- [x] 클라우드 신청 화면 진입 및 추천 사양/운영체제/지원조건 확인
- [ ] 클라우드 신청 완료/승인 상태 확인
- [ ] `AI 안심매니저` 또는 공모전 프로젝트 실제 생성 화면 확인
- [ ] 정확한 모델 표시명 기록
- [ ] AI API/토큰 생성 또는 할당 방식 실제 화면 확인
- [ ] 정본 프롬프트 실행 + 최소 입력 3개 원본 JSON 출력 기록
- [ ] 프로젝트/프롬프트·모델 설정/실행 결과 캡처 3개 이상 확보
- [ ] 미리보기/배포 기능 실제 존재 여부 확인
- [ ] `docs/contest/modoo-ai-lab-evidence.md`의 blocker를 실제 증빙으로 교체
- [ ] Kiosk 확장 화면/구조 1장을 제출 자료에 포함

## Next action

공모전 단기 경로에서는 **aitestbed 실제 사용 증빙 → Trust Check AI 설명 한 기능 → 안전 fallback 검증 → Kiosk 확장 화면 한 장** 순서로 진행한다. P0.1 KISA 실데이터 적재와 Preview/모바일 QA는 병행 가능한 별도 작업으로 유지한다.

## Contest next action

현재 즉시 작업은 **클라우드 신청 완료/승인 상태 확인 → 정확한 AI 모델/API 메뉴 확인 → Trust Check 프롬프트 실제 실행과 캡처 확보**다. Kiosk는 Phase 0 제출에서는 확장 시나리오 한 장만 사용하고 실제 전면 통합은 하지 않는다.
