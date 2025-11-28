#!/bin/bash
# JWT認証用の秘密鍵・証明書生成スクリプト
# GitHub Actions から Salesforce に自動接続するために使用

set -e  # エラー時に停止

echo "========================================="
echo "JWT認証用 秘密鍵・証明書 生成"
echo "========================================="

# 証明書保存ディレクトリ作成
CERT_DIR="./certificates"
mkdir -p "$CERT_DIR"

echo -e "\n[1/4] 秘密鍵を生成中..."
openssl genrsa -out "$CERT_DIR/server.key" 2048
echo "✅ 秘密鍵を生成しました: $CERT_DIR/server.key"

echo -e "\n[2/4] 証明書を生成中..."
openssl req -new -x509 -nodes -sha256 -days 365 \
  -key "$CERT_DIR/server.key" \
  -out "$CERT_DIR/server.crt" \
  -subj "/C=JP/ST=Tokyo/L=Tokyo/O=SalesforceAI/OU=Development/CN=github-actions"
echo "✅ 証明書を生成しました: $CERT_DIR/server.crt"

echo -e "\n[3/4] GitHub Secrets用にbase64エンコード中..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOSの場合
  base64 -i "$CERT_DIR/server.key" -o "$CERT_DIR/server.key.base64"
else
  # Linuxの場合
  base64 -w 0 "$CERT_DIR/server.key" > "$CERT_DIR/server.key.base64"
fi
echo "✅ base64エンコード完了: $CERT_DIR/server.key.base64"

echo -e "\n[4/4] 証明書情報を表示..."
openssl x509 -in "$CERT_DIR/server.crt" -text -noout | head -n 20

echo -e "\n========================================="
echo "✅ 証明書生成完了！"
echo "========================================="

echo -e "\n📋 生成されたファイル:"
echo "  • $CERT_DIR/server.key         - 秘密鍵（厳重に管理）"
echo "  • $CERT_DIR/server.crt         - 公開鍵証明書"
echo "  • $CERT_DIR/server.key.base64  - GitHub Secrets用（base64）"

echo -e "\n⚠️  重要な注意事項:"
echo "  • server.key は絶対にGitにコミットしないでください"
echo "  • .gitignore に certificates/ が追加されているか確認してください"

echo -e "\n📝 次のステップ:"
echo "  1. certificates/ ディレクトリが .gitignore に追加されているか確認"
echo "  2. Salesforce組織で接続アプリを作成"
echo "  3. GitHub Secretsに以下の値を登録:"
echo "     - SF_CONSUMER_KEY: 接続アプリのConsumer Key"
echo "     - SF_USERNAME: Salesforceユーザー名"
echo "     - SERVER_KEY: server.key.base64 の内容"
echo ""
