# Obsidian Book Vault

Obsidianで読書メモを素早く作成するプラグイン。書名/ISBNから書籍情報を自動取得し、テンプレートに従ったmarkdownファイルを生成する。

## ビルド・開発コマンド

```bash
npm install          # 依存関係インストール（bash環境から実行不可、ユーザーに依頼）
npm run build        # TypeScript型チェック + esbuild本番ビルド → main.js
npm run dev          # esbuild watchモード（開発用）
npm run deploy       # .envのOBSIDIAN_VAULT_PATHへデプロイ（main.js, manifest.json, styles.css）
```

## アーキテクチャ

- **エントリーポイント**: `src/main.ts` — BookVaultPlugin (Obsidian Plugin継承)
- **API**: `src/google-books-api.ts` — Google Books API v1 (認証不要、`requestUrl`でCORS回避)
- **UI**: `src/book-search-modal.ts` — 2段階モーダル (入力Modal → 結果SuggestModal)
- **ノート生成**: `src/book-note-creator.ts` — `{{placeholder}}` regex置換、サムネイルDL
- **型定義**: `src/types.ts` — BookInfo, BookVaultSettings, デフォルト値
- **設定**: `src/settings-tab.ts` — 設定タブUI

## コーディング規約

- TypeScript strict mode (`strictNullChecks: true`)
- Obsidian API の `requestUrl()` を使用（fetch禁止、CORS問題回避のため）
- 外部ライブラリは最小限（テンプレートはregex置換、ライブラリ不要）
- UIテキストは日本語
- esbuild で CommonJS にバンドル、`obsidian` は external

## 注意事項

- bash環境からnpmが使えない。`npm install` / `npm run build` 等はユーザーに手動実行を依頼すること
- `.env` にはローカルのVaultパスが入っている。コミットしないこと
- `main.js` はビルド成果物。gitignore済み
- Obsidian最低バージョン: 0.15.0

