# Gmail連携後にメールを取得できない場合

Google認証とトークン保存が成功すると `/dashboard?gmail=connected` に戻る。これはGmail APIからのメール取得まで成功したことを示すものではない。

2026-10-17の実環境では、メール取得時のGoogleエラーがAPI未有効化として判定され、OAuthクライアントのプロジェクトでGmail APIが有効になっていないことを確認した。

1. [Google CloudのGmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)を開く。
2. アプリの `GOOGLE_CLIENT_ID` に対応するOAuthクライアントと同じプロジェクトを選ぶ。
3. Gmail APIを有効化する。
4. ホームの「更新」を押す。許可が有効なら、APIの有効化だけを理由に再連携する必要はない。

## エラーの区別

- `gmail_api_disabled`: Gmail APIの未有効化。Google Cloudで有効化する。
- `gmail_scope_missing`: 読み取り権限が不足。再連携して権限を許可する。
- `gmail_authorization_expired`: Googleの許可失効。再連携する。
- `gmail_token_unreadable`: 保存トークンを復号できない。暗号化キーの設定を確認し、再連携する。
- `gmail_database_missing`: 必要なDBテーブルがAPIから見つからない。移行SQLの適用を確認する。
- `gmail_rate_limited`: Gmail側の取得回数制限。時間をおいて再試行する。
- `gmail_domain_policy`: Workspaceの組織ポリシーによる制限。管理者設定を確認する。
- `gmail_fetch_failed`: 未分類の取得失敗。再試行し、改善しなければ設定を確認する。

ブラウザへ返すメッセージはアプリで定義したものだけを使用する。Googleの生のエラー、認証ヘッダー、トークン、メール本文はエラーレスポンスに含めない。取得に失敗した場合は成功通知を同時に表示しない。

参考: [Google公式：Gmail APIのエラー](https://developers.google.com/workspace/gmail/api/guides/handle-errors)
