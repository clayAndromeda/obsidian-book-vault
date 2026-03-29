# Book Vault

Obsidianで読書メモを素早く作成するプラグイン。書名またはISBNから書籍情報を自動取得し、テンプレートに従ったmarkdownファイルを生成します。

## 機能

- 書名またはISBNで書籍を検索（Google Books API）
- 書籍情報（タイトル、著者、出版社、ISBN、サムネイル等）を自動取得
- カスタマイズ可能なテンプレートで読書ノートを生成
- サムネイル画像の自動ダウンロード

## インストール方法

### BRAT を使う方法（推奨）

[BRAT (Beta Reviewer's Auto-update Tester)](https://github.com/TfTHacker/obsidian42-brat) を使うと、GitHubリポジトリから直接プラグインをインストール・自動更新できます。

1. Obsidianの「設定 > コミュニティプラグイン」から **BRAT** をインストールして有効化
2. `Ctrl/Cmd + P` でコマンドパレットを開く
3. `BRAT: Add a beta plugin for testing` を選択
4. 以下のリポジトリURLを入力:
   ```
   clayAndromeda/obsidian-book-vault
   ```
5. 「Add Plugin」をクリック
6. 「設定 > コミュニティプラグイン」で **Book Vault** を有効化

BRATがインストールされていれば、プラグインの更新も自動で検知されます。

### 手動インストール

1. [Releases](https://github.com/clayAndromeda/obsidian-book-vault/releases/latest) ページから以下のファイルをダウンロード:
   - `main.js`
   - `manifest.json`
   - `styles.css`
2. Vaultの `.obsidian/plugins/obsidian-book-vault/` フォルダを作成
3. ダウンロードした3ファイルをそのフォルダにコピー
4. Obsidianを再起動（またはリロード）
5. 「設定 > コミュニティプラグイン」で **Book Vault** を有効化

## 使い方

1. コマンドパレット (`Ctrl/Cmd + P`) を開く
2. `Book Vault: 読書ノートを作成` を選択
3. 書名またはISBNを入力して検索
4. 検索結果から書籍を選択
5. 読書ノートが自動生成される

## 設定

「設定 > Book Vault」から以下を設定できます:

- **ノート保存先フォルダ** — 生成されるノートの保存先
- **サムネイル保存先フォルダ** — 書影画像の保存先
- **ノートテンプレート** — ノートの内容テンプレート（プレースホルダーで書籍情報を埋め込み）

## リリース手順（開発者向け）

```bash
# バージョンを更新
npm version patch  # or minor, major

# タグをpushするとGitHub Actionsが自動でリリースを作成
git push --follow-tags
```

## ライセンス

MIT
