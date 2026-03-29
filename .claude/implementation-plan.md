# 実装計画

## 技術スタック
- TypeScript + esbuild (Obsidian sample plugin準拠)
- Google Books API (認証不要、`requestUrl`でCORS回避)
- 2段階モーダル: 入力Modal → 結果SuggestModal (APIへの過剰リクエスト防止)
- テンプレート: `{{placeholder}}` regex置換 (ライブラリ不要)

## プロジェクト構造
```
obsidian-book-vault/
├── .gitignore
├── manifest.json            # Obsidianプラグインメタデータ
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
├── versions.json
├── styles.css               # モーダルUI用スタイル
└── src/
    ├── main.ts              # プラグインエントリーポイント
    ├── types.ts             # インターフェース定義 (BookInfo, Settings)
    ├── google-books-api.ts  # Google Books APIクライアント
    ├── book-search-modal.ts # 検索入力 + 結果選択モーダル
    ├── book-note-creator.ts # テンプレート描画 + ファイル生成
    └── settings-tab.ts      # 設定タブ
```

## 実装ステップと進捗

### Step 1: プロジェクトスキャフォールド — 途中
- [x] `.gitignore`, `manifest.json`, `package.json`, `tsconfig.json`, `esbuild.config.mjs`, `versions.json` 作成済
- [x] `src/` ディレクトリ作成済
- [ ] `npm install` 未実行

### Step 2: 型定義 + 設定基盤 — 完了
- [x] `src/types.ts` — BookInfo, BookVaultSettings, DEFAULT_SETTINGS, DEFAULT_NOTE_TEMPLATE
- [x] `src/settings-tab.ts` — BookVaultSettingTab (全設定項目+テンプレートリセット)
- [x] `src/main.ts` — 設定ロード+設定タブ登録+リボンアイコン+コマンド

### Step 3: Google Books APIクライアント — 完了
- [x] `src/google-books-api.ts`
- [x] ISBN自動判定、requestUrl使用、http→https変換、フィールド欠損時デフォルト値

### Step 4: 検索・選択モーダル — 完了
- [x] `src/book-search-modal.ts` — BookSearchModal(Modal) → BookSelectModal(SuggestModal)
- [x] `styles.css` — サムネイル+タイトル+著者のレイアウト

### Step 5: ノート生成 — 完了
- [x] `src/book-note-creator.ts`
- [x] {{placeholder}} regex置換、サムネイルDL、フォルダ自動作成、重複チェック

### Step 6: 仕上げ — 完了
- [x] リボンアイコン(`book-open`)追加
- [x] エッジケース: ネットワークエラー通知、フィールド欠損デフォルト値、重複ファイル名チェック
- エッジケース: ネットワークエラー、フィールド欠損、重複ファイル名

## デフォルトテンプレート
```markdown
---
title: "{{title}}"
subtitle: "{{subtitle}}"
authors: [{{authors}}]
publisher: "{{publisher}}"
publishedDate: "{{publishedDate}}"
pageCount: {{pageCount}}
isbn10: "{{isbn10}}"
isbn13: "{{isbn13}}"
categories: [{{categories}}]
status: unread
rating:
date: "{{date}}"
---

# {{title}}

{{thumbnail}}

## 書籍情報
- **著者**: {{authors}}
- **出版社**: {{publisher}}
- **出版日**: {{publishedDate}}
- **ページ数**: {{pageCount}}
- **ISBN**: {{isbn13}}
- **Google Books**: [リンク]({{googleBooksUrl}})

## 概要
{{description}}

## メモ


## 引用


## 感想

```

## 環境メモ
- bash環境からnpmが使えない。`npm install`等はユーザーに手動実行を依頼すること
