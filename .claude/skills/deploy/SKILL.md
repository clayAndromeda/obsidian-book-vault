---
name: deploy
description: Build and deploy the plugin to the local Obsidian vault
---

# Deploy Skill

Obsidian Vaultへのデプロイ手順:

1. ユーザーに `npm run build` の実行を依頼（bash環境からnpm実行不可）
2. ビルド成功を確認
3. ユーザーに `npm run deploy` の実行を依頼
4. デプロイ先: `.env` の `OBSIDIAN_VAULT_PATH/.obsidian/plugins/obsidian-book-vault/`
5. コピーされるファイル: `main.js`, `manifest.json`, `styles.css`
6. Obsidianでプラグインをリロード（設定 → コミュニティプラグイン → リロード）
