# Node.jsセキュリティ更新の対応記録

対応日：2026年10月22日

## 変更内容

ローカルの`job-tracker`、`portfolio`、`life-management-app`、`life-manager`で、CI・開発用Node.jsを修正済みの22.23.4に固定した。手元にインストール済みのNode.jsは26.12.1で、こちらも今回のセキュリティ修正を含むため変更していない。[Node.js公式の修正告知](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)

各リポジトリで以下を変更した。

- リポジトリ直下に`.nvmrc`を追加し、22.23.4を指定。
- CIの`setup-node`を`node-version-file: .nvmrc`へ変更。
- `package.json`の`engines.node`を`^22.23.4 || ^24.22.1 || ^26.12.1`へ設定。各系統の古いパッチ版とEOLの20系を対応範囲から除外。
- npmを使用する2リポジトリは、ロックファイル内のルートパッケージの`engines`も同期。依存パッケージのバージョンは変更していない。
- READMEに開発用Node.jsと対応範囲、nvm使用時の切り替え方法を記載。
- `portfolio`のVercelデプロイにも`setup-node`を追加し、CLIを実行するNode.jsを明示。

PlanPilot・ShukatsuHubの作業中の変更や、各リポジトリの既存の画面変更は、この対応では編集していない。GitHub Actionsのdisable操作は行っていない。

## 検証結果

公式配布のNode.js 22.23.4を一時ディレクトリに展開し、公式のSHA-256一覧との一致を確認したうえで検証した。

| 対象 | 実行した検証 | 結果 |
| --- | --- | --- |
| job-tracker | `npm run lint`、`npm run typecheck`、`npm test`、`npm run build` | 成功。22ファイル・123テストが成功 |
| portfolio | `npm run lint`、`npm run typecheck`、`npm run build` | 成功。既存の作業中コードを含む状態で確認 |
| life-manager | `pnpm verify` | 整形・Lint・型・28テスト・ビルドが成功。DB統合・E2Eは今回の実行対象外 |
| life-management-app | `pnpm verify` | 整形・Lint・型・18テスト、追加の統合2テスト、ブラウザ2テスト、ビルドが成功 |

life-management-appの統合・ブラウザ検証は一時ディレクトリ内のテスト専用DBで実行し、既存の利用者データを使用していない。job-trackerのビルドは公開Supabase変数をダミーで上書きして確認した。最初のビルドはネットワーク制限によるGoogle Fontsの取得失敗となり、接続可能な環境での再実行は成功した。

あわせて、設定の整合性と、enginesの範囲が22.23.3・24.22.0・26.12.0を拒否し、22.23.4・24.22.1・26.12.1を許可することを確認した。

## 本番反映と残る確認

変更はローカルのみで、push・本番デプロイは行っていない。GitHub上の既定ブランチのCIと、稼働中アプリのNode.jsが更新済みという意味ではない。

VercelではNode.jsのmajorを選び、minor・patchはプラットフォーム側が更新する。`engines`は新しいデプロイの選択に影響し、今回の範囲ではVercelが対応する最新の24系を選ぶ可能性がある。これはCIの22.23.4と異なるため、本番ビルドとFunction実行時のバージョンを、次回デプロイ時に確認する。ソース上の宣言だけでは本番へのパッチ反映を証明できない。[Vercel公式のNode.jsバージョン管理](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)

`setup-node`で選ぶNode.jsと、Action自身の`action.yml`が指定する実行ランタイムも別である。この対応では、Action本体のバージョン更新・SHA固定、Vercel CLIの固定、Next.js等の依存更新、トークン保管方法の修正は行っていない。[Actions横断調査](github-actions-security-review-2026-10-22.md)に記載したこれらの対応は引き続き残る。
