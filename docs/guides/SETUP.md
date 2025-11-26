# セットアップガイド

## 前提条件

- Node.js 20.x 以上
- Salesforce CLI
- Git

## インストール手順

### 1. リポジトリクローン

```bash
git clone https://github.com/takashin198726/sf-ai-cli-practice.git
cd sf-ai-cli-practice
```

### 2. 依存関係インストール

```bash
npm install
npx playwright install chromium
```

### 3. Salesforce 組織認証

```bash
sf org login web --set-default --alias my-org
```

### 4. 環境変数設定

```bash
cp .env.example .env

# .envを編集
SF_BASE_URL=https://your-org.my.salesforce.com
```

### 5. 動作確認

```bash
# Apexテスト
npm run test:apex

# Playwrightスモークテスト
npm run test:smoke
```

## 開発環境構成

### VSCode 拡張機能

推奨拡張機能は`.vscode/extensions.json`に定義されています：

- Salesforce Extension Pack
- Playwright Test for VSCode
- Prettier
- ESLint

### Git Hooks

Husky による自動実行：

- Pre-commit: Prettier + lint-staged
- Pre-push: Playwright クリティカルテスト
- Commit-msg: Commitlint

## トラブルシューティング

### Playwright 認証エラー

```bash
# 認証を再実行
npx playwright test playwright/tests/auth.setup.ts
```

### Salesforce CLI 接続エラー

```bash
# 組織情報を確認
sf org display --verbose

# 再認証
sf org login web --set-default
```
