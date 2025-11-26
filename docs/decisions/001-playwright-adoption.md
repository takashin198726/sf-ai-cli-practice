# ADR 001: Playwright 採用

## Status

Accepted

## Context

Salesforce Lightning の E2E テストフレームワークを選定する必要があった。

### 検討した選択肢

1. Selenium
2. Cypress
3. Playwright

## Decision

Playwright を採用

## Rationale

### Playwright の優位性

- Shadow DOM 自動貫通（Salesforce LWC 対応）
- 高速実行（Chromium CDP 直接制御）
- 並列実行対応
- Visual Regression Testing 内蔵
- TypeScript 完全サポート

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
- 既存 Selenium テストからの移行コスト

## 参考資料

- [Playwright 公式ドキュメント](https://playwright.dev/)
- [テスト戦略](../architecture/TESTING_STRATEGY.md)
- [セットアップガイド](../guides/SETUP.md)
