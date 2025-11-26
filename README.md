# Salesforce AI CLI Practice

Salesforce 開発における **モダンな CI/CD パイプライン** と **AI 活用** を実践するためのリポジトリです。
Salesforce CLI (sf コマンド) を使用した基本的なソースコード管理に加え、ガバナンス、品質担保、テスト効率化、そして AI レビューを統合した高度な開発環境を提供します。

## 🚀 Tech Stack

このプロジェクトには、以下のツール・ライブラリが導入されています。

| Category            | Tool                   | Description                                                                                 |
| :------------------ | :--------------------- | :------------------------------------------------------------------------------------------ |
| **Version Control** | **Jujutsu (jj)**       | ローカル開発用の次世代バージョン管理ツール。Git と共存し、柔軟な履歴編集が可能。            |
| **AI Review**       | **CodeRabbit**         | 日本語による AI コードレビュー。Salesforce のベストプラクティスとセキュリティを監視します。 |
| **Linter**          | **SF Code Analyzer**   | PMD / ESLint / RetireJS を統合した静的解析ツール。GitHub Actions で自動実行されます。       |
| **Formatter**       | **Prettier**           | コードスタイルの自動整形。`lint-staged` によりコミット時に強制適用されます。                |
| **Testing**         | **ApexBluePrint**      | テストデータ生成ライブラリ（Data Factory）。複雑な関連データを 1 行で作成可能です。         |
| **CI/CD**           | **sfdx-git-delta**     | 差分デプロイメントツール。変更されたメタデータのみを抽出してデプロイ・テストします。        |
| **Governance**      | **Husky / Commitlint** | Git フックとコミットメッセージの規約（Conventional Commits）を強制します。                  |

## 📦 前提条件 (Prerequisites)

開発を始める前に、以下のツールをインストールしてください。

