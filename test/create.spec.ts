import { test, expect } from '@playwright/test';
import { SearchPage } from './page-objects/SearchPage';

test.describe('Anlegen', () => {
  test('ADMIN: Buch anlegen', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.login('admin', 'p');
    await page.goto('/create');
    await expect(page.locator('h1')).toHaveText('Buch anlegen');
  });
});
