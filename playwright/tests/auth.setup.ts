import { test as setup } from '@playwright/test';
import { execSync } from 'child_process';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  console.log('�� Retrieving org info from Salesforce CLI...');
  
  // sfコマンドからアクセストークンとインスタンスURLを取得
  // CLIの色出力を無効化してJSONパースエラーを防ぐ
  const sfOrgDisplay = execSync('sf org display --json', {
    env: { ...process.env, FORCE_COLOR: '0' }
  }).toString();

  const orgInfo = JSON.parse(sfOrgDisplay).result;

  if (!orgInfo.accessToken || !orgInfo.instanceUrl) {
    throw new Error('❌ Failed to retrieve Access Token. Run "sf org login web" first.');
  }

  // Frontdoor URL (裏口入学URL) を構築
  const frontdoorUrl = `${orgInfo.instanceUrl}/secur/frontdoor.jsp?sid=${orgInfo.accessToken}&retURL=/lightning/page/home`;

  console.log(`🚀 Logging in to ${orgInfo.instanceUrl}...`);

  // ログイン実行
  await page.goto(frontdoorUrl);
  
  // ホーム画面のロード待ち (URLが lightning に変わるまで)
  await page.waitForURL(/lightning/);
  
  // 認証状態 (Cookie/Storage) を保存
  await page.context().storageState({ path: authFile });
  console.log('✅ Authentication state saved!');
});
