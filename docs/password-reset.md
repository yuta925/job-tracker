# パスワードの再設定

Supabase Authは元のパスワードを保持せず、ハッシュを保存するため、アプリからパスワードを取り出して確認する機能は設けない。メールのリンクで本人確認し、新しいパスワードを設定する。

## 利用手順

1. `/login` の「パスワードを忘れた方はこちら」を開く。
2. 登録したメールアドレスを入力し、再設定メールを送信する。
3. メールのリンクを開く。
4. 新しいパスワードと確認用パスワードを入力する。8文字以上・確認一致が必要。
5. 更新後はそのままホームに進める。次回から新しいパスワードでログインする。

Gmail連携の設定は不要。再設定メールはSupabase Authのメール送信機能を使用する。

## Supabase側の設定

1. `.env.local` とデプロイ先に `NEXT_PUBLIC_SITE_URL` を設定する。開発時は `http://localhost:3000`、本番は実際のHTTPS URL。ポートが異なる場合は合わせる。
2. Supabase Dashboard → Authentication → URL Configuration で、Site URLを本番URLに設定し、Redirect URLsに次を追加する。
   - `http://localhost:3000/auth/recovery`
   - `https://本番ドメイン/auth/recovery`
3. Authentication → Email Templates → Reset Password に `web/supabase/templates/recovery.html` の内容を設定する。リンクは `.RedirectTo` と `.TokenHash` を使う。
4. 必要に応じてSupabaseのメール送信設定（SMTP）を行う。既定のメール送信は試用向けで、送信制限がある。メールが届かない場合はAuthログ、迷惑メール、送信設定を確認する。
5. 環境変数を変更したらサーバーを再起動・再デプロイする。

テンプレート変更後のリンクは、リクエスト元と異なるブラウザでも検証できる。標準の `.ConfirmationURL` を使う既存テンプレートにも対応するが、PKCEのコード交換にはリクエスト元ブラウザのCookieが必要なため、同じブラウザで開くこと。

## 実装上の扱い

- 再送画面と `/auth/recovery` は未ログインでもアクセス可能。
- `/auth/recovery` は `type=recovery` のトークン、または標準メールのPKCEコードを検証する。成功後は固定の `/reset-password` に転送する。
- `/reset-password` と更新処理の両方でSupabaseによるユーザー確認を行う。ログイン済みのユーザーは自身のパスワードを変更できる。
- 不正・期限切れ・使用済みリンクでは再送画面へ戻す。
- メールアドレスの登録有無は成功メッセージに含めず、送信先のアカウント存在確認に使わせない。
- パスワードをアプリのDBやログへ保存しない。Supabaseの `updateUser` へ渡す。
- DBの移行は不要。Supabase管理画面のURL・メール設定は別途適用する。
- 新規登録の `/auth/callback` も、未ログイン時に認証ガードで遮断されないよう修正した。

## 検証

送信アクション・入力検証・本人確認・期限切れ・外部転送の拒否・認証ガード・画面操作をモックで検証する。実メールの送信確認は、Supabase側の設定後に行う。

公式資料: [Password security](https://supabase.com/docs/guides/auth/password-security)、[Password-based Auth](https://supabase.com/docs/guides/auth/passwords)、[Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)、[Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)。
