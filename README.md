# Salesforce AI Cli
Salesforce CLI (sfコマンド) を使用してソースコードの管理およびデプロイを行います。

## 📦 前提条件 (Prerequisites)

開発を始める前に、以下のツールをインストールしてください。

* [VS Code](https://code.visualstudio.com/)
* [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli)
* [Salesforce Extension Pack (VS Code Extension)](https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode)
* [Git](https://git-scm.com/)

## 🚀 セットアップ手順 (Getting Started)

### 1. リポジトリのクローン
```bash
git clone [このリポジトリのURL]
cd [フォルダ名]
```
### 2. Salesforce組織への接続
開発対象の組織（SandboxまたはDev Org）へログインします。
```Bash
# Webログイン画面が開きます
sf org login web --alias [任意の組織名] --set-default --instance-url [https://test.salesforce.com](https://test.salesforce.com)

# 本番環境/Dev環境の場合は [https://login.salesforce.com](https://login.salesforce.com)
```
### 3. 接続確認
正しく接続され、デフォルト組織に設定されているか確認します。
```bash
sf org list
```
#### 🛠️ 主要コマンド (Common Commands)
メタデータの取得 (Retrieve)
組織の最新状態をローカルに取り込みます。
```bash
# manifest/package.xml に定義された内容を取得
sf project retrieve start --manifest manifest/package.xml
```
メタデータのデプロイ (Deploy)
ローカルの変更を組織に反映します。
```bash
# 特定のファイルをデプロイする場合（推奨）
sf project deploy start --source-dir force-app/main/default/classes/MyClass.cls

# manifestの内容を一括デプロイ（注意して実行）
sf project deploy start --manifest manifest/package.xml
```

#### 📂 ディレクトリ構造
- force-app/ : Salesforceのソースコード（Apex, LWC, Objectsなど）
- manifest/ : 取得・デプロイ対象を定義する package.xml
- scripts/ : データロードや匿名Apex実行用のスクリプト
- sfdx-project.json : プロジェクト定義ファイル

📚 ドキュメント
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)