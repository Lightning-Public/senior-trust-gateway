# Handoffs

ChatGPT, Codex, 기타 개발 에이전트 또는 새로운 세션으로 작업을 넘길 때 사용하는 폴더다.

## Handoff 작성 규칙

파일명:

`YYYY-MM-DD-<topic>-handoff.md`

최소 포함 항목:

1. 목표
2. 현재 브랜치/PR/Issue
3. 완료한 작업
4. 확정된 결정
5. 아직 결정하지 않은 것
6. 알려진 위험/막힘
7. 바로 다음 행동 1~3개
8. 검증 방법

## Canonical state

장기 기준은 다음 순서로 본다.

1. `AGENTS.md` — 작업 규칙
2. `docs/product/*` — 제품 원칙
3. `PROJECT_STATE.md` — 현재 상태
4. Issue/PR — 개별 실행 작업과 논의
5. `docs/handoffs/*` — 세션 이동용 스냅샷

Handoff는 위 문서와 충돌할 경우 최신 canonical 문서를 따른다.
