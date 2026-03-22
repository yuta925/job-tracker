# Job Tracker

就活の応募企業と選考ステータスを Kanban 形式で管理する Web アプリです。  
Supabase Auth でログインし、各ユーザーが自分の応募データのみを CRUD できます。

## 主な機能

- ログイン / 新規登録（Supabase Auth）
- 認証ガード（未ログイン時は `/login` にリダイレクト）
- 応募情報の作成・編集・削除
- Kanban でのステータス管理
- ドラッグ&ドロップによるステータス更新
- ユーザー単位のデータ分離（RLS）

## ステータス

- `interest`（興味あり）
- `applied`（エントリー済み）
- `document_passed`（書類通過）
- `interviewing`（面接中）
- `offer`（内定）
- `rejected`（お見送り）

## 技術スタック

- Next.js (App Router)
- TypeScript
- Supabase Auth / Database
- Tailwind CSS
- React Testing Library
- Vitest
- GitHub Actions

## ディレクトリ構成

このリポジトリは `web` 配下がフロントエンド本体です。

```text
.
├─ web/
│  ├─ app/                  # App Router ページ
│  ├─ components/           # UI / Kanban / Auth コンポーネント
│  ├─ hooks/                # アプリケーション状態管理フック
│  ├─ lib/                  # Supabase クライアント / データアクセス
│  ├─ supabase/migrations/  # DB マイグレーション SQL
│  └─ __tests__/            # テスト
├─ .github/workflows/ci.yml
└─ README.md
```

## セットアップ

1. 依存関係をインストール

```bash
cd web
npm ci
```

2. 環境変数を設定（`web/.env.local`）

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Supabase でテーブルを作成
- `web/supabase/migrations/0001_create_applications.sql` の内容を SQL Editor で実行してください。

4. 開発サーバー起動

```bash
npm run dev
```

## 開発コマンド（`web` 配下）

```bash
npm run dev        # 開発サーバー
npm run lint       # ESLint
npm run typecheck  # TypeScript 型チェック
npm test           # Vitest
npm run build      # 本番ビルド
```

## 認証とデータ保護

- `proxy.ts` と Supabase セッション更新処理で認証状態をチェック
- `applications` テーブルに RLS を設定
- `auth.uid() = user_id` ポリシーで、自分のデータのみ参照/更新/削除可能

## CI

GitHub Actions（`.github/workflows/ci.yml`）で以下を実行します。

- install
- lint
- typecheck
- test
- build
