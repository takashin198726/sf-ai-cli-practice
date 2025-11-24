import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// .envファイルから環境変数を読み込む
dotenv.config();

export default defineConfig({
  testDir: './playwright/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  // Salesforceは遅いのでタイムアウトを60秒に延長
  timeout: 60 * 1000,
  
  // スクリーンショット比較の共通設定 (Scoped VRT用)
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,     // 100pxまでのズレは許容
      threshold: 0.2,         // 色差の許容度
      animations: 'disabled', // アニメーション停止
    },
  },

  use: {
    // 環境変数からURLを読み込む (GitHubには上がらない)
    baseURL: process.env.SF_BASE_URL,

    // 認証情報を全テストで使い回す
    storageState: 'playwright/.auth/user.json',
    trace: 'on-first-retry',
    // VRTのために画面サイズを固定
    viewport: { width: 1280, height: 720 },
    video: 'retain-on-failure',
  },

  projects: [
    // セットアップ処理 (認証)
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      // setup実行時は認証情報を読み込まない
      use: {
        storageState: { cookies: [], origins: [] },
      },
    },
    // テスト実行 (Chromeのみで十分)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'], // setupが終わってから実行する依存関係
    },
  ],
});
