# Jujutsu ワークフロー

このプロジェクトでは、ローカル開発に **Jujutsu (jj)** を使用し、リモートリポジトリは **GitHub (Git)** を使用するハイブリッド運用を行っています。

## 📚 目次

- [なぜ Jujutsu を使うのか](#なぜjujutsuを使うのか)
- [初回セットアップ](#初回セットアップ)
- [基本ワークフロー](#基本ワークフロー)
- [複数変更の同時作業](#複数変更の同時作業)
- [GitHub との連携](#githubとの連携)
- [Claude Code との共存](#claude-codeとの共存)
- [よくある質問](#よくある質問)
- [チートシート](#チートシート)

## なぜ Jujutsu を使うのか

### 主な利点

1. **柔軟な履歴編集** - コミット後でも簡単に履歴を整理できる
2. **優れたコンフリクト解決** - 3-way マージで競合解決が容易
3. **複数変更の同時作業** - AI で複数のアプローチを試して比較・選択できる
4. **Working copy の自動コミット** - 作業内容が自動的に保存される
5. **Git 互換** - GitHub とシームレスに連携、.git ディレクトリを共有

### 運用方針

```
┌─────────────────────────────────────┐
│  ローカル開発: Jujutsu (jj)         │
│  ├─ 複数の変更を同時進行            │
│  ├─ 柔軟な履歴編集                  │
│  └─ 実験的アプローチの比較          │
└─────────────────────────────────────┘
            ↓ jj git push
┌─────────────────────────────────────┐
│  リモート: GitHub (Git)              │
│  ├─ PR作成・レビュー                │
│  ├─ CI/CD実行                       │
│  └─ チーム共有                      │
└─────────────────────────────────────┘
```

## 初回セットアップ

### 1. Jujutsu のインストール確認

```bash
jj --version
# jj 0.35.0 が表示されればOK
```

### 2. ユーザー情報の設定

初回のみ、コミット作成者情報を設定します。

```bash
# 名前とメールアドレスを設定（Gitと同じものを推奨）
jj config set --user user.name "Your Name"
jj config set --user user.email "your.email@example.com"
```

### 3. ブックマーク設定の確認

既に設定済みですが、確認方法:

```bash
# トラッキング中のブックマークを表示
jj bookmark list
```

## 基本ワークフロー

### 現在の状態を確認

```bash
# Jujutsuの状態を表示
jj status

# 変更履歴を表示（グラフ形式）
jj log
```

### 新しい変更を開始

```bash
# 新しい変更を作成（現在の変更の上に積む）
jj new -m "feat: 新機能の実装"

# または、特定のリビジョンから開始
jj new @- -m "別アプローチの試行"
```

### 変更の記述を更新

```bash
# 現在の変更の説明を編集
jj describe

# または、直接指定
jj describe -m "feat: ユーザー認証機能を追加"
```

### 変更の確認とコミット

```bash
# 変更内容を確認
jj diff

# Jujutsuは自動的にworking copyをコミット
# 明示的に次の変更を作成する場合
jj commit -m "機能実装完了"
```

## 複数変更の同時作業

Jujutsu の真価を発揮する使い方です。AI ツール（Claude Code など）で複数のアプローチを試す際に便利です。

### パターン 1: 並列で複数のアプローチを試す

```bash
# ベースとなるリビジョンを確認
jj log

# アプローチA
jj new @- -m "approach-A: Redis caching"
# ... Claude Codeで実装 ...

# アプローチB（同じベースから）
jj new @- -m "approach-B: In-memory caching"
# ... Claude Codeで実装 ...

# 両方を比較
jj log
jj diff -r <revision-A>
jj diff -r <revision-B>

# 良い方を選択、不要な方を破棄
jj abandon <不要なrevision>
```

### パターン 2: 順次試して、良いものを残す

```bash
# アプローチA
jj new -m "試行1: 方法A"
# ... 実装 ...

# Aの結果を見て、別の方法を試す
jj new -m "試行2: 方法B（Aを改良）"
# ... 実装 ...

# 最終的に選択した変更だけを残す
jj squash  # 前の変更に統合
```

### 変更の整理

```bash
# 複数の変更を1つにまとめる
jj squash -r <revision> --into <target-revision>

# 変更の一部を別のコミットに吸収
jj absorb

# 不要な変更を削除
jj abandon <revision>
```

## GitHub との連携

### GitHub から最新を取得

```bash
# リモートから最新を取得
jj git fetch

# mainブランチを更新
jj rebase -d main
```

### GitHub へプッシュ

```bash
# ブランチを作成してプッシュ
jj git push --branch feature-branch

# または、既存のGitブランチにプッシュ
jj git push --bookmark main
```

### プルリクエストの作成

```bash
# 1. 変更をGitHubにプッシュ
jj git push --branch feature/new-feature

# 2. GitHub CLIを使用（推奨）
gh pr create --title "新機能: ○○" --body "詳細な説明"

# または、GitHub UIで作成
# https://github.com/your-repo/compare/feature/new-feature
```

## Claude Code との共存

Claude Code は Git コマンドを使用しますが、Jujutsu と Git は`.git`ディレクトリを共有するため問題なく共存できます。

### 推奨運用パターン

#### パターン A: Jujutsu 優先

```bash
# 日常の開発
jj new -m "feat: 新機能"
# ... Claude Codeで実装 ...

# コミット・PR作成時
jj git push --branch feature-branch

# GitHubでPR作成
gh pr create
```

#### パターン B: ハイブリッド

```bash
# 実験的開発: Jujutsu
jj new -m "試行: アプローチA"
# ... 実装・比較 ...

# 確定後: Claude Codeに任せる
# Claude CodeはGitコマンドでコミット・プッシュ・PR作成
```

### 注意点

1. **Git コマンドの影響**

   - Claude Code が Git コマンドを実行しても、Jujutsu は自動的に同期
   - `jj git import` で手動同期も可能

2. **コミットメッセージ**

   - Jujutsu で作成した変更も、Git 履歴として扱える
   - PR を作成する前に履歴を整理することを推奨

3. **ブランチの扱い**
   - Jujutsu は「bookmark」、Git は「branch」
   - 両者は同期されるため、どちらで作成しても問題なし

## よくある質問

### Q: Git コマンドを使ってもいいですか？

A: はい、問題ありません。Jujutsu と Git は共存できます。`jj git import`で変更を同期できます。

### Q: コンフリクトが発生したらどうすればいいですか？

```bash
# Jujutsuのコンフリクト解決
jj status  # コンフリクトファイルを確認
# ファイルを編集して解決
jj resolve --list  # 解決状況を確認
jj resolve --mark <file>  # 解決完了をマーク
```

### Q: 間違って変更を破棄してしまいました

```bash
# 操作履歴を表示
jj op log

# 以前の状態に戻す
jj op restore <operation-id>
```

### Q: Git の履歴と Jujutsu の履歴は違いますか？

A: 同じです。Jujutsu は`.git`を使用するため、最終的に GitHub にプッシュされる履歴は通常の Git 履歴と同一です。

### Q: CI/CD はどうすればいいですか？

A: CI/CD は引き続き Git コマンドを使用できます。Jujutsu は`.git`を維持するため、GitHub Actions などは変更不要です。

## チートシート

### 頻繁に使うコマンド

| コマンド                      | 説明                     |
| ----------------------------- | ------------------------ |
| `jj status`                   | 現在の状態を表示         |
| `jj log`                      | 変更履歴を表示           |
| `jj diff`                     | 変更内容を表示           |
| `jj new -m "message"`         | 新しい変更を作成         |
| `jj describe`                 | 変更の説明を編集         |
| `jj commit`                   | 現在の変更を確定         |
| `jj squash`                   | 変更を前のコミットに統合 |
| `jj abandon <rev>`            | 変更を破棄               |
| `jj git fetch`                | リモートから取得         |
| `jj git push --branch <name>` | ブランチにプッシュ       |
| `jj op log`                   | 操作履歴を表示           |
| `jj op restore <id>`          | 操作を取り消し           |

### Git vs Jujutsu コマンド対応表

| Git                | Jujutsu                     |
| ------------------ | --------------------------- |
| `git status`       | `jj status`                 |
| `git log`          | `jj log`                    |
| `git diff`         | `jj diff`                   |
| `git add`          | (不要、自動追跡)            |
| `git commit`       | `jj commit` または `jj new` |
| `git branch`       | `jj bookmark`               |
| `git checkout`     | `jj new <rev>`              |
| `git merge`        | `jj merge`                  |
| `git rebase`       | `jj rebase`                 |
| `git fetch`        | `jj git fetch`              |
| `git push`         | `jj git push`               |
| `git reset --hard` | `jj restore`                |

## リソース

- [Jujutsu 公式ドキュメント](https://martinvonz.github.io/jj/)
- [Jujutsu GitHub リポジトリ](https://github.com/martinvonz/jj)
- [Jujutsu チュートリアル](https://martinvonz.github.io/jj/latest/tutorial/)
