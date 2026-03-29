---
name: build
description: Build the plugin (TypeScript check + esbuild bundle)
---

# Build Skill

ビルド手順:

1. `npm run build` を実行（bash環境からnpm実行不可のため、ユーザーに依頼）
   - ユーザーに `! npm run build` をプロンプトに入力してもらう
2. ビルドプロセス:
   - `tsc -noEmit` で型チェック
   - `node esbuild.config.mjs production` でバンドル
3. 出力: `main.js` (CommonJS, minified, tree-shaken)
4. エラーがあれば修正して再ビルド
