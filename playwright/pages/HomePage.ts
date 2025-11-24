import { Page, expect } from '@playwright/test';

/**
 * ベースページクラス
 * 全てのPage Objectで共通のメソッドを提供
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Lightning Experienceのロード完了を待つ
   * Salesforce特有の遅延レンダリングに対応
   */
  async waitForLightningLoad() {
    // URLがlightningに変わるまで待機
    await this.page.waitForURL(/lightning/);
    
    // DOMContentLoadedまで待機（networkidleは使わない）
    // Salesforceはバックグラウンドで継続的なネットワークアクティビティがあるため
    // networkidleだとタイムアウトする
    await this.page.waitForLoadState('domcontentloaded');
    
    // Aura Frameworkの準備完了を確認
    // Salesforce LightningはAuraフレームワーク上で動作するため、
    // Aura.applicationReadyがtrueになるまで待つ必要がある
    try {
      await this.page.waitForFunction(() => {
        return (window as any).Aura?.applicationReady === true;
      }, { timeout: 15000 });
    } catch (error) {
      // Auraが利用できない場合（新しいLWCベースのページ等）は
      // 主要な要素の出現で判断
      await this.page.locator('.slds-global-header').waitFor({ 
        state: 'visible',
        timeout: 15000 
      });
    }
    
    // 追加の安定化待機（アニメーション完了等）
    await this.page.waitForTimeout(1000);
  }

  /**
   * Shadow DOMを貫通してボタンをクリック
   * PlaywrightはShadow DOMを自動で貫通するため、
   * ユーザーに見える属性（ロール、ラベル）でアクセス可能
   */
  async clickButtonByName(name: string) {
    await this.page.getByRole('button', { name }).click();
  }

  /**
   * トースト通知の確認（成功/エラー）
   * Salesforceの操作後に表示される通知を検証
   */
    async waitForToast(type: 'success' | 'error' | 'warning', message?: string) {
    const toastLocator = this.page.locator('.slds-notify--toast');
    await toastLocator.waitFor({ state: 'visible', timeout: 10000 });
    
    // トーストのタイプを確認
    if (type === 'success') {
        await expect(toastLocator).toHaveClass(/slds-theme--success/);
    } else if (type === 'error') {
        await expect(toastLocator).toHaveClass(/slds-theme--error/);
    } else if (type === 'warning') {
        await expect(toastLocator).toHaveClass(/slds-theme_warning/);
    }
    
    // メッセージ内容の確認（オプション）
    if (message) {
        await expect(toastLocator).toContainText(message);
    }
    }

  /**
   * グローバル検索を実行
   */
  async globalSearch(query: string) {
    const searchBox = this.page.getByPlaceholder('Search...');
    await searchBox.fill(query);
    await searchBox.press('Enter');
    await this.waitForLightningLoad();
  }
}

/**
 * Salesforce Lightningホーム画面のPage Object
 */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * ホーム画面へ移動
   */
  async goto() {
    await this.page.goto('/lightning/page/home');
    await this.waitForLightningLoad();
  }

  /**
   * App Launcherからアプリケーションを開く
   * Salesforceのワッフルアイコン（9つの点）から任意のアプリを起動
   */
  async openApp(appName: string) {
    // App Launcher（ワッフルアイコン）をクリック
    const appLauncher = this.page.getByRole('button', { name: /App Launcher/i });
    await appLauncher.click();
    
    // モーダルが開くのを待つ
    await this.page.waitForSelector('.slds-modal--large', { state: 'visible' });
    
    // アプリ検索
    const searchInput = this.page.getByPlaceholder(/Search apps/i);
    await searchInput.fill(appName);
    
    // 検索結果からアプリをクリック
    await this.page.getByRole('link', { name: appName, exact: false }).click();
    await this.waitForLightningLoad();
  }

  /**
   * ナビゲーションバーから特定のオブジェクトへ移動
   * 例: navigateToObject('Accounts')
   */
  async navigateToObject(objectName: string) {
    const navItem = this.page.getByRole('link', { name: objectName });
    await navItem.click();
    await this.waitForLightningLoad();
  }

  /**
   * プロフィールメニューを開く
   */
  async openProfileMenu() {
    const profileButton = this.page.locator('.profile-link-container button');
    await profileButton.click();
  }

  /**
   * ログアウト
   */
  async logout() {
    await this.openProfileMenu();
    await this.page.getByRole('menuitem', { name: 'Log Out' }).click();
  }

  /**
   * Visual Regression Testing用の動的要素マスク
   * 毎回変わる要素（日時、アバター等）を返す
   */
  getDynamicElementsForMasking() {
    return [
      this.page.locator('lightning-formatted-date-time'),
      this.page.locator('lightning-formatted-time'),
      this.page.locator('.slds-avatar'),
      this.page.locator('[title*="Last Modified"]'),
    ];
  }

  /**
   * VRT用の検証対象要素を取得
   * 最初のflexipageComponentを返す
   */
  getMainComponent() {
    return this.page.locator('.flexipageComponent').first();
  }
}
