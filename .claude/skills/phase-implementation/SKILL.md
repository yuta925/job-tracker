# Phase Implementation

## Purpose
Phase 単位の実装を安全に進めるためのワークフロー。

## When to Use
- roadmap に定義された Phase を進めるとき
- 複数の機能を順番に実装するとき
- 変更を小さく区切って進めたいとき

## Workflow
1. CLAUDE.md と docs を読んで前提を把握する
2. 対象 Phase の機能を一覧化する
3. 関連ファイルと影響範囲を調査する
4. 機能ごとに小タスクへ分解する
5. 小タスク単位で実装する
6. テストを追加する
7. lint / typecheck / test を実行する
8. 機能単位で git add / git commit を行う
9. 変更ファイル一覧、実行結果、残課題を報告する

## Guardrails
- 一気に大きく変更しない
- 既存 CRUD / Kanban / 認証の安定性を崩さない
- status に別責務を混ぜない
- 可変仕様は docs に従う
- any は使わない

## Output Format
- 関連ファイル一覧
- 修正方針
- 小タスクの順序
- 各タスクの変更内容
- 追加テスト
- 実行結果
- コミット内容
- 残課題
