# CLAUDE.md

## Project
就活の選考状況を管理する Web アプリを作る。
ログイン後、応募企業を Kanban 形式のダッシュボードで 1 画面表示する。
カードはドラッグ&ドロップでステータス移動できる。

## Users
- 1ユーザー1アカウント前提
- 各ユーザーは自分の応募情報のみ閲覧・更新できる

## Tech Stack
- Next.js (App Router)
- TypeScript
- Supabase Auth
- Supabase Database
- Tailwind CSS
- React Testing Library
- Vitest
- GitHub Actions

## Product Principles
- 応募管理を最優先とする
- まずは 1 人用の個人利用に最適化する
- 複雑な自動化より、抜け漏れなく整理できることを重視する
- 機能追加時も既存の CRUD / Kanban / 認証の安定性を崩さない

## Core Scope
- Supabase Auth によるログイン
- 応募企業データの CRUD
- Kanban ダッシュボード表示
- ドラッグ&ドロップでステータス更新
- テストコードの整備
- CI の整備

## Stable Out of Scope
- チーム共有
- 分析グラフ
- 複雑な検索基盤
- マルチテナント管理

## Statuses
- interest: 興味あり
- applied: エントリー済み
- document_passed: 書類通過
- interviewing: 面接中
- offer: 内定
- rejected: お見送り

## Functional Requirements
- 未ログイン時はログインページへ遷移する
- ログイン後はダッシュボードを表示する
- application はログインユーザー単位で分離する
- Kanban 上でカードを移動すると status が更新される
- CRUD 操作は型安全に実装する

## Development Rules
- まず実装前に関連ファイルと設計方針を確認する
- 一度に大きく変更せず、小タスク単位で進める
- 仕様が変わりうる内容は CLAUDE.md ではなく docs に書く
- any は使わない
- 明示的な型定義を優先する
- UI とデータアクセスの責務を分離する
- server/client component の境界を明確にする
- 変更後は lint, typecheck, test を実行する
- コードを編集したら、機能ごとに変更を区切る
- 各機能の実装完了後は、関連ファイルを確認したうえで git add を行う
- git commit は機能単位で行い、コミットメッセージは変更内容が分かるように簡潔に書く
- 無関係な変更を同じコミットに混ぜない
- 1つの機能に対して、実装・テスト・必要なドキュメント更新を含めてからコミットする
- 最後に変更ファイル一覧、実行結果、残課題を報告する

## Code Style
- コンポーネントは責務ごとに小さく分割する
- hooks は目的別に分ける
- Supabase へのアクセスは専用層に寄せる
- 定数・型・バリデーションを分離する
- status は string の生値乱用を避け、union または enum 相当で管理する
- 一時的な仕様判断をコンポーネント内に閉じ込めず、必要に応じて docs に明記する

## Testing Policy
- 重要なロジックには unit test を書く
- 主要 UI 操作には component test を書く
- 認証保護と status 更新の導線を優先してテストする
- DnD は少なくとも主要ケースをテストする
- バグ修正時は再発防止のテスト追加を優先する

## CI Policy
- pull_request と main への push で CI を実行する
- CI では install, lint, typecheck, test, build を実行する
- main に入るコードは CI 通過を前提とする

## Docs Policy
- 現在の設計判断は docs/decisions.md に記録する
- 実装順は docs/roadmap.md に記録する
- ドメイン整理は docs/domain.md に記録する
