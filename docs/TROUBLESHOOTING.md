# AI Guide - 트러블슈팅

> 프로젝트 고유 이슈와 해결법. 공통 이슈는 workspace/CLAUDE.md 참조.

## Git 원격 저장소 미설정

**증상**: `git push` 실행 시 원격 저장소가 없다는 오류

**원인**: GitHub 리포지토리가 아직 생성되지 않음

**해결**:
```bash
# 1. GitHub에 리포지토리 생성
gh repo create ai-guide --private --source=. --push

# 2. 또는 수동으로
git remote add origin git@github.com:<username>/ai-guide.git
git push -u origin main
```

## feature 브랜치 방치

**증상**: feature/situation-based-pivot 브랜치가 오래 방치됨

**해결**:
```bash
# 현재 브랜치 상태 확인
git log --oneline -5 feature/situation-based-pivot

# main과의 차이 확인
git diff main...feature/situation-based-pivot --stat

# 작업 재개 또는 정리 결정
```

## Next.js 빌드 에러

**증상**: `npm run build` 실패

**확인 순서**:
1. `npm run lint` -- 린트 오류 확인
2. TypeScript 타입 오류 확인
3. data/ 디렉토리의 JSON 파일 형식 검증
4. Next.js App Router 파일 구조 확인 (page.tsx, layout.tsx)

### 발행 result=generation-failed

**증상**: `~/.claude/logs/ai-guide-publish.status` 에 `result=generation-failed`, 로그에 `Malformed output` 또는 `generation error`

**확인 순서**:
1. 경고 줄 끝에 찍힌 파일을 연다 (`~/.claude/state/ai-guide-failed/raw-output/`). 머리에 사유·제목·URL, 그 아래 모델·CLI 원문이 있다.
2. `reason: cli-error` — 원문의 CLI 메시지를 본다. `You've hit your weekly limit` 는 다음 리셋까지 대기, `Not logged in` 은 `~/.claude/secrets/teamY/claude-cli.env` 토큰 점검.
3. `reason: malformed` — 마커가 없는 출력이다. 설명문이면 무언가가 답을 다시 쓰게 한 것이니 `scripts/claude-cli-args.ts` 의 격리 플래그가 유지되는지 본다.
4. `reason: invalid-article: …` — 품질 검증이 거부한 것이다. 검증을 낮추지 말고 생성 지침을 고친다.

**2026-11-01 사례**: 전역 Stop 훅이 재작성을 시켜 stdout 에 두 번째 답만 남았다. CLI 를 설정·도구 없이 저장소 밖에서 실행하도록 고쳤다 (`docs/LESSONS.md`).

---

*마지막 업데이트: 2026-11-01*
