// playwright/pages/BasePage.ts
import { Page } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async waitForLightningLoad() {
    await this.page.waitForURL(/lightning/);
    await this.page.waitForLoadState('networkidle');
    
    // Aura Ready確認
    await this.page.waitForFunction(() => {
      return (window as any).Aura?.applicationReady === true;
    }, { timeout: 30000 });
  }

  async clickButtonByName(name: string) {
    await this.page.getByRole('button', { name }).click();
  }
}