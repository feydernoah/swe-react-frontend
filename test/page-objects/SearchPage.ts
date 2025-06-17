import { Page, Locator } from '@playwright/test';

export class SearchPage {
  readonly page: Page;
  readonly queryInput: Locator;
  readonly artSelect: Locator;
  readonly submitButton: Locator;
  readonly resultList: Locator;
  readonly errorBox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.queryInput = page.locator('#query');
    this.artSelect = page.locator('#art');
    this.submitButton = page.locator('button[type="submit"]');
    this.resultList = page.locator('ul.divide-y');
    this.errorBox = page.locator('div.text-red-400');
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
    return this.errorBox.textContent();
  }

  async hasBookId(id: string) {
    return this.resultList.locator(`text=Id: ${id}`).isVisible();
  }
}
