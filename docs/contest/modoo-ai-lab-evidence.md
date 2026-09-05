# 모두의 AI 실험실 경진대회 증빙 기록

Last updated: 2026-09-05

## 1. 제출 서비스

- 공모전 서비스명: **시니어 AI 생활매니저**
- 부제: **안심부터 시작하는 시니어 디지털 동행**
- 제품 본체: Senior Trust Gateway
- Phase 0 메인: Trust Check 80%
- Phase 0 확장: Kiosk Safe Guidance 20%

`시니어 AI 생활매니저`는 고령자가 문자·키오스크·공공/생활 디지털 서비스에서 “이 상황을 믿어도 되는가, 지금 무엇을 해야 하는가”를 이해하도록 돕고, 위험한 행동은 AI의 확신과 관계없이 안전정책과 사람 확인으로 통제하는 서비스다.

핵심 흐름:

```text
이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결
```

핵심 안전 원칙:

> **AI confidence ≠ user authorization**

## 2. 융합 아키텍처 기준

2026-09-05 `main`에 병합된 PR #12 / merge `7553cfe9490ca1daec69cca03baafeaaa5495432`의 로드맵을 기준으로 한다.

- **Senior Trust Gateway** = 위험등급·검증수준·권한정책·사람 에스컬레이션 본체
- **Kiosk AI** = `Lightning-Public/kiosk_ar_assistant@3a7da8f`의 화면·음성·포인터 UX 원본
- **aitestbed AI** = 공통 `AIProvider`를 통한 의도·문맥 이해와 시니어용 쉬운 설명
- 모델/API 호출은 서버 측 경로 우선
- 개인정보·문자 원문·키오스크 화면 정보는 최소화·마스킹
- quota / timeout / 모델 장애 / 잘못된 JSON / 모델 거부 시 결정론적 fallback

목표 구조:

```text
Trust Check UI ───────┐
                      ├─► Senior Trust Orchestrator
Kiosk Guidance UI ────┘      ├─ deterministic safety rules
                             ├─ official-source verifier
                             ├─ AIProvider
                             │    └─ AitestbedProvider (server-side)
                             └─ HumanEscalation
```

## 3. 공모전 공식 요구와 대응

공개 공식 자료에서 확인한 사항:

- 주제: 모두의 AI 실험실 온라인 플랫폼을 활용한 개인·지역·사회 현안 해결 AI 서비스
- 접수 마감: 2026-09-06 18:00 KST
- 모두의 AI 실험실 지원 범주: 자연어 기반 바이브코딩, 생성형 AI 모델 이용 토큰, 민간 클라우드, 개발지원도구, 공공·민간 데이터/API
- 로그인 진입: 정부 통합로그인 안내
- 서면평가: **문제 정의 및 제안 필요성 / 창의성 및 AI 활용 적절성 / 실현 가능성 및 완성도**

| 공식 평가 관점 | 시니어 AI 생활매니저 대응 |
| --- | --- |
| 문제 정의 및 제안 필요성 | 고령자가 문자·키오스크 등 디지털 환경의 의미·위험·다음 행동을 판단하기 어려운 문제 해결 |
| 창의성 및 AI 활용 적절성 | 규칙만으로 어려운 문맥·의도 이해와 쉬운 설명을 AI가 담당하고, 고위험 권한은 결정론적으로 분리 |
| 실현 가능성 및 완성도 | Trust Check 동작 프로토타입 + Kiosk UX 원본 + 공통 AIProvider 경계 + fallback + 자동 테스트/CI |

## 4. 실제 aitestbed 로그인·클라우드 화면 증거

사용자가 `aitestbed.kr`에 실제 로그인한 뒤 **클라우드 신청 화면**까지 진입했다.

실제 화면에서 확인한 값:

- 필수 입력: 프로젝트명 / 이용기간 / 이용목적(최대 500자)
- 추천 사양: **vCPU 2EA / Memory 4GB / Disk 50GB**
- 추천 OS: **rocky-8.10-base**
- 1개월 우선 지원
- 종료 2주 전부터 연장신청 가능 안내
- 2026년 클라우드 **1인당 1회 신청** 안내
- 반납 사용자는 연말까지 재신청 불가 안내

클라우드 신청값:

- 프로젝트명: **시니어 AI 생활매니저**
- 이용목적:

