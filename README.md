# www.keihan.or.jp

一般社団法人京阪マーケティング・リサーチ機構（KMA）の公式サイトです。Astro で静的 HTML を生成し、GitHub Pages で配信します。

- 日本語は `/`、英語は `/en/` 配下に置き、各ページに `hreflang` の相互リンクがあります。
- クライアント JS は使いません（例外は公告ページの日付表示のみ）。JS を実行しないクローラーからも全文が読めます。

## 論文・News の追加

どちらもデータファイル 1 つを編集するだけで済みます。main に push すると自動でデプロイされます。

| 追加するもの | 編集するファイル | 表示先 |
|---|---|---|
| 論文 | `src/content/research.yaml` | トップ（新しい 3 件）、`/research/`、`/en/research/` |
| News | `src/content/news.yaml` | トップ（日英） |

書き方はファイル冒頭のコメントと既存の項目を参照してください。論文は `date`（掲載日）の新しい順、News は `date` の新しい順に並びます。項目が足りない・形式が違う場合はビルドがエラーで止まり、デプロイされません。

## ページ構成

| ページ | 日本語 | 英語 | ソース |
|---|---|---|---|
| トップ | `/` | `/en/` | `src/pages/index.astro`, `src/pages/en/index.astro` |
| 研究成果 | `/research/` | `/en/research/` | `src/pages/research/`, `src/pages/en/research/` |
| 法人概要 | `/about/` | `/en/about/` | `src/pages/about/`, `src/pages/en/about/` |
| 公告 | `/koukoku/` | なし | `src/pages/koukoku/index.astro` |

- サイト名・ミッション文・お問い合わせフォームの URL など共通の文言は `src/i18n.ts` にあります。
- `sitemap.xml` と `robots.txt` はビルド時に生成されます（`src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`）。
- トップには schema.org `ResearchOrganization` の JSON-LD を埋め込んでいます（`src/components/OrgJsonLd.astro`）。

## 変えてはいけないもの

- **公告ページの URL `/koukoku/`**。電子公告の URL は登記事項の可能性があるため、パスを変えないでください。
- **`public/CNAME`**（`www.keihan.or.jp`）と DNS。`keihan.or.jp` ではメールを運用しているため、DNS レコード（特に MX）には触れないでください。
- **旧サイトから引き継いだ静的ファイルのパス**（`public/` 直下の favicon・画像類、`public/ARCHIVE/`、`public/404/index.html` のリダイレクト）。

## 開発

Node.js 22.12 以上が必要です。

```bash
npm install
npm run dev       # 開発サーバー http://localhost:4321
npm run build     # dist/ に静的サイトを生成
npm run verify    # dist/ に対して受け入れ条件を検査
npm run verify -- https://www.keihan.or.jp   # 本番を JS 非実行で検査
npm run images    # ロゴから OGP 画像とタッチアイコンを再生成（法人名を変えたとき）
```

`npm run verify` では次の項目を検査します。

- `/en/` に英語ミッション文、トップ（日英）に最新 3 件の DOI、研究成果ページ（日英）に全 DOI が含まれる
- 公告の文面が旧サイトと同一
- 旧サイトの全パスが存在する
- 日英ページの `hreflang` 相互リンク
- 公告以外にクライアント JS がない

## デプロイ

`.github/workflows/deploy.yml` が main への push で `withastro/action` によりビルドし、`npm run verify` を通過したものだけを GitHub Pages にデプロイします。プルリクエストでもビルドと検査だけが走ります。

リポジトリ設定の **Settings → Pages → Build and deployment → Source** は「GitHub Actions」にしておく必要があります。

### 依存関係の更新

Dependabot（`.github/dependabot.yml`）が、月に 1 回、Astro などの npm パッケージと GitHub Actions の更新 PR を作ります。PR でもビルドと `npm run verify` が走るので、CI が緑なら中身を確認してマージしてください。マイナー・パッチ更新は 1 本の PR にまとまります。メジャー更新は個別の PR になるので、プレビューで表示を確認してからマージしてください。

## 旧サイトからの移行メモ

- 旧サイトは Gatsby（LekoArts cara テーマ）で、ソースは `pettan0818/keihan-org-LP`、ビルド成果物をこのリポジトリの main に直接 push していました。
- ハッシュ付き JS チャンク、`page-data/*.json` などの Gatsby 内部ファイルは移行していません。
- `banner.jpg`、`apple-touch-icon*.png`、`android-chrome-*.png` はテーマのサンプル画像だったため、同じパスのまま KMA のロゴ（`logo_original.png`）から作り直しました。ロゴの文字は白で暗い背景用のため、ヘッダーは旧サイトの背景色 `#141821` の帯にしています。
