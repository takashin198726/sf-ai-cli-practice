import { APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Salesforce REST API操作クラス
 * テストデータの作成・取得・削除をAPI経由で実行
 */
export class SalesforceAPI {
  private baseURL: string;
  private accessToken: string;
  private apiVersion = 'v60.0';

  constructor(request: APIRequestContext) {
    this.baseURL = process.env.SF_BASE_URL || '';
    if (!this.baseURL) {
      throw new Error('SF_BASE_URL is not set in environment variables');
    }
    
    // 認証ファイルからアクセストークンを取得
    this.accessToken = this.extractAccessToken();
  }

  /**
   * 認証ファイル（storageState）からアクセストークンを抽出
   * @private
   */
  private extractAccessToken(): string {
    try {
      const authFilePath = path.join(process.cwd(), 'playwright/.auth/user.json');
      const authState = JSON.parse(fs.readFileSync(authFilePath, 'utf-8'));
      
      // sidクッキーからアクセストークンを取得
      const sidCookie = authState.cookies.find((c: any) => c.name === 'sid');
      if (!sidCookie) {
        throw new Error('Access token (sid cookie) not found in auth state');
      }
      
      return sidCookie.value;
    } catch (error) {
      throw new Error(`Failed to extract access token: ${error}`);
    }
  }

  /**
   * SOQLクエリを実行
   * @param soql - SOQLクエリ文字列
   * @returns クエリ結果
   * 
   * @example
   * ```typescript
   * const result = await api.query('SELECT Id, Name FROM Account LIMIT 10');
   * console.log(result.records);
   * ```
   */
  async query(soql: string): Promise<any> {
    const url = `${this.baseURL}/services/data/${this.apiVersion}/query`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        // URLパラメータとしてSOQLを送信
      });

      // 実際のリクエストURL構築
      const queryUrl = `${url}?q=${encodeURIComponent(soql)}`;
      const actualResponse = await fetch(queryUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!actualResponse.ok) {
        const errorText = await actualResponse.text();
        throw new Error(`SOQL query failed (${actualResponse.status}): ${errorText}`);
      }

      return await actualResponse.json();
    } catch (error) {
      throw new Error(`Failed to execute SOQL query: ${error}`);
    }
  }

  /**
   * レコードを作成
   * @param objectType - オブジェクト種別（例: 'Account', 'Contact'）
   * @param data - レコードデータ
   * @returns 作成されたレコードのID
   * 
   * @example
   * ```typescript
   * const result = await api.createRecord('Account', {
   *   Name: 'Test Account',
   *   Industry: 'Technology'
   * });
   * console.log(result.id); // 新しく作成されたレコードのID
   * ```
   */
  async createRecord(objectType: string, data: any): Promise<{ id: string; success: boolean; errors: any[] }> {
    const url = `${this.baseURL}/services/data/${this.apiVersion}/sobjects/${objectType}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Record creation failed (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create ${objectType} record: ${error}`);
    }
  }

  /**
   * レコードを更新
   * @param objectType - オブジェクト種別
   * @param recordId - レコードID
   * @param data - 更新データ
   * 
   * @example
   * ```typescript
   * await api.updateRecord('Account', '001xx000003DGb2AAG', {
   *   Phone: '03-1234-5678'
   * });
   * ```
   */
  async updateRecord(objectType: string, recordId: string, data: any): Promise<void> {
    const url = `${this.baseURL}/services/data/${this.apiVersion}/sobjects/${objectType}/${recordId}`;

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Record update failed (${response.status}): ${errorText}`);
      }
    } catch (error) {
      throw new Error(`Failed to update ${objectType} record: ${error}`);
    }
  }

  /**
   * レコードを取得
   * @param objectType - オブジェクト種別
   * @param recordId - レコードID
   * @param fields - 取得するフィールドのリスト（オプション）
   * @returns レコードデータ
   * 
   * @example
   * ```typescript
   * const account = await api.getRecord('Account', '001xx000003DGb2AAG', ['Id', 'Name', 'Phone']);
   * console.log(account.Name);
   * ```
   */
  async getRecord(objectType: string, recordId: string, fields?: string[]): Promise<any> {
    let url = `${this.baseURL}/services/data/${this.apiVersion}/sobjects/${objectType}/${recordId}`;
    
    if (fields && fields.length > 0) {
      url += `?fields=${fields.join(',')}`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get record (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get ${objectType} record: ${error}`);
    }
  }

  /**
   * レコードを削除
   * @param objectType - オブジェクト種別
   * @param recordId - レコードID
   * 
   * @example
   * ```typescript
   * await api.deleteRecord('Account', '001xx000003DGb2AAG');
   * ```
   */
  async deleteRecord(objectType: string, recordId: string): Promise<void> {
    const url = `${this.baseURL}/services/data/${this.apiVersion}/sobjects/${objectType}/${recordId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      // 204 No Content または 404 Not Found は成功とみなす
      if (!response.ok && response.status !== 404) {
        const errorText = await response.text();
        throw new Error(`Record deletion failed (${response.status}): ${errorText}`);
      }
    } catch (error) {
      // 404エラーは無視（すでに削除済み）
      if (error instanceof Error && error.message.includes('404')) {
        console.log(`Record ${objectType}:${recordId} already deleted or not found`);
        return;
      }
      throw new Error(`Failed to delete ${objectType} record: ${error}`);
    }
  }

  /**
   * 複数レコードを一括削除
   * @param objectType - オブジェクト種別
   * @param recordIds - レコードIDのリスト
   * 
   * @example
   * ```typescript
   * await api.deleteRecords('Account', ['001...', '001...', '001...']);
   * ```
   */
  async deleteRecords(objectType: string, recordIds: string[]): Promise<void> {
    const deletePromises = recordIds.map(id => this.deleteRecord(objectType, id));
    await Promise.all(deletePromises);
  }

  /**
   * レコード数をカウント
   * @param objectType - オブジェクト種別
   * @param whereClause - WHERE句（オプション）
   * @returns レコード数
   * 
   * @example
   * ```typescript
   * const count = await api.countRecords('Account', "Industry = 'Technology'");
   * console.log(`Technology accounts: ${count}`);
   * ```
   */
  async countRecords(objectType: string, whereClause?: string): Promise<number> {
    let soql = `SELECT COUNT() FROM ${objectType}`;
    if (whereClause) {
      soql += ` WHERE ${whereClause}`;
    }

    const result = await this.query(soql);
    return result.totalSize;
  }
}
