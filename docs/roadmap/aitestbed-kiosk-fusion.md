# AI 안심동행 — aitestbed + Kiosk AI 융합 로드맵

Last updated: 2026-09-05

## 1. 결정

Senior Trust Gateway를 신뢰·보호·권한관리 본체로 유지하고, Kiosk AI를 두 번째 사용 장면으로 연결한다.

- 제출/제품 본체: **Senior Trust Gateway / AI 안심매니저**
- 확장 기능: **Kiosk Safe Guidance**
- 통합 서비스 표현: **AI 안심동행 — 문자부터 키오스크까지, 행동 전에 확인하는 시니어 디지털 신뢰 게이트웨이**
- 단기 범위: Trust Check 80% + Kiosk 확장 시나리오 20%

두 앱을 한 번에 전면 통합하지 않는다. 먼저 공통 흐름을 검증한다.

`이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결`

## 2. 연결할 원격 저장소

- Trust/policy 본체: `https://github.com/Lightning-Public/senior-trust-gateway`
- Kiosk UX 원본: `https://github.com/Lightning-Public/kiosk_ar_assistant`
- Kiosk 기준 커밋: `3a7da8f` (`main`, 2026-08-24 확인)

### 저장소 책임 경계

| 영역 | 책임 저장소 |
| --- | --- |
| 위험등급, 검증수준, 권한정책, 사람 에스컬레이션 | `senior-trust-gateway` |
| 키오스크 화면 안내, 포인터, 음성·고대비 UX | `kiosk_ar_assistant` |
| aitestbed 모델 호출 어댑터와 fallback 정책 | 우선 `senior-trust-gateway` |
| 재사용 가능한 공통 계약 | 검증 후 별도 shared package 후보 |

초기에는 Git submodule이나 저장소 전체 복사를 하지 않는다. Kiosk 기능을 옮길 때 원본 파일·커밋·변경 이유를 기록하고 필요한 컴포넌트만 선택적으로 포팅한다.

## 3. 현재 사실 경계

### Senior Trust Gateway

- 규칙 기반 Trust Check와 KISA 공식 데이터 snapshot 검증 인프라가 있다.
- AI 모델 추론은 아직 핵심 실행 경로에 연결되지 않았다.
- 위험도와 공식 확인 수준은 분리한다: `Risk != Verification`.

### Kiosk AI

- 현재 공개 구현은 정적 키오스크 이미지와 사전 정의 좌표를 이용한 안내 데모다.
- Web Speech API 기반 음성 입력·출력과 시니어용 UI 자산이 있다.
- 실제 카메라 CV/OCR, 실시간 버튼 검출·추적 또는 Google Lens 연동 완료로 주장하지 않는다.
- 2026-09-05 기준 `npm ci`와 production build는 성공했다.
- 다만 `src/App.jsx`가 로컬 정의/import 없이 `speakTTS`와 `KIOSK_TYPES`를 호출하므로 해당 실행 경로의 브라우저 runtime 오류를 통합 전에 수정·검증한다.

### aitestbed.kr

2026-09-05 공개 사이트와 프런트엔드에서 다음은 확인된다.

- 바이브코딩, 클라우드, 개발지원도구 신청
- 로그인 전용 `내 API 키` 화면과 키 신청/승인/발급/포인트 상태
- AI 모델 API 사용한도의 양도·재판매를 제한하는 약관 문구
- 바이브코딩 프로젝트의 소스 코드 다운로드

그러나 **외부 프로젝트가 호출할 AI 추론 API**의 base URL, 인증 방식, request/response schema, SDK 또는 호출 예시는 공개 문서에서 확인하지 못했다. 로그인 전용 키 관리 endpoint(`/api/v1/keys/*`)의 존재는 외부 추론 endpoint를 증명하지 않는다.

또한 공식 FAQ의 `API 데이터 연계`는 디지털융합플랫폼에서 발급한 **공공데이터 API 키**를 바이브코딩 채팅창에 붙여 넣는 절차다. 이를 AI 모델 API 제공 근거로 사용하지 않는다.

