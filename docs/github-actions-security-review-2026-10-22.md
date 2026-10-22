# GitHub Actionsの実行リスクとリポジトリ横断調査

調査日：2026年10月22日（日本時間）

調査後のNode.js更新は[対応記録](node-security-update-2026-10-22.md)を参照。以下は調査時点のGitHub上の設定に対する評価であり、ローカルの更新はまだpush・本番反映していない。

## 1. 結論

**「GitHub ActionsでCIを回しているなら、すべてdisableにしなければならない」と判断する根拠は、今回確認した設定にはない。** 優先して対策するのは、本番用の秘密情報を使うデプロイ、AIエージェントを動かす処理、古いランタイム、外部Actionの参照方法である。

友人の指摘にある「RCM」の定義・出典は調査時点で未確認である。本資料ではRCE（Remote Code Execution：リモートコード実行）の意味を想定し、特定の侵害事件を指しているとは断定していない。

GitHubの個人アカウント`yuta925`が所有する20リポジトリの既定ブランチを照会し、6リポジトリの9ワークフローを確認した。今回確認した9ファイルには、`pull_request_target`、`workflow_run`、self-hosted runner、PRのタイトルなどをシェルへ直接展開する典型的な記述は見つからなかった。ただし、この静的確認は侵害がないことの保証ではない。

| 優先度 | リポジトリ・対象 | 現状と主な対策 | 停止についての判断 |
| --- | --- | --- | --- |
| 高 | `portfolio`：本番デプロイ | `vercel@latest`を毎回インストールし、本番環境変数を取得してビルド。CLI・Actionの固定、mainの保護、本番Environmentの承認・秘密情報制御を優先 | 必要ならデプロイだけを一時停止。通常のCIまで止める根拠は見つからない |
| 高・用途確認 | `LabFlow`：Claudeの2ワークフロー | OAuthトークンを渡すAI実行。Action内部の認可に加え、実行者・ツール・プラグインの制限と参照固定を確認 | 使っていないならこの2つを停止するのが合理的。外部利用者による無条件実行は未確認 |
| 高 | `job-tracker`：CI | アプリ用Node.js 20はサポート終了済み。サポート中の修正済みNodeへ更新。トークン権限の明示、Action固定も必要 | CIを継続するなら更新を優先。Actionsの停止では本番Next.jsの脆弱性は直らない |
| 中／Node修正確認は早急 | `life-management-app`：Verify | Node.js 22の実パッチ版を確認。`permissions`明示、Action固定、checkout資格情報の保存抑制 | 危険な権限付きPR実行は見つからず、一律停止の根拠なし |
| 中／Node修正確認は早急 | `life-manager`：CI | 上と同様。DB接続先はCI内のPostgreSQLであり、記載されたテスト用パスワードを本番漏えいとは評価しない | 上と同様 |
| 低・整理対象 | `sns-app`：tutorial | checkoutしか行わない2ジョブ。`checkout@v2`が残る | 不要なら停止・削除。残すならAction更新と権限明示 |

## 2. CIの「コード実行」と危険なRCEの違い

CIは、テストやビルドのためにコードを実行する機能である。PR内のテスト・ビルドスクリプト・依存パッケージも実行対象になる。したがって重要なのは、**誰のコードを、どの権限・秘密情報・ネットワークアクセスで動かすか**である。

| 条件 | 起こりうること | 対策 |
| --- | --- | --- |
| 外部forkのPRをGitHub-hosted runnerでテストし、秘密情報を渡さず、読み取り専用トークンで実行 | 攻撃者のコードはrunner内で動くが、通常は本番用秘密情報・書き込み権限を持たない | 外部PRの承認方針、最小権限、時間制限、信頼できない成果物の分離 |
| `pull_request_target`など、権限や秘密情報のある処理で外部PRのコードをcheckout・実行 | 秘密情報の持ち出し、リポジトリの改ざん、デプロイ先への侵入 | 該当ワークフローを止めて修正。非特権CIと特権処理を分離 |
| 外部Actionやnpm依存が改ざんされ、秘密情報のあるジョブで実行 | 正規のpushやデプロイでも認証情報が漏れる可能性 | 参照固定、依存更新のレビュー、秘密情報の最小化、漏えい時の失効 |
| 外部コードをself-hosted runnerで実行 | runnerの永続化、社内ネットワークやホストへの侵入の可能性 | 不特定のPRを実行させない。隔離・使い捨て化と接続権限の制限 |

