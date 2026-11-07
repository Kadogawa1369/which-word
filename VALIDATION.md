# 検証記録

2026-11-07（日本時間）。このクラウド環境での結果です。

- `npm ci` 相当のロックファイル付き依存導入と `npm run build` 成功。
- `CHROMIUM_PATH=/usr/bin/chromium npm test -- --project=chromium-mobile`：6テスト成功。
- 初回の第1問、誤答再挑戦、正解による空欄補完、未正解の次へ禁止、重複クリア禁止、全20問、シャッフル一周を確認。
- 効果音ON/OFFとWeb Audio発音ノードの生成、英文のみの読み上げ指示、en-US優先、通常/低速、連打前と問題移動時の停止を確認。読み上げはモックでAPIへの引数を検証。耳での音質確認は未実施。
- manifest、192/512/maskableアイコン、apple-touch-iconと全キャッシュ資産のローカル配信を確認。
- キャッシュ後、ブラウザをオフラインにして再読み込みし、解答・次への移動成功。
- workerのv1→v2更新をテストサーバーで実施。解答中は旧版を維持し、明示的更新後に旧キャッシュを削除。更新後のオフライン解答も成功。
- 320px、375pxのスマホ幅と1440pxのPC幅で横あふれなし。320px/PCスクリーンショットを目視確認。
- ゲーム一周中の未処理JavaScriptエラー・HTTP 404なし。
- `node --check app.js` / `node --check sw.js` / `git diff --check` 成功。

## 未確認・制約

- iPhone実機、Safari実機、ホーム画面追加、standalone起動、実音声、端末オフライン音声は未確認。
- クラウド内のWebKit取得はネットワーク制約で未完了。GitHub Actions上ではChromium / WebKit各6件、合計12件が成功し、ビルドとPages用artifact作成も成功。検証対象コミットは `ea6f639`、実行は https://github.com/Kadogawa1369/which-word/actions/runs/42366019217 。
- Playwright WebKitのブラウザoffline切り替えは再読み込みで内部エラーになったため、WebKitはテスト用配信サーバーの接続を切断し、ネットワーク取得が失敗することを確認してからキャッシュ動作を検証。Chromiumはブラウザoffline設定で検証。iPhone実機の検証とは別。
- 参考ゲームのURLはプロキシの403で閲覧できなかった。指定仕様をもとに実装。
- GitHub APIとGitHub Pagesへの通信は現行ネットワークポリシーで403。Pages設定の照会・変更、公開URLでの配信確認は未完了。環境設定ドラフトに必要な通信先を追加済み（保存だけでは実行中環境へ適用されない）。
- mainへのコミット・プッシュ成功。公開ジョブは `actions/configure-pages` で `Get Pages site failed / Not Found`。Pagesサイトが有効化されていないためデプロイは未完了。Settings → Pages → Source: GitHub Actions を設定し、Actionsからワークフローを再実行する必要がある。公式 `actions/configure-pages@v5` のaction.ymlでも初回有効化にはGITHUB_TOKEN以外のトークンが必要と明記されているため、権限を増やす変更や追加の秘密情報は行っていない。
- 未検証の想定URLを公開済みとは扱わない。手順とURL表示箇所はREADMEを参照。
