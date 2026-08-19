# きのこの和名・分類の変遷

Reveal.js で作成した、16:9のプレゼンテーションです。

## 表示方法

Node.js（推奨: 現行LTS版）がある環境では、リポジトリのルートで次を実行します。表示だけなら依存パッケージのインストールは不要です。

```bash
npm start
```

ブラウザで <http://localhost:8000> を開いてください。矢印キーでスライドを移動し、`F` キーで全画面表示できます。Reveal.js とアイコン、WebフォントはCDNから読み込むため、初回表示時にはインターネット接続が必要です。

## ファイル構成

- `index.html` — スライド本文と参考文献
- `css/theme.css` — 16:9のテーマ、レイアウト、配色
- `js/presentation.js` — Reveal.js の初期化設定
- `scripts/check-slides.mjs` — スライド構造の簡易チェック
- `scripts/serve.mjs` — Windows/macOS/Linux 共通のローカル表示サーバー

## チェック

```bash
npm test
```

## PowerPoint / PDF の生成

Reveal.js を唯一のプレゼンテーション本体として、Playwright の Chromium で各スライドを 1600 × 900 px にレンダリングします。PowerPoint は各キャプチャ画像を16:9のページ全面に配置するため、テキストは編集できませんが、HTML/CSS版の見た目を保てます。fragment はすべて表示した最終状態で出力され、処理に使ったPNGはOSの一時ディレクトリから終了時に削除されます。

### 必要な依存パッケージ

- Node.js（推奨: 現行LTS版）と npm
- `playwright`（Chromiumによるレンダリング、画像取得、PDF生成）
- `pptxgenjs`（画像からPowerPointファイルを生成）

依存関係は `package.json` に定義されています。

### Windowsでの初回セットアップ

PowerShellまたはコマンドプロンプトでリポジトリのルートへ移動し、次を実行します。表示だけなら、このインストール手順を省略して `npm start` を実行できます。

```powershell
npm install
npx playwright install chromium
```

Reveal.js、Font AwesomeなどのCDNリソースとWebフォントを読み込むため、エクスポート時にもインターネット接続が必要です。Playwrightはフォントの読み込み完了を待ってからキャプチャします。日本語が正しく表示されない場合は、元のプレゼンテーションが想定する日本語フォントをWindowsへインストールしてください。

### PPTX生成コマンド

```bash
npm run export:pptx
```

16:9の `dist/kinoko-name-map-YYYYMMDDTHHMMSS-sssZ.pptx` が生成されます。ファイル名には生成時刻（UTC）がミリ秒まで付くため、以前の出力を上書きせずに保存できます。

### PDF生成コマンド

```bash
npm run export:pdf
```

16:9の `dist/kinoko-name-map-YYYYMMDDTHHMMSS-sssZ.pdf` が生成されます。こちらも生成時刻（UTC）がファイル名に付き、同じPNGキャプチャをChromiumでPDF化するため、PPTXとページ順・表示状態が一致します。

### 追加・変更したエクスポート関連ファイル

- `scripts/export-slides.mjs` — ローカル配信、全スライドのキャプチャ、PPTX/PDF生成、一時ファイル削除
- `package.json` — エクスポートコマンドと必要な依存関係
- `.gitignore` — 依存パッケージと生成物をGit管理から除外
- `README.md` — セットアップおよび生成手順（本節）
