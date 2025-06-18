import { test, expect } from '@playwright/test';
import { SearchPage } from './page-objects/SearchPage';

test.describe('Buchsuche', () => {
  test('ERROR: Buch ID nicht bekannt', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.search('unbekannte-id-123', '');
    await expect(searchPage.errorText).toBeVisible();
    const errorText = await searchPage.getErrorText();
    expect(errorText === null ? '' : errorText).toMatch(
      /Keine Bücher gefunden|Validation failed/,
    );
  });

  test('ERROR: Zugriff verweigert auf /create', async ({ page }) => {
    await page.goto('/create');
    await expect(page.locator('h1')).toHaveText('Zugriff verweigert');
    await expect(page.locator('p')).toContainText(
      'Nur Admins können Bücher anlegen',
    );
  });

  test('USER: Zeige alle Bücher an', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.search('', '');
    const heading = page.locator('h3:has-text("Gefundene Bücher")');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Gefundene Bücher');
  });

  test('USER: Zeige Buch mit ID 90 an', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.search('90', '');
    await expect(searchPage.resultList).toBeVisible();
    await expect(await searchPage.hasBookId('90')).toBeTruthy();
  });

  test('ADMIN: Ändere Bewertung von Buch 90', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.login('admin', 'p');
    await searchPage.goto();
    await searchPage.search('90', '');
    await expect(searchPage.resultList).toBeVisible();
    const currentRating = await searchPage.getBookRating('90');
    let newRating = Math.floor(Math.random() * 5) + 1;
    if (newRating === currentRating) {
      newRating = (newRating % 5) + 1;
    }
    await searchPage.setBookRating('90', newRating);
    await expect.poll(() => searchPage.getBookRating('90')).toBe(newRating);
  });
});
