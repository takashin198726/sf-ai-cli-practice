import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

/**
 * Salesforce Lightningホーム画面のテストスイート
 * Visual Regression Testingを含む
 */
test.describe('Home Page Tests', () => {
  let homePage: HomePage;

  /**
   * 各テスト前にPage Objectインスタンスを作成
   */
  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  /**
   * 基本的なナビゲーションテスト
   * ホーム画面が正常にロードされることを確認
   */
  test('should load home page successfully', async ({ page }) => {
    await homePage.goto();
    
    // URLが正しいことを確認
    await expect(page).toHaveURL(/lightning\/page\/home/);
    
    // ページタイトルにSalesforceが含まれることを確認
    await expect(page).toHaveTitle(/Salesforce/);
  });

  /**
   * Visual Regression Test - フルページスクリーンショット
   * ホーム画面全体のレイアウト検証
   */
  test('Home Page Full Snapshot', async ({ page }) => {
    // Page Objectを使用してホーム画面へ移動
    await homePage.goto();

    // スクリーンショット比較（VRT実行）
    await expect(page).toHaveScreenshot('home-page-full.png', {
      fullPage: true,
      // Salesforceの動的要素による誤検知を防ぐため、閾値を設定
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  /**
   * Visual Regression Test - コンポーネント単位のスクリーンショット
   * 特定のコンポーネント領域のみを検証（Scoped VRT）
   * 
   * Scoped VRTの利点:
   * - ページ全体ではなく重要な領域のみを検証
   * - 無関係な変更によるテスト失敗を防ぐ
   * - スクリーンショットサイズが小さく、比較が高速
   */
  test('Home Page Component Snapshot', async ({ page }) => {
    await homePage.goto();

    // 検証対象のコンポーネントを取得
    const targetComponent = homePage.getMainComponent();
    await expect(targetComponent).toBeVisible();

    // 動的要素をマスク（毎回変わる要素を隠す）
    const maskElements = homePage.getDynamicElementsForMasking();

    // コンポーネント単位でスクリーンショット比較
    await expect(targetComponent).toHaveScreenshot('home-component.png', {
      mask: maskElements,
      // アニメーションを無効化（playwright.config.tsでグローバル設定済み）
    });
  });

  /**
   * ナビゲーション機能テスト
   * App Launcherからアプリを開くフローを検証
   */
  test('should open app from App Launcher', async ({ page }) => {
    await homePage.goto();

    // Salesアプリを開く（環境に存在する標準アプリを指定）
    await homePage.openApp('Sales');

    // Sales Homeに遷移したことを確認
    await expect(page).toHaveURL(/lightning\/page\/home/);
  });

  /**
   * グローバル検索機能テスト
   */
  test('should perform global search', async ({ page }) => {
    await homePage.goto();

    // 検索を実行
    await homePage.globalSearch('Account');

    // 検索結果ページに遷移したことを確認
    await expect(page).toHaveURL(/lightning\/r\/search/);
  });

  /**
   * レスポンシブデザインテスト（モバイル表示）
   * オプション: モバイル表示でのレイアウト検証
   */
  test('should render correctly on mobile', async ({ page }) => {
    // モバイルビューポートに変更
    await page.setViewportSize({ width: 375, height: 812 });
    
    await homePage.goto();

    // モバイル用のスクリーンショット
    await expect(page).toHaveScreenshot('home-page-mobile.png', {
      fullPage: true,
    });
  });
});