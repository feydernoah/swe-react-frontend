import { test, expect } from '@playwright/test';
import { SearchPage } from './page-objects/SearchPage';

test.describe('Buchsuche', () => {
  test('ERROR: Buch ID nicht bekannt', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.search('unbekannte-id-123', '');
    await expect(searchPage.errorBox).toBeVisible();
    const errorText = await searchPage.getErrorText();
    expect(errorText === null ? '' : errorText).toMatch(/Keine Bücher gefunden|Validation failed/);
  });

  test('FEATURE: Zeige alle Bücher an', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.search('', '');
    const heading = page.locator('h3:has-text("Gefundene Bücher")');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Gefundene Bücher');
  });

  test('FEATURE: Zeige Buch mit ID 90 an', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.search('90', '');
    await expect(searchPage.resultList).toBeVisible();
    await expect(await searchPage.hasBookId('90')).toBeTruthy();
  });
});
