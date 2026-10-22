# Job-Tracker

締切・予定・重要メールをホームで確認し、応募企業と選考ステータスを管理する Web アプリです。
Supabase Auth でログインし、各ユーザーが自分の応募データのみを CRUD できます。

## 主な機能

- ログイン / 新規登録（Supabase Auth）
- メールからのパスワード再設定（[設定手順](docs/password-reset.md)）
- 認証ガード（未ログイン時は `/login` にリダイレクト）
- 応募情報の作成・編集・削除
- ホームで直近の締切・面接・予定を集約
- Gmailの重要な選考メールを表示（別途OAuth設定が必要）
- 共通フォームでの予定管理（説明会・逆求人・CA面談を統合）
- 夏/冬インターン・早期選考・本選考・内定者インターンの分類
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

Node.jsは `.nvmrc` の22.23.4を使用します。nvmを利用する場合は、リポジトリ直下で `nvm install` と `nvm use` を実行してください。
対応範囲は22.23.4以降の22系、24.22.1以降の24系、26.12.1以降の26系です。CIは `.nvmrc` を参照します。

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
- 新規環境は `web/supabase/migrations/0001` から `0016` まで番号順に適用してください。
- 既存環境の更新、Gmail設定、名称・デザイン案は [見直し内容とセットアップ](docs/refresh-plan.md) を参照してください。
- 環境変数の一覧は `web/.env.example` にあります。

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
