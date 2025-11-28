# Phase 1 実装ガイド

## 📋 概要

Phase 1では以下の3つのタスクを実装します：
1. Apexテスト自動実行（CI/CD統合）✅ 完了
2. sfdx-hardis 導入・動作確認 🔄 進行中
3. デプロイ検証の有効化

---

## ✅ 1.1 Apexテスト自動実行（完了）

### 実装内容
[`.github/workflows/pr-validation.yml`](file:///Users/takashin/code/sf-ai-cli-practice/.github/workflows/pr-validation.yml) に Apex テスト実行ステップを追加しました。

### 変更点
- **新規ステップ**: `Run Apex Tests`
- **実行条件**: `changed-sources/package/package.xml` が存在する場合のみ
- **テストレベル**: `RunLocalTests`（組織内の全テスト実行）
- **コードカバレッジ**: 有効
- **タイムアウト**: 10分

### 注意事項
> [!IMPORTANT]
> 現在はコメントアウト状態です。Salesforce組織の認証設定完了後に有効化してください。

```yaml
# 有効化する際は以下のコメントを外す
sf apex run test --test-level RunLocalTests \
  --result-format human \
  --code-coverage \
  --wait 10
```

---

## 🔄 1.2 sfdx-hardis 導入・動作確認（進行中）

### セットアップスクリプト作成

[`scripts/setup-sfdx-hardis.sh`](file:///Users/takashin/code/sf-ai-cli-practice/scripts/setup-sfdx-hardis.sh) を作成しました。

### 実行方法

```bash
# スクリプトを実行
./scripts/setup-sfdx-hardis.sh
```

### スクリプトの処理内容

1. **Salesforce CLI確認** - `sf` コマンドの存在確認
2. **sfdx-hardis インストール** - メインプラグインのインストール
3. **依存プラグイン インストール**:
   - `@salesforce/plugin-packaging`
   - `sfdmu`
4. **動作確認** - 主要コマンドのヘルプ表示

### 次のステップ

スクリプト実行後、以下を手動で実施してください：

#### 1. Salesforce組織への接続

```bash
# Developer Edition / Sandboxの場合
sf org login web --alias dev-org --set-default --instance-url https://test.salesforce.com

# 本番 / Developer Editionの場合
sf org login web --alias dev-org --set-default --instance-url https://login.salesforce.com
```

#### 2. 接続確認

```bash
# 組織一覧表示
sf org list

# sfdx-hardisで組織選択
sf hardis:org:select
```

#### 3. 基本コマンド動作確認

```bash
# Apexテスト実行
sf hardis:org:test:apex --target-org dev-org

# 未使用メタデータ検出
sf hardis:lint:unusedmetadatas

# プロジェクトドキュメント生成
sf hardis:doc:project2markdown --output-dir docs/
```

---

## ⏳ 1.3 デプロイ検証の有効化（未実施）

### 実装内容（予定）

[`.github/workflows/pr-validation.yml`](file:///Users/takashin/code/sf-ai-cli-practice/.github/workflows/pr-validation.yml) の以下の部分を有効化：

```yaml
# 現在（コメントアウト状態）
# sf project deploy start -x changed-sources/package/package.xml --dry-run

# 有効化後
sf project deploy start -x changed-sources/package/package.xml --dry-run
```

### 前提条件

デプロイ検証を有効化するには、以下が必要です：

1. **GitHub Secrets設定**
   - Salesforce組織の認証情報
   - または JWT認証設定

2. **推奨方法: JWT認証**

```bash
# 1. 秘密鍵・証明書の生成
openssl genrsa -out server.key 2048
openssl req -new -x509 -nodes -sha256 -days 365 -key server.key -out server.crt

# 2. Salesforce接続アプリの作成
# Setup > Apps > App Manager > New Connected App
# - Enable OAuth Settings: チェック
# - Use digital signatures: チェック（server.crtをアップロード）
# - Selected OAuth Scopes: api, refresh_token, offline_access

# 3. GitHub Secretsに追加
# - SF_CONSUMER_KEY: 接続アプリのConsumer Key
# - SF_USERNAME: Salesforce組織のユーザー名
# - SERVER_KEY: server.keyの内容（base64エンコード済み）
```

### GitHub Actions更新（JWT認証追加）

```yaml
- name: Authenticate to Salesforce
  run: |
    echo "${{ secrets.SERVER_KEY }}" | base64 --decode > server.key
    sf org login jwt \
      --client-id ${{ secrets.SF_CONSUMER_KEY }} \
      --jwt-key-file server.key \
      --username ${{ secrets.SF_USERNAME }} \
      --alias ci-org \
      --set-default
```

---

## 📊 進捗状況

| タスク | 状態 | 完了日 |
|--------|------|--------|
| 1.1 Apexテスト自動実行 | ✅ 完了 | 2025-11-28 |
| 1.2 sfdx-hardis導入 | 🔄 進行中 | - |
| 1.3 デプロイ検証有効化 | ⏳ 未実施 | - |

---

## 🎯 次のアクション

### 今すぐ実行可能

1. sfdx-hardisセットアップスクリプトの実行:
   ```bash
   ./scripts/setup-sfdx-hardis.sh
   ```

2. Salesforce組織への接続:
   ```bash
   sf org login web --alias dev-org --set-default
   ```

3. 基本コマンドの動作確認:
   ```bash
   sf hardis:org:test:apex --target-org dev-org
   ```

### 組織接続後に実施

1. JWT認証の設定（CI/CD用）
2. GitHub Secretsの登録
3. PR validation workflowの有効化

---

## ❓ トラブルシューティング

### Q: sfdx-hardisのインストールに失敗する

**A**: Salesforce CLIのバージョンを確認してください

```bash
# バージョン確認
sf version

# 最新版にアップデートat
npm install --global @salesforce/cli@latest
```

### Q: 組織接続でエラーが出る

**A**: ブラウザで直接ログインできるか確認してください

```bash
# 詳細ログ表示で再試行
sf org login web --alias dev-org --set-default --loglevel debug
```

### Q: Apexテストが実行できない

**A**: 組織にApexクラスが存在するか確認してください

```bash
# Apexクラス一覧表示
sf apex list class --target-org dev-org
```
