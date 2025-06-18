import { test, expect } from '@playwright/test';
import { SearchPage } from './page-objects/SearchPage';

test.describe('Anlegen', () => {
  test('ADMIN: Buch anlegen', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.login('admin', 'p');
    await page.goto('/create');
    await expect(page.locator('h1')).toHaveText('Buch anlegen');
    await expect(page.locator('input[name="isbn"]')).toBeVisible();
    await expect(page.locator('input[name="rating"]')).toBeVisible();
    await expect(page.locator('input[name="preis"]')).toBeVisible();
    await expect(page.locator('input[name="titel"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
