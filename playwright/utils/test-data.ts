import { SalesforceAPI } from './salesforce-api';

/**
 * テストデータ管理クラス
 * テストで使用するレコードの作成・追跡・自動クリーンアップを管理
 */
export class TestDataManager {
  private createdRecords: Array<{ type: string; id: string; name?: string }> = [];
  private api: SalesforceAPI;

  constructor(api: SalesforceAPI) {
    this.api = api;
  }

  /**
   * ユニークな取引先（Account）を作成
   * @param name - 取引先名（省略時は自動生成）
   * @param additionalData - 追加のフィールドデータ
   * @returns 作成された取引先のIDと名前
   * 
   * @example
   * ```typescript
   * const account = await testData.createTestAccount('Acme Corp');
   * console.log(account.id, account.name);
   * ```
   */
  async createTestAccount(name?: string, additionalData?: any): Promise<{ id: string; name: string }> {
    // ユニークな名前を生成（タイムスタンプ付き）
    const uniqueName = name || `TestAccount_${Date.now()}`;
    
    const accountData = {
      Name: uniqueName,
      Type: 'Prospect',
      Industry: 'Technology',
      ...additionalData,
    };

    const result = await this.api.createRecord('Account', accountData);

    // 作成したレコードを記録（後でクリーンアップ用）
    this.createdRecords.push({
      type: 'Account',
      id: result.id,
      name: uniqueName,
    });

    console.log(`✅ Created test Account: ${uniqueName} (${result.id})`);

    return { id: result.id, name: uniqueName };
  }

  /**
   * ユニークな取引先責任者（Contact）を作成
   * @param accountId - 紐付ける取引先のID
   * @param data - 取引先責任者データ（FirstName, LastNameなど）
   * @returns 作成された取引先責任者のID
   * 
   * @example
   * ```typescript
   * const contact = await testData.createTestContact(accountId, {
   *   FirstName: '太郎',
   *   LastName: '田中'
   * });
   * ```
   */
  async createTestContact(
    accountId: string,
    data?: { FirstName?: string; LastName?: string; Email?: string; [key: string]: any }
  ): Promise<{ id: string; name: string }> {
    const timestamp = Date.now();
    const contactData = {
      AccountId: accountId,
      FirstName: data?.FirstName || 'TestFirst',
      LastName: data?.LastName || `TestLast_${timestamp}`,
      Email: data?.Email || `test.${timestamp}@example.com`,
      ...data,
    };

    const result = await this.api.createRecord('Contact', contactData);
    const fullName = `${contactData.FirstName} ${contactData.LastName}`;

    this.createdRecords.push({
      type: 'Contact',
      id: result.id,
      name: fullName,
    });

    console.log(`✅ Created test Contact: ${fullName} (${result.id})`);

    return { id: result.id, name: fullName };
  }

  /**
   * ユニークな商談（Opportunity）を作成
   * @param accountId - 紐付ける取引先のID
   * @param data - 商談データ
   * @returns 作成された商談のID
   * 
   * @example
   * ```typescript
   * const opp = await testData.createTestOpportunity(accountId, {
   *   Name: 'Big Deal',
   *   Amount: 100000
   * });
   * ```
   */
  async createTestOpportunity(
    accountId: string,
    data?: { Name?: string; Amount?: number; CloseDate?: string; [key: string]: any }
  ): Promise<{ id: string; name: string }> {
    const timestamp = Date.now();
    
    // CloseDate: 今日から30日後
    const closeDate = new Date();
    closeDate.setDate(closeDate.getDate() + 30);
    const closeDateString = closeDate.toISOString().split('T')[0];

    const opportunityData = {
      AccountId: accountId,
      Name: data?.Name || `TestOpportunity_${timestamp}`,
      StageName: 'Prospecting',
      CloseDate: data?.CloseDate || closeDateString,
      Amount: data?.Amount || 10000,
      ...data,
    };

    const result = await this.api.createRecord('Opportunity', opportunityData);

    this.createdRecords.push({
      type: 'Opportunity',
      id: result.id,
      name: opportunityData.Name,
    });

    console.log(`✅ Created test Opportunity: ${opportunityData.Name} (${result.id})`);

    return { id: result.id, name: opportunityData.Name };
  }

