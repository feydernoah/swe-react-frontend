import { Page, Locator } from '@playwright/test';

export class SearchPage {
  readonly page: Page;
  readonly queryInput: Locator;
  readonly artSelect: Locator;
  readonly submitButton: Locator;
  readonly resultList: Locator;
  readonly errorText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.queryInput = page.locator('#query');
    this.artSelect = page.locator('#art');
    this.submitButton = page.locator('button[type="submit"]');
    this.resultList = page.locator('ul.divide-y');
    this.errorText = page.locator('div.text-error');
  }

  async goto() {
    await this.page.goto('/search');
  }

  async search(query: string, art: string = '') {
    await this.queryInput.fill(query);
    if (art) {
      await this.artSelect.selectOption(art);
    }
    await this.submitButton.click();
  }

  async getResultsText() {
    return this.resultList.textContent();
  }

  async getErrorText() {
    return this.errorText.textContent();
  }

  async hasBookId(id: string) {
    return this.resultList.locator(`text=Id: ${id}`).isVisible();
  }

  async login(username: string, password: string) {
    await this.page.goto('/login');
    await this.page.locator('input[name="username"]').fill(username);
    await this.page.locator('input[name="password"]').fill(password);
    await this.page.locator('button[type="submit"]').click();
    await this.page.waitForLoadState('networkidle');
    await this.page.goto('/search');
  }

  async getBookRating(bookId: string): Promise<number> {
    const bookItem = this.resultList.locator(`li:has-text('Id: ${bookId}')`);
    const ratingContainer = bookItem.locator('div:has-text("Bewertung:")');
    const stars = ratingContainer.locator('svg');
    const filledStars = await stars.evaluateAll(
      (nodes: Element[]) =>
        nodes.filter((n) => n.getAttribute('fill') === '#facc15').length,
    );
    return filledStars;
  }

  async setBookRating(bookId: string, newRating: number) {
    // Find the list item for the book
    const bookItem = this.resultList.locator(`li:has-text('Id: ${bookId}')`);
    // Find the Bewertung container inside that item
    const ratingContainer = bookItem.locator('div:has-text("Bewertung:")');
    // Find the button with the correct aria-label
    const button = ratingContainer.locator(
      `button[aria-label="Set rating to ${newRating}"]`,
    );
    await button.click();
  }
}
