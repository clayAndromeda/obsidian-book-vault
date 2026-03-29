---
description: Code style conventions for this project
globs: "**/*.ts"
---

# Code Style

- インデント: タブ
- 文字列: ダブルクォート優先（importパス等）
- 型定義は `src/types.ts` に集約
- async/await を使用（Promise chain より優先）
- エラーハンドリング: try/catch + `new Notice()` でユーザーに通知
