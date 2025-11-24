import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

/**
 * Salesforce Lightningホーム画面のスモークテスト
 * @smoke - 最も重要な基本機能テスト
 */
test.describe('Home Page Smoke Tests @smoke', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  /**
   * @critical - ビジネスクリティカルなテスト
   */
  test('should load home page successfully @critical', async ({ page }) => {
    await homePage.goto();
    await expect(page).toHaveURL(/lightning\/page\/home/);
    await expect(page).toHaveTitle(/Salesforce/);
  });

  test('should display global header', async ({ page }) => {
    await homePage.goto();
    const globalHeader = page.locator('.slds-global-header');
    await expect(globalHeader).toBeVisible();
  });
});

/**
 * Visual Regression Tests
 * @visual @slow
 */
test.describe('Home Page Visual Tests @visual @slow', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test('Home Page Full Snapshot', async ({ page }) => {
    await homePage.goto();
    await expect(page).toHaveScreenshot('home-page-full.png', {
      fullPage: true,
      maxDiffPixels: 100,
      threshold: 0.2,
    });
  });

  test('Home Page Component Snapshot', async ({ page }) => {
    await homePage.goto();
    const targetComponent = homePage.getMainComponent();
    await expect(targetComponent).toBeVisible();
    const maskElements = homePage.getDynamicElementsForMasking();
    await expect(targetComponent).toHaveScreenshot('home-component.png', {
      mask: maskElements,
    });
  });

  test('should render correctly on mobile @mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await homePage.goto();
    await expect(page).toHaveScreenshot('home-page-mobile.png', {
      fullPage: true,
    });
  });
});