外部forkからの通常の`pull_request`は、原則として秘密情報が渡されず、`GITHUB_TOKEN`も読み取り専用になる。一方、`pull_request_target`で外部コードを実行する構成は「pwn request」と呼ばれる攻撃の入口になる。[GitHub公式の説明](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target)、[GitHub Security Lab](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/)

今回のrunnerはすべてGitHub-hostedのUbuntuまたはmacOSであり、自分のMacをself-hosted runnerとして使う設定は見つからなかった。今回の設定だけから「CIが動くと手元のMacで外部の任意コマンドが実行される」とは判断できない。ただし、runnerにクラウド・SSH・デプロイ等の認証情報を渡す場合は、その権限が別の環境へ影響を広げる。

## 3. リポジトリごとの該当箇所

### 3.1 portfolio：デプロイの秘密情報を優先して保護

根拠：[deploy-to-vercel.yml](https://github.com/yuta925/portfolio/blob/main/.github/workflows/deploy-to-vercel.yml#L16)

- 17行目：`npm install --global vercel@latest`で、実行時点のCLIと依存を取得する。
- 20行目：`vercel pull --environment=production`で本番環境の設定・変数をrunnerへ取得する。
- 23行目：取得後に`vercel build --prod`を実行する。
- 20・23・26行目：`VERCEL_TOKEN`を使用する。
- YAMLには`permissions`、`environment`、CI成功を要求するジョブ依存がない。

想定経路は「CLI／依存の侵害、または悪意ある変更のmain混入 → 秘密情報を扱うrunnerでビルド → 認証情報の持ち出しや不正デプロイ」である。`vercel pull`が環境変数をローカルキャッシュへ保存することは公式仕様であり、ビルド時にそれらを読み取れる範囲を管理する必要がある。本番変数に具体的に何が含まれるか、Sensitive設定で取得が制限されているかは未確認。[Vercel CLI公式仕様](https://vercel.com/docs/cli/pull)

通常の[CIワークフロー](https://github.com/yuta925/portfolio/blob/main/.github/workflows/ci.yml#L9)には`contents: read`があり、この設定はデプロイ用ファイルへは引き継がれない。またCIとデプロイは別ワークフローとして同じpushで起動するため、CI失敗時のデプロイ抑止をYAML単体では保証していない。mainへのマージ前に必須チェックを課していれば、その部分を補えるが、実際のブランチ保護は未確認である。

対策：

1. Vercel CLIを検証済みの固定バージョンにし、可能な範囲でロックファイル管理する。Actionも固定する。
2. mainへPRレビューと必須CIを要求し、ワークフロー・依存定義の変更を重点レビューする。
3. 本番Environmentへ必要な秘密情報だけを置き、対応プランで利用可能なら承認者・デプロイブランチ制限を設定する。設定可能性と適用済みかは実画面で確認する。
4. 本番秘密情報を不要なビルドには渡さない。必須の場合も、インストール・ビルド・デプロイの各処理がどの情報にアクセスできるかを明示する。
5. CI成功済みの同一コミットのみをデプロイする経路に整える。認証情報だけを別ジョブへ移しても、未検証の成果物やコードを実行すれば保護にはならない。
6. トークンを最小権限・短い有効期間で管理する。環境変数渡しへの変更だけでは、同じrunnerの悪意ある処理から秘密情報を守れない。

継続利用するなら、このデプロイの保護を最優先にする。使っていない／別の自動デプロイと重複しているなら、当該ワークフローの停止を検討する。漏えいが判明した場合は停止だけでなくトークン失効・再発行とログ調査が必要である。

### 3.2 LabFlow：AI実行とトークン・プラグインの境界

根拠：[claude.yml](https://github.com/yuta925/LabFlow/blob/main/.github/workflows/claude.yml#L3)、[claude-code-review.yml](https://github.com/yuta925/LabFlow/blob/main/.github/workflows/claude-code-review.yml#L22)

- `claude.yml`はIssue・コメント・レビューを受け、`@claude`が含まれる場合にジョブを起動する。YAMLの条件自体には実行者の明示的な許可リストがない。
- 両ファイルとも`anthropics/claude-code-action@v1`を使い、`CLAUDE_CODE_OAUTH_TOKEN`を渡す。`id-token: write`もある。
- 自動レビューは外部プラグインのmarketplaceを指定し、プラグインを導入する。
- [.claude/settings.json](https://github.com/yuta925/LabFlow/blob/main/.claude/settings.json)には`git add`・`commit`・`push`を許可する設定がある。これはツール実行の許可であり、それだけでGitHubトークンに書き込み権限が与えられるわけではない。

**「外部の誰でもコメントだけでAIを実行できる」とは断定しない。** 現行の公式Actionは、通常、呼び出した利用者の書き込み権限を確認する。今回のYAMLには、その確認を緩める`allowed_non_write_users`や`allowed_bots: '*'`はない。外部forkの通常PRでは秘密情報も渡されない。Actionの既定の防御を維持することが重要である。過去の実行で解決された`@v1`の具体的SHA・内部実装までは照合していない。[Actionの公式セキュリティ仕様](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md)

残るリスクは、許可された利用者による起動時にも信頼できない文面・コードをAIが扱うこと、ツール経由のコマンド実行、Action・プラグインのサプライチェーン、トークンの露出である。今回、プロンプトインジェクションが成功することや秘密情報の持ち出しは実証していない。

対策：

1. 使っていないなら、この2つのAIワークフローだけを停止する。iOSビルドは別に判断する。
2. 利用する場合、YAML側にも信頼する起動者の条件または手動承認を追加し、Action内部の認可と併用する。外部利用者への無条件開放はしない。
3. レビュー専用ジョブでは必要なツールだけを許可する。コミット・pushが不要なら、そのジョブから許可しない。プロンプトで禁止するだけに頼らない。
4. Actionを検証済みの版へ固定し、追加プラグインの版・更新経路も確認する。
5. OAuthトークンとGitHub権限を用途に合わせて制限する。`id-token: write`はActionの認証で必要な場合があるため、用途を確認して不要な権限のみを削減する。

[ios-build.yml](https://github.com/yuta925/LabFlow/blob/main/.github/workflows/ios-build.yml)は別途、`permissions: contents: read`の明示、checkout資格情報の保存抑制、`setup-xcode`等の固定を行う。AI用OAuthトークンを渡す記述はこのファイルにはない。

### 3.3 job-tracker：CIは維持し、Node・権限・Action参照を更新

根拠：[ci.yml](https://github.com/yuta925/job-tracker/blob/main/.github/workflows/ci.yml#L17)

確認した構成は`push`／`pull_request`、`ubuntu-latest`、`npm ci`と品質チェックである。Supabaseの設定はプレースホルダーで、本番のGmail鍵やSupabase管理キーを渡す記述はない。

必要な対策：

- 22行目の`node-version: 20`をサポート中の修正済みリリースへ更新する。2026年10月22日時点でNode.js 20はEOLである。[Node.js公式サポート状況](https://nodejs.org/en/about/previous-releases)
- `permissions: contents: read`を明示する。現在はリポジトリ／組織の既定設定に依存しており、実際に書き込み権限があると確認したわけではない。
- checkoutで`persist-credentials: false`を設定する。CIでpushする用途は見つからない。
- checkout・setup-nodeを固定し、時間制限、外部PRの承認方針、依存更新通知を設定する。

Actionsを停止しても、[前回報告した本番Next.jsやCalendarトークンの問題](security-risk-report-2026-10-19.md)は解消しない。CIの実行環境と公開アプリの実行環境は、それぞれ更新が必要である。

### 3.4 life-management-app・life-manager：基本設定とNode実パッチ版

根拠：[life-management-app/verify.yml](https://github.com/yuta925/life-management-app/blob/main/.github/workflows/verify.yml)、[life-manager/ci.yml](https://github.com/yuta925/life-manager/blob/main/.github/workflows/ci.yml)

どちらも`permissions`未指定で、外部Actionはタグ参照である。Node.jsは`22`指定であり、次節の修正が入ったパッチ版を実際に使うことを確認する。通常CIでは`contents: read`、`persist-credentials: false`、Actionの固定を適用する。

`life-manager`の`postgres:postgres`と`localhost:5432`は、ワークフローが起動するテスト用DBを指す。この記述を本番用パスワードの流出とは評価しない。`postgres:17`などのイメージも、版・digestの固定と更新管理を検討する。

ローカルの`life-manager`には統合・E2Eテスト等の追加がある一方、GitHub既定ブランチのCIはそれらと異なる。本資料のGitHub上の評価は、取得した既定ブランチの内容を基準としている。

### 3.5 sns-app：不要なチュートリアル実行を整理

根拠：[tutorial.yml](https://github.com/yuta925/sns-app/blob/develop/.github/workflows/tutorial.yml)

`push`で2ジョブが起動し、checkoutだけを行う。10行目には`actions/checkout@v2`が残る。使っていなければ停止・削除する。残す場合は保守中のActionへの更新、参照固定、`contents: read`、資格情報保存の抑制を行う。今回取得した実行履歴にはrunがなかったが、それだけでは現在disableされているかは判断できない。

## 4. 10月21日に公開されたNode.jsのRCEについて

指摘元と同じ問題かは不明だが、調査直前の2026年10月21日に、Node.jsはBrotliデコーダの境界外書き込みによるRCE（CVE-2026-111497）を含む修正を公開している。修正リリースは`22.23.4`、`24.22.1`、`26.12.1`である。[Node.js公式アドバイザリ](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)

Actionsの全面停止が修正方法ではない。CI・ホスティング・Docker等で実際に使うNodeと、攻撃者の入力を処理する経路を確認して更新する。今回、各アプリでこのCVEの悪用経路が成立するかまでは調べていない。

- `portfolio`のCI、`life-management-app`、`life-manager`は`22`指定なので、修正済みのパッチ版が選ばれることを確認する。`setup-node`のキャッシュに古い版がある場合も考え、`check-latest: true`を使う方法や修正済み版を明示する方法を検討する。
- `job-tracker`の`20`はEOLであり、サポート中の系統への移行を優先する。
- `portfolio`のデプロイにはNodeの明示的なセットアップがなく、実際のrunner／Vercelのバージョンは別途確認が必要である。
- `setup-node`の`node-version`はアプリやビルドで使うNodeを選ぶ設定である。JavaScript Action自身の実行ランタイムはAction側の定義に従うため、アプリ用Nodeの更新だけで全Actionのランタイムが更新されたことにはならない。

## 5. 共通で確認・変更する箇所

| 確認箇所 | 対策 | 今回の確認状況 |
| --- | --- | --- |
| 通常CIのYAML | `permissions: contents: read`、push不要ならcheckoutの`persist-credentials: false` | `portfolio`のCIのみcontentsの読み取り専用指定あり。AIジョブは用途に応じた権限を別途指定 |
| Actionの参照 | 検証済みの完全長commit SHAへ固定し、更新をレビュー | 19個の`uses:`はすべてタグ参照。ワークフローディレクトリに`actions.lock`は見つからない |
| Action依存のロック | 利用可能ならGitHubのworkflow dependency lockfileも選択肢 | 公式ではpublic preview。採用時は運用を検証してから導入する |
| Settings → Actions → General | 通常のトークン権限を読み取り専用、必要なActionだけ許可、外部PRの承認を設定 | 実際の管理設定は未確認 |
| Settings → Actions → Policies | 不要な`pull_request_target`等を許可しない | 実際のポリシーは未確認。今回のYAMLにこのイベントはない |
| mainのRulesets／保護設定 | PRレビュー、必須CI、ワークフロー変更のレビュー | 適用状況は未確認 |
| 本番Environment | 承認・対象ブランチ・秘密情報を限定 | `portfolio`のYAMLにはEnvironment指定なし。管理画面の設定は未確認 |
| Dependencies／Security | 依存更新、Actionsの更新通知・解析、疑わしい変更のレビュー | npm全依存・全Actionの侵害履歴は今回の調査対象外 |
| 不要なリポジトリ・ワークフロー | 使わない自動化は停止し、不要な認証情報も整理 | 停止操作・認証情報の削除は実施していない |

GitHubは最小権限とActionの参照固定を案内している。現在は依存先も含めて固定するworkflow dependency lockfileも案内されているが、public previewである。SHA固定でも、最初に選んだコード自体の安全性やnpm等の別の依存までは保証されない。[GitHub公式の安全な利用指針](https://docs.github.com/en/actions/reference/security/secure-use)、[workflow dependency lockfile](https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles)

また、GitHubの公式告知では、一部の公開リポジトリに対する`pull_request_target`の既定ブロックを2026年11月2日から強制適用するとしている。これは**特定の危険なイベントの制限**であり、すべてのCIを停止する告知ではない。[GitHubの告知](https://github.blog/changelog/2026-09-17-workflow-execution-protections-in-github-actions-generally-available/)

## 6. disableを選ぶ条件

- **修正前に停止を優先：** 権限付きジョブが未確認の外部コードを実行している、利用Actionの侵害が判明した、不審なrun・変更・秘密情報流出が見つかった場合。今回、これらの成立は確認していない。
- **不要なら停止：** `sns-app`のチュートリアルや、使っていないAI・デプロイ処理。保守しない自動化の実行面を減らせる。
- **CIを残して強化：** 秘密情報を持たないGitHub-hostedの通常テスト・ビルド。検証機会を維持し、権限・依存・ランタイムを改善する。

個別の停止はActionsタブから対象ワークフローを選んで行い、リポジトリ全体を止める場合はSettings → Actions → Generalの設定で行う。停止は今後の実行を止める措置であり、漏えい済みの秘密情報の失効や、稼働中のアプリの更新を代替しない。[GitHubのActions設定](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)

## 7. 調査範囲と証跡

今回は調査のみを行い、Actions設定、ワークフロー、秘密情報、デプロイ、実行状態は変更していない。実コードや第三者Actionの実行、テスト用のPR・Issue作成、攻撃コードの投入も行っていない。直近runは各対象リポジトリ最大5件のメタデータだけを確認しており、全ログ・全履歴を用いた侵害調査は行っていない。

個人所有20リポジトリのうち、次の14個では、アクセス可能な既定ブランチの`.github/workflows`ディレクトリが見つからなかった：`1st-step`、`AI-Python`、`blog`、`dengon_game`、`music_app_frontend`、`notification-service`、`REALRAID_team3`、`recipe-seach-app`、`recipe_search`、`ShukatsuHub`、`SpeakerCheck`、`todokuyo`、`WordMemoApp`、`yuta925`。これらは「Actionsが無効」と確認したものではなく、別ブランチやGitHubの設定による自動処理も対象外である。

ローカルの`PlanPilot`にはワークフローが見つからず、今回の接続で得た個人所有一覧にも含まれていなかったため、GitHub側の確認はできていない。組織所有・共同開発の全リポジトリは対象に含めていない。

取得したワークフローのGit blob SHAを以下に記録する。リンクは既定ブランチなので、後日変更された場合はこのSHAと照合する。

| リポジトリ | ファイル | blob SHA |
| --- | --- | --- |
| job-tracker | ci.yml | `9dfd209ebcb3103eed3431e26585c361cdc74ab1` |
| LabFlow | claude-code-review.yml | `b5e8cfd4dc37c61955c30f11cebe4e7bf7d126dd` |
| LabFlow | claude.yml | `6b15fac7af3da593de10cdc0e8203a0ae7d722bd` |
| LabFlow | ios-build.yml | `f5bd67ca09a989d7ec54b0015436456cedb01426` |
| life-management-app | verify.yml | `50e31981493fe47034e3ef8f15301e999751c932` |
| life-manager | ci.yml | `e9d3fe71adee717e37ac3d163710c18c80dd057f` |
| portfolio | ci.yml | `513c9b29b3fde1644783474366479b9902f62ace` |
| portfolio | deploy-to-vercel.yml | `18a7fca13c67259f608d7b3705f470d2671cc278` |
| sns-app | tutorial.yml | `d0be83c9781f6c1eb635614dc4ca1b70f204226a` |
