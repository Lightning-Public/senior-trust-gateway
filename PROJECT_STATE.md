# PROJECT_STATE

Last updated: 2026-09-05

## Status

**P0 / P0.1 merged / aitestbed + Kiosk fusion roadmap merged / contest hardening in Draft PR #10**

2026-09-06 18:00 KST 마감 `모두의 AI 실험실 AI 서비스 경진대회` 제출 후보는 **시니어 AI 생활매니저 — 안심부터 시작하는 시니어 디지털 동행**이다.

제품 본체는 Senior Trust Gateway의 신뢰·위험·검증·권한정책이며, 공모전 구현 범위는 **Trust Check 80% + Kiosk Safe Guidance 확장 20%**로 제한한다.

사용자는 `aitestbed.kr`에 실제 로그인해 클라우드 신청 화면까지 진입했다. 실제 화면에서 다음을 확인했다.

- 추천 자원: vCPU 2 / Memory 4GB / Disk 50GB
- OS: `rocky-8.10-base`
- 1개월 우선 지원
- 2026년 클라우드 1인 1회 신청 제한

정확한 모델 표시명, 외부 AI 추론 API 호출 계약, 승인 상태, 실제 모델 출력은 아직 확인하지 않았으므로 추정하지 않는다.

## Repository

- Canonical remote: `Lightning-Public/senior-trust-gateway`
- Default branch: `main`
- P0 merge: PR #6
- P0.1 infrastructure merge: PR #8
- KISA bucket balance fix: `3b6088c4f52e3a5b1a1ec0e7f396871af8dbf7ab`
- aitestbed + Kiosk fusion roadmap: PR #12 / merge `7553cfe9490ca1daec69cca03baafeaaa5495432`
- aitestbed API fact-boundary clarification: PR #13 / merge `e1e111a8e310b42de5333886d17023c432e7f21c`
- Contest hardening: Draft PR #10 `feat/modoo-ai-lab-contest`
- Kiosk UX reference: `Lightning-Public/kiosk_ar_assistant@3a7da8f`

## Fixed direction

- Contest service: **시니어 AI 생활매니저**
- Subtitle / integrated expression: **안심부터 시작하는 시니어 디지털 동행**
- Product sequence: **Protect → Trust → Delegate**
- Senior Trust Gateway = 위험·검증·권한정책 본체
- Trust Check = 첫 핵심 기능
- Kiosk Safe Guidance = 두 번째 생활장면
- AI authorization invariant: **AI confidence != user authorization**
- Trust invariant: **Risk != Verification**
- Official-data invariant: **공식 목록 미일치 != 안전**

## P0 / P0.1 implementation

- Vite + TypeScript 정적 웹
- `RuleBasedRiskAnalyzer`
- `OfficialSourceVerifier` / `GroundedRiskAnalyzer`
- authoritative exact match만 공식 근거로 승격
- build-time KISA CSV ingest + 256-way hash bucket snapshot
- 최신 main의 folded 32-bit hash bucket selector와 distribution regression test를 기준으로 유지

## Contest AI context layer — PR #10

- `AiMessageInterpreter` / `AiInterpretation`
- JSON: `summary`, `risk_context`, `safe_next_action`, `uncertainty`
- `CONTEST_AI_SYSTEM_PROMPT`
- `JsonAiMessageInterpreter`
- `SafeAiAssistedRiskAnalyzer`
- 모델 exception / timeout / malformed JSON → 규칙엔진 fallback
- HIGH는 AI 출력으로 하향 또는 승인 불가
- prototype 코드 CI: 31 tests + production build 성공 이력 보유

## aitestbed fact boundary

### Confirmed

- `AitestbedVibeWorkflow`: 바이브코딩 프로토타입 생성·수정·소스 다운로드·공모전 증빙
- 로그인 후 클라우드 신청 화면과 위 자원/OS/지원조건

### Unverified candidate

- `AitestbedModelApiProvider`

외부 프로젝트가 호출할 AI 추론 API는 다음 채택 게이트를 모두 통과하기 전 구현 완료로 주장하지 않는다.

1. 공식 AI 추론 API 문서 확인
2. base URL / 인증 header / 모델 목록 / request-response schema 기록
3. 최소 호출 probe 성공
4. 외부 프로젝트 사용·개인정보·상업 이용 범위 확인

로그인 전용 `내 API 키` 화면이나 키 관리 endpoint의 존재만으로 외부 추론 API를 증명하지 않는다. 확인 전에는 mock 또는 다른 승인된 AIProvider를 사용한다.

## Roadmap

정본: [`docs/roadmap/aitestbed-kiosk-fusion.md`](docs/roadmap/aitestbed-kiosk-fusion.md)

- Phase 0: 공모전 증빙 — aitestbed 바이브코딩 사용·생성 결과·소스 다운로드 + Kiosk 확장 한 장
- Phase 1: Text Trust Assistant — AIProvider 계약, mock/fallback, 검증된 provider만 연결
- Phase 2: Kiosk Structured Guidance — 한 가지 공공 키오스크 시나리오
- Phase 3: Vision/OCR — 실제 image input capability 확인 후에만
- Phase 4: 공공 프로젝트 공통 AIProvider 계층 후보

## Contest evidence

- `docs/contest/modoo-ai-lab-evidence.md`
- `docs/contest/ai-use-one-page.md`
- `docs/contest/platform-run-sheet.md`
- `docs/contest/platform-cloud-observation.md`

## Remaining contest work

- [x] aitestbed 로그인
- [x] 클라우드 신청 화면 진입 및 사양 확인
- [ ] 클라우드 신청 완료/승인 상태 확인
- [ ] 바이브코딩 프로젝트 `시니어 AI 생활매니저` 생성
- [ ] 프로젝트 생성 / 프롬프트 / 생성 결과 화면 캡처 3개 이상
- [ ] 생성 소스 다운로드 및 저장소와 포팅 범위 기록
- [ ] 화면에 실제 모델 표시명이 있으면 정확한 문자열 기록
- [ ] 외부 AI 추론 API 문서 및 호출 probe 여부 확인
- [ ] Kiosk 확장 장면 1개를 제출 자료에 포함
- [ ] 최종 제출 PDF/PPT/PPTX 정리

## Next action

공모전 마감 전 우선순위:

**클라우드 신청 완료 상태 확인 → aitestbed 바이브코딩 프로젝트 생성 → 실제 프롬프트/생성 결과/소스 다운로드 증빙 → Kiosk 확장 한 장 → 제출자료 완성**

외부 AI 추론 API는 공식 문서와 실제 probe가 확보된 경우에만 별도 adapter 구현으로 진행한다.