  /**
   * カスタムオブジェクトのレコードを作成（汎用）
   * @param objectType - オブジェクト種別
   * @param data - レコードデータ
   * @returns 作成されたレコードのID
   * 
   * @example
   * ```typescript
   * const customRecord = await testData.createTestRecord('CustomObject__c', {
   *   Name: 'Test Record',
   *   CustomField__c: 'value'
   * });
   * ```
   */
  async createTestRecord(objectType: string, data: any): Promise<{ id: string }> {
    const result = await this.api.createRecord(objectType, data);

    this.createdRecords.push({
      type: objectType,
      id: result.id,
      name: data.Name || 'Unknown',
    });

    console.log(`✅ Created test ${objectType}: ${data.Name || result.id}`);

    return { id: result.id };
  }

  /**
   * 作成したレコードを取得
   * @returns 作成されたレコードのリスト
   */
  getCreatedRecords(): Array<{ type: string; id: string; name?: string }> {
    return [...this.createdRecords];
  }

  /**
   * 特定のオブジェクト種別のレコードIDを取得
   * @param objectType - オブジェクト種別
   * @returns レコードIDのリスト
   */
  getRecordIdsByType(objectType: string): string[] {
    return this.createdRecords
      .filter(record => record.type === objectType)
      .map(record => record.id);
  }

  /**
   * テストで作成した全レコードをクリーンアップ（削除）
   * test.afterEach または test.afterAll で呼び出す
   * 
   * @example
   * ```typescript
   * test.afterAll(async () => {
   *   await testData.cleanup();
   * });
   * ```
   */
  async cleanup(): Promise<void> {
    if (this.createdRecords.length === 0) {
      console.log('🧹 No records to clean up');
      return;
    }

    console.log(`🧹 Cleaning up ${this.createdRecords.length} test records...`);

    // 依存関係を考慮して削除順序を決定
    // 子レコード → 親レコードの順で削除
    const deletionOrder = ['Opportunity', 'Contact', 'Account'];

    for (const objectType of deletionOrder) {
      const recordsToDelete = this.createdRecords.filter(r => r.type === objectType);
      
      if (recordsToDelete.length > 0) {
        console.log(`  Deleting ${recordsToDelete.length} ${objectType} records...`);
        
        for (const record of recordsToDelete) {
          try {
            await this.api.deleteRecord(record.type, record.id);
            console.log(`    ✓ Deleted ${record.type}: ${record.name || record.id}`);
          } catch (error) {
            console.error(`    ✗ Failed to delete ${record.type}:${record.id}`, error);
          }
        }
      }
    }

    // その他のオブジェクト（カスタムオブジェクトなど）を削除
    const otherRecords = this.createdRecords.filter(
      r => !deletionOrder.includes(r.type)
    );

    for (const record of otherRecords) {
      try {
        await this.api.deleteRecord(record.type, record.id);
        console.log(`  ✓ Deleted ${record.type}: ${record.name || record.id}`);
      } catch (error) {
        console.error(`  ✗ Failed to delete ${record.type}:${record.id}`, error);
      }
    }

    // クリーンアップ完了後、配列をクリア
    this.createdRecords = [];
    console.log('✅ Cleanup complete');
  }

  /**
   * 特定のレコードのみをクリーンアップ対象から除外
   * @param recordId - 除外するレコードID
   */
  excludeFromCleanup(recordId: string): void {
    this.createdRecords = this.createdRecords.filter(r => r.id !== recordId);
  }

  /**
   * クリーンアップをリセット（作成記録をクリア）
   * 注意: レコード自体は削除されません
   */
  resetTracking(): void {
    console.log('⚠️  Resetting record tracking (records will not be cleaned up)');
    this.createdRecords = [];
  }
}
