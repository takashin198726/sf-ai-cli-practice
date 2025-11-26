# テスト戦略

## テストピラミッド

```
        /\
       /  \     E2E Tests (Playwright)
      /----\    - Smoke: 2-3分
     /      \   - Critical: 5分
    /--------\  Integration Tests
   /          \ - API Tests (82%高速化達成)
  /------------\ Unit Tests (Apex)
                - ApexBluePrint使用
```

## テストレイヤー

### 1. Unit Tests (Apex)

- **ツール**: ApexBluePrint
- **カバレッジ目標**: 75%以上
- **実行頻度**: 毎コミット
- **実行時間**: 1-2 分

### 2. Integration Tests

- **ツール**: Playwright API
- **対象**: REST API, SOQL
- **実行頻度**: 毎プッシュ
- **実行時間**: 3-5 分

### 3. E2E Tests

- **ツール**: Playwright
- **対象**: UI 操作
- **実行頻度**: PR 作成時
- **実行時間**: 10-15 分

## 現在の実績

| 指標           | Before  | After  | 改善率  |
| -------------- | ------- | ------ | ------- |
| テスト実行時間 | 52.3 秒 | 9.4 秒 | 82%短縮 |
| 成功率         | 56%     | 100%   | 完全    |
| 並列実行       | 不可    | 可能   | -       |

## データ管理戦略

### テストデータ分離

```typescript
// ユニークデータ生成
const account = await testData.createTestAccount(`Test_${Date.now()}`);

// 自動クリーンアップ
test.afterAll(async () => {
  await testData.cleanup();
});
```

### API 優先アプローチ

1. セットアップ: API（1-2 秒）
2. テスト実行: UI or API
3. 検証: API（0.5 秒）
4. クリーンアップ: 自動
