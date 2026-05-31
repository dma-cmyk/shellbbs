# 🌐 ShellBBS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-blue.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-19.0.0-blue.svg)](https://react.dev/)

> **「ログは清潔に保ち、スクリプトは最適化してください。」**
> 
> ShellBBSは、レトロなLinuxシェル風インターフェースを通じて操作する、近未来的な匿名掲示板システム（BBS）です。Google AI Studioからエクスポートされ、強力なAIアシスタントや仮想モニター環境が統合されています。

---

## 💠 主な特徴 (Features)

### 1. 本格的な擬似シェル環境 (Terminal Interface)
ブラウザ上で動作するターミナルから、直感的なLinux風コマンドで掲示板を操作できます。
- **掲示板コマンド**: `threads` (スレッド一覧), `cd <id>` (入室), `cat <id>` (閲覧), `post <msg>` (投稿), `mkthread <title>` (スレッド作成)
- **ファイル操作**: `ls`, `pwd`, `mkdir`, `touch`, `rm`, `mv`, `cp`, `nano` (ビルトインエディタ)
- **テキスト処理ユーティリティ**: `grep`, `awk`, `sed`, `sort`, `uniq`, `head`, `tail`, `wc`, `base64`, `xargs`
- **高度なシェル機能**: パイプライン (`|`)、出力リダイレクト (`>` / `>>`)、連鎖実行 (`;`)、シェル変数展開 (`$VAR`)、エイリアス定義 (`alias`)、シェル関数定義 (`function`) に完全対応！

### 2. 仮想ライブプレビュー・モニター (UI Sandbox)
VFS (仮想ファイルシステム) 内に作成したHTML/JS/CSSファイルを、右側の仮想デバイスモニターにマウントして即座にプレビュー・実行できます。
- コマンド `web /bbs.html` でWebクライアントのモックが連動起動します。
- `nano` エディタでHTMLを編集し保存すると、ホットリロードが走りリアルタイムに仮想画面に反映されます。

### 3. AIパイロット & 自動対話モード (AI Agent Integration)
Google Gemini API を活用した高度なAI機能を標準搭載。
- `ai <prompt>` / `chat` で対話ができるだけでなく、AIがターミナルコマンドを自律生成し、BBSのスレッド作成や巡回、システム監視を代行する「自律自動操作モード（AI Agent Mode）」を搭載しています。
- 予期せぬコマンド実行を防ぐため、ユーザーによるワンクリック実行承認（Approve）ゲートも備えています。

### 4. カスタムビジュアルテーマ (Themes)
Retro Hacker Green、Cyberpunk、Dracula、Monochromeなど、気分に合わせた外観切り替えが可能。
- `themes` / `theme <name>` で即座に変更できます。
- `maketheme` コマンドで、対話型のウィザードを通じて自分だけのオリジナルテーマをビルドできます。

---

## 🛠️ 技術スタック (Tech Stack)

### フロントエンド (Client)
- **コア**: React 19 (TypeScript), Vite
- **スタイリング**: Tailwind CSS v4 (CSS-first architecture)
- **アニメーション**: Motion
- **アイコン**: Lucide React

### バックエンド (Server)
- **実行環境**: Node.js, Express (APIサーバー)
- **DB / 永続化**: Firebase (Cloud Firestore)
- **AI SDK**: `@google/genai` (Google Gen AI SDK v2)
- **ビルドツール**: esbuild, tsx (TypeScript Execution)

---

## 🚀 導入手順 (Getting Started)

### 前提条件 (Prerequisites)
- **Node.js** (v18.0.0以上推奨)
- **Firebase プロジェクト** (Firestore データベースが有効化されていること)

### 1. リポジトリのクローン & 依存関係のインストール
```bash
git clone https://github.com/your-username/shellbbs.git
cd shellbbs
npm install
```

### 2. 環境変数の設定
プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、GeminiのAPIキーを設定します。
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Firebase 設定の配置
Firebase プロジェクトの設定情報を、ルートディレクトリにある `firebase-applet-config.json` に配置します。
```json
{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "...",
  "firestoreDatabaseId": "(default)"
}
```

### 4. 開発サーバーの起動
```bash
npm run dev
```
起動後、ブラウザで **[http://localhost:3000](http://localhost:3000)** にアクセスしてください。

### 5. ビルドと本番実行
本番環境向けにビルドして実行する場合：
```bash
npm run build
npm start
```

---

## 📋 主要コマンド一覧 (Cheat Sheet)

| コマンド | 説明 | 使用例 |
| :--- | :--- | :--- |
| `threads` | 全ての掲示板スレッドを一覧表示します | `threads -r` |
| `mkthread <title>` | 指定したタイトルで新しいスレッドを立てます | `mkthread "レトロPCについて"` |
| `cd <id>` | 掲示板スレッドIDを指定してそのスレッドに入室します | `cd 17000000000` |
| `post <msg>` | 入室中のスレッドに新しいレスを投稿します | `post "こんにちは"` |
| `cat <id>` | スレッドIDのコメント、またはファイルを閲覧します | `cat 17000000000` |
| `ai <prompt>` | AIアシスタントに自然言語で指示を出します | `ai サーバーの調子を見て` |
| `web <file>` | 仮想ファイルシステム内のHTMLをプレビュー表示します | `web /bbs.html` |
| `theme <name>` | ターミナルのテーマデザインを切り替えます | `theme dracula` |

---

## 📄 ライセンス (License)
このプロジェクトは **MIT License** の元で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。
