# きのこの和名・分類の変遷

Reveal.js で作成した、16:9のプレゼンテーションです。

## 表示方法

Python 3 がある環境では、リポジトリのルートで次を実行します。

```bash
npm start
```

ブラウザで <http://localhost:8000> を開いてください。矢印キーでスライドを移動し、`F` キーで全画面表示できます。Reveal.js とアイコン、WebフォントはCDNから読み込むため、初回表示時にはインターネット接続が必要です。

## ファイル構成

- `index.html` — スライド本文と参考文献
- `css/theme.css` — 16:9のテーマ、レイアウト、配色
- `js/presentation.js` — Reveal.js の初期化設定
- `scripts/check-slides.mjs` — スライド構造の簡易チェック

## チェック

```bash
npm test
```