- [VS Code](https://code.visualstudio.com/)
- [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli)
- [Salesforce Extension Pack (VS Code Extension)](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode)
- [Git](https://git-scm.com/)
- [Jujutsu (jj)](https://martinvonz.github.io/jj/) - **推奨** ローカル開発用バージョン管理ツール
- **Node.js (v18 or later)** - 開発用ライブラリの実行に必要
- **Java (v11 or later)** - Prettier (Apex パーサー) の高速化に必要

## 🚀 セットアップ手順 (Getting Started)

### 1. リポジトリのクローンと依存関係のインストール

```bash
# リポジトリの取得
git clone [このリポジトリのURL]
cd sf-ai-cli-practice

# npmパッケージのインストール (Prettier, Husky等)
npm install

# サブモジュール (ApexBluePrint) の初期化
git submodule init
git submodule update
```

### 2. Salesforce 組織への接続

開発対象の組織（Sandbox, Dev Org, または Dev Hub）へログインします。

```bash
# Webログイン画面が開きます（エイリアスは任意）
sf org login web --alias dev-org --set-default --instance-url https://test.salesforce.com

# Developer Edition / Playground の場合は https://login.salesforce.com
```

### 3. 接続確認

正しく接続され、デフォルト組織に設定されているか確認します。

```bash
sf org list
```

## 💻 日々の開発フロー (Daily Development)

### フォーマットと静的解析

VS Code の設定により、保存時に自動整形されます。手動実行も可能です。

```bash
# Prettierの手動実行
npx prettier --write "force-app/**/*.{cls,html,js,css}"
```

### メタデータの取得 (Retrieve)

組織の最新状態をローカルに取り込みます。

```bash
# manifest/package.xml に定義された内容を取得
sf project retrieve start --manifest manifest/package.xml
```

### メタデータのデプロイ (Deploy)

ローカルの変更を組織に反映します。

```bash
# 特定のファイルをデプロイする場合（推奨）
sf project deploy start --source-dir force-app/main/default/classes/MyClass.cls

# manifestの内容を一括デプロイ
sf project deploy start --manifest manifest/package.xml
```

### テストデータの作成 (ApexBluePrint)

サブモジュール submodules/ApexBluePrint を活用し、テストコード内で簡潔にデータを作成します。

```java
// 例: 取引先と関連する商談を同時に作成 (SOrchestratorを使用)
SOrchestrator orchestrator = SOrchestrator.start()
    .add(
        SBluePrint.of(Account.class)
            .set("Name", "Test Acc")
            .withChildren(
                SBluePrint.of(Opportunity.class)
                    .set("Name", "Test Opp")
            )
    );
orchestrator.create();

```

## 🤖 CI/CD Pipelines (GitHub Actions)

プルリクエスト作成時に以下のワークフローが自動実行されます。

- **Salesforce Code Analyzer**: force-app 配下の変更に対し、セキュリティと品質ルールをスキャンします。
- **Validate Delta**: sfdx-git-delta を使用し、変更されたコンポーネントのみを抽出して検証デプロイを行います。

## 📂 ディレクトリ構造

- **force-app/** : Salesforce のメインソースコード（Apex, LWC, Objects など）
- **manifest/** : 取得・デプロイ対象を定義する package.xml
- **scripts/** : データロードや匿名 Apex 実行用のスクリプト
- **submodules/** : 外部ライブラリ（ApexBluePrint など）
- **.husky/** : Git フックの設定ファイル
- **.github/** : GitHub Actions ワークフロー定義
- **sfdx-project.json** : プロジェクト定義ファイル

## 📚 ドキュメント

- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [ApexBluePrint Repository](https://github.com/krile136/ApexBlueprint)

## E2E テスト

### セットアップ

```bash
npm install
npx playwright install chromium

# 環境変数設定
cp .env.example .env
# .envを編集してSF_BASE_URLを設定
```

### テスト実行

```bash
# スモークテスト（2-3分）
npm run test:smoke

# クリティカルテスト（1-2分）
npm run test:critical

# 開発モード（VRT除外、3-5分）
npm run test:dev

# Push前チェック（自動実行）
npm run test:pre-push

# 全テスト（10-15分）
npm run test:e2e
```

### アーキテクチャ

- **Page Object Model**: 保守性向上
- **API 統合**: 82%高速化達成
- **自動クリーンアップ**: ゴミデータゼロ
- **並列実行**: 3-5 倍高速

### パフォーマンス

| 指標     | Before  | After  | 改善率  |
| -------- | ------- | ------ | ------- |
| 実行時間 | 52.3 秒 | 9.4 秒 | 82%短縮 |
| 成功率   | 56%     | 100%   | 完全    |

詳細は[テスト戦略ドキュメント](docs/architecture/TESTING_STRATEGY.md)を参照。

## ドキュメント

- [アーキテクチャ](docs/architecture/)
- [セットアップガイド](docs/guides/SETUP.md)
- [テスト戦略](docs/architecture/TESTING_STRATEGY.md)
- [Jujutsu ワークフロー](docs/jujutsu-workflow.md)
- [ADR](docs/decisions/)

## バージョン管理 (Version Control)

このプロジェクトでは、ローカル開発に **Jujutsu (jj)** を使用し、リモートリポジトリは **GitHub (Git)** を使用するハイブリッド運用を推奨しています。

### Jujutsu の利点

- **柔軟な履歴編集**: コミット後でも簡単に履歴を整理
- **複数変更の同時作業**: AI ツールで複数のアプローチを試して比較・選択
- **優れたコンフリクト解決**: 3-way マージで競合解決が容易
- **Git 完全互換**: GitHub とシームレスに連携

### 初回セットアップ (Jujutsu)

```bash
# Jujutsuのインストール (Homebrewの場合)
brew install jj

# ユーザー情報の設定
jj config set --user user.name "Your Name"
jj config set --user user.email "your.email@example.com"

# 既存のGitリポジトリと統合（既に設定済み）
# jj git init --colocate
```

### 基本的な使い方

```bash
# 状態確認
jj status

# 新しい変更を開始
jj new -m "feat: 新機能の実装"

# 変更履歴を表示
jj log

# GitHubへプッシュ
jj git push --branch feature-branch
```

詳細は[Jujutsu ワークフローガイド](docs/jujutsu-workflow.md)を参照してください。

**Note**: Jujutsu を使わない場合は、従来通り Git コマンドでの開発も可能です。

## 開発ワークフロー

### ブランチ戦略

```
main (本番)
├── develop (開発) ※現在未使用
├── feature/xxx (機能開発)
├── chore/xxx (雑務)
└── fix/xxx (バグ修正)
```

### コミット規約

Conventional Commits + Commitlint を使用：

```
feat: 新機能
fix: バグ修正
chore: 雑務
docs: ドキュメント
test: テスト
refactor: リファクタリング
```

### 品質ゲート

- Pre-commit: Prettier + ESLint
- Pre-push: Playwright クリティカルテスト
- PR: 全テスト + CodeRabbit レビュー
