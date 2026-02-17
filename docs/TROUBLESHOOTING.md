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

---

*마지막 업데이트: 2026-02-13*
