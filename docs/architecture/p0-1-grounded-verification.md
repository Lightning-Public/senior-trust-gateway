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
Official KISA CSV
  ↓ build-time ingest
kisa-phishing-snapshot.json
  ↓ lazy/static load
Message → RuleBasedRiskAnalyzer
               ↓
       GroundedRiskAnalyzer
          ├─ URL normalize
          └─ KisaPhishingSnapshotVerifier
               ↓
           RiskAnalysis
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

P0.1의 첫 운영 방식은 **build-time official CSV snapshot**으로 확정한다. 런타임 서버/API 호출 없이 연간 공식 데이터를 정적 스냅샷으로 배포한다.

향후 데이터 최신성 요구가 커질 때만 server-side adapter를 검토한다.

## Build-time snapshot ingest

공공데이터포털에서 공식 CSV를 다운로드한 뒤 `prototype` 디렉터리에서 실행한다.

```bash
npm run build:kisa-snapshot -- /path/to/한국인터넷진흥원_피싱사이트.csv
```

기본 출력:

```text
prototype/public/data/kisa-phishing-snapshot.json
```

생성된 문서는 다음 조건을 만족할 때만 앱에서 authoritative source로 인정된다.

- `kind = KISA_PHISHING_SNAPSHOT`
- `authoritative = true`
- `source = data.go.kr/15143094`
- records가 1건 이상

저장소 기본 파일은 `authoritative: false` + 빈 records이며, 공식 CSV를 적재하기 전에는 `OFFICIAL_SOURCE` 판정을 내릴 수 없다.

## Current implementation

- `OfficialSourceVerifier` contract
- HTTP URL extraction and normalization
- `KisaPhishingSnapshotVerifier`
- `GroundedRiskAnalyzer`
- authoritative match만 `OFFICIAL_SOURCE`로 승격
- no-match/unavailable fail-safe behavior
- 보호나라 공식 확인방법 handoff
- fixture-based tests without network/API key
- build-time CSV → JSON snapshot generator
- browser snapshot loader with fail-safe placeholder
- CI snapshot-generator syntax check

## Not yet completed

- 실제 공식 KISA CSV를 저장소/배포 스냅샷에 적재
- 최신 스냅샷의 크기·로딩 성능 측정
- 모바일 Preview QA
- 실시간 KISA 스미싱 판별 자동연계 (공식 개발 API 계약 미확인)

## Next gate

1. PR #8 최신 CI test/build 통과
2. fail-safe semantics review
3. 실제 공식 CSV를 이용한 snapshot 생성 및 크기 확인
4. Preview 확보 후 모바일 QA
