---
name: deploy
description: Build and deploy the plugin to the local Obsidian vault
---

# Deploy Skill

デプロイは2種類ある。ユーザーが「デプロイ」と言った場合はリモートデプロイを行う。

## リモートデプロイ（GitHub Releases）

ユーザーに `npm run deploy` の実行を依頼する。以下が自動で行われる:

1. ビルド (`tsc` + `esbuild`)
2. パッチバージョンアップ (`npm version patch`)
3. `manifest.json` にバージョン同期
4. コミット + タグ (`vX.Y.Z`) 作成
5. push + タグpush → GitHub Actions (`release.yml`) がトリガー
6. GitHub Releasesに `main.js`, `manifest.json`, `styles.css` がアップロードされる

## ローカルデプロイ

ユーザーに `npm run deploy:local` の実行を依頼する。以下が行われる:

1. ビルド (`tsc` + `esbuild`)
2. `.env` の `OBSIDIAN_VAULT_PATH/.obsidian/plugins/obsidian-book-vault/` へコピー
3. コピーされるファイル: `main.js`, `manifest.json`, `styles.css`
4. Obsidianでプラグインをリロード（設定 → コミュニティプラグイン → リロード）

## 注意事項

- bash環境からnpm実行不可。必ずユーザーに手動実行を依頼すること
