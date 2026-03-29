---
description: Rules for Obsidian plugin development
globs: "src/**/*.ts"
---

# Obsidian Plugin Rules

- `obsidian` モジュールからのみObsidian APIをインポートする
- HTTP通信は `requestUrl()` を使う（fetchやXMLHttpRequest禁止）
- Plugin lifecycle: `onload()` で初期化、`onunload()` でクリーンアップ
- 設定は `this.loadData()` / `this.saveData()` で永続化
- ユーザー通知は `new Notice()` を使用
- モーダルは `Modal` または `SuggestModal` を継承
- ファイル操作は `this.app.vault` API経由
