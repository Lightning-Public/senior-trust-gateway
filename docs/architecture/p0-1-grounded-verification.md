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
- 전체 행: 131,752
- 업데이트 주기: 연간
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
  └─ BundledKisaSnapshotVerifier
       ├─ manifest.json
       └─ required hash bucket only
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
- manifest 또는 필요한 버킷 파일을 신뢰성 있게 읽지 못한 경우 자동 공식 대조 실패로 표시

## Browser/API-key policy

공공데이터포털 Open API는 서비스키가 필요한다.

정적 Vite 클라이언트의 `VITE_*` 환경변수에 서비스키를 넣으면 최종 JavaScript에 노출될 수 있으므로 금지한다.

1차 운영 방식은 **trusted build-time CSV snapshot ingest**다.

향후 최신성이 더 필요해질 때만 서버 측 adapter를 검토한다.

## Partitioned snapshot design

131,752행 전체를 모바일 브라우저에 한 번에 전달하지 않는다.

빌드 시 공식 CSV를 다음 구조로 변환한다.

```text
public/data/kisa-phishing/
  manifest.json
  00.json
  01.json
  ...
  ff.json
```

- URL 정규화 후 FNV-1a 기반 8-bit bucket key 사용
- 최대 256개 버킷
- manifest에는 전체 레코드 수, 데이터 기준일, 버킷별 건수만 저장
- URL이 없는 메시지는 manifest조차 요청하지 않음
- URL이 있으면 manifest를 한 번 읽고 해당 URL에 필요한 버킷만 로드
- 동일 세션에서 manifest와 버킷 결과를 캐시
- manifest상 빈 버킷은 네트워크 요청 없이 `NO_MATCH`
- 필요한 버킷 로딩 실패 시 `UNAVAILABLE`
- 다른 버킷 로딩이 실패했더라도 성공적으로 읽은 공식 버킷에서 exact match가 발견되면 해당 MATCH 근거는 사용할 수 있음

이 구조는 전체 데이터 크기와 무관하게 한 번의 URL 확인 시 네트워크·메모리 비용을 작은 부분 집합으로 제한한다.

## Build-time generator

```bash
cd prototype
node scripts/build-kisa-snapshot.mjs /path/to/official-kisa.csv public/data/kisa-phishing
```

생성기는:

1. 공식 CSV의 날짜/URL 컬럼을 찾는다.
2. HTTP(S) URL만 정규화한다.
3. 중복 URL을 제거한다.
4. 256개 해시 버킷으로 분할한다.
5. authoritative manifest와 각 bucket JSON을 생성한다.

기본 저장소에는 `authoritative: false`, `totalRecords: 0`인 manifest만 포함한다. 실제 공식 CSV가 적재되지 않은 상태에서는 공식 판정을 절대 내리지 않는다.

## Current implementation

- `OfficialSourceVerifier` contract
- HTTP URL extraction and normalization
- `KisaPhishingSnapshotVerifier`
- `GroundedRiskAnalyzer`
- authoritative exact match만 `OFFICIAL_SOURCE`로 승격
- no-match/unavailable fail-safe behavior
- 보호나라 공식 확인방법 handoff
- CSV → partitioned JSON build generator
- fail-safe non-authoritative placeholder manifest
- lazy manifest/bucket loader + per-session cache
- fixture-based tests without network/API key
- CI smoke test that executes the generator on a synthetic CSV

## Remaining validation

- 실제 KISA CSV 1회 적재
- real-data manifest/버킷 총 크기 및 최대 버킷 크기 측정
- Preview/device QA

실데이터 파일 다운로드 URL이 포털 페이지에서 동적으로 처리되어 현재 자동화 환경에서는 원문 CSV 자체를 아직 확보하지 못했다. 다만 131,752행 전체를 한 파일로 로드하는 설계 위험은 해시 버킷 분할로 선제 제거했다.
