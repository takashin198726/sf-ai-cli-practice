import { test, expect } from '@playwright/test';
import { SalesforceAPI } from '../../utils/salesforce-api';
import { TestDataManager } from '../../utils/test-data';

/**
 * API連携テスト（UI依存ゼロ）
 * @critical - ビジネスクリティカルなテスト
 * 
 * このテストは以下のパターンを示します：
 * 1. APIでテストデータを作成（高速・確実）
 * 2. APIで結果を検証（高速）
 * 3. 自動クリーンアップ
 */
test.describe('Account API Integration Tests @critical', () => {
  let api: SalesforceAPI;
  let testData: TestDataManager;

  // 全テスト開始前に一度だけ実行
  test.beforeAll(async ({ request }) => {
    api = new SalesforceAPI(request);
    testData = new TestDataManager(api);
  });

  // 全テスト終了後にクリーンアップ
  test.afterAll(async () => {
    await testData.cleanup();
  });

  /**
   * テスト1: API経由でデータ作成 → API検証
   */
  test('should create account via API and verify', async () => {
    // 1. APIで取引先を作成（1-2秒）
    const account = await testData.createTestAccount('API Test Corp', {
      Industry: 'Technology',
      AnnualRevenue: 1000000,
    });

    // 2. APIで作成された取引先を検証
    const created = await api.getRecord('Account', account.id, ['Name', 'Industry', 'AnnualRevenue']);
    
    expect(created.Name).toBe('API Test Corp');
    expect(created.Industry).toBe('Technology');
    expect(created.AnnualRevenue).toBe(1000000);
  });

  /**
   * テスト2: レコードの更新とAPI検証
   */
  test('should update account via API and verify', async () => {
    // 1. APIでテストデータ作成
    const account = await testData.createTestAccount('Test Company');

    // 2. APIで更新
    await api.updateRecord('Account', account.id, {
      Phone: '03-1234-5678',
      Website: 'https://example.com'
    });

    // 3. APIで変更を検証
    const updated = await api.getRecord('Account', account.id, ['Phone', 'Website']);
    expect(updated.Phone).toBe('03-1234-5678');
    expect(updated.Website).toBe('https://example.com');
  });

  /**
   * テスト3: 関連レコードの作成と検証（API）
   */
  test('should create account with related contact', async () => {
    // 1. APIで取引先と取引先責任者を作成
    const account = await testData.createTestAccount('Parent Company');
    const contact = await testData.createTestContact(account.id, {
      FirstName: '太郎',
      LastName: '田中',
      Email: 'tanaka@example.com',
    });

    // 2. APIで関連を検証
    const contactRecord = await api.getRecord('Contact', contact.id, ['AccountId', 'FirstName', 'LastName', 'Email']);
    
    expect(contactRecord.AccountId).toBe(account.id);
    expect(contactRecord.FirstName).toBe('太郎');
    expect(contactRecord.LastName).toBe('田中');
    expect(contactRecord.Email).toBe('tanaka@example.com');
  });

  /**
   * テスト4: レコード数の検証（API活用）
   */
  test('should verify account count via API', async () => {
    // まずテストデータを作成
    await testData.createTestAccount('Count Test 1');
    await testData.createTestAccount('Count Test 2');

    // APIで全体のレコード数を検証（高速）
    const totalCount = await api.countRecords('Account');
    console.log(`Total Accounts in org: ${totalCount}`);
    
    // 少なくとも作成した2件は存在するはず
    expect(totalCount).toBeGreaterThanOrEqual(2);
  });

  /**
   * テスト5: 複雑な検索条件での検証
   */
  test('should query accounts with specific criteria', async () => {
    // テストデータを複数作成
    await testData.createTestAccount('Tech Company A', { Industry: 'Technology' });
    await testData.createTestAccount('Tech Company B', { Industry: 'Technology' });
    await testData.createTestAccount('Finance Company', { Industry: 'Finance' });

    // SOQLで特定条件のレコードを検索
    const result = await api.query(
      "SELECT Id, Name, Industry FROM Account WHERE Industry = 'Technology' AND Name LIKE 'Tech Company%'"
    );

    // 検証
    expect(result.records.length).toBeGreaterThanOrEqual(2);
    expect(result.records.every((r: any) => r.Industry === 'Technology')).toBe(true);
  });

  /**
   * テスト6: 複数レコードの一括作成
   */
  test('should create multiple accounts', async () => {
    const accounts = [];
    
    for (let i = 1; i <= 3; i++) {
      const account = await testData.createTestAccount(`Bulk Test Account ${i}`);
      accounts.push(account);
    }

    // 全てのレコードが作成されたことを確認
    expect(accounts.length).toBe(3);
    
    // 各レコードを検証
    for (const account of accounts) {
      const record = await api.getRecord('Account', account.id, ['Name']);
      expect(record.Name).toContain('Bulk Test Account');
    }
  });
});

/**
 * 並列実行テスト
 * @smoke - データが完全分離されているため並列実行可能
 */
test.describe('Parallel Execution Tests @smoke', () => {
  let api: SalesforceAPI;
  let testData: TestDataManager;

  test.beforeEach(async ({ request }) => {
    // 各テストで独立したTestDataManagerを使用
    api = new SalesforceAPI(request);
    testData = new TestDataManager(api);
  });

  test.afterEach(async () => {
    await testData.cleanup();
  });

  // これらのテストは並列実行されても互いに干渉しない
  test('parallel test 1', async () => {
    const account = await testData.createTestAccount('Parallel Account 1');
    expect(account.id).toBeTruthy();
    
    // レコードが実際に作成されたことをAPI確認
    const record = await api.getRecord('Account', account.id, ['Name']);
    expect(record.Name).toBe('Parallel Account 1');
  });

  test('parallel test 2', async () => {
    const account = await testData.createTestAccount('Parallel Account 2');
    expect(account.id).toBeTruthy();
    
    const record = await api.getRecord('Account', account.id, ['Name']);
    expect(record.Name).toBe('Parallel Account 2');
  });

  test('parallel test 3', async () => {
    const account = await testData.createTestAccount('Parallel Account 3');
    expect(account.id).toBeTruthy();
    
    const record = await api.getRecord('Account', account.id, ['Name']);
    expect(record.Name).toBe('Parallel Account 3');
  });
});

/**
 * エラーハンドリングテスト
 * @smoke
 */
test.describe('Error Handling Tests @smoke', () => {
  let api: SalesforceAPI;
  let testData: TestDataManager;

  test.beforeEach(async ({ request }) => {
    api = new SalesforceAPI(request);
    testData = new TestDataManager(api);
  });

  test.afterEach(async () => {
    await testData.cleanup();
  });

  test('should handle deletion of non-existent record', async () => {
  // 存在しないIDで削除を試みる（エラーにならずに処理される）
  await expect(
    api.deleteRecord('Account', '001000000000000AAA')
  ).resolves.toBeUndefined();
});

test('should create and immediately verify record', async () => {
  const account = await testData.createTestAccount('Immediate Test');
  
  // getRecordメソッドを使用する方が安全
  const record = await api.getRecord('Account', account.id, ['Id', 'Name']);
  
  expect(record.Id).toBe(account.id);
  expect(record.Name).toBe('Immediate Test');
});
});
