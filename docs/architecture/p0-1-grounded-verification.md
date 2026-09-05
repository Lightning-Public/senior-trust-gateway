# P0.1 Grounded Verification

## Goal

P0의 문장 규칙 판정과 실제 공식 근거 확인을 분리한다.

핵심 불변식:

> `Risk != Verification`

그리고 두 번째 불변식:

> `공식 목록 미일치 != 안전`

## Official sources checked

### KISA 보호나라 스미싱 확인서비스

- 공식 안내: https://www.boho.or.kr/kr/subPage.do?menuNo=205116
- 국민이 의심 메시지를 직접 질의하는 서비스
- 현재 공식 이용 흐름은 보호나라 카카오톡 채널 중심
- 결과는 정상 / 주의 / 악성으로 제공
- 현재 저장소에서는 비공식 자동화나 scraping을 하지 않는다

따라서 P0.1에서는 **공식 서비스로 이동하는 handoff UX**만 제공한다.

### 한국인터넷진흥원_피싱사이트

- 공공데이터포털: https://www.data.go.kr/data/15143094/fileData.do
- 제공기관: 한국인터넷진흥원(KISA)
- 데이터셋 기준: `한국인터넷진흥원_피싱사이트_20241231`
- 주요 컬럼: 탐지날짜, 피싱사이트 URL
- 업데이트 주기: 연간
- 공공데이터포털 페이지 기준 전체 131,752행
- Open API는 활용신청 및 서비스키가 필요

이 자료는 **실시간 피싱 판별 API가 아니라 공개된 탐지 URL 스냅샷**으로 취급한다.

## Architecture

```text
Message
  ↓
RuleBasedRiskAnalyzer
  ↓
GroundedRiskAnalyzer
  ├─ URL extraction / normalization
  └─ OfficialSourceVerifier
       └─ KisaPhishingSnapshotVerifier
  ↓
RiskAnalysis
  ├─ risk level
  ├─ verification level
  └─ official check result
```

## Verification behavior

### Authoritative MATCH

공식 KISA 데이터에서 URL이 정확히 일치하고, 스냅샷이 신뢰 가능한 공식 데이터에서 생성됐음이 명시된 경우에만:

- risk → `HIGH`
- verification → `OFFICIAL_SOURCE`
- 링크를 열지 말도록 안내
- 가족/사람 확인 경로 표시
- 출처와 데이터 기준일 표시

### NO_MATCH

- 기존 위험도 유지
- verification을 안전으로 승격하지 않음
- `공개 목록에서 일치하지 않음. 안전하다는 뜻은 아님`을 명시

### UNAVAILABLE

- 기존 위험도 유지
- verification은 `RULES_ONLY`
- 자동 공식 대조가 불가능했음을 표시

## Browser/API-key policy

공공데이터포털 Open API는 서비스키가 필요하다.

정적 Vite 클라이언트의 `VITE_*` 환경변수에 서비스키를 넣으면 최종 JavaScript에 노출될 수 있으므로 금지한다.

허용되는 운영 방식:

1. 서버 측 adapter가 공공데이터 API를 호출
2. 신뢰된 빌드 파이프라인이 공식 CSV/API에서 스냅샷을 생성하고 정적 앱에는 필요한 최소 데이터만 배포

P0.1 기본 브라우저 데모에는 API 키를 넣지 않는다.

## Current implementation

- `OfficialSourceVerifier` contract
- HTTP URL extraction and normalization
- `KisaPhishingSnapshotVerifier`
- `GroundedRiskAnalyzer`
- authoritative match만 `OFFICIAL_SOURCE`로 승격
- no-match/unavailable fail-safe behavior
- 보호나라 공식 확인방법 handoff
- fixture-based tests without network/API key

## Not yet implemented

- 실제 KISA CSV 스냅샷 자동 생성 파이프라인
- 서버 측 공공데이터 Open API adapter
- 실시간 KISA 스미싱 판별 자동연계 (공식 개발 API 계약 미확인)
- 모바일 Preview QA

## Next gate

1. CI test/build 통과
2. Draft PR review
3. 공식 CSV snapshot ingest 방식을 별도 increment로 결정
4. Vercel/GitHub Pages 등 실제 Preview 확보 후 모바일 QA
