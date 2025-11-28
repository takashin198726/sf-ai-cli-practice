#!/bin/bash
# sfdx-hardis セットアップスクリプト
# Phase 1.2: sfdx-hardis 導入・動作確認

set -e  # エラー時に停止

echo "========================================="
echo "sfdx-hardis セットアップ開始"
echo "========================================="

# Salesforce CLIのバージョン確認
echo -e "\n[1/5] Salesforce CLIバージョン確認..."
if ! command -v sf &> /dev/null; then
    echo "❌ Salesforce CLIがインストールされていません"
    echo "   インストールしてください: npm install --global @salesforce/cli"
    exit 1
fi
sf version
echo "✅ Salesforce CLI確認完了"

# sfdx-hardis プラグインのインストール
echo -e "\n[2/5] sfdx-hardis プラグインをインストール中..."
if sf plugins | grep -q "sfdx-hardis"; then
    echo "⚠️  sfdx-hardisは既にインストールされています"
    echo "   アップデートを確認中..."
    sf plugins update
else
    echo "y" | sf plugins install sfdx-hardis
fi
echo "✅ sfdx-hardis インストール完了"

# 依存プラグインのインストール
echo -e "\n[3/5] 依存プラグインをインストール中..."

# @salesforce/plugin-packaging
if sf plugins | grep -q "@salesforce/plugin-packaging"; then
    echo "✅ @salesforce/plugin-packaging は既にインストールされています"
else
    echo "   @salesforce/plugin-packaging をインストール中..."
    echo "y" | sf plugins install @salesforce/plugin-packaging
fi

# sfdmu
if sf plugins | grep -q "sfdmu"; then
    echo "✅ sfdmu は既にインストールされています"
else
    echo "   sfdmu をインストール中..."
    echo "y" | sf plugins install sfdmu
fi

echo "✅ 依存プラグ インストール完了"

# インストール済みプラグイン一覧表示
echo -e "\n[4/5] インストール済みプラグイン一覧:"
sf plugins

# 基本コマンドの動作確認
echo -e "\n[5/5] 基本コマンドの動作確認..."

echo "  • hardis:org:test:apex のヘルプ表示:"
sf hardis:org:test:apex --help | head -n 10

echo -e "\n  • hardis:lint:unusedmetadatas のヘルプ表示:"
sf hardis:lint:unusedmetadatas --help | head -n 10

echo -e "\n  • hardis:doc:project2markdown のヘルプ表示:"
sf hardis:doc:project2markdown --help | head -n 10

echo -e "\n========================================="
echo "✅ sfdx-hardis セットアップ完了！"
echo "========================================="
echo ""
echo "次のステップ:"
echo "1. Salesforce組織に接続してください:"
echo "   sf org login web --alias dev-org --set-default"
echo ""
echo "2. 接続を確認してください:"
echo "   sf hardis:org:select"
echo ""
echo "3. テスト実行を試してください:"
echo "   sf hardis:org:test:apex --target-org dev-org"
echo ""
