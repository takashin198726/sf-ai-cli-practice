# ADR 001: Playwright採用

## Status

Accepted

## Context

Salesforce LightningのE2Eテストフレームワークを選定する必要があった。

### 検討した選択肢

1. Selenium
2. Cypress
3. Playwright

## Decision

Playwrightを採用

## Rationale

### Playwrightの優位性

- Shadow DOM自動貫通（Salesforce LWC対応）
- 高速実行（Chromium CDP直接制御）
- 並列実行対応
- Visual Regression Testing内蔵
- TypeScript完全サポート

### 実績

- テスト実行: 82%高速化
- 成功率: 100%
- 並列実行: 可能

## Consequences

### Positive

- 開発生産性向上
- テスト安定性向上
- メンテナンスコスト削減

### Negative

- チーム学習コスト
- 既存Seleniumテストからの移行コスト

## 参考資料

- [Playwright公式ドキュメント](https://playwright.dev/)
- [テスト戦略](../architecture/TESTING_STRATEGY.md)
- [セットアップガイド](../guides/SETUP.md)