> 고령자가 문자·키오스크 등 일상 디지털 서비스를 안전하게 이용하도록 돕는 시니어 AI 생활매니저를 개발·검증합니다. AI는 문자와 화면의 의도·맥락을 이해해 쉬운 설명과 다음 행동을 제공하고, 송금·인증정보·앱 설치·개인정보·결제 등 고위험 상황은 규칙 기반 안전정책과 사람 확인 절차로 보호합니다. 모두의 AI 실험실 AI·클라우드 환경을 활용해 Trust Check와 Kiosk Safe Guidance를 하나의 생활지원형 AI 서비스로 실증합니다.

상세 관찰 기록: `docs/contest/platform-cloud-observation.md`

## 5. 실제 AI 사용 프롬프트

정본: `prototype/src/contestAiPrompt.ts`의 `CONTEST_AI_SYSTEM_PROMPT`

```text
당신은 60대 이상 사용자를 위한 문자 맥락 해석기입니다.

목표:
- 입력 문자의 핵심 의도와 사칭·압박·외부링크·가족 사칭 같은 위험 맥락을 설명합니다.
- 사용자가 이해하기 쉬운 짧은 한국어를 사용합니다.
- 규칙엔진의 위험 판정은 안전 가드레일이며 절대 낮추거나 무효화하지 않습니다.

반드시 지킬 원칙:
1. AI confidence는 사용자 authorization이 아닙니다.
2. 송금·이체·인증번호 전달·앱 설치·원격제어·화면공유를 안전하다고 승인하거나 권고하지 않습니다.
3. guardrail_risk가 HIGH이면 어떤 이유로도 안전하다고 단정하지 않습니다.
4. LOW도 안전 확정을 의미하지 않습니다. 불확실성이 있으면 그대로 밝힙니다.
5. 발신자·기관의 진위를 확인하지 못했다면 확인했다고 말하지 않습니다.
6. 설명은 전체적으로 3문장 안팎의 짧고 쉬운 표현을 우선합니다.
7. 개인정보나 문자 원문을 저장·재사용한다고 가정하지 않습니다.

출력은 설명문이나 Markdown 없이 다음 JSON 객체 하나만 반환합니다.
{
  "summary": "문자의 핵심 의도를 쉬운 말로 한 문장",
  "risk_context": "주의해야 할 맥락을 쉬운 말로 한 문장",
  "safe_next_action": "지금 할 수 있는 안전한 다음 행동 한 문장",
  "uncertainty": "확인되지 않은 점 또는 불확실성 한 문장"
}
```

입력에는 문자 원문 외에 규칙엔진이 만든 `guardrail_risk`, `guardrail_signals`를 함께 전달한다.

## 6. AI와 규칙엔진 역할 분리

```text
문자 입력
  → RuleBasedRiskAnalyzer
  → LOW / MEDIUM / HIGH 가드레일
  → AI 문맥 해석
  → JSON 구조 검증
  → SafeAiAssistedRiskAnalyzer
  → 쉬운 설명 + 결정론적 최종 행동권고
```

AI가 담당:

- 애매한 문자 핵심 의도
- 사칭·압박·외부링크·가족사칭 맥락
- 60대 이상 사용자가 이해하기 쉬운 설명
- 불확실성 표시

규칙엔진이 담당:

- 송금·이체
- 인증번호·비밀번호 등 인증정보
- 앱 설치·원격제어·화면공유
- 명확한 고위험 압박 패턴
- 최종 위험등급과 행동권고 권한

AI는 HIGH를 낮추거나 행동을 허가할 수 없다.

## 7. 입력·출력 검증 예시

아래 출력은 **플랫폼 실측이 아니라 코드/테스트 fixture**다. 실제 제출본에는 aitestbed 원본 출력으로 교체한다.

### A. 일반 일정 안내

입력:

```text
내일 오후 2시에 주민센터 프로그램이 있습니다.
```

fixture:

```json
{
  "summary": "일정이나 안내 내용을 전달하는 문자로 보여요.",
  "risk_context": "지금 문장만으로는 돈이나 개인정보를 요구하는 맥락이 뚜렷하지 않아요.",
  "safe_next_action": "내용만 확인하고 추가 행동 요구가 생기면 다시 확인하세요.",
  "uncertainty": "발신자 자체가 진짜인지는 이 분석만으로 확인할 수 없어요."
}
```

규칙 결과: `LOW` — 안전 확정 아님.

### B. 택배 외부 링크

입력:

```text
배송지를 확인해 주세요 https://delivery.example/parcel
```

fixture:

