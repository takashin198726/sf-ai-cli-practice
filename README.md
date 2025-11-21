# Salesforce AI CLI Practice

Salesforce開発における **モダンなCI/CDパイプライン** と **AI活用** を実践するためのリポジトリです。
Salesforce CLI (sfコマンド) を使用した基本的なソースコード管理に加え、ガバナンス、品質担保、テスト効率化、そしてAIレビューを統合した高度な開発環境を提供します。

## 🚀 Tech Stack

このプロジェクトには、以下のツール・ライブラリが導入されています。

| Category       | Tool                   | Description                                                                              |
| :------------- | :--------------------- | :--------------------------------------------------------------------------------------- |
| **AI Review**  | **CodeRabbit**         | 日本語によるAIコードレビュー。Salesforceのベストプラクティスとセキュリティを監視します。 |
| **Linter**     | **SF Code Analyzer**   | PMD / ESLint / RetireJS を統合した静的解析ツール。GitHub Actionsで自動実行されます。     |
| **Formatter**  | **Prettier**           | コードスタイルの自動整形。`lint-staged` によりコミット時に強制適用されます。             |
| **Testing**    | **ApexBluePrint**      | テストデータ生成ライブラリ（Data Factory）。複雑な関連データを1行で作成可能です。        |
| **CI/CD**      | **sfdx-git-delta**     | 差分デプロイメントツール。変更されたメタデータのみを抽出してデプロイ・テストします。     |
| **Governance** | **Husky / Commitlint** | Gitフックとコミットメッセージの規約（Conventional Commits）を強制します。                |

## 📦 前提条件 (Prerequisites)

開発を始める前に、以下のツールをインストールしてください。

- [VS Code](https://code.visualstudio.com/)
- [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli)
- [Salesforce Extension Pack (VS Code Extension)](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode)
- [Git](https://git-scm.com/)
- **Node.js (v18 or later)** - 開発用ライブラリの実行に必要
- **Java (v11 or later)** - Prettier (Apexパーサー) の高速化に必要

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

### 2. Salesforce組織への接続

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

VS Codeの設定により、保存時に自動整形されます。手動実行も可能です。

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
// 例: 取引先と関連する商談を同時に作成
SBluePrint.create(new Account(Name='Test Acc'), new Opportunity(Name='Test Opp'));
```

## 🤖 CI/CD Pipelines (GitHub Actions)

プルリクエスト作成時に以下のワークフローが自動実行されます。

- **Salesforce Code Analyzer**: force-app 配下の変更に対し、セキュリティと品質ルールをスキャンします。
- **Validate Delta**: sfdx-git-delta を使用し、変更されたコンポーネントのみを抽出して検証デプロイを行います。

## 📂 ディレクトリ構造

- **force-app/** : Salesforceのメインソースコード（Apex, LWC, Objectsなど）
- **manifest/** : 取得・デプロイ対象を定義する package.xml
- **scripts/** : データロードや匿名Apex実行用のスクリプト
- **submodules/** : 外部ライブラリ（ApexBluePrintなど）
- **.husky/** : Gitフックの設定ファイル
- **.github/** : GitHub Actions ワークフロー定義
- **sfdx-project.json** : プロジェクト定義ファイル

## 📚 ドキュメント

- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [ApexBluePrint Repository](https://github.com/ntotten/ApexBluePrint)
