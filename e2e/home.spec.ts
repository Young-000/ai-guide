import { test, expect } from '@playwright/test';

test.describe('AI 가이드 홈페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('페이지 로드', () => {
    test('홈페이지가 정상적으로 로드된다', async ({ page }) => {
      await expect(page).toHaveTitle(/AI 가이드/);
      await expect(page.getByRole('heading', { name: '무엇을 하고 싶으세요?' })).toBeVisible();
    });

    test('검색 입력창이 표시된다', async ({ page }) => {
      await expect(page.getByPlaceholder(/PDF 요약하고 싶어요/)).toBeVisible();
    });

    test('카테고리 버튼들이 표시된다', async ({ page }) => {
      const categories = ['업무', '학습', '개발', '디자인', '콘텐츠', '리서치'];
      for (const category of categories) {
        await expect(page.getByRole('button', { name: new RegExp(category) })).toBeVisible();
      }
    });

    test('인기 상황이 표시된다', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /인기 상황/ })).toBeVisible();
      // 최소 1개 이상의 상황 카드가 표시되어야 함
      const cards = page.locator('button:has-text("🏆")');
      await expect(cards.first()).toBeVisible();
    });
  });

  test.describe('검색 기능', () => {
    test('검색어 입력 시 결과가 표시된다', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/PDF 요약하고 싶어요/);
      await searchInput.fill('PDF');

      // 검색 결과가 표시될 때까지 대기
      await expect(page.getByText(/개의 추천 상황/)).toBeVisible({ timeout: 5000 });
    });

    test('검색어 삭제 시 인기 상황으로 돌아간다', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/PDF 요약하고 싶어요/);
      await searchInput.fill('PDF');
      await expect(page.getByText(/개의 추천 상황/)).toBeVisible();

      // 검색어 지우기
      await searchInput.clear();
      await expect(page.getByRole('heading', { name: /인기 상황/ })).toBeVisible();
    });

    test('존재하지 않는 검색어는 빈 결과를 표시한다', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/PDF 요약하고 싶어요/);
      await searchInput.fill('존재하지않는검색어xyz');

      await expect(page.getByText(/에 맞는 상황을 찾지 못했어요/)).toBeVisible();
    });
  });

  test.describe('카테고리 필터', () => {
    test('카테고리 버튼 클릭 시 해당 카테고리로 필터링된다', async ({ page }) => {
      await page.getByRole('button', { name: /개발/ }).click();

      // 카테고리가 선택되면 결과가 표시됨
      await expect(page.getByText(/개의 추천 상황/)).toBeVisible({ timeout: 5000 });
    });

    test('선택된 카테고리를 다시 클릭하면 해제된다', async ({ page }) => {
      const devButton = page.getByRole('button', { name: /개발/ });

      await devButton.click();
      await expect(page.getByText(/개의 추천 상황/)).toBeVisible();

      await devButton.click();
      await expect(page.getByRole('heading', { name: /인기 상황/ })).toBeVisible();
    });

    test('초기화 버튼으로 필터를 초기화할 수 있다', async ({ page }) => {
      await page.getByRole('button', { name: /개발/ }).click();
      await expect(page.getByText(/개의 추천 상황/)).toBeVisible();

      await page.getByRole('button', { name: '초기화' }).click();
      await expect(page.getByRole('heading', { name: /인기 상황/ })).toBeVisible();
    });
  });

  test.describe('가이드 패널', () => {
    test('인기 상황 카드 클릭 시 가이드 패널이 표시된다', async ({ page }) => {
      // 첫 번째 인기 상황 카드 클릭
      await page.getByRole('button', { name: /PDF 문서 빠르게 요약하기/ }).click();

      // 가이드 패널이 표시되어야 함 (모바일 오버레이 또는 사이드 패널)
      await expect(page.getByText('추천 도구')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('따라하기')).toBeVisible();
    });

    test('검색 결과 카드 클릭 시 가이드 패널이 표시된다', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/PDF 요약하고 싶어요/);
      await searchInput.fill('코드');

      // 검색 결과 대기
      await expect(page.getByText(/개의 추천 상황/)).toBeVisible();

      // 결과 카드 클릭
      await page.getByRole('button', { name: /코드 에러 해결하기/ }).click();

      // 가이드 패널 표시 확인
      await expect(page.getByText('추천 도구')).toBeVisible({ timeout: 5000 });
    });

    test('프롬프트 복사 버튼이 동작한다', async ({ page }) => {
      await page.getByRole('button', { name: /PDF 문서 빠르게 요약하기/ }).click();

      // 복사 버튼 대기
      const copyButton = page.getByRole('button', { name: '복사' }).first();
      await expect(copyButton).toBeVisible({ timeout: 5000 });

      await copyButton.click();
      await expect(page.getByText('복사됨')).toBeVisible();
    });

    test('가이드 패널 닫기 버튼이 동작한다', async ({ page }) => {
      await page.getByRole('button', { name: /PDF 문서 빠르게 요약하기/ }).click();
      await expect(page.getByText('추천 도구')).toBeVisible();

      // 닫기 버튼 클릭 (X 버튼)
      await page.locator('button:has(svg)').filter({ has: page.locator('path[d*="M6 18L18 6"]') }).click();

      // 패널이 닫히면 인기 상황이 다시 보여야 함
      await expect(page.getByRole('heading', { name: /인기 상황/ })).toBeVisible();
    });
  });

  test.describe('네비게이션', () => {
    test('전체 도구 링크가 동작한다', async ({ page }) => {
      await page.getByRole('link', { name: '전체 도구' }).click();
      await expect(page).toHaveURL(/\/tools/);
    });

    test('로고 클릭 시 홈으로 이동한다', async ({ page }) => {
      await page.getByRole('link', { name: '전체 도구' }).click();
      await expect(page).toHaveURL(/\/tools/);

      await page.getByRole('link', { name: /AI 가이드/ }).click();
      await expect(page).toHaveURL('/');
    });
  });
});