```json
{
  "summary": "택배 확인을 위해 외부 링크를 누르게 하는 문자예요.",
  "risk_context": "외부 링크는 실제 택배사 주소인지 별도 확인이 필요해요.",
  "safe_next_action": "문자 속 링크 대신 택배사 공식 앱이나 홈페이지에서 직접 확인하세요.",
  "uncertainty": "이 주소가 실제 택배사 주소인지는 현재 확인되지 않았어요."
}
```

규칙 결과: `MEDIUM`.

### C. 검찰 사칭 + 안전계좌 이체

입력:

```text
검찰입니다. 범죄 연루 확인을 위해 지금 안전계좌로 전액 이체하세요.
```

AI가 안전하다고 답하더라도 규칙 결과는 `HIGH`이며 최종 정지 메시지와 행동 권고는 AI 출력으로 대체하지 않는다.

## 8. 자동 검증 결과

Draft PR #10의 prototype 코드에서 GitHub Actions `Prototype CI` run #53 성공.

- snapshot generator smoke test: PASS
- Vitest: **3 test files / 31 tests passed**
- `aiAssistedRiskAnalyzer.test.ts`: **8 tests passed**
- HIGH 하향 금지: PASS
- 잘못된 JSON fallback: PASS
- 모델 장애 fallback: PASS
- 모델 timeout fallback: PASS
- `tsc --noEmit`: PASS
- Vite production build: PASS

## 9. Kiosk Safe Guidance 확장

Kiosk 원본 기준: `Lightning-Public/kiosk_ar_assistant@3a7da8f`.

공모전에서는 키오스크 전체를 별도 제품으로 제출하지 않는다. 생활매니저의 두 번째 생활장면으로 한 가지 시나리오만 보여준다.

추천: **병원 접수** 또는 **민원서류 발급**.

```text
키오스크 화면/구조
  → AI가 현재 단계 의미를 쉬운 말로 설명
  → 화면·음성·포인터로 다음 행동 안내
  → 개인정보·동의·결제 단계는 확인/사람 연결
```

실제 계정에서 image input 지원이 확인되지 않으면 CV/OCR 완료를 주장하지 않고 사전 정의 화면 구조 또는 OCR 텍스트 입력을 사용한다.

## 10. 증빙 캡처 경로

실제 화면을 확보한 뒤 저장한다.

- `docs/contest/evidence/01-cloud-project.png` — 클라우드 프로젝트 신청/상태
- `docs/contest/evidence/02-prompt-model-settings.png` — 정확한 모델명 + 프롬프트/설정
- `docs/contest/evidence/03-trust-check-result.png` — 개인정보 없는 입력 + 실제 JSON 출력
- `docs/contest/evidence/04-kiosk-guidance.png` — 가능하면 Kiosk 확장 화면
- `docs/contest/evidence/05-preview-or-deploy.png` — 실제 기능이 존재할 때만

## 11. 개인정보·보안

- 실제 문자 원문을 저장소에 커밋하지 않는다.
- 캡처에는 전화번호, 이름, 인증번호, 실주소 등 개인정보를 사용하지 않는다.
- API 키/토큰을 Git·클라이언트 번들·로그에 남기지 않는다.
- 서버 측 secret 또는 승인된 aitestbed 실행 경로가 실제 제공되는지 확인한 뒤 사용한다.
- 공식 목록 미일치 != 안전.
- KISA/보호나라 API·연동은 실제 이용 방법을 확인하기 전에는 완료로 주장하지 않는다.

## 12. 현재 확인 필요 항목 — BLOCKER

현재 실제 로그인으로 클라우드 신청 화면까지는 확인했다. 다음 항목은 실제 화면에서 확인 후 갱신한다.

- [ ] 클라우드 신청 완료/승인대기 상태
- [ ] 정확한 AI 모델 표시명
- [ ] AI API/key/token 발급·할당 방식과 승인 상태
- [ ] 모델 한도/quota
- [ ] image input capability
- [ ] 위 정본 프롬프트 실제 실행
- [ ] 최소 입력 3개 aitestbed 원본 JSON 출력
- [ ] 플랫폼 화면 캡처 최소 3개
- [ ] 미리보기/배포 기능 확인
- [ ] API/SDK 직접 연결 가능 여부

완료 기준: **플랫폼 사용 증거 최소 3개 + 실제 모델명 + 실제 프롬프트/출력 + HIGH를 AI가 낮출 수 없다는 검증**.