공개 FAQ 기준 웹 바이브코딩은 공공 실험용 서버이며 외부 데이터를 읽는 예외적 경로만 허용하고, 내부 데이터를 외부로 내보내는 아웃바운드 기능은 제공하지 않는다. 이미지·영상·음성의 개발자 수준 운영은 생성 소스를 내려받아 별도 개발환경에서 후속 개발하도록 안내한다.

따라서 현재 상태는 다음과 같다.

- `AitestbedVibeWorkflow`: **confirmed** — 프롬프트 기반 프로토타입 생성·수정·다운로드·공모전 증빙
- `AitestbedModelApiProvider`: **unverified candidate** — 로그인 후 공식 호출 문서와 실제 probe가 확인될 때만 구현

실제 계정에 제공되는 모델, 호출 규격, 이미지 입력, 한도와 승인 상태는 로그인 후 확인한 값만 사용한다. 제공받은 계정·한도를 제3자에게 양도하거나 재판매하지 않고, 유료 서비스 운영은 운영기관 사전 승인 조건을 확인한다.

## 4. 목표 아키텍처

```text
AitestbedVibeWorkflow (confirmed)
  └─ prompt evidence → prototype/code download → local repository

Trust Check UI ───────┐
                      ├─► Senior Trust Orchestrator
Kiosk Guidance UI ────┘      ├─ deterministic safety rules
                             ├─ official-source verifier
                             ├─ AIProvider interface
                             │    ├─ Local/approved provider
                             │    └─ AitestbedModelApiProvider (candidate)
                             └─ HumanEscalation interface
```

### 역할 분리

- 규칙엔진: 송금·결제·인증번호·민감정보·원격제어 등 고위험 행동 차단
- 공식 데이터: 확인 가능한 범위와 기준일을 포함한 근거 제공
- aitestbed 바이브코딩: 프로토타입 생성·수정·소스 다운로드와 공모전 활용 증빙
- AIProvider: 실제 호출 계약이 확인된 모델 공급자로 의도·문맥 해석과 쉬운 설명 생성
- Kiosk UI: 다음 버튼·행동을 크게 보여주고 음성으로 안내
- 사람/신뢰원: 불확실하거나 고위험인 경우 최종 확인

AI 모델의 확신은 사용자 권한이나 안전 판정을 대신하지 않는다. AI는 규칙엔진의 `HIGH`를 낮출 수 없다.

## 5. API 확인 후 공통 공급 레이어

프로젝트마다 API 호출 코드를 복제하지 않고 `AIProvider` 계약을 둔다. 단, aitestbed의 외부 추론 API 사용 가능성이 검증되기 전에는 provider 구현을 시작하지 않고 mock/다른 승인 공급자를 사용한다.

```ts
interface AIProvider {
  explain(input: ExplainRequest): Promise<ExplainResult>
  capabilities(): Promise<ProviderCapabilities>
}
```

최소 capability:

- `textInput`
- `structuredOutput`
- `imageInput` — 실제 계정에서 확인된 경우에만 true
- `maxInputSize`
- `rateLimitKnown`
- `commercialUseStatus`

provider 채택 게이트:

1. 로그인 후 공식 AI 추론 API 문서 확인
2. base URL, 인증 header, 모델 목록, 요청·응답 schema 기록
3. 최소 호출 probe 성공
4. 외부 프로젝트 사용·개인정보·상업 이용 범위 확인
5. 위 네 조건을 충족하지 못하면 `AitestbedModelApiProvider`를 미구현 상태로 유지

보안 원칙:

- API 키는 브라우저 번들·Git·로그에 넣지 않는다.
- 문서로 확인된 server-side 호출 경로에서만 사용한다.
- 원문 메시지와 키오스크 화면의 개인정보를 최소화·마스킹한다.
- timeout, quota 초과, 잘못된 JSON, 모델 거부 시 규칙 기반 fallback을 사용한다.
- 프로젝트별 프롬프트·출력 schema·감사 로그는 분리한다.

## 6. 단계별 실행

### Phase 0 — 공모전 증빙

