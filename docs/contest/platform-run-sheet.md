# 모두의 AI 실험실 플랫폼 증빙 Run Sheet

목적: **현재 `senior-trust-gateway` MVP 개발과 별개로**, 공모전 제출에 필요한 aitestbed 실제 사용 증거를 확보한다.

공모전 최상위 하네스: `docs/contest/contest-harness.md`

이 문서는 제품 개발 순서를 결정하지 않는다. MVP 정본은 현재 저장소의 실행 가능한 prototype이다.

## 1. 서비스

- 프로젝트명: **시니어 AI 생활매니저**
- 부제: **안심부터 시작하는 시니어 디지털 동행**
- MVP: Trust Check 80% + Hospital Kiosk Safe Guidance 20%
- 공통 흐름: `이해 → 위험 확인 → 쉬운 다음 행동 → 필요 시 사람 연결`

## 2. 로그인·클라우드 증빙

이미 확인된 값:

- `aitestbed.kr` 로그인
- 클라우드 신청 화면 진입
- vCPU 2EA
- Memory 4GB
- Disk 50GB
- OS `rocky-8.10-base`
- 1개월 우선 지원
- 2026년 1인 1회 신청 안내

추가 기록:

- 신청 완료/대기/승인 상태: `________________`
- 신청일시(KST): `________________`
- 실제 이용기간: `________________`

캡처 후보:

```text
docs/contest/evidence/01-cloud-project.png
```

## 3. 바이브코딩 활용 증빙

목표는 **MVP를 새로 만드는 것이 아니라 aitestbed 사용 사실을 증명**하는 것이다.

실행 runbook:

`docs/contest/aitestbed-vibe-build-plan.md`

확보할 것:

- 프로젝트명 `시니어 AI 생활매니저`
- 실제 입력 프롬프트
- 생성 결과 화면
- 가능하면 소스 다운로드 화면/파일

캡처 후보:

```text
docs/contest/evidence/02-vibe-prompt.png
docs/contest/evidence/03-vibe-result.png
docs/contest/evidence/05-source-download.png
```

생성 결과는 현재 MVP보다 우선하지 않는다. 다운로드 소스가 있어도 UI 개선만 비교하고 기존 안전정책을 교체하지 않는다.

## 4. 플랫폼에서 실제 AI 모델 정보가 보이는 경우

보이는 문자열만 그대로 기록한다.

- 정확한 모델 표시명: `________________`
- 모델 공급자/분류: `________________`
- 토큰/포인트 명칭: `________________`
- 외부 API endpoint 공식 문서: `YES / NO / 확인 불가`
- SDK/코드 연동 문서: `________________`
- image input capability: `YES / NO / 확인 불가`

이 항목이 보이지 않아도 추정하지 않는다.

`내 API 키` 화면만으로 외부 추론 API를 증명하지 않는다.

## 5. 외부 AIProvider 채택 Gate

`AitestbedModelApiProvider`는 아래를 모두 확인한 경우에만 구현한다.

1. 공식 AI 추론 API 문서
2. base URL / 인증 / 모델 / request-response schema
3. 최소 실제 호출 probe
4. 외부 프로젝트 사용·개인정보·상업 이용 범위

통과하지 못하면 현재 deterministic MVP를 유지한다.

## 6. MVP 자체 캡처

aitestbed 캡처와 별개로 현재 저장소 MVP의 실제 화면도 제출 증빙에 필요하다.

필수 장면:

1. 초기 Trust Check 화면
2. MEDIUM 또는 HIGH 결과 화면
3. Hospital Kiosk 안내
4. 민감정보 HIGH 안전중단 + 직원 도움 안내

이 화면은 aitestbed 생성 결과가 아니라 **실제 제출 MVP 화면**이어야 한다.

## 7. 개인정보·보안

- 실사용 문자 원문 금지
- 실제 주민등록번호/전화번호/인증번호 금지
- API 키/토큰 캡처 금지
- 개인정보가 포함된 화면은 저장소에 커밋하지 않음
- HIGH를 AI가 낮춘 것처럼 보이는 증빙 금지

## 8. 플랫폼 증빙 완료 기준

- [x] 로그인
- [x] 클라우드 신청 화면 진입/사양 확인
- [ ] 신청 상태 확인
- [ ] 플랫폼 활용 화면 3개 이상
- [ ] 바이브코딩 실제 입력/결과
- [ ] 가능하면 소스 다운로드 증거
- [ ] 실제 모델/API 정보가 보이면 정확한 사실만 기록

플랫폼 증빙을 확보한 뒤에는 즉시 **MVP/제출문서 완성 작업으로 복귀**한다.
