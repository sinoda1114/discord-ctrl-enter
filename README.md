# Discord Ctrl Enter

Discord Web で `Enter` を改行、`Ctrl+Enter` / `Command+Enter` を送信に寄せる Chrome Extension MV3 です。

## MVP

- Discord の `https://discord.com/channels/*` でのみ content script を実行します。
- `Enter` 単体はメッセージ送信を止め、改行を挿入します。
- `Ctrl+Enter` / `Command+Enter` は送信します。
- `Shift+Enter` は Discord 標準の改行に任せます。

## ローカル読み込み

1. Chrome で `chrome://extensions` を開きます。
2. 右上の「デベロッパー モード」を有効にします。
3. 「パッケージ化されていない拡張機能を読み込む」からこのディレクトリを選択します。
4. Discord Web をリロードして動作確認します。

Windows + Chrome で切り分ける場合は、以下で専用プロファイルの Chrome を起動できます。

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\open-chrome-with-extension.ps1
```

拡張のオプション画面に `v0.5.6` と表示されていることを確認してください。

## ディレクトリ構成

```text
discord-ctrl-enter/
  manifest.json
  icons/
    icon-16.png
    icon-32.png
    icon-48.png
    icon-128.png
  src/
    background.js
    content.js
    options.html
    options.css
    options.js
```

## テスト観点

- 自動テストは `npm test` で実行します。
- Discord のチャンネル画面でのみ動作すること。
- `Enter` で送信されず、改行されること。
- `Ctrl+Enter` / `Command+Enter` で送信できること。
- 日本語 IME 変換中の `Enter` を妨げないこと。
- Shift+Enter など Discord 標準の補助入力を壊さないこと。
- オプション変更がリロードなしで content script に反映されること。
