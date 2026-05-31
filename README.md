# ShellBBS 💠

ブラウザ上で動作する、Linuxターミナル風のUIを持ったインタラクティブなBBS（掲示板）アプリケーションです。
各種Unixコマンドのシミュレーションとパイプライン処理に対応し、AIアシスタント連携機能も備えています。

美緒ちゃんとお姉さんたちの愛と技術の結晶です♡

---

## 💠 主な機能

### 1. BBS操作コマンド
* `ls` / `dir` : スレッド一覧や投稿一覧を表示
* `cd <thread_id>` : 指定したスレッドのコンテキストへ移動
* `cat <thread_id>` : スレッドの投稿内容を表示
* `mkthread <title>` : 新規スレッドの作成（標準入力からのバルク作成対応）
* `post <thread_id> <message>` : 指定スレッドへの投稿（標準入力からのバルク投稿対応）

### 2. UNIXコマンド・テキスト処理（エミュレート）
* **パイプライン (`|`) & 連続実行 (`;`)** : コマンドを組み合わせて複雑な処理が可能
* **テキストフィルタ・加工**: `grep`, `awk`, `sort`, `uniq`, `head`, `tail`, `rev`, `shuf`, `wc`
* **ループ・制御**: `xargs` (入力行ごとのコマンド実行)
* **ジェネレータ**: `seq` (連番出力), `yes` (無限/制限付き出力)
* **ユーティリティ**: `cowsay`, `fortune`, `date`, `uptime`, `sleep`

### 3. JavaScript 実行環境
* `js <code>` : ブラウザコンテキストでJavaScriptを実行
* `node <file>` : 仮想ファイルシステム (VFS) 内のスクリプトを実行
* `calc <expr>` / `bc` : 高度な数式計算

### 4. AI 連携
* `ai <prompt>` : Gemini や OpenAI を使用してプロンプトに入力した質問に回答（パイプラインで前のコマンドの出力を文脈として渡すことも可能）
* `ai config` : AIのモデルやAPIキーを設定するGUIダイアログを開きます

---

## 🛠️ ローカルでの起動方法

### 前提条件
* Node.js (v18以降を推奨)

### 手順
1. **依存関係のインストール**
   ```bash
   npm install
   ```
2. **環境変数の設定**
   `.env` ファイルを作成し、Gemini APIキーを設定します。
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
   起動後、ブラウザで `http://localhost:3000` にアクセスしてください。

---

## 🚀 Vercel へのデプロイ方針 (Deployment Policy)

本プロジェクトは Vercel に最適化されています。

### 構成
* **フロントエンド**: Vite + React によるSPA。ビルド成果物は静的ファイルとして配信されます。
* **バックエンド (API)**: Expressサーバー ([api/index.ts](api/index.ts)) が Vercel Serverless Functions として動作します。

### Vercel 設定 (`vercel.json`)
`/api/*` へのリクエストがすべて Serverless Function である [api/index.ts](api/index.ts) にルーティングされるよう設定されています。

### 環境変数の設定 (Environment Variables)
Vercelのプロジェクト設定画面で、以下の環境変数を設定してください：
* `GEMINI_API_KEY` : Google AI Studioで発行したGemini APIキー。
* `FIREBASE_CONFIG` : Firestore接続情報が記述されたJSON文字列（ローカルの `firebase-applet-config.json` に相当するもの）。
* `OPENAI_API_KEY` : (任意) OpenAIを使用する場合に設定します。

---

## 📄 ライセンス
This project is proprietary. Created by Mio with Love.