1. aitestbed 바이브코딩 신청·이용 상태를 확인한다.
2. `AI 안심동행` 프로젝트를 만들고 실제 프롬프트와 생성 결과를 기록한다.
3. 생성 소스를 다운로드해 로컬 저장소와의 차이·포팅 범위를 정리한다.
4. 프로젝트·프롬프트·실행 결과 화면을 개인정보 없이 캡처한다.
5. 외부 추론 API가 확인되지 않으면 `실시간 AI 호출 구현`으로 주장하지 않는다.

완료 기준: 플랫폼 사용 증거 3개 이상, 실제 프롬프트·생성 결과·다운로드 소스가 있다.

### Phase 1 — Text Trust Assistant

- 먼저 `AIProvider` 계약과 mock/fallback을 구현한다.
- aitestbed 외부 추론 API가 provider 채택 게이트를 통과하면 adapter를 추가한다.
- AI는 문자 의도와 사칭 맥락을 구조화하고, 출력은 `summary`, `riskContext`, `safeNextAction`, `uncertainty`로 제한한다.
- 규칙엔진 결과와 충돌하면 더 안전한 결과를 채택한다.

완료 기준: 실제 provider 출처와 호출 증거가 기록되고, 대표 6개 시나리오와 모델 장애 시나리오가 테스트된다.

### Phase 2 — Kiosk Structured Guidance

- `kiosk_ar_assistant`의 고대비 UI, 음성, 포인터 자산을 선택적으로 포팅한다.
- 먼저 카메라 인식 없이 공공 키오스크 한 종류의 구조화된 화면 정의를 사용한다.
- 대상 시나리오는 병원 접수, 복지 신청 또는 민원 발급 중 하나만 고정한다.
- 결제·동의·개인정보 단계에서 확인 또는 사람 연결을 요구한다.

완료 기준: 한 시나리오가 시작부터 완료/안전중단까지 재현된다.

### Phase 3 — Vision/OCR 후보

- 실제 사용 가능한 provider에서 image input 호출 문서와 probe가 확인된 경우에만 진행한다.
- 화면 이미지에서 텍스트·후보 버튼을 추출하되, 사용자에게 누르라고 지시하기 전에 화면 상태와 목표를 재확인한다.
- 미지원이면 OCR 텍스트 입력 또는 사전 정의 화면 구조를 유지한다.

완료 기준: 실제 지원 capability와 테스트 결과가 문서화되고, 미지원 기능을 완료로 표시하지 않는다.

### Phase 4 — 공공 프로젝트 공통화

검증된 `AIProvider` adapter를 다음 프로젝트가 재사용할 수 있게 분리한다. aitestbed adapter는 외부 추론 API가 provider 채택 게이트를 통과한 경우에만 포함한다.

- Senior Trust Gateway: 의심 문자 이해·쉬운 설명
- Kiosk AI: 화면 문구 이해·다음 행동 안내
- PublicInfo Guardian AI: 공공 페이지 요약·불일치 후보·조치안
- Public Safety 계열: 재난·신고 정보 분류와 행동요령 설명

공통화는 API 약관, 한도, 운영 안정성, 상업 이용 가능 범위를 확인한 뒤 진행한다.

## 7. 우선순위와 비범위

### 지금 한다

- aitestbed 바이브코딩 실제 사용·소스 다운로드 증빙
- Kiosk 확장 화면 한 장과 결합 구조
- `AIProvider` 계약과 mock/fallback 설계
- 외부 AI 추론 API 지원 여부의 사실 경계

### 지금 하지 않는다

- 두 저장소 전면 병합
- 여러 키오스크 업종 동시 지원
- 실제 결제·계정 변경
- 확인되지 않은 Google Lens/CV/OCR 연동 주장
- aitestbed 자원의 재판매 또는 무승인 상용 의존

## 8. 개발 세션 인수 조건

개발 세션은 다음을 먼저 확인한다.

1. aitestbed 신청·승인 상태와 실제 계정 capability
2. 사용할 모델의 정확한 표시명과 호출 문서
3. `kiosk_ar_assistant@3a7da8f`의 재현 빌드 상태
4. 포팅할 컴포넌트와 원본 provenance
5. 개인정보 처리와 fallback 경로

완료 보고에는 변경 파일, 사용 프롬프트, 플랫폼 증빙, 테스트/build 결과, 미구현 또는 차단 항목을 포함한다.
