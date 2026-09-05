# PROJECT_STATE

Last updated: 2026-09-05

## Status

**P0 merged / P0.1 Grounded Verification merged / aitestbed + Kiosk fusion roadmap merged / contest hardening in Draft PR #10**

제품 기준선과 P0/P0.1은 `main`에 병합되었다. PR #12 / merge `7553cfe9490ca1daec69cca03baafeaaa5495432`에서 aitestbed + Kiosk AI 융합 로드맵을 확정했다. 현재 공모전 대응은 Draft PR #10 `feat/modoo-ai-lab-contest`에서 진행한다.

## Product naming

- Repository / trust core: **Senior Trust Gateway**
- Contest service: **시니어 AI 생활매니저**
- Subtitle: **안심부터 시작하는 시니어 디지털 동행**
- Phase 0 first capability: **Trust Check** — 의심 문자·디지털 요청 안심확인
- Phase 0 extension: **Kiosk Safe Guidance**
- Long-term sequence: **Protect → Trust → Delegate**

`AI 안심매니저`는 전체 제품명이 아니라 초기 Trust Check 기능을 설명하는 표현으로 사용한다.

## Fixed architecture

- Senior Trust Gateway = 위험등급·검증수준·권한정책·사람 에스컬레이션 본체
- `Lightning-Public/kiosk_ar_assistant@3a7da8f` = Kiosk 화면·음성·포인터 UX 원본
- aitestbed AI = 공통 `AIProvider`를 통한 의도·문맥 이해와 시니어용 쉬운 설명
- 모델/API 호출 = 서버 측 경로 우선
- 개인정보·문자 원문·키오스크 화면 정보 = 최소화·마스킹
- quota / timeout / 모델 장애 / 잘못된 JSON / 모델 거부 = 결정론적 fallback
- AI authorization invariant: **AI confidence != user authorization**
- Trust invariant: **Risk != Verification**
- Official-data invariant: **공식 목록 미일치 != 안전**

## Contest Phase 0 scope

단기 범위는 **Trust Check 80% + Kiosk 확장 20%**다.

공통 사용자 흐름:

```text
이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결
```

### Trust Check

- Vite + TypeScript 프로토타입
- `RuleBasedRiskAnalyzer`
- `OfficialSourceVerifier` / `GroundedRiskAnalyzer`
- `SafeAiAssistedRiskAnalyzer`
- AI JSON: `summary`, `risk_context`, `safe_next_action`, `uncertainty`
- HIGH는 AI가 낮추거나 행동을 승인할 수 없음
- 모델 장애·지연·잘못된 JSON → 규칙엔진 fallback

### Kiosk Safe Guidance

- 원본: `Lightning-Public/kiosk_ar_assistant@3a7da8f`
- 공모전에서는 전체 CV/OCR 통합보다 한 가지 대표 생활장면만 사용
- 우선 후보: 병원 접수 또는 민원서류 발급
- 화면·음성·포인터로 쉬운 다음 행동을 안내
- 개인정보·동의·결제 단계는 확인 또는 사람 연결
- image input은 aitestbed 실제 계정에서 지원 확인 전 완료로 주장하지 않음

## Aitestbed actual observation

사용자는 `aitestbed.kr` 정부 통합로그인 후 **클라우드 신청 화면**까지 실제 진입했다.

확인값:

- 필수 입력: 프로젝트명 / 이용기간 / 이용목적 500자
- 추천 자원: vCPU 2EA / Memory 4GB / Disk 50GB
- OS: `rocky-8.10-base`
- 1개월 우선 지원
- 2026년 클라우드 1인당 1회 신청 안내

클라우드 프로젝트 권장명: **시니어 AI 생활매니저**.

상세: `docs/contest/platform-cloud-observation.md`

## Verification

- P0.1 snapshot generator smoke test: pass
- grounded verification policy tests: pass
- Contest PR #10 Prototype CI run #53: **success**
- Contest test result: **3 files / 31 tests passed**
- `aiAssistedRiskAnalyzer.test.ts`: **8 tests passed**
- HIGH downgrade prevention: pass
- malformed JSON / model exception / timeout fallback: pass
- production build: **pass** (`tsc --noEmit && vite build`)

## Contest documents

- `docs/roadmap/aitestbed-kiosk-fusion.md` — merged architecture/phase roadmap
- `docs/contest/modoo-ai-lab-evidence.md` — contest evidence source of truth
- `docs/contest/ai-use-one-page.md` — one-page proposal narrative
- `docs/contest/platform-run-sheet.md` — authenticated platform execution checklist
- `docs/contest/platform-cloud-observation.md` — actual cloud application observations

## Remaining contest blockers

- [ ] 클라우드 신청 완료/승인대기 상태 확인
- [ ] 정확한 aitestbed AI 모델 표시명 확인
- [ ] AI API/key/token 할당·승인 방식 확인
- [ ] 모델 quota / image input capability 확인
- [ ] 정본 프롬프트 실제 실행
- [ ] 실제 JSON 출력 최소 3개 기록
- [ ] 플랫폼 캡처 최소 3개 확보
- [ ] Kiosk 확장 장면 1개 확보
- [ ] 미리보기/배포 기능 확인
- [ ] PR #10을 최신 `main`과 동기화하고 충돌 해소

## Existing P0.1 follow-up

공모전과 별도 병행 작업:

- 실제 최신 KISA 공식 CSV 확보/ingest
- real-data bucket 크기/분포 측정
- Preview 배포
- 대표 모바일 기기 UX/성능 QA

## Next action

공모전 마감 전 최우선은 **클라우드 프로젝트 `시니어 AI 생활매니저` 신청 완료 → 실제 모델/API·토큰 확인 → Trust Check 프롬프트 3개 실행·캡처 → Kiosk 확장 장면 1개 정리 → 증빙 문서 현행화**다. 확인되지 않은 플랫폼 기능은 추정하지 않는다.
