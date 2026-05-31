import { useState, useEffect, useRef, FormEvent, ReactNode, KeyboardEvent, isValidElement } from "react";
import { defaultBBSContent } from "./defaultBBSContent";
import { modernBBSContent } from "./modernBBSContent";

const START_TIME = Date.now();

interface CalcStore {
  vars: Record<string, any>;
  funcs: Record<string, { params: string[]; body: string }>;
}

let calcStore: CalcStore = {
  vars: {
    PI: Math.PI,
    E: Math.E,
  },
  funcs: {}
};

const locales = {
  ja: {
    bannerDesc: "ルートノードへようこそ。ログは清潔に保ち、スクリプトは最適化してください。",
    helpText: "タイプ 'help' でコマンド一覧を表示します。",
    cmdNotFound: "コマンドが見つかりません",
    usage: "使用法",
    created: "スレッドを作成しました:",
    posted: "投稿しました:",
    notFound: "見つかりません",
    langSet: "言語を日本語に設定しました",
    aiKeyMissing: "OPENAI_API_KEY が設定されていません。「ai config」コマンドからAPI設定を開いてください。",
    helpLines: [
      "利用可能なコマンド:",
      "  [BBS]",
      " ls / dir [パス]     ファイル・スレッド・投稿一覧を巡回閲覧 (パス指定可)",
      " cd <id>             スレッドIDを指定して移動",
      " mkthread <title>    新規スレッド作成 (標準入力からの一括作成対応)",
      " cat <id>            スレッド<id>を読む",
      " post <id> <msg>     スレッド<id>に投稿 (標準入力からの一括投稿対応)",
      " update             BBSからシステムアップデートを自動適用",
      "  [AI / 環境変数]",
      " ai <text>           AIに質問 (標準入力を文脈として渡せます)",
      " ai config           AIの設定ウィンドウを開く",
      "                     ⚠️ 事前にAPIキーの設定が必要です",
      " export K=V          環境変数の設定",
      " env                 環境変数の一覧を表示",
      "  [ユーティリティ]",
      " echo <args>         出力",
      " yes [text]          繰り返しテキストを出力 (制限あり)",
      " seq <start> <end>   連番を出力",
      " head [-n N]         先頭N行を出力 (-N と省略可能)",
      " tail [-n N]         末尾N行を出力 (-N と省略可能)",
      " grep [-i] [-v] pat  正規表現でフィルタ (-i: 大文字小文字無視, -v: 反転)",
      " awk '{print $N}'    N番目の列を出力",
      " sort [-n] [-r]      行をソート (-n: 数値として, -r: 降順)",
      " uniq [-c]           重複行を削除 (-c: 重複回数を追加表示)",
      " rev                 文字を反転",
      " shuf                行をシャッフル",
      " base64 [-d]         Base64 エンコード/デコード",
      " wc [-l|-w|-c]       行数(l)、単語数(w)、文字数(c)をカウント",
      " xargs [-I {}] cmd   入力行ごとにコマンド実行",
      " sleep <sec>         待機",
      " cowsay <msg>        牛",
      " fortune             ランダムな格言",
      " date                現在時刻",
      " uptime              起動時間",
      " history             コマンド履歴",
      " clear               ターミナル消去",
      " reset               ローカルデータを初期化",
      " update              システムアップデート",
      " su <user>           ユーザー変更",
      " whoami              ユーザー名確認",
      " lang <ja|en>        言語切り替え",
      " help                ヘルプ",
      " alias name=cmd      コマンドのエイリアスを作成",
      " js <code>           JavaScriptコードを実行 (vfs/bbs/env API有)",
      " node <file.js>      VFS内のJSファイル、またはJSコードを実行",
      " expr <expr>         数式（1 + 2 など）を評価",
      " bc                  引き数や標準入力から数式を計算して出力",
      " calc <expr>         数式を美しく計算・評価 (Math関数等も対応)",
      "  [シェル変数 ＆ 関数]",
      " VAR=value           シェルスクリプトやターミナルで変数代入 (例: X=100)",
      " function f() {...}  シェル関数を定義、位置引数 $1, $2, $#, $@ 等に対応する",
      "",
      "コマンドのパイプ '|' と連続実行 ';' に完全対応",
      "例: seq 1 100 | xargs -I {} post 1 'こんにちは {}'"
    ]
  },
  en: {
    bannerDesc: "Welcome to the root node. Keep your logs clean and your scripts optimized.",
    helpText: "Type 'help' to see available commands.",
    cmdNotFound: "command not found",
    usage: "Usage",
    created: "Created threads:",
    posted: "Posted messages:",
    notFound: "No posts found or thread does not exist.",
    langSet: "Language set to English",
    aiKeyMissing: "OPENAI_API_KEY is not set. Please use the 'ai config' command to configure it.",
    helpLines: [
      "Available commands:",
      "  [BBS]",
      " ls / dir [path]    List files, directories, or forum posts",
      " cd <id>             Change to thread context",
      " mkthread <title>    Create thread (supports stdin bulk)",
      " cat <id>            Read posts in thread <id>",
      " post <id> <msg>     Post to thread (supports stdin bulk)",
      " update              Auto-apply system updates from BBS",
      "  [AI / Env]",
      " ai <text>           Ask AI (supports stdin as context)",
      " ai config           Open AI settings wizard",
      "                     ⚠️ Requires setting API key first",
      " export K=V          Set env vars",
      " env                 List environment variables",
      "  [Utilities]",
      " echo <args>         Print string",
      " yes [text]          Output string repeatedly",
      " seq <start> <end>   Print sequence of numbers",
      " head [-n N]         Output first N lines (can use -N)",
      " tail [-n N]         Output last N lines (can use -N)",
      " grep [-i] [-v] ptn  Filter lines matching regex (-i: ignore case, -v: invert)",
      " awk '{print $N}'    Print column N",
      " sort [-n] [-r]      Sort input lines (-n: numeric, -r: reverse)",
      " uniq [-c]           Filter adjacent matching lines (-c: count)",
      " rev                 Reverse lines characterwise",
      " shuf                Generate random permutations",
      " base64 [-d]         Base64 encode/decode",
      " wc [-l|-w|-c]       Count lines(l) / words(w) / chars(c)",
      " xargs [-I {}] cmd   Execute command for each line",
      " sleep <sec>         Delay execution",
      " cowsay <msg>        Cow says",
      " fortune             Random quote",
      " date                Print date",
      " uptime              Show uptime",
      " history             Show command history",
      " clear               Clear terminal",
      " reset               Initialize local data",
      " update              System update",
      " su <user>           Change user",
      " whoami              Show user",
      " lang <ja|en>        Change language",
      " help                Show this help",
      " alias name=cmd      Create command alias",
      " js <code>           Execute inline JavaScript (vfs/bbs/env API supported)",
      " node <file.js>      Run VFS JS script or inline Javascript text",
      " expr <expr>         Evaluate standard mathematical expression",
      " bc                  Arbitrary precision calculator (supports stdin lines)",
      " calc <expr>         Beautiful mathematical calculator (supports Math.*)",
      "  [Shell Variables & Functions]",
      " VAR=value           Assign variables (e.g. USERNAME=alice, access with $VAR)",
      " function f() {...}  Define custom shell functions with positional args ($1, $# etc)",
      "",
      "Pipelines '|' and sequences ';' are fully supported. ",
      "Example: seq 1 100 | xargs -I {} post 1 'Spam {}'"
    ]
  }
};

const themes: Record<string, {
  name: string;
  nameEn: string;
  canvasBg: string;
  termBg: string;
  termText: string;
  promptUser: string;
  promptHost: string;
  promptCwd: string;
  caret: string;
  accentGlow: string;
  topbarBg: string;
  borderBg: string;
  editorBg: string;
}> = {
  emerald: {
    name: "エメラルド (ハッカー・グリーン)",
    nameEn: "Emerald (Hacker Green)",
    canvasBg: "bg-[#050505]",
    termBg: "bg-black",
    termText: "text-[#d4d4d4]",
    promptUser: "text-[#4ade80]",
    promptHost: "text-[#a855f7]",
    promptCwd: "text-[#60a5fa]",
    caret: "caret-[#4ade80]",
    accentGlow: "text-emerald-400 border-emerald-800 bg-emerald-950/60",
    topbarBg: "bg-zinc-950/80 border-b border-zinc-900",
    borderBg: "border-zinc-900",
    editorBg: "bg-black text-gray-200 border-zinc-800"
  },
  amber: {
    name: "アンバー (クラシック琥珀)",
    nameEn: "Amber (Retro Orange)",
    canvasBg: "bg-[#0a0501]",
    termBg: "bg-[#0b0602]",
    termText: "text-[#f5a623]",
    promptUser: "text-[#ff9800]",
    promptHost: "text-[#f5a623]",
    promptCwd: "text-[#ffb74d]",
    caret: "caret-[#ff9800]",
    accentGlow: "text-amber-400 border-amber-800/80 bg-amber-950/40",
    topbarBg: "bg-[#180a02] border-b border-[#301503]",
    borderBg: "border-[#301503]",
    editorBg: "bg-[#080300] text-amber-250 border-[#301503]"
  },
  dracula: {
    name: "ドラキュラ (ダークパープル)",
    nameEn: "Dracula (Dark Purple)",
    canvasBg: "bg-[#181a26]",
    termBg: "bg-[#282a36]",
    termText: "text-[#f8f8f2]",
    promptUser: "text-[#ff79c6]",
    promptHost: "text-[#bd93f9]",
    promptCwd: "text-[#8be9fd]",
    caret: "caret-[#ff79c6]",
    accentGlow: "text-pink-400 border-[#bd93f9]/50 bg-[#343746]/60",
    topbarBg: "bg-[#1E1F29]/80 border-b border-[#191A21]",
    borderBg: "border-[#191A21]",
    editorBg: "bg-[#282a36] text-[#f8f8f2] border-[#191A21]"
  },
  matrix: {
    name: "マトリックス (ディープ・グリーン)",
    nameEn: "Matrix (Code Green)",
    canvasBg: "bg-[#010903]",
    termBg: "bg-black",
    termText: "text-[#00ff41] font-mono [text-shadow:0_0_2px_#00ff41]",
    promptUser: "text-[#00ff41]",
    promptHost: "text-[#008f11]",
    promptCwd: "text-[#5ff27b]",
    caret: "caret-[#00ff41]",
    accentGlow: "text-emerald-405 border-[#003b0d] bg-[#001003]/60",
    topbarBg: "bg-[#021305]/80 border-b border-[#003b0d]",
    borderBg: "border-[#003b0d]",
    editorBg: "bg-black text-[#00ff41] border-[#003b0d]"
  },
  cyberpunk: {
    name: "サイバーパンク (ネオン・イエロー)",
    nameEn: "Cyberpunk (Neon Yellow)",
    canvasBg: "bg-[#140024]",
    termBg: "bg-[#1e0033]",
    termText: "text-[#00ffff]",
    promptUser: "text-[#ff0055]",
    promptHost: "text-[#ffff00]",
    promptCwd: "text-[#00ff55]",
    caret: "caret-[#ff0055]",
    accentGlow: "text-[#ff0055] border-[#ff0055]/50 bg-[#1e0033]/60",
    topbarBg: "bg-[#0d001a]/80 border-b border-[#ff0055]/30",
    borderBg: "border-[#ff0055]/20",
    editorBg: "bg-[#140024] text-[#00ffff] border-[#ff0055]/30"
  },
  classic: {
    name: "モノクロ (クラシック・グレー)",
    nameEn: "Monochrome (Classic Gray)",
    canvasBg: "bg-[#121212]",
    termBg: "bg-[#1c1c1c]",
    termText: "text-zinc-200",
    promptUser: "text-zinc-100 font-bold",
    promptHost: "text-zinc-400",
    promptCwd: "text-zinc-300",
    caret: "caret-zinc-100",
    accentGlow: "text-zinc-300 border-zinc-700 bg-zinc-800/60",
    topbarBg: "bg-zinc-900 border-b border-zinc-800",
    borderBg: "border-zinc-800",
    editorBg: "bg-[#181818] text-zinc-200 border-zinc-800"
  },
  light: {
    name: "コーラルライト (白背景)",
    nameEn: "Coral Light (Light Mode)",
    canvasBg: "bg-[#f4f4f5]",
    termBg: "bg-white",
    termText: "text-zinc-800",
    promptUser: "text-rose-600 font-bold",
    promptHost: "text-indigo-650 text-[#4f46e5]",
    promptCwd: "text-teal-600 text-[#0d9488]",
    caret: "caret-rose-600",
    accentGlow: "text-rose-600 border-rose-300 bg-rose-50/60",
    topbarBg: "bg-zinc-100 border-b border-zinc-200",
    borderBg: "border-[#e4e4e7]",
    editorBg: "bg-zinc-50 text-zinc-800 border-zinc-200"
  }
};

function tokenize(str: string, sep: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (inQuotes) {
      if (c === quoteChar) inQuotes = false;
      current += c;
    } else {
      if (c === '"' || c === "'") {
        inQuotes = true;
        quoteChar = c;
        current += c;
      } else if (c === "\\" && i < str.length - 1) {
        current += str[++i];
      } else if (c === sep) {
        result.push(current);
        current = '';
      } else {
        current += c;
      }
    }
  }
  result.push(current);
  return result;
}

function substituteEnv(str: string, env: Record<string, string>): string {
  let result = str.replace(/\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (match, p1) => {
     return env[p1] !== undefined ? env[p1] : "";
  });
  result = result.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, p1) => {
     return env[p1] !== undefined ? env[p1] : "";
  });
  return result;
}

function resolvePath(currentDir: string, targetPath: string): string {
  let resolved = targetPath.startsWith('/') ? targetPath : '';
  if (!targetPath.startsWith('/')) {
    resolved = currentDir === '/' ? '/' + targetPath : currentDir + '/' + targetPath;
  }
  
  const segments = resolved.split('/');
  const finalSegments: string[] = [];
  for (const seg of segments) {
    if (seg === '.' || seg === '') {
      continue;
    }
    if (seg === '..') {
      finalSegments.pop();
    } else {
      finalSegments.push(seg);
    }
  }
  return '/' + finalSegments.join('/');
}

function parseRedirection(str: string): { cmd: string, redirectFile: string, append: boolean } | null {
  let inDoubleQuotes = false;
  let inSingleQuotes = false;
  for (let i = str.length - 1; i >= 0; i--) {
    const c = str[i];
    if (c === '"') {
      inDoubleQuotes = !inDoubleQuotes;
    } else if (c === "'") {
      inSingleQuotes = !inSingleQuotes;
    } else if (!inDoubleQuotes && !inSingleQuotes) {
      if (c === '>') {
        let isAppend = false;
        let startIdx = i;
        if (i > 0 && str[i - 1] === '>') {
          isAppend = true;
          startIdx = i - 1;
        }
        
        const cmdPart = str.substring(0, startIdx).trim();
        const filePart = str.substring(i + 1).trim();
        
        let cleanFile = filePart;
        if ((cleanFile.startsWith('"') && cleanFile.endsWith('"')) || 
            (cleanFile.startsWith("'") && cleanFile.endsWith("'"))) {
          cleanFile = cleanFile.slice(1, -1);
        }
        
        return {
          cmd: cmdPart,
          redirectFile: cleanFile,
          append: isAppend
        };
      }
    }
  }
  return null;
}

const ALL_COMMANDS = [
  'ls', 'dir', 'threads', 'mkthread', 'cat', 'post', 'read', 'cd',
  'echo', 'yes', 'seq', 'head', 'tail', 'grep', 'awk',
  'sort', 'uniq', 'rev', 'shuf', 'base64', 'wc', 'xargs',
  'sleep', 'cowsay', 'fortune', 'date', 'uptime', 'watch',
  'export', 'env', 'printenv', 'ai', 'chat',
  'history', 'lang', 'theme', 'themes', 'maketheme', 'su', 'whoami', 'clear', 'help',
  'pwd', 'mkdir', 'touch', 'rm', 'mv', 'cp', 'sh', 'nano', 'edit', 'write', 'js', 'node', 'expr', 'bc', 'calc',
  'memory', 'wiki', 'task', 'schedule', 'web', 'preview', 'update'
];

export interface SuggestionCandidate {
  value: string;
  label: string;
}

export interface SuggestionResult {
  suggestion: string;
  ghost: string;
  candidates?: SuggestionCandidate[];
}

async function getSuggestion(input: string, history: string[], context: string | null, apiFuncs: any): Promise<SuggestionResult> {
  const result: SuggestionResult = { suggestion: "", ghost: "" };
  if (!input) return result;

  const trimmed = input.trimStart();
  const leadingSpaces = input.length - trimmed.length;
  
  // 1. check history backward for ghost suggestion
  for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].startsWith(input) && history[i] !== input) {
          result.ghost = history[i];
          break;
      }
  }

  // 2. check commands
  if (!input.includes(' ')) {
      const matches = ALL_COMMANDS.filter(c => c.startsWith(trimmed));
      if (matches.length === 1) {
          if (matches[0] !== trimmed) {
              result.suggestion = " ".repeat(leadingSpaces) + matches[0];
          }
      } else if (matches.length > 1) {
          let commonPrefix = matches[0];
          for (let i = 1; i < matches.length; i++) {
              let j = 0;
              while (j < commonPrefix.length && j < matches[i].length && commonPrefix[j] === matches[i][j]) j++;
              commonPrefix = commonPrefix.substring(0, j);
          }
          result.suggestion = " ".repeat(leadingSpaces) + commonPrefix;
          result.candidates = matches.map(m => ({ value: " ".repeat(leadingSpaces) + m, label: m }));
      }
      return result;
  }
  
  // 3. check thread IDs for cd if allowed
  let candidates: SuggestionCandidate[] = [];
  if (trimmed.startsWith('cd ')) {
      const partialId = trimmed.substring(3);
      const ths = await apiFuncs.fetchThreads();
      const matches = ths.filter((t: any) => t.id.startsWith(partialId));
      for (const m of matches) {
          candidates.push({ value: " ".repeat(leadingSpaces) + "cd " + m.id, label: m.id });
      }
  }

  // 4. check paths matching what is available in VFS
  const parts = input.split(' ');
  if (parts.length > 1) {
      const lastArg = parts[parts.length - 1]; 
      
      const dirPart = lastArg.lastIndexOf('/') >= 0 ? lastArg.substring(0, lastArg.lastIndexOf('/')) : '';
      const namePart = lastArg.lastIndexOf('/') >= 0 ? lastArg.substring(lastArg.lastIndexOf('/') + 1) : lastArg;
      
      const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      const cwd = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
      
      let searchDir = resolvePath(cwd, dirPart || ".");
      let searchPrefix = searchDir === "/" ? "/" : searchDir + "/";
      
      let candidateNames = new Set<string>();
      for (const path of Object.keys(vfsObj)) {
          if (path.startsWith(searchPrefix) && path !== searchDir) {
             const relative = path.substring(searchPrefix.length);
             const firstSegment = relative.split('/')[0];
             if (firstSegment.startsWith(namePart) && firstSegment !== namePart) {
                 candidateNames.add(firstSegment);
             }
          }
      }
      if (candidateNames.size > 0 && input.endsWith(lastArg)) {
          const arr = Array.from(candidateNames);
          const prefixInput = input.substring(0, input.length - namePart.length);
          for (const m of arr) {
              let c = prefixInput + m;
              const route = resolvePath(cwd, (dirPart ? dirPart + '/' : '') + m);
              const dir = vfsObj[route]?.type === 'dir' || Object.keys(vfsObj).some(p => p.startsWith(route === '/' ? '/' : route + '/'));
              if (dir) c += '/';
              candidates.push({
                  value: c,
                  label: m + (dir ? '/' : '')
              });
          }
      }
  }
  
  if (candidates.length === 1) {
      result.suggestion = candidates[0].value;
  } else if (candidates.length > 1) {
      let commonPrefix = candidates[0].value;
      for (let i = 1; i < candidates.length; i++) {
          let j = 0;
          while (j < commonPrefix.length && j < candidates[i].value.length && commonPrefix[j] === candidates[i].value[j]) j++;
          commonPrefix = commonPrefix.substring(0, j);
      }
      result.suggestion = commonPrefix;
      result.candidates = candidates;
  }
  
  return result;
}

function renderCommandTextWithLinks(content: any): any {
  if (isValidElement(content)) {
    return content;
  }
  if (typeof content !== 'string') {
    return content;
  }

  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const parts = content.split(urlRegex);
  if (parts.length === 1) {
    return content;
  }

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 underline hover:text-cyan-300 break-all transition-colors cursor-pointer"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function parseArgs(str: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (inQuotes) {
      if (c === "\\") {
        if (i < str.length - 1) {
          const next = str[i + 1];
          if (next === 'n') {
            current += '\n';
            i++;
          } else if (next === 't') {
            current += '\t';
            i++;
          } else if (next === 'r') {
            current += '\r';
            i++;
          } else {
            current += str[++i];
          }
        } else {
          current += c;
        }
      } else if (c === quoteChar) {
         inQuotes = false;
      } else {
         current += c;
      }
    } else {
      if (c === '"' || c === "'") {
        inQuotes = true;
        quoteChar = c;
      } else if (c === "\\" && i < str.length - 1) {
        const next = str[i + 1];
        if (next === 'n') {
          current += '\n';
          i++;
        } else if (next === 't') {
          current += '\t';
          i++;
        } else if (next === 'r') {
          current += '\r';
          i++;
        } else {
          current += str[++i];
        }
      } else if (c === ' ' || c === '\t' || c === '\n') {
        if (current.length > 0) {
           result.push(current);
           current = '';
        }
      } else {
        current += c;
      }
    }
  }
  if (current.length > 0) result.push(current);
  return result;
}

const FORTUNES = [
  "Any sufficiently advanced technology is indistinguishable from magic. - Arthur C. Clarke",
  "Talk is cheap. Show me the code. - Linus Torvalds",
  "UNIX is simple. It just takes a genius to understand its simplicity. - Dennis Ritchie",
  "There are only two hard things in Computer Science: cache invalidation and naming things. - Phil Karlton",
  "The best way to predict the future is to invent it. - Alan Kay",
  "プログラムは書いた人のように動くのではなく、書かれた通りに動く。 - Unknown",
  "推測するな、計測せよ。 - Rob Pike"
];

const FORTUNE_WORDS = {
  adjectives: [
    "永遠の", "見えざる", "漆黒の", "光り輝く", "いにしえの", 
    "沈黙の", "荒ぶる", "宿命の", "さまよえる", "真実の", 
    "忘れられた", "孤高の", "禁断の", "未踏の", "伝説の", 
    "幻の", "究極の", "始まりの", "終わりの", "名もなき",
    "深淵の", "迷宮の", "混沌の", "星屑の", "銀河の",
    "虚無の", "静寂の", "狂気の", "絶望の", "栄光の",
    "偽りの", "神聖なる", "邪悪なる", "不可視の", "未知の",
    "輝かしき", "凍てつく", "燃え盛る", "妖艶な", "荘厳な",
    "無慈悲な", "深遠なる", "煌めく"
  ],
  nouns: [
    "コード", "バグ", "プログラマ", "システム", "アルゴリズム", 
    "AI", "データ", "メモリー", "ターミナル", "ハッカー", 
    "サーバー", "シェル", "コマンド", "プロセス", "ネットワーク",
    "データベース", "コンパイラ", "ルーター", "パケット", "オブジェクト",
    "例外", "ループ", "フラグ", "ポインタ", "レジスタ",
    "フレームワーク", "ハードウェア", "エンジニア", "変異", "プロトコル",
    "バグフィックス", "最適化", "論理爆弾", "仮想空間", "並列処理",
    "量子コンパイラ", "特異点", "バグ空間"
  ],
  predicates: [
    "は眠らない。", "が世界を支配する。", "に導かれん。", "は永遠に繰り返す。", 
    "が真実を語る。", "はすべてを知っている。", "が目を覚ます。", "は静寂を愛する。", 
    "の中に答えがある。", "はただそこにある。", "が未来を創る。", "を恐れるな。",
    "に終わりはない。", "が希望を照らす。", "は常に進化する。", "が運命を決める。",
    "は誰にも止められない。", "と共に歩め。", "は幻想に過ぎない。", "が奇跡を起こす。",
    "を打ち砕く。", "が世界をバグらせる。", "はすべてを無に還す。", "が新たな時代を告げる。",
    "を信じるな。",
    "は無限に広がる。", "が混沌を整理する。",
    "は真実を知っている。", "が均衡を保つ。"
  ],
  names: [
    "Unknown", "Anonymous", "A Hacker", "A Developer", "Ghost in the Machine",
    "System Admin", "A Coder", "The Architect", "A Cyber Cowboy", "A Cybernetic Oracle",
    "John Doe", "Jane Doe", "Master Programmer", "A Wandering Engineer",
    "田中", "佐藤", "鈴木", "高橋", "渡辺", "小林", "中村", "山田",
    "スティーブ", "アリス", "ボブ", "エリス", "チャーリー", "デビッド", "キャロル",
    "Steve John Matrix", "Alice Sarah Core", "David Alan Logic", "Maria Elena System",
    "田中 太郎 エンジニア", "佐藤 次郎 プログラマー", "鈴木 花子 ハッカー"
  ]
};

export type HelpInfo = {
cat: string;
related: string[];
desc: string;
usage: string;
options?: { opt: string; desc: string }[];
examples?: { cmd: string; desc: string }[];
};
export const defaultHelpsJa: Record<string, HelpInfo> = {
  curl: { cat: 'UTIL', related: ['web', 'cat'], desc: "外部URLからコンテンツをダウンロードして表示します。", usage: "curl <url>", examples: [{ cmd: "curl https://api.ipify.org", desc: "指定したURLからIP情報を取得して表示します" }] },
  task: { cat: 'UI', related: ['schedule'], desc: "タスク(ToDo)を管理・表示します", usage: "task [ls|add|rm|check|uncheck] [args]", examples: [{cmd:"task add 新規タスク", desc: "タスクを追加"}, {cmd: "task ls", desc: "タスク一覧"}, {cmd: "task check <id>", desc: "完了にする"}] },
  schedule: { cat: 'UI', related: ['task'], desc: "スケジュールや予定を管理・表示します", usage: "schedule [ls|add|rm] [args]", examples: [{cmd:"schedule add 12:00 会議", desc: "予定を追加"}, {cmd: "schedule ls", desc: "予定一覧"}, {cmd: "schedule rm <id>", desc: "予定を削除"}] },
  memory: { cat: 'UI', related: [], desc: "AIの記憶(メモリ)をカード形式で管理します", usage: "memory [ls|add|rm] [args]", examples: [{cmd:"memory add ユーザーの好み 値", desc: "記憶を追加"}, {cmd: "memory ls", desc: "記憶一覧"}, {cmd: "memory rm <id>", desc: "記憶を削除"}] },
  objective: { cat: 'UI', related: [], desc: "AIエージェントの目的・ゴール(目標設定)を設定します", usage: "objective [set|clear] [args]", examples: [{cmd:"objective", desc: "現在の目的を表示"}, {cmd: "objective set 日本の歴史の解説役", desc: "目標を設定"}, {cmd: "objective clear", desc: "目標をクリア"}] },
        wiki: { cat: 'UI', related: ['help'], desc: "Wiki(ヘルプ)の編集や構築を行います。", usage: "wiki [init|edit|rm] <cmd>", examples: [{cmd:"wiki init", desc: "/sys/wiki に初期ファイルを展開します"}, {cmd: "wiki edit ls", desc: "lsコマンドのヘルプを編集します"}] },
        startup: { cat: 'UTIL', related: ['web', 'wiki'], desc: "起動時に自動実行されるコマンドを管理・登録します。", usage: "startup [add|rm|edit|clear|run] [args]", examples: [{cmd: "startup", desc: "登録一覧を表示"}, {cmd: "startup add web /bbs.html", desc: "起動時にBBSを表示するよう追加"}, {cmd: "startup rm 1", desc: "1件目の項目を削除"}] },
  split: { cat: 'UI', related: ['tmux', 'web'], desc: "画面を垂直・水平に分割して複数ターミナルを起動します。", usage: "split [v|h|close]", examples: [{cmd: "split v", desc: "画面を垂直に分割"}, {cmd: "split h", desc: "画面を水平に分割"}, {cmd: "split close", desc: "分割を閉じる"}] },
  tmux: { cat: 'UI', related: ['split'], desc: "画面分割コマンド(splitのエイリアス)", usage: "tmux [v|h|close]", examples: [{cmd: "tmux h", desc: "水平分割"}] },
ls: { 
cat: 'FILE', related: ['cd', 'pwd'], 
desc: "ファイル/フォルダ一覧、またはスレッドの投稿一覧を表示します。", 
usage: "ls [dir_or_thread_id]",
options: [
{ opt: '-r', desc: 'スレッドの投稿一覧を表示する際に逆順(新しい順)で表示します。' }
],
examples: [
{ cmd: "ls", desc: "カレントディレクトリのファイル一覧を表示します。" },
{ cmd: "ls /scripts", desc: "指定したディレクトリの中身を表示します。" },
{ cmd: "ls 1700000000000", desc: "指定したスレッドIDのコメント一覧を表示します。" },
]
},
cd: { 
cat: 'FILE', related: ['ls', 'pwd'], 
desc: "カレントディレクトリを移動、または掲示板スレッドに入室します。", 
usage: "cd <path_or_thread_id>",
examples: [
{ cmd: "cd /", desc: "ルートディレクトリに移動します。" },
{ cmd: "cd ..", desc: "一つ上のディレクトリに移動します。" },
{ cmd: "cd 1700000000000", desc: "指定した掲示板スレッドに入室します。以降のコマンド(post等)の対象になります。" }
]
},
pwd: { 
cat: 'FILE', related: ['ls', 'cd'], 
desc: "現在のカレントディレクトリの絶対パスを表示します。", 
usage: "pwd",
examples: [
{ cmd: "pwd", desc: "現在のパス(/scriptsなど)を表示します。" }
]
},
mkdir: { cat: 'FILE', related: ['touch', 'rm'], desc: "ディレクトリ(フォルダ)を作成します。", usage: "mkdir <folder>", examples: [{ cmd: "mkdir new_folder", desc: "カレントディレクトリに新しいフォルダを作成します。" }] },
touch: { cat: 'FILE', related: ['mkdir', 'nano'], desc: "指定したデータのない空のファイルを作成します。(既存ファイルの場合は何もしません)", usage: "touch <file>", examples: [{ cmd: "touch note.txt", desc: "note.txtを作成します。" }] },
rm: { cat: 'FILE', related: ['mv', 'cp'], desc: "ファイルやディレクトリを削除します。", usage: "rm [-r] <path>", options: [{opt: "-r", desc: "ディレクトリとその中身を再帰的に削除します"}], examples: [{cmd: "rm old.txt", desc: "ファイルを削除します"}, {cmd: "rm -r folder/", desc: "フォルダごと削除します"}] },
mv: { cat: 'FILE', related: ['cp', 'rm'], desc: "ファイルやディレクトリを移動(またはリネーム)します。", usage: "mv <src> <dst>", examples: [{ cmd: "mv old.txt new.txt", desc: "ファイル名を変更します。" }, { cmd: "mv file.txt folder/", desc: "ファイルをご指定のフォルダへ移動します。" }] },
cp: { cat: 'FILE', related: ['mv', 'rm'], desc: "ファイルをコピーします。現在ディレクトリのコピーには対応していません。", usage: "cp <src> <dst>", examples: [{ cmd: "cp file1.txt file2.txt", desc: "file1.txtの内容をfile2.txtにコピーします。" }] },
nano: { cat: 'FILE', related: ['edit', 'write', 'cat'], desc: "テキストエディタを起動してファイルを編集します。", usage: "nano <file>", examples: [{ cmd: "nano src.js", desc: "ブラウザ上でテキストエディタを使って編集します。" }] },
edit: { cat: 'FILE', related: ['nano', 'write'], desc: "テキストエディタを起動します。(nanoのエイリアス)", usage: "edit <file>", examples: [{ cmd: "edit src.js", desc: "エディタを開きます。" }] },
write: { cat: 'FILE', related: ['nano', 'cat'], desc: "ファイルにテキストを直接書き込みます(上書き)。", usage: "write <file> <text>", examples: [{ cmd: "write test.txt Hello", desc: "test.txtにHelloを書き込みます。" }] },

threads: { cat: 'BBS', related: ['mkthread', 'read'], desc: "全スレッドの一覧を表示します。", usage: "threads [-r]", options: [{opt:"-r", desc: "逆順(新しい順)で表示します"}], examples: [{cmd: "threads", desc: "デフォルト順でスレッドを一覧します"}] },
mkthread: { cat: 'BBS', related: ['threads', 'post'], desc: "新しくスレッドを作成します。（本文も同時に投稿可能です）", usage: "mkthread <title> [body]", examples: [{ cmd: "mkthread \"My New Thread\"", desc: "指定のタイトルでスレッドを作成します。" }, { cmd: "mkthread \"Title\" \"First Post content\"", desc: "タイトルと本文を指定してスレッドを作成します。" }] },
post: { cat: 'BBS', related: ['threads', 'read', 'cat'], desc: "指定したスレッドに新規書き込み(返信)をします。", usage: "post [id] <msg>", examples: [{ cmd: "post 1700 Hello", desc: "指定IDにHelloと投稿します。" }, {cmd: "post hello", desc: "カレントスレッド入室中ならIDなしで投稿可"}] },
cat: { cat: 'BBS', related: ['read', 'nano'], desc: "ファイルの内容を表示するか、掲示板スレッドの全コメントを出力します。", usage: "cat <path_or_thread_id>", examples: [{ cmd: "cat note.txt", desc: "ファイルの中身を表示します。" }, { cmd: "cat 1700000000000", desc: "指定したスレッドのコメントをすべて表示します。" }] },
read: { cat: 'BBS', related: ['cat', 'threads'], desc: "スレッドの全返信を閲覧します。", usage: "read <id>", examples: [{ cmd: "read 1700", desc: "スレッドのコメントを読みます。" }] },

sh: { cat: 'EXEC', related: ['js', 'watch'], desc: "シェルスクリプトを実行します。", usage: "sh <file.sh>", examples: [{ cmd: "sh run.sh", desc: "スクリプトを実行します。" }] },
js: { cat: 'EXEC', related: ['node', 'sh'], desc: "JavaScriptのコードを評価します。", usage: "js <code>", examples: [{ cmd: "js \"console.log(1+1)\"", desc: "JSを実行して出力を得ます。" }] },
node: { cat: 'EXEC', related: ['js'], desc: "JavaScriptコード評価(jsのエイリアス)。", usage: "node <code>", examples: [{ cmd: "node app.js", desc: "JSファイルを実行します。" }] },
expr: { cat: 'EXEC', related: ['bc', 'calc'], desc: "簡単な計算式を評価します。", usage: "expr <math>", examples: [{ cmd: "expr 1 + 2", desc: "足し算をします。" }] },
bc: { cat: 'EXEC', related: ['expr', 'calc'], desc: "計算式を評価します。", usage: "bc <math>", examples: [{ cmd: "echo '1+1' | bc", desc: "標準入力から数式を受け取ります。" }] },
calc: { cat: 'EXEC', related: ['expr', 'bc'], desc: "高度な数式計算や変数代入が行えます。", usage: "calc <math>", examples: [{ cmd: "calc a=5; a*2", desc: "変数を使った計算も可能です。" }] },
watch: { cat: 'EXEC', related: ['sh'], desc: "コマンドを指定秒数ごとに定期実行します。", usage: "watch <sec> <cmd>", examples: [{ cmd: "watch 2 date", desc: "2秒間に1回現在時刻を表示します。" }, { cmd: "watch stops", desc: "定期実行を停止します。" }] },
ai: { cat: 'EXEC', related: ['chat'], desc: "AI自動操作、対話モード(chat)、または設定を行います。", usage: "ai [chat|config|<prompt>]", examples: [{cmd: "ai config", desc: "AIの設定画面を開きます"}, {cmd: "ai chat", desc: "対話モードを開きます"}, {cmd: "ai create a game", desc: "プロンプトでAIに指示を出します"}] },
chat: { cat: 'EXEC', related: ['ai'], desc: "AIとの対話モードに入ります。", usage: "chat", examples: [{ cmd: "chat", desc: "対話モードを起動" }] },

echo: { cat: 'UTIL', related: ['cat'], desc: "標準出力にテキストをそのまま表示します。", usage: "echo <text>", examples: [{ cmd: "echo Hello World", desc: "Hello World と画面に出力します。" }, { cmd: "echo text > file.txt", desc: "text という文字列をファイルに書き込みます。" }] },
yes: { cat: 'UTIL', related: ['echo'], desc: "テキストを繰り返し出力します。強制停止するまで無限に流れます。", usage: "yes [text]", examples: [{cmd: "yes y", desc: "yを無限に出力します"}] },
seq: { cat: 'UTIL', related: ['echo'], desc: "連続した数字を出力します。", usage: "seq <first> <last>", examples: [{ cmd: "seq 1 5", desc: "1から5までの数値を出力します" }] },
head: { cat: 'UTIL', related: ['tail', 'cat'], desc: "ファイルの先頭部分を出力します。", usage: "head [-n limit] <file>", options:[{opt:"-n", desc:"表示する行数を指定します"}], examples: [{ cmd: "head -n 5 log.txt", desc: "先頭5行などを出力します" }] },
tail: { cat: 'UTIL', related: ['head', 'cat'], desc: "ファイルの末尾部分を出力します。", usage: "tail [-n limit] <file>", options:[{opt:"-n", desc:"末尾から抽出する行数"}], examples: [{ cmd: "tail -n 10 log.txt", desc: "末尾10行を抽出" }] },
grep: { cat: 'UTIL', related: ['awk'], desc: "指定したパターン(文字列や正規表現)に一致する行を検索します。", usage: "grep [-i] [-v] <pattern> <file>", options: [ { opt: "-i", desc: "大文字・小文字を区別せずに検索します" }, { opt: "-v", desc: "パターンに一致しない行を抽出します" } ], examples: [{ cmd: "grep error log.txt", desc: "log.txtからerrorを含む行を抽出します。" }] },
wc: { cat: 'UTIL', related: ['cat'], desc: "行数、単語数、バイト数をカウントします。", usage: "wc [-l] <file>", options:[{opt:"-l", desc:"行数のみカウント"}], examples: [{ cmd: "wc log.txt", desc: "統計情報を見ます" }] },
sleep: { cat: 'UTIL', related: ['watch'], desc: "指定した秒数待機します。スクリプト等で一時停止したい時に使用します。", usage: "sleep <sec>", examples: [{cmd: "sleep 3; echo 'done'", desc: "3秒待ってからテキストを出力します"}] },
reset: { cat: 'UTIL', related: ['clear'], desc: "ターミナルをリセットします。", usage: "reset", examples: [{cmd: "reset", desc: "画面表示をすべてリセットし、初期状態にします"}] },
update: { cat: 'UTIL', related: ['reset', 'threads'], desc: "BBSのお知らせスレッドからシステムファイルを自動で最新版にアップデートします。", usage: "update", examples: [{cmd: "update", desc: "BBSの配信情報からシステムをアップデートします"}] },
sort: { cat: 'UTIL', related: ['uniq'], desc: "行を並び替えます。", usage: "sort [-r|-n] <file>", options:[{opt:"-r",desc:"逆順"},{opt:"-n",desc:"数値として比較"}], examples: [{ cmd: "sort log.txt", desc: "アルファベット順にソート" }] },
uniq: { cat: 'UTIL', related: ['sort'], desc: "連続する重複行を削除します。", usage: "uniq [-c] <file>", options:[{opt:"-c",desc:"出現回数をカウント"}], examples: [{ cmd: "sort file | uniq", desc: "並び替えた上で重複排除。" }] },
rev: { cat: 'UTIL', related: ['cat'], desc: "行の文字を反転させます。", usage: "rev <file>", examples: [{cmd: "echo 'hello' | rev", desc: "olleh と出力されます"}] },
shuf: { cat: 'UTIL', related: ['sort'], desc: "行をランダムに並べ替えます。", usage: "shuf <file>", examples: [{cmd: "shuf items.txt", desc: "リストの中身をシャッフル出力します"}] },
base64: { cat: 'UTIL', related: ['cat'], desc: "Base64エンコード/デコードを行います。", usage: "base64 [-d] <file>", options: [{opt: "-d", desc: "デコードを行います"}], examples: [{cmd: "echo 'hey' | base64", desc: "Base64文字列に変換します"}, {cmd: "echo 'aGV5Cg==' | base64 -d", desc: "元の文字列に復号します"}] },
cowsay: { cat: 'UTIL', related: ['fortune'], desc: "喋る牛のアスキーアートを生成します。", usage: "cowsay <text>", examples: [{ cmd: "cowsay moo", desc: "牛が喋ります。" }] },
fortune: { cat: 'UTIL', related: ['cowsay'], desc: "ランダムな格言を表示します。", usage: "fortune", examples: [{cmd: "fortune", desc: "ちょっとした名言や小話をランダムに一つ表示します"}] },
date: { cat: 'UTIL', related: ['uptime'], desc: "現在の日時を表示します。", usage: "date", examples: [{ cmd: "date", desc: "現在時刻の確認" }] },
uptime: { cat: 'UTIL', related: ['date'], desc: "システムの稼働時間を表示します。", usage: "uptime", examples: [{cmd: "uptime", desc: "システムが開かれてからの経過時間を表示します"}] },
xargs: { cat: 'UTIL', related: ['echo'], desc: "標準入力から引数を受け取り、指定コマンドを実行します。", usage: "xargs <cmd>", examples: [{cmd: "echo 'f1.txt f2.txt' | xargs rm", desc: "複数のファイルを一括で削除します"}] },
awk: { cat: 'UTIL', related: ['grep'], desc: "テキストの加工などを行うデータ処理言語です。基本構文のみサポート。", usage: "awk '<prog>' <file>", examples: [{ cmd: "awk '{print $1}' log.txt", desc: "各行の1番目の単語を抽出" }] },
dir: { cat: 'UTIL', related: ['ls'], desc: "ディレクトリの内容を表示します(lsと同じです)。", usage: "dir [path]", examples: [{cmd: "dir", desc: "カレントディレクトリの一覧を表示します"}] },

exit: { cat: 'SYS', related: ['quit', 'clear'], desc: "操作モード(AIエージェントのチャット等)から抜けます。", usage: "exit", examples: [{cmd: "exit", desc: "現在のセッションを終了します"}] },
quit: { cat: 'SYS', related: ['exit'], desc: "操作モードから抜けます(exitと同じで、セッションを終了します)。", usage: "quit", examples: [{cmd: "quit", desc: "現在のセッションを終了します"}] },

"for": { cat: 'EXEC', related: ['if', 'function'], desc: "ループ処理を行います(for in do done)。", usage: "for i in a b c; do echo $i; done", examples: [{cmd: "for file in *.txt; do cat $file; done", desc: "txtファイルを順番に処理します"}] },
"if": { cat: 'EXEC', related: ['for', 'function'], desc: "条件分岐を行います(if [ cond ]; then fi)。", usage: "if [ -z \$A ]; then echo a; fi", examples: [{cmd: "if [ 1 = 1 ]; then echo yes; fi", desc: "条件が真の時にコマンドを実行します"}] },
"function": { cat: 'EXEC', related: ['for', 'if'], desc: "カスタムシェル関数を定義します。", usage: "function f() { echo \$1; }", examples: [{cmd: "function greet() { echo \"Hello \$1\"; }", desc: "関数を定義します"}] },

web: { cat: 'UI', related: ['preview', 'theme'], desc: "HTMLファイルなどを画面右側の仮想モニターにマウントして描画します。", usage: "web <file> | web off", examples: [{cmd: "web index.html", desc: "プレビュー画面でindex.htmlを開きます"}, {cmd: "web off", desc: "プレビュー画面を閉じます"}] },
preview: { cat: 'UI', related: ['web'], desc: "HTMLファイルを仮想モニターでプレビューします(webと同じ)。", usage: "preview <file> | preview off", examples: [{cmd: "preview index.html", desc: "プレビューします"}] },
theme: { cat: 'UI', related: ['themes', 'maketheme'], desc: "ターミナルのテーマカラーを変更します。", usage: "theme <name>", examples: [{ cmd: "theme matrix", desc: "テーマをmatrixに変更" }, { cmd: "theme hacker", desc: "Hackerテーマへ" }] },
themes: { cat: 'UI', related: ['theme', 'maketheme'], desc: "利用可能なシステムテーマの一覧を表示します。", usage: "themes", examples: [{cmd: "themes", desc: "一覧を表示します"}] },
edittheme: { cat: 'UI', related: ['theme', 'maketheme', 'rmtheme'], desc: "カスタムテーマを編集します。", usage: "edittheme <key>", examples: [{cmd:"edittheme mytheme", desc: "mythemeを編集する"}] },
        rmtheme: { cat: 'UI', related: ['theme', 'maketheme', 'edittheme'], desc: "カスタムテーマを削除します。", usage: "rmtheme <key>", examples: [{cmd:"rmtheme mytheme", desc: "mythemeを削除する"}] },
        maketheme: { cat: 'UI', related: ['theme', 'themes'], desc: "オリジナルテーマを作成できるウィザードを起動します。", usage: "maketheme", examples: [{ cmd: "maketheme", desc: "対話型でテーマ作成スタート" }] },
lang: { cat: 'UI', related: ['clear'], desc: "システムのUI言語を切り替えます。(日本語/英語)", usage: "lang [ja|en]", examples: [{cmd: "lang ja", desc: "日本語に切り替えます"}] },
clear: { cat: 'UI', related: ['history'], desc: "ターミナルの出力画面をすべてクリアし初期状態に戻します。", usage: "clear", examples: [{ cmd: "clear", desc: "画面のお掃除" }] },

su: { cat: 'SYS', related: ['whoami'], desc: "ユーザー名として表示されるエイリアスを変更します。", usage: "su <username>", examples: [{ cmd: "su admin", desc: "これ以降あなたのユーザー名がadminになります" }] },
whoami: { cat: 'SYS', related: ['su'], desc: "現在のユーザーのハンドルネームを表示します。", usage: "whoami", examples: [{cmd: "whoami", desc: "ユーザー名を表示します"}] },
export: { cat: 'SYS', related: ['env', 'printenv'], desc: "環境変数を設定します。", usage: "export KEY=value", examples: [{ cmd: "export FOO=bar", desc: "FOOにbarを代入" }] },
env: { cat: 'SYS', related: ['export', 'printenv'], desc: "現在設定されている環境変数の一覧を表示します。", usage: "env", examples: [{ cmd: "env", desc: "一覧表示" }] },
printenv: { cat: 'SYS', related: ['export', 'env'], desc: "設定されている環境変数の一覧を表示します。", usage: "printenv", examples: [{cmd: "printenv", desc: "環境変数の一覧を表示します"}] },
alias: { cat: 'SYS', related: ['export', 'ls'], desc: "コマンドのエイリアス(別名)を新しく定義します。", usage: "alias <name>=\"<cmd>\"", examples: [{ cmd: "alias ll=\"ls -l\"", desc: "llでls -lを実行できるようにします。" }, { cmd: "alias", desc: "登録済みの一覧を表示" }] },
history: { cat: 'SYS', related: ['clear'], desc: "これまでに実行したコマンドの履歴を表示します。", usage: "history", examples: [{cmd: "history", desc: "履歴一覧を表示します"}] },
help: { cat: 'SYS', related: [], desc: "ヘルプマニュアルを表示します。コマンド名を指定すると詳細が見れます。", usage: "help [cmd]", examples: [{cmd: "help", desc: "全ての一覧"}, {cmd: "help ls", desc: "lsの詳細"}] }
};

export const defaultHelpsEn: Record<string, HelpInfo> = {
  curl: { cat: 'UTIL', related: ['web', 'cat'], desc: "Downloads and prints the content of a given external URL.", usage: "curl <url>", examples: [{ cmd: "curl https://api.ipify.org", desc: "Fetch and print IP info from the URL" }] },
  task: { cat: 'UI', related: ['schedule'], desc: "Manage and track tasks (ToDo)", usage: "task [ls|add|rm|check|uncheck] [args]", examples: [{cmd:"task add New Task", desc: "Add task"}, {cmd: "task ls", desc: "List tasks"}, {cmd: "task check <id>", desc: "Mark as done"}] },
  schedule: { cat: 'UI', related: ['task'], desc: "Manage and track schedule/events", usage: "schedule [ls|add|rm] [args]", examples: [{cmd:"schedule add 12:00 Meeting", desc: "Add event"}, {cmd: "schedule ls", desc: "List events"}, {cmd: "schedule rm <id>", desc: "Remove event"}] },
  memory: { cat: 'UI', related: [], desc: "Manage AI memory in card format", usage: "memory [ls|add|rm] [args]", examples: [{cmd:"memory add user_pref value", desc: "Add memory"}, {cmd: "memory ls", desc: "List memories"}, {cmd: "memory rm <id>", desc: "Delete memory"}] },
  objective: { cat: 'UI', related: [], desc: "Set core objective/goal for the AI agent", usage: "objective [set|clear] [args]", examples: [{cmd:"objective", desc: "Show current objective"}, {cmd: "objective set Be a history tutor", desc: "Set core objective"}, {cmd: "objective clear", desc: "Clear objective"}] },
        wiki: { cat: 'UI', related: ['help'], desc: "Build or edit the Wiki (help commands).", usage: "wiki [init|edit|rm] <cmd>", examples: [{cmd:"wiki init", desc: "Initializes files into /sys/wiki/"}, {cmd: "wiki edit ls", desc: "Edits the help card for ls"}] },
        startup: { cat: 'UTIL', related: ['web', 'wiki'], desc: "Manage commands executed automatically on shell startups.", usage: "startup [add|rm|edit|clear|run] [args]", examples: [{cmd: "startup", desc: "List registered commands"}, {cmd: "startup add web /bbs.html", desc: "Add web /bbs.html to startup"}, {cmd: "startup rm 1", desc: "Remove 1st command"}] },
  split: { cat: 'UI', related: ['tmux', 'web'], desc: "Splits the screen vertically or horizontally for multiple terminals.", usage: "split [v|h|close]", examples: [{cmd: "split v", desc: "Split vertically"}, {cmd: "split close", desc: "Close split"}] },
  tmux: { cat: 'UI', related: ['split'], desc: "Terminal multiplexer (alias for split).", usage: "tmux [v|h|close]", examples: [{cmd: "tmux h", desc: "Split horizontally"}] },
ls: { 
cat: 'FILE', related: ['cd', 'pwd'], 
desc: "Lists files/folders or thread posts.", 
usage: "ls [dir_or_thread_id]",
options: [
{ opt: '-r', desc: 'Reverse the order when viewing thread posts.' }
],
examples: [
{ cmd: "ls", desc: "List contents of the current directory." },
{ cmd: "ls /scripts", desc: "List contents of a specific directory." },
{ cmd: "ls 1700000000000", desc: "List posts of a specific BBS thread." },
]
},
cd: { 
cat: 'FILE', related: ['ls', 'pwd'], 
desc: "Changes directory or enters a thread context.", 
usage: "cd <path_or_thread_id>",
examples: [
{ cmd: "cd /", desc: "Change to the root directory." },
{ cmd: "cd ..", desc: "Move up one directory." },
{ cmd: "cd 1700000000000", desc: "Enter a thread context for subsequent commands." }
]
},
pwd: { 
cat: 'FILE', related: ['ls', 'cd'], 
desc: "Prints current working directory path.", 
usage: "pwd",
examples: [
{ cmd: "pwd", desc: "Prints the path (e.g. /scripts)." }
]
},
mkdir: { cat: 'FILE', related: ['touch', 'rm'], desc: "Creates a new directory (folder).", usage: "mkdir <folder>", examples: [{ cmd: "mkdir my_folder", desc: "Creates a directory in the current location." }] },
touch: { cat: 'FILE', related: ['mkdir', 'nano'], desc: "Creates an empty file if it doesn't exist.", usage: "touch <file>", examples: [{ cmd: "touch note.txt", desc: "Creates note.txt." }] },
rm: { cat: 'FILE', related: ['mv', 'cp'], desc: "Removes a file or directory.", usage: "rm [-r] <path>", options: [{ opt: "-r", desc: "Recursively remove a directory and its contents." }], examples: [{ cmd: "rm old.txt", desc: "Deletes a file." }, { cmd: "rm -r folder/", desc: "Deletes a folder and all contents." }] },
mv: { cat: 'FILE', related: ['cp', 'rm'], desc: "Moves or renames a file/directory.", usage: "mv <src> <dst>", examples: [{ cmd: "mv old.txt new.txt", desc: "Renames the file." }, { cmd: "mv file.txt folder/", desc: "Moves the file to a folder." }] },
cp: { cat: 'FILE', related: ['mv', 'rm'], desc: "Copies a file.", usage: "cp <src> <dst>", examples: [{ cmd: "cp file1.txt file2.txt", desc: "Copies file1 to file2." }] },
nano: { cat: 'FILE', related: ['edit', 'write', 'cat'], desc: "Opens the text editor in the browser to edit a file.", usage: "nano <file>", examples: [{ cmd: "nano src.js", desc: "Opens the editor." }] },
edit: { cat: 'FILE', related: ['nano', 'write'], desc: "Opens the text editor (alias for nano).", usage: "edit <file>", examples: [{ cmd: "edit src.js", desc: "Opens the editor." }] },
write: { cat: 'FILE', related: ['nano', 'cat'], desc: "Writes text directly to a file, overwriting it.", usage: "write <file> <text>", examples: [{ cmd: "write test.txt Hello", desc: "Writes 'Hello' into test.txt." }] },

threads: { cat: 'BBS', related: ['mkthread', 'read'], desc: "Lists all BBS threads on the server.", usage: "threads [-r]", options:[{opt:"-r", desc:"Reverse sort order (newest first)."}], examples: [{ cmd: "threads", desc: "Lists recent threads." }] },
mkthread: { cat: 'BBS', related: ['threads', 'post'], desc: "Creates a new BBS thread (can also post initial body content).", usage: "mkthread <title> [body]", examples: [{ cmd: "mkthread \"New Topic\"", desc: "Creates a thread with the specified title." }, { cmd: "mkthread \"My Topic\" \"Hello there!\"", desc: "Creates a thread with title and first post body." }] },
post: { cat: 'BBS', related: ['threads', 'read', 'cat'], desc: "Posts a reply to a thread.", usage: "post [id] <msg>", examples: [{ cmd: "post 1700 Hello", desc: "Posts 'Hello' to the specified thread ID." }, {cmd: "post hello", desc: "Posts to the current thread if you're in one."}] },
cat: { cat: 'BBS', related: ['read', 'nano'], desc: "Prints file content or all replies in a thread.", usage: "cat <path_or_id>", examples: [{ cmd: "cat note.txt", desc: "Shows file contents." }, { cmd: "cat 1700", desc: "Shows all posts of the thread." }] },
read: { cat: 'BBS', related: ['cat', 'threads'], desc: "Prints all posts of a BBS thread.", usage: "read <id>", examples: [{ cmd: "read 1700", desc: "Reads thread comments." }] },

sh: { cat: 'EXEC', related: ['js', 'watch'], desc: "Executes a shell script.", usage: "sh <file.sh>", examples: [{ cmd: "sh run.sh", desc: "Runs the shell script." }] },
js: { cat: 'EXEC', related: ['node', 'sh'], desc: "Evaluates JavaScript code.", usage: "js <code>", examples: [{ cmd: "js \"console.log(1+1)\"", desc: "Executes JS and captures output." }] },
node: { cat: 'EXEC', related: ['js'], desc: "Evaluates JavaScript code (alias for js).", usage: "node <code>", examples: [{ cmd: "node app.js", desc: "Executes a JS file." }] },
expr: { cat: 'EXEC', related: ['bc', 'calc'], desc: "Evaluates simple math expressions.", usage: "expr <math>", examples: [{ cmd: "expr 1 + 2", desc: "Calculates addition." }] },
bc: { cat: 'EXEC', related: ['expr', 'calc'], desc: "Evaluates math expressions from stdin or arguments.", usage: "bc <math>", examples: [{ cmd: "echo '1+1' | bc", desc: "Evaluates from stdin." }] },
calc: { cat: 'EXEC', related: ['expr', 'bc'], desc: "Advanced math calculation with variable support.", usage: "calc <math>", examples: [{ cmd: "calc a=5; a*2", desc: "Supports variable assignment." }] },
watch: { cat: 'EXEC', related: ['sh'], desc: "Executes a command periodically.", usage: "watch <sec> <cmd>", examples: [{ cmd: "watch 2 date", desc: "Runs 'date' every 2 seconds." }, { cmd: "watch stops", desc: "Stops the periodic execution." }] },
ai: { cat: 'EXEC', related: ['chat'], desc: "AI automation, interactive chat, or config.", usage: "ai [chat|config|<prompt>]", examples: [{ cmd: "ai config", desc: "Opens API key config dialog." }, { cmd: "ai chat", desc: "Enters interactive chat mode." }, { cmd: "ai create a game", desc: "Prompts the AI." }] },
chat: { cat: 'EXEC', related: ['ai'], desc: "Enters an interactive chat mode with the AI.", usage: "chat", examples: [{ cmd: "chat", desc: "Starts chat mode." }] },

echo: { cat: 'UTIL', related: ['cat'], desc: "Prints text to standard output.", usage: "echo <text>", examples: [{ cmd: "echo Hello World", desc: "Prints 'Hello World'." }, { cmd: "echo text > file.txt", desc: "Writes text to a file." }] },
yes: { cat: 'UTIL', related: ['echo'], desc: "Repeatedly outputs a line until killed.", usage: "yes [text]", examples: [{ cmd: "yes y", desc: "Outputs 'y' infinitely." }] },
seq: { cat: 'UTIL', related: ['echo'], desc: "Prints a sequence of numbers.", usage: "seq <first> <last>", examples: [{ cmd: "seq 1 5", desc: "Outputs numbers from 1 to 5." }] },
head: { cat: 'UTIL', related: ['tail', 'cat'], desc: "Outputs the first part of files.", usage: "head [-n limit] <file>", options:[{opt:"-n", desc:"Number of lines to display."}], examples: [{ cmd: "head -n 5 log.txt", desc: "Outputs the first 5 lines." }] },
tail: { cat: 'UTIL', related: ['head', 'cat'], desc: "Outputs the last part of files.", usage: "tail [-n limit] <file>", options:[{opt:"-n", desc:"Number of lines to extract from the end."}], examples: [{ cmd: "tail -n 10 log.txt", desc: "Extracts the last 10 lines." }] },
grep: { cat: 'UTIL', related: ['awk'], desc: "Prints lines matching a pattern.", usage: "grep [-i] [-v] <pattern> <file>", options: [ { opt: "-i", desc: "Case-insensitive matching." }, { opt: "-v", desc: "Invert match (exclude pattern)." } ], examples: [{ cmd: "grep error log.txt", desc: "Extracts lines containing 'error'." }] },
wc: { cat: 'UTIL', related: ['cat'], desc: "Prints newline, word, and byte counts.", usage: "wc [-l] <file>", options:[{opt:"-l", desc:"Count lines only."}], examples: [{ cmd: "wc log.txt", desc: "Prints file stats." }] },
sleep: { cat: 'UTIL', related: ['watch'], desc: "Delays execution for a specified time.", usage: "sleep <sec>", examples: [{ cmd: "sleep 3; echo 'done'", desc: "Waits 3 seconds then prints text." }] },
reset: { cat: 'UTIL', related: ['clear'], desc: "Resets the terminal display.", usage: "reset", examples: [{ cmd: "reset", desc: "Clears and resets the screen state." }] },
update: { cat: 'UTIL', related: ['reset', 'threads'], desc: "Auto-updates system files from BBS update announcements.", usage: "update", examples: [{cmd: "update", desc: "Checks and downloads file updates from the BBS."}] },
sort: { cat: 'UTIL', related: ['uniq'], desc: "Sorts lines of text files.", usage: "sort [-r|-n] <file>", options:[{opt:"-r",desc:"Reverse order."},{opt:"-n",desc:"Numeric sort."}], examples: [{ cmd: "sort log.txt", desc: "Sorts alphabetically." }] },
uniq: { cat: 'UTIL', related: ['sort'], desc: "Removes consecutive duplicate lines.", usage: "uniq [-c] <file>", options:[{opt:"-c",desc:"Count occurrences."}], examples: [{ cmd: "sort file | uniq", desc: "Sorts then removes duplicates." }] },
rev: { cat: 'UTIL', related: ['cat'], desc: "Reverses characters in each line.", usage: "rev <file>", examples: [{ cmd: "echo 'hello' | rev", desc: "Outputs 'olleh'." }] },
shuf: { cat: 'UTIL', related: ['sort'], desc: "Generates random permutations of lines.", usage: "shuf <file>", examples: [{ cmd: "shuf items.txt", desc: "Shuffles the output lines." }] },
base64: { cat: 'UTIL', related: ['cat'], desc: "Base64 encodes or decodes data.", usage: "base64 [-d] <file>", options: [{opt: "-d", desc: "Decode base64 string."}], examples: [{ cmd: "echo 'hey' | base64", desc: "Encodes to base64." }, { cmd: "echo 'aGV5Cg==' | base64 -d", desc: "Decodes to original text." }] },
cowsay: { cat: 'UTIL', related: ['fortune'], desc: "Generates an ASCII art speaking cow.", usage: "cowsay <text>", examples: [{ cmd: "cowsay moo", desc: "Cow says moo." }] },
fortune: { cat: 'UTIL', related: ['cowsay'], desc: "Prints a random adage or quote.", usage: "fortune", examples: [{ cmd: "fortune", desc: "Shows a random quote." }] },
date: { cat: 'UTIL', related: ['uptime'], desc: "Prints the system date and time.", usage: "date", examples: [{ cmd: "date", desc: "Shows current local time." }] },
uptime: { cat: 'UTIL', related: ['date'], desc: "Tells you how long the system has been running.", usage: "uptime", examples: [{ cmd: "uptime", desc: "Shows uptime duration." }] },
xargs: { cat: 'UTIL', related: ['echo'], desc: "Builds and executes command lines from stdin.", usage: "xargs <cmd>", examples: [{ cmd: "echo 'f1.txt f2.txt' | xargs rm", desc: "Passes files to rm." }] },
awk: { cat: 'UTIL', related: ['grep'], desc: "Pattern scanning and processing language.", usage: "awk '<prog>' <file>", examples: [{ cmd: "awk '{print $1}' log.txt", desc: "Extracts the first word of each line." }] },
dir: { cat: 'UTIL', related: ['ls'], desc: "Lists directory contents (alias for ls).", usage: "dir [path]", examples: [{ cmd: "dir", desc: "Lists current directory contents." }] },

exit: { cat: 'SYS', related: ['quit', 'clear'], desc: "Exits interactive modes (e.g. AI chat).", usage: "exit", examples: [{ cmd: "exit", desc: "Ends the current session." }] },
quit: { cat: 'SYS', related: ['exit'], desc: "Exits interactive modes (alias for exit).", usage: "quit", examples: [{ cmd: "quit", desc: "Ends the current session." }] },

"for": { cat: 'EXEC', related: ['if', 'function'], desc: "Loop construct (for in do done).", usage: "for i in a b c; do echo $i; done", examples: [{ cmd: "for file in *.txt; do cat $file; done", desc: "Processes text files." }] },
"if": { cat: 'EXEC', related: ['for', 'function'], desc: "Conditional construct (if [ cond ]; then fi).", usage: "if [ -z \$A ]; then echo a; fi", examples: [{ cmd: "if [ 1 = 1 ]; then echo yes; fi", desc: "Executes if truthy." }] },
"function": { cat: 'EXEC', related: ['for', 'if'], desc: "Defines a custom shell function.", usage: "function f() { echo \$1; }", examples: [{ cmd: "function greet() { echo \"Hello \$1\"; }", desc: "Defines a function." }] },

web: { cat: 'UI', related: ['preview', 'theme'], desc: "Mounts HTML to the virtual monitor.", usage: "web <file> | web off", examples: [{ cmd: "web index.html", desc: "Opens file in preview." }, { cmd: "web off", desc: "Closes the preview." }] },
preview: { cat: 'UI', related: ['web'], desc: "Mounts HTML to virtual monitor (alias for web).", usage: "preview <file> | preview off", examples: [{ cmd: "preview index.html", desc: "Previews the file." }] },
theme: { cat: 'UI', related: ['themes', 'maketheme'], desc: "Changes the terminal UI theme color.", usage: "theme <name>", examples: [{ cmd: "theme matrix", desc: "Switches to Matrix theme." }, { cmd: "theme hacker", desc: "Switches to Hacker theme." }] },
themes: { cat: 'UI', related: ['theme', 'maketheme'], desc: "Shows available terminal themes.", usage: "themes", examples: [{ cmd: "themes", desc: "Lists all themes." }] },
edittheme: { cat: 'UI', related: ['theme', 'maketheme', 'rmtheme'], desc: "Edit custom theme.", usage: "edittheme <key>", examples: [{cmd:"edittheme mytheme", desc: "Edit mytheme"}] },
        rmtheme: { cat: 'UI', related: ['theme', 'maketheme', 'edittheme'], desc: "Delete custom theme.", usage: "rmtheme <key>", examples: [{cmd:"rmtheme mytheme", desc: "Delete mytheme"}] },
        maketheme: { cat: 'UI', related: ['theme', 'themes'], desc: "Starts interactive theme creator wizard.", usage: "maketheme", examples: [{ cmd: "maketheme", desc: "Starts the builder." }] },
lang: { cat: 'UI', related: ['clear'], desc: "Switches system language (ja or en).", usage: "lang [ja|en]", examples: [{ cmd: "lang en", desc: "Switches to English." }] },
clear: { cat: 'UI', related: ['history'], desc: "Clears terminal output screen.", usage: "clear", examples: [{ cmd: "clear", desc: "Cleans the terminal screen." }] },

su: { cat: 'SYS', related: ['whoami'], desc: "Changes the alias displayed for your user.", usage: "su <username>", examples: [{ cmd: "su admin", desc: "Changes your username to admin." }] },
whoami: { cat: 'SYS', related: ['su'], desc: "Prints the active user handle.", usage: "whoami", examples: [{ cmd: "whoami", desc: "Prints your name." }] },
export: { cat: 'SYS', related: ['env', 'printenv'], desc: "Sets environment variable.", usage: "export KEY=value", examples: [{ cmd: "export FOO=bar", desc: "Sets FOO to bar." }] },
env: { cat: 'SYS', related: ['export', 'printenv'], desc: "Prints all set environment variables.", usage: "env", examples: [{ cmd: "env", desc: "Prints variables." }] },
printenv: { cat: 'SYS', related: ['export', 'env'], desc: "Prints environment variables.", usage: "printenv", examples: [{ cmd: "printenv", desc: "Prints variables." }] },
alias: { cat: 'SYS', related: ['export', 'ls'], desc: "Defines a new command alias.", usage: "alias <name>=\"<cmd>\"", examples: [{ cmd: "alias ll=\"ls -l\"", desc: "Maps ll to ls -l." }, { cmd: "alias", desc: "Lists registered aliases." }] },
history: { cat: 'SYS', related: ['clear'], desc: "Prints standard command history.", usage: "history", examples: [{ cmd: "history", desc: "Shows previous commands." }] },
help: { cat: 'SYS', related: [], desc: "Prints help manual.", usage: "help [cmd]", examples: [{ cmd: "help", desc: "Shows index." }, { cmd: "help ls", desc: "Shows details for ls." }] }
};


async function executeCommand(cmd: string, args: string[], stdin: string[], username: string, apiFuncs: any): Promise<any[]> {
  const t = locales[apiFuncs.getLang() as keyof typeof locales];
  
  if (cmd !== 'help' && (args.includes('-h') || args.includes('--help'))) {
    return executeCommand('help', [cmd], stdin, username, apiFuncs);
  }

  switch (cmd) {
    case 'curl': {
      const url = args[0];
      if (!url) {
        return ["curl: usage: curl <url>"];
      }
      try {
        const response = await fetch(url);
        if (!response.ok) {
          return [`curl: error: HTTP status ${response.status} ${response.statusText}`];
        }
        const text = await response.text();
        return text.split('\n');
      } catch (err: any) {
        return [`curl: error fetching URL (CORS restriction or network error): ${err.message || String(err)}`];
      }
    }
    case 'echo':
      return args.join(' ').split('\n');
    case 'yes':
      const text = args.length > 0 ? args.join(' ') : 'y';
      return Array(1000).fill(text);
    case 'seq': {
      const start = args.length > 1 ? parseInt(args[0]) : 1;
      const end = args.length > 1 ? parseInt(args[1]) : parseInt(args[0]);
      if (isNaN(start) || isNaN(end)) return ["seq: invalid arguments"];
      const count = Math.min(Math.abs(end - start) + 1, 5000);
      const dir = start <= end ? 1 : -1;
      return Array.from({ length: count }, (_, i) => String(start + i * dir));
    }
    case 'head': {
      let n = 10;
      if (args[0] === '-n') n = parseInt(args[1]) || 10;
      else if (args[0] && args[0].match(/^-\d+$/)) n = parseInt(args[0].substring(1));
      return stdin.slice(0, n);
    }
    case 'tail': {
      let tn = 10;
      if (args[0] === '-n') tn = parseInt(args[1]) || 10;
      else if (args[0] && args[0].match(/^-\d+$/)) tn = parseInt(args[0].substring(1));
      return stdin.slice(-tn);
    }
    case 'grep': {
      let flagI = false;
      let flagV = false;
      let pattern = "";
      let srcFile = "";
      const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
      const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      
      for (const a of args) {
        if (a === '-i') flagI = true;
        else if (a === '-v') flagV = true;
        else if (!pattern) pattern = a;
        else if (!srcFile) srcFile = a;
      }
      if (!pattern) return [`grep: missing pattern`];
      
      let linesInput = stdin;
      if (srcFile) {
        const resolved = resolvePath(currentDir, srcFile);
        if (vfsObj[resolved] && vfsObj[resolved].type === 'file') {
          linesInput = (vfsObj[resolved].content || "").split('\n');
        } else {
          return [`grep: ${srcFile}: No such virtual file`];
        }
      }
      
      try {
        const rx = new RegExp(pattern, flagI ? "i" : "");
        return linesInput.filter(line => flagV ? !rx.test(line) : rx.test(line));
      } catch (e: any) {
        return [`grep: invalid regex`];
      }
    }
    case 'wc': {
      let wcL = false, wcW = false, wcC = false;
      let targetFile = "";
      const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
      const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      
      const cleanArgs = args.filter(a => {
        if (a === '-l' || a === 'l') { wcL = true; return false; }
        if (a === '-w' || a === 'w') { wcW = true; return false; }
        if (a === '-c' || a === 'c') { wcC = true; return false; }
        return true;
      });
      
      let linesInput = stdin;
      if (cleanArgs.length > 0) {
        const resolved = resolvePath(currentDir, cleanArgs[0]);
        if (vfsObj[resolved] && vfsObj[resolved].type === 'file') {
          linesInput = (vfsObj[resolved].content || "").split('\n');
          targetFile = cleanArgs[0];
        }
      }
      
      if (!wcL && !wcW && !wcC) wcL = wcW = wcC = true;
      const lineCount = linesInput.length;
      const wordCount = linesInput.reduce((acc, line) => acc + line.split(/\s+/).filter(Boolean).length, 0);
      const charCount = linesInput.reduce((acc, line) => acc + line.length + 1, 0);
      let wcRes = [];
      if (wcL) wcRes.push(lineCount);
      if (wcW) wcRes.push(wordCount);
      if (wcC) wcRes.push(charCount);
      if (targetFile) wcRes.push(targetFile);
      return [wcRes.join("\t")];
    }
    case 'sleep': {
      const sec = parseFloat(args[0]) || 0;
      await new Promise(r => setTimeout(r, Math.min(sec, 10) * 1000));
      return stdin;
    }
    case 'reset': {
      apiFuncs.resetLocalData();
      return [];
    }
    case 'update': {
      const isJa = apiFuncs.getLang() === 'ja';
      try {
        const threads = await apiFuncs.fetchThreads();
        const updateThreads = threads.filter((t: any) => 
          t.title.includes('【システム配信】') || 
          t.title.toLowerCase().includes('system updates')
        );

        if (updateThreads.length === 0) {
          return [isJa ? "システム配信スレッドが見つかりませんでした。" : "No system update threads found on BBS."];
        }

        const mergeAgentMd = (local: string, incoming: string): string => {
          const splitIdx = incoming.search(/## 🎭/);
          const base = splitIdx !== -1 ? incoming.substring(0, splitIdx) : incoming;
          const localMatch = local.match(/(## 🎭[\s\S]*)/);
          const incomingMatch = incoming.match(/(## 🎭[\s\S]*)/);
          let custom = "";
          if (localMatch && localMatch[1]) {
            custom = localMatch[1];
          } else if (incomingMatch && incomingMatch[1]) {
            custom = incomingMatch[1];
          } else {
            custom = "## 🎭 カスタムキャラクター・指示\n(以下に自由に追加ルールやキャラクター設定を書いてください)\n- ";
          }
          return base.trim() + "\n\n" + custom.trim() + "\n";
        };

        let updatedFiles: string[] = [];
        const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
        const newVfs = { ...vfsObj };

        // Get last applied update timestamp
        let lastAppliedTime = 0;
        const statusFile = newVfs['/sys/update_status.json'];
        if (statusFile && statusFile.content) {
          try {
            const statusData = JSON.parse(statusFile.content);
            if (statusData.lastAppliedTimestamp) {
              lastAppliedTime = new Date(statusData.lastAppliedTimestamp).getTime();
            }
          } catch (e) {
            console.warn("Failed to parse update_status.json", e);
          }
        }

        let maxAppliedTime = lastAppliedTime;
        let maxAppliedTimestamp = "";

        for (const thread of updateThreads) {
          const posts = await apiFuncs.fetchPosts(thread.id);
          
          // Sort posts chronologically to apply them in correct order
          const sortedPosts = [...posts].sort((a: any, b: any) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

          for (const post of sortedPosts) {
            if (!post.author || !post.author.includes('◆SysAdminTrip')) {
              continue;
            }

            const postTime = new Date(post.timestamp).getTime();
            if (postTime <= lastAppliedTime) {
              continue; // Skip already applied updates
            }

            const regex = /<update\s+path="([^"]+)">([\s\S]*?)<\/update>/g;
            let match;
            let postHasUpdates = false;

            while ((match = regex.exec(post.content)) !== null) {
              const filePath = match[1];
              const fileContent = match[2];
              
              const normalizedPath = filePath.startsWith('/') ? filePath : '/' + filePath;
              const parent = normalizedPath.split('/').slice(0, -1).join('/') || '/';
              
              if (parent !== '/') {
                const parts = parent.split('/').filter(p => p);
                let currentPath = "";
                for (const part of parts) {
                  currentPath += "/" + part;
                  if (!newVfs[currentPath]) {
                    newVfs[currentPath] = { type: 'dir' };
                  }
                }
              }

              if (normalizedPath.toLowerCase() === '/agent.md' && newVfs[normalizedPath] && newVfs[normalizedPath].content) {
                newVfs[normalizedPath] = { 
                  type: 'file', 
                  content: mergeAgentMd(newVfs[normalizedPath].content, fileContent) 
                };
              } else {
                newVfs[normalizedPath] = { type: 'file', content: fileContent };
              }
              updatedFiles.push(normalizedPath);
              postHasUpdates = true;
            }

            if (postHasUpdates) {
              if (postTime > maxAppliedTime) {
                maxAppliedTime = postTime;
                maxAppliedTimestamp = post.timestamp;
              }
            }
          }
        }

        if (updatedFiles.length > 0) {
          if (!newVfs['/sys']) {
            newVfs['/sys'] = { type: 'dir' };
          }
          newVfs['/sys/update_status.json'] = {
            type: 'file',
            content: JSON.stringify({ lastAppliedTimestamp: maxAppliedTimestamp }, null, 2)
          };

          apiFuncs.setVFS(newVfs);
          return [
            isJa 
              ? `✨ システムアップデートが完了しました！以下のファイルが更新されました：\n` + updatedFiles.map(f => `  - ${f}`).join('\n')
              : `✨ System update completed! The following files have been updated:\n` + updatedFiles.map(f => `  - ${f}`).join('\n')
          ];
        } else {
          return [isJa ? "適用可能な新しいアップデートはありませんでした。" : "No new updates found to apply."];
        }
      } catch (e: any) {
        return [`update error: ${e.message || String(e)}`];
      }
    }
    case 'sort': {
      let sortR = false, sortN = false;
      args.forEach(a => {
        if (a === '-r') sortR = true;
        if (a === '-n') sortN = true;
      });
      return stdin.slice().sort((a, b) => {
        let cmp = 0;
        if (sortN) cmp = (parseFloat(a) || 0) - (parseFloat(b) || 0);
        else cmp = a.localeCompare(b);
        return sortR ? -cmp : cmp;
      });
    }
    case 'uniq': {
      let uniqC = false;
      args.forEach(a => { if (a === '-c') uniqC = true; });
      if (!uniqC) return stdin.filter((v, i, a) => i === 0 || v !== a[i - 1]);
      
      const resCount: string[] = [];
      let count = 0;
      let currentUniq = "";
      for (let i = 0; i < stdin.length; i++) {
         if (i === 0) { currentUniq = stdin[i]; count = 1; }
         else if (stdin[i] === currentUniq) { count++; }
         else {
            resCount.push(`${count.toString().padStart(7)} ${currentUniq}`);
            currentUniq = stdin[i]; count = 1;
         }
      }
      if (stdin.length > 0) resCount.push(`${count.toString().padStart(7)} ${currentUniq}`);
      return resCount;
    }
    case 'expr': {
      let expression = args.join(' ').trim();
      if (!expression && stdin.length > 0) {
        expression = stdin.join(' ').trim();
      }
      if (!expression) return ["expr: missing expression"];
      
      try {
        const cleanExpr = expression
          .replace(/\\/g, '')
          .replace(/times/g, '*')
          .replace(/div/g, '/');

        const fn = new Function(`return (${cleanExpr})`);
        const result = fn();
        return [String(result)];
      } catch (err: any) {
        return [`expr: syntax error in expression "${expression}"` + (err ? `: ${err.message}` : '')];
      }
    }
    case 'bc': {
      let inputs: string[] = [];
      if (args.length > 0) {
        const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
        const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
        const firstArgResolved = resolvePath(currentDir, args[0]);
        if (vfsObj[firstArgResolved] && vfsObj[firstArgResolved].type === 'file') {
          inputs = (vfsObj[firstArgResolved].content || "").split('\n').filter(Boolean);
        } else {
          inputs = [args.join(' ')];
        }
      } else if (stdin.length > 0) {
        inputs = stdin;
      } else {
        return ["bc: waiting for stdin, run with piped input or passing equation. E.g. echo '1.5 * 3' | bc"];
      }

      const results: string[] = [];
      let scale = 2;
      for (const rawLine of inputs) {
        const line = rawLine.trim();
        if (!line) continue;
        
        const scaleMatch = line.match(/^scale\s*=\s*(\d+)$/i);
        if (scaleMatch) {
          scale = parseInt(scaleMatch[1]);
          continue;
        }

        const cleanExpr = line.replace(/\\/g, ''); 
        
        try {
          const val = new Function(`return (${cleanExpr})`)();
          if (typeof val === 'number') {
            if (Number.isInteger(val)) {
              results.push(String(val));
            } else {
              results.push(String(parseFloat(val.toFixed(scale))));
            }
          } else if (val !== undefined) {
            results.push(String(val));
          }
        } catch (err) {
          results.push(`(bc: error evaluating "${line}")`);
        }
      }
      return results;
    }
    case 'calc': {
      let expression = args.join(' ').trim();
      if (!expression && stdin.length > 0) {
        expression = stdin.join(' ').trim();
      }

      const isJa = apiFuncs.getLang() === 'ja';

      if (!expression) {
        const activeVars = Object.entries(calcStore.vars).filter(([k]) => k !== 'PI' && k !== 'E');
        const activeFuncs = Object.entries(calcStore.funcs);

        return [
          <div key="calc-help" className="font-sans text-xs text-zinc-300 bg-zinc-950/45 p-3 rounded border border-zinc-900 space-y-2">
            <div>
              <p className="font-bold text-teal-400">{isJa ? "🔢 高機能電卓プログラム (calc)" : "🔢 Advanced Calculator Program (calc)"}</p>
              <p className="text-zinc-400">{isJa ? "数式の計算に加え、変数への代入やユーザー定義関数の割り当て・永続保存が可能です。" : "Supports mathematical computations, persistent variables, or custom math function definitions."}</p>
              <p className="mt-1 text-zinc-400">{isJa ? "使い方: calc <数式 / 変数代入 / 関数定義>" : "Usage: calc <math_expr / var_assignment / func_definition>"}</p>
            </div>
            <div className="border-t border-zinc-900/60 pt-1">
              <p className="font-semibold text-teal-300">{isJa ? "📐 数式の計算例" : "📐 Math Calculation Examples"}</p>
              <ul className="list-disc pl-4 space-y-0.5 text-zinc-400 font-mono">
                <li>calc "12.5 * 8 - 4"</li>
                <li>calc "sqrt(16) + PI * sin(PI / 2)"</li>
              </ul>
            </div>
            <div className="border-t border-zinc-900/60 pt-1">
              <p className="font-semibold text-teal-300">{isJa ? "💾 永続変数の定義・計算例" : "💾 Persistent Variables Examples"}</p>
              <ul className="list-disc pl-4 space-y-0.5 text-zinc-400 font-mono">
                <li>calc "x = 42"</li>
                <li>calc "y = x * 2"</li>
                <li>calc "y + 8"</li>
              </ul>
            </div>
            <div className="border-t border-zinc-900/60 pt-1">
              <p className="font-semibold text-teal-300">{isJa ? "🔮 ユーザー定義関数の例" : "🔮 Custom Function Definition Examples"}</p>
              <ul className="list-disc pl-4 space-y-0.5 text-zinc-400 font-mono">
                <li>calc "f(x) = x * x + 2"</li>
                <li>calc "f(5) * 10"</li>
                <li>calc "area(w, h) = w * h"</li>
              </ul>
            </div>
            <div className="border-t border-zinc-900/60 pt-1">
              <p className="font-semibold text-zinc-400">{isJa ? "🧹 メモリのクリア:" : "🧹 Memory Reset:"}</p>
              <p className="text-zinc-500 font-mono pl-4">calc clear {isJa ? "(定義されたすべての変数/関数を消去します)" : "(clears all defined variables/functions)"}</p>
            </div>

            {(activeVars.length > 0 || activeFuncs.length > 0) && (
              <div className="border-t border-teal-950/50 pt-2 mt-1 bg-teal-950/10 p-2 rounded">
                <p className="font-semibold text-cyan-400">{isJa ? "📊 現在登録されているメモリ状況:" : "📊 Current Memory Registered:"}</p>
                {activeVars.length > 0 && (
                  <div className="mt-1">
                    <span className="text-zinc-400 font-sans font-medium">{isJa ? "【定義済み変数】" : "【Variables】"}</span>
                    <ul className="pl-4 list-disc text-zinc-400 font-mono">
                      {activeVars.map(([k, v]) => <li key={`var-${k}`}>{k} = <span className="text-white font-semibold">{String(v)}</span></li>)}
                    </ul>
                  </div>
                )}
                {activeFuncs.length > 0 && (
                  <div className="mt-1">
                    <span className="text-zinc-400 font-sans font-medium">{isJa ? "【ユーザー定義関数】" : "【Custom Functions】"}</span>
                    <ul className="pl-4 list-disc text-zinc-400 font-mono">
                      {activeFuncs.map(([k, f]) => <li key={`func-${k}`}>{k}({f.params.join(', ')}) = <span className="text-white font-semibold">{f.body}</span></li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ];
      }

      const normalizedExpr = expression.toLowerCase();
      if (normalizedExpr === 'clear' || normalizedExpr === 'reset' || normalizedExpr === 'clean' || normalizedExpr === '--clear') {
        calcStore = {
          vars: { PI: Math.PI, E: Math.E },
          funcs: {}
        };
        return [isJa ? "🧹 電卓のカスタム変数と関数をすべて消去（初期化）しました。" : "🧹 Cleared all custom variables and functions in calculator memory."];
      }

      // 1. Check if it's a Custom Function Definition: f(x) = x * x or area(w, h) = w * h
      const funcMatch = expression.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*=\s*(.+)$/);
      if (funcMatch) {
        const funcName = funcMatch[1];
        const paramStr = funcMatch[2];
        const bodyValue = funcMatch[3];

        if (typeof (Math as any)[funcName] === 'function') {
          return [`calc: "${funcName}" is a built-in standard Math function and cannot be redefined.`];
        }

        const params = paramStr.split(',').map(p => p.trim()).filter(Boolean);
        calcStore.funcs[funcName] = { params, body: bodyValue };

        return [
          <div key="calc-func-def" className="font-mono text-cyan-400 text-sm py-1">
            🚀 {isJa ? "関数を定義しました:" : "Custom Function Defined:"} <span className="font-bold text-white">{funcName}({params.join(', ')})</span> = <span className="text-gray-300 font-semibold">{bodyValue}</span>
          </div>
        ];
      }

      // 2. Check if it's a Variable Assignment: x = 15 or const y = 2 * PI
      const assignMatch = expression.match(/^(?:let|const|var)?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (assignMatch) {
        const varName = assignMatch[1];
        const rhs = assignMatch[2];

        if (varName === 'PI' || varName === 'E' || typeof (Math as any)[varName] === 'function') {
          return [`calc: "${varName}" is a reserved standard math symbol and cannot be overwritten.`];
        }

        try {
          const unpackedMath = Object.getOwnPropertyNames(Math)
            .map(p => `const ${p} = Math.${p};`)
            .join('\n');

          const unpackedVars = Object.entries(calcStore.vars)
            .map(([k, v]) => `const ${k} = ${JSON.stringify(v)};`)
            .join('\n');

          const unpackedFuncs = Object.entries(calcStore.funcs)
            .map(([k, f]) => `const ${k} = (${f.params.join(', ')}) => { return (${f.body}); };`)
            .join('\n');

          const runCode = `
            ${unpackedMath}
            ${unpackedVars}
            ${unpackedFuncs}
            return (${rhs});
          `;

          const val = new Function(runCode)();
          calcStore.vars[varName] = val;

          return [
            <div key="calc-var-def" className="font-mono text-emerald-400 text-sm py-1">
              💾 {isJa ? "変数を保存しました:" : "Variable Saved:"} <span className="font-bold text-white">{varName}</span> = <span className="text-white font-bold">{String(val)}</span>
            </div>
          ];
        } catch (err: any) {
          return [`calc: Error evaluating assignment right-hand side "${rhs}": ${err.message || String(err)}`];
        }
      }

      // 3. Regular Expression Calculation (evaluate mathematical expression in the custom state scope)
      try {
        const unpackedMath = Object.getOwnPropertyNames(Math)
          .map(p => `const ${p} = Math.${p};`)
          .join('\n');

        const unpackedVars = Object.entries(calcStore.vars)
          .map(([k, v]) => `const ${k} = ${JSON.stringify(v)};`)
          .join('\n');

        const unpackedFuncs = Object.entries(calcStore.funcs)
          .map(([k, f]) => `const ${k} = (${f.params.join(', ')}) => { return (${f.body}); };`)
          .join('\n');

        const runCode = `
          ${unpackedMath}
          ${unpackedVars}
          ${unpackedFuncs}
          return (${expression});
        `;

        const val = new Function(runCode)();
        if (typeof val === 'number') {
          return [
            <div key="calc-res" className="font-mono text-emerald-400 text-sm py-1">
              ✨ {expression} = <span className="font-bold underline decoration-dotted text-white">{String(val)}</span>
            </div>
          ];
        }
        return [typeof val === 'object' ? JSON.stringify(val) : String(val)];
      } catch (err: any) {
        return [`calc: Error trying to evaluate math expression "${expression}"` + (err ? `: ${err.message}` : '')];
      }
    }
    case 'rev':
      if (stdin.length) return stdin.map(l => l.split('').reverse().join(''));
      return [args.join(' ').split('').reverse().join('')];
    case 'shuf':
      return stdin.slice().sort(() => Math.random() - 0.5);
    case 'base64':
      try {
        if (args[0] === '-d') {
          const src = stdin.length ? stdin.join('') : args.slice(1).join('');
          return [atob(src)];
        }
        const src = stdin.length ? stdin.join('\n') : args.join(' ');
        return [btoa(src)];
      } catch(e) { return ["base64: invalid input"]; }
    case 'cowsay':
      const cowMsg = stdin.length ? stdin.join('\n') : args.join(' ');
      if (!cowMsg) return [];
      const lines = cowMsg.split('\n');
      const maxLen = Math.max(...lines.map(l => l.length));
      const top = ` ${"_".repeat(maxLen + 2)}`;
      const bot = ` ${"-".repeat(maxLen + 2)}`;
      const cow = lines.map(l => `< ${l.padEnd(maxLen)} >`);
      return [
        top,
        ...cow,
        bot,
        `        \\   ^__^`,
        `         \\  (oo)\\_______`,
        `            (__)\\       )\\/\\`,
        `                ||----w |`,
        `                ||     ||`
      ];
    case 'fortune':
      if (Math.random() > 0.4) {
          const adj = FORTUNE_WORDS.adjectives[Math.floor(Math.random() * FORTUNE_WORDS.adjectives.length)];
          const noun = FORTUNE_WORDS.nouns[Math.floor(Math.random() * FORTUNE_WORDS.nouns.length)];
          const pred = FORTUNE_WORDS.predicates[Math.floor(Math.random() * FORTUNE_WORDS.predicates.length)];
          const name = FORTUNE_WORDS.names[Math.floor(Math.random() * FORTUNE_WORDS.names.length)];
          return [`${adj}${noun}${pred} - ${name}`];
      }
      return [FORTUNES[Math.floor(Math.random() * FORTUNES.length)]];
    case 'date':
      return [new Date().toString()];
    case 'uptime':
      const up = Math.floor((Date.now() - START_TIME) / 1000);
      return [`up ${up} seconds`];
    case 'export':
      if (args.length === 0) {
         const currentEnv = apiFuncs.getAllEnv();
         return Object.entries(currentEnv).map(([k, v]) => `${k}="${v}"`);
      }
      for (const arg of args) {
         const match = arg.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/);
         if (match) {
            apiFuncs.setEnv(match[1], match[2]);
         } else {
            return [`export: invalid format: ${arg}`];
         }
      }
      return [];
    case 'env':
    case 'printenv':
      return Object.entries(apiFuncs.getAllEnv()).map(([k, v]) => `${k}=${v}`);
    case 'ai':
    case 'chat': {
      if (args.length > 0 && (args[0] === 'settings' || args[0] === 'config')) {
        if (apiFuncs.openAISettings) {
          apiFuncs.openAISettings();
        }
        return [];
      }
      if (args.length === 0 && stdin.length === 0) {
        apiFuncs.startAgentMode();
        return apiFuncs.getLang() === 'ja'
          ? [
              "=== AIエージェント対話モードを開始しました ===",
              "シェルに関する指示を日本語で入力してください。AIが適切なコマンドを作成し自動実行します。",
              "例: '新規スレッド「雑談」を作成して、そのあとスレッドの一覧を見せて'",
              "※終了するには 'exit' または 'quit' と入力してください。"
            ]
          : [
              "=== AI Agent Interactive Mode Started ===",
              "Please enter your instructions in natural language.",
              "AI will automatically write and execute terminal commands to achieve them.",
              "Example: 'Create a thread named General and list all threads'",
              "※Type 'exit' or 'quit' to end the interactive agent session."
            ];
      }

      const promptText = args.join(' ');
      const fullPrompt = stdin.length > 0 ? "Context from stdin:\n" + stdin.join('\n') + "\n\nQuery:\n" + promptText : promptText;

      // Single run in agent loop
      await executeAgentLoop(fullPrompt, apiFuncs, username, []);
      return [];
    }
    case 'history':
      return apiFuncs.getHistory().map((cmd: string, i: number) => ` ${i+1}\t${cmd}`);
    case 'lang':
      if (args[0] === 'en' || args[0] === 'ja') {
          apiFuncs.setLang(args[0]);
          return locales[args[0] as 'ja'|'en'].langSet ? [locales[args[0] as 'ja'|'en'].langSet] : [];
      }
      return [`${t.usage}: lang <ja|en>`];

    case 'xargs':
      let replaceStr = '';
      let subCmdArgs = [...args];
      if (args[0] === '-I') {
        replaceStr = args[1];
        subCmdArgs = args.slice(2);
      }
      if (subCmdArgs.length === 0) return ["xargs: missing command"];
      
      const subCmd = subCmdArgs.join(' ');
      const results = [];
      for (let i=0; i<stdin.length; i++) {
         const line = stdin[i];
         let lineCommand = '';
         if (replaceStr) {
            lineCommand = subCmdArgs.map(a => {
               if (a.includes(replaceStr)) {
                  return "'" + a.replace(replaceStr, line.replace(/'/g, "\\'")) + "'";
               }
               return a;
            }).join(' ');
         } else {
            lineCommand = subCmd + " '" + line.replace(/'/g, "\\'") + "'";
         }
         const res = await apiFuncs.executeNested(lineCommand);
         results.push(...res);
      }
      return results;
      
    case 'awk':
       if (args[0] && args[0].includes('print')) {
           const match = args[0].match(/\$(\d+)/);
           if (match) {
               const idx = parseInt(match[1]) - 1;
               return stdin.map(line => line.split(/\s+/)[idx] || '');
           }
       }
       return stdin;
       
    case 'pwd':
      return [apiFuncs.getCWD ? apiFuncs.getCWD() : "/"];

    case 'mkdir': {
      if (args.length === 0) return ["mkdir: missing operand"];
      const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
      const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      const results: string[] = [];
      
      for (const arg of args) {
        const resolved = resolvePath(currentDir, arg);
        const parent = resolved.split('/').slice(0, -1).join('/') || '/';
        if (!vfsObj[parent] && parent !== '/') {
          results.push(`mkdir: cannot create directory '${arg}': Parent directory does not exist`);
          continue;
        }
        if (vfsObj[resolved]) {
          results.push(`mkdir: cannot create directory '${arg}': File or directory already exists`);
          continue;
        }
        apiFuncs.setVFS((prev: any) => ({
          ...prev,
          [resolved]: { type: 'dir' }
        }));
      }
      return results;
    }

    case 'touch': {
      if (args.length === 0) return ["touch: missing file operand"];
      const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
      
      for (const arg of args) {
        const resolved = resolvePath(currentDir, arg);
         apiFuncs.setVFS((prev: any) => {
           if (prev[resolved]) return prev;
           return {
             ...prev,
             [resolved]: { type: 'file', content: '' }
           };
         });
      }
      return [];
    }

    case 'rm': {
      if (args.length === 0) return ["rm: missing operand"];
      const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
      const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      let recursive = false;
      let targetPaths: string[] = [];
      
      for (const arg of args) {
        if (arg === '-r' || arg === '-rf') {
          recursive = true;
        } else {
          targetPaths.push(arg);
        }
      }
      
      if (targetPaths.length === 0) return ["rm: missing operand"];
      const results: string[] = [];
      
      for (const rawPath of targetPaths) {
        const resolved = resolvePath(currentDir, rawPath);
        const item = vfsObj[resolved];
        if (!item) {
          results.push(`rm: cannot remove '${rawPath}': No such file or directory`);
          continue;
        }
        
        if (item.type === 'dir' && !recursive) {
          results.push(`rm: cannot remove '${rawPath}': Is a directory (use -r)`);
          continue;
        }
        
        apiFuncs.setVFS((prev: any) => {
          const next = { ...prev };
          delete next[resolved];
          if (recursive && item.type === 'dir') {
            const prefix = resolved === '/' ? '/' : resolved + '/';
            for (const key of Object.keys(next)) {
              if (key.startsWith(prefix)) {
                delete next[key];
              }
            }
          }
          return next;
        });
      }
      return results;
    }

    case 'mv': {
      if (args.length < 2) return ["mv: missing file operand"];
      const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
      const src = resolvePath(currentDir, args[0]);
      const dest = resolvePath(currentDir, args[1]);
      const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      
      const item = vfsObj[src];
      if (!item) return [`mv: cannot stat '${args[0]}': No such file or directory`];
      
      let finalDest = dest;
      if (vfsObj[dest] && vfsObj[dest].type === 'dir') {
        const fileName = src.split('/').pop() || '';
        finalDest = dest === '/' ? '/' + fileName : dest + '/' + fileName;
      }
      
      apiFuncs.setVFS((prev: any) => {
        const next = { ...prev };
        next[finalDest] = { ...prev[src] };
        delete next[src];
        
        if (item.type === 'dir') {
          const prefix = src === '/' ? '/' : src + '/';
          const newPrefix = finalDest === '/' ? '/' : finalDest + '/';
          for (const key of Object.keys(prev)) {
            if (key.startsWith(prefix) && key !== src) {
              const subPath = key.substring(prefix.length);
              next[newPrefix + subPath] = { ...prev[key] };
              delete next[key];
            }
          }
        }
        return next;
      });
      return [];
    }

    case 'cp': {
      if (args.length < 2) return ["cp: missing file operand"];
      const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
      const src = resolvePath(currentDir, args[0]);
      const dest = resolvePath(currentDir, args[1]);
      const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      
      const item = vfsObj[src];
      if (!item) return [`cp: cannot stat '${args[0]}': No such file or directory`];
      if (item.type === 'dir') return [`cp: -r not supported for directory copy`];
      
      let finalDest = dest;
      if (vfsObj[dest] && vfsObj[dest].type === 'dir') {
        const fileName = src.split('/').pop() || '';
        finalDest = dest === '/' ? '/' + fileName : dest + '/' + fileName;
      }
      
      apiFuncs.setVFS((prev: any) => ({
        ...prev,
        [finalDest]: { type: 'file', content: item.content || "" }
      }));
      return [];
    }

    case 'write': {
      if (args.length === 0) return ["write: usage: write <file_path> <text_content>"];
      const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
      const resolved = resolvePath(currentDir, args[0]);
      const contentStr = args.slice(1).join(' ');
      apiFuncs.setVFS((prev: any) => ({
        ...prev,
        [resolved]: { type: 'file', content: contentStr }
      }));
      return [];
    }

    case 'nano':
    case 'edit': {
      if (args.length === 0) return ["nano: missing file operand"];
      const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
      const resolved = resolvePath(currentDir, args[0]);
      const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      
      if (vfsObj[resolved] && vfsObj[resolved].type === 'dir') {
        return [`nano: '${args[0]}' is a directory`];
      }
      
      if (apiFuncs.openEditor) {
        apiFuncs.openEditor(resolved, vfsObj[resolved]?.content || "");
      } else {
        return ["nano: editor not initialized in this session"];
      }
      return [];
    }

    case 'sh': {
      if (args.length === 0) return ["sh: missing script argument"];
      const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
      const resolved = resolvePath(currentDir, args[0]);
      const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      const item = vfsObj[resolved];
      if (!item || item.type !== 'file') return [`sh: ${args[0]}: No such file`];
      
      const content = item.content || "";
      const results = await executeScriptEngine(content, username, apiFuncs, true);
      return results;
    }

    case 'js':
    case 'node': {
      if (args.length === 0 && stdin.length === 0) {
        return ["js/node: missing code arguments or script file path"];
      }

      const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
      const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};

      let codeToRun = "";
      let isFilePath = false;

      if (args.length > 0) {
        const firstArg = args[0];
        if (firstArg === '-e' && args.length > 1) {
          codeToRun = args.slice(1).join(' ');
        } else {
          const resolved = resolvePath(currentDir, firstArg);
          if (vfsObj[resolved] && vfsObj[resolved].type === 'file') {
            codeToRun = vfsObj[resolved].content || "";
            isFilePath = true;
          } else {
            codeToRun = args.join(' ');
          }
        }
      } else {
        codeToRun = stdin.join('\n');
      }

      if (!isFilePath && ((codeToRun.startsWith("'") && codeToRun.endsWith("'")) || (codeToRun.startsWith('"') && codeToRun.endsWith('"')))) {
        codeToRun = codeToRun.slice(1, -1);
      }

      let processedCode = codeToRun;
      if (!isFilePath) {
        // Rewrite top-level standard function declarations to window variables
        processedCode = processedCode.replace(
          /^\s*function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*\{([\s\S]*)\}/gm,
          (match, name, params, body) => {
            (window as any).__added_js_repl_vars__ = (window as any).__added_js_repl_vars__ || new Set();
            (window as any).__added_js_repl_vars__.add(name);
            return `window.${name} = function(${params}) {${body}};`;
          }
        );

        // Rewrite top-level variable declarations to window variables to persist them
        processedCode = processedCode.replace(
          /^\s*(?:let|const|var)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+?);?$/gm,
          (match, name, rightSide) => {
            let cleanRHS = rightSide.trim();
            if (cleanRHS.endsWith(';')) {
              cleanRHS = cleanRHS.slice(0, -1);
            }
            (window as any).__added_js_repl_vars__ = (window as any).__added_js_repl_vars__ || new Set();
            (window as any).__added_js_repl_vars__.add(name);
            return `window.${name} = ${cleanRHS};`;
          }
        );
      }

      const logs: string[] = [];
      const customConsole = {
        log: (...msgs: any[]) => logs.push(msgs.map(m => typeof m === 'object' ? JSON.stringify(m, null, 2) : String(m)).join(' ')),
        error: (...msgs: any[]) => logs.push(`[error] ${msgs.map(m => typeof m === 'object' ? JSON.stringify(m, null, 2) : String(m)).join(' ')}`),
        warn: (...msgs: any[]) => logs.push(`[warn] ${msgs.map(m => typeof m === 'object' ? JSON.stringify(m, null, 2) : String(m)).join(' ')}`),
        info: (...msgs: any[]) => logs.push(`[info] ${msgs.map(m => typeof m === 'object' ? JSON.stringify(m, null, 2) : String(m)).join(' ')}`),
        clear: () => {}
      };

      const jsApi = {
        vfs: {
          read: (p: string) => {
            const r = resolvePath(currentDir, p);
            const currentVFS = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
            return currentVFS[r]?.content ?? null;
          },
          write: (p: string, content: string) => {
            const r = resolvePath(currentDir, p);
            apiFuncs.setVFS((prev: any) => ({
              ...prev,
              [r]: { type: 'file', content }
            }));
            return true;
          },
          exists: (p: string) => {
            const r = resolvePath(currentDir, p);
            const currentVFS = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
            return !!currentVFS[r];
          },
          ls: (p: string = "") => {
            const r = resolvePath(currentDir, p || ".");
            const currentVFS = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
            const prefix = r === '/' ? '/' : r + '/';
            const seen = new Set<string>();
            for (const path of Object.keys(currentVFS)) {
              if (path.startsWith(prefix) && path !== r) {
                const relative = path.substring(prefix.length);
                const firstSegment = relative.split('/')[0];
                if (firstSegment) seen.add(firstSegment);
              }
            }
            return Array.from(seen);
          },
          rm: (p: string) => {
            const r = resolvePath(currentDir, p);
            apiFuncs.setVFS((prev: any) => {
              const next = { ...prev };
              delete next[r];
              return next;
            });
            return true;
          }
        },
        bbs: {
          threads: async () => {
             return await apiFuncs.fetchThreads();
          },
          posts: async (threadId: string) => {
             return await apiFuncs.fetchPosts(threadId);
          },
          mkthread: async (title: string) => {
             const res = await apiFuncs.createThreads([{ title, author: username }]);
             return res;
          },
          post: async (threadId: string, message: string) => {
             const res = await apiFuncs.createPost(threadId, message, username);
             return res;
          }
        },
        env: {
          get: (key: string) => {
            return apiFuncs.getEnv ? apiFuncs.getEnv(key) : null;
          },
          set: (key: string, val: string) => {
            if (apiFuncs.setEnv) apiFuncs.setEnv(key, val);
          }
        }
      };

      try {
        const fn = new Function('console', 'vfs', 'bbs', 'env', 'stdin', `
          return (async () => {
            ${processedCode}
          })();
        `);
        const result = await fn(customConsole, jsApi.vfs, jsApi.bbs, jsApi.env, stdin);
        if (result !== undefined) {
          logs.push(typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result));
        }
      } catch (err: any) {
        logs.push(`TypeError / SyntaxError: ${err.message || String(err)}`);
      }

      return logs;
    }

    case 'cd': {
      let dir = args[0];
      const hasStdin = !!(stdin && stdin.length > 0);
      if (dir === '-' && hasStdin) {
        dir = stdin[0].trim();
      }

      if (!dir || dir === '~' || dir === '/') {
        apiFuncs.setCWD('/');
        apiFuncs.setContext(null);
        return [];
      }
      
      const currentDir = apiFuncs.getCWD();
      const resolved = resolvePath(currentDir, dir);
      const vfsObj = apiFuncs.getVFS();
      const resolvedPrefix = resolved === '/' ? '/' : resolved + '/';
      const isDir = resolved === '/' || 
                    (vfsObj[resolved] && vfsObj[resolved].type === 'dir') || 
                    Object.keys(vfsObj).some(p => p.startsWith(resolvedPrefix));
      
      if (isDir) {
        apiFuncs.setCWD(resolved);
        apiFuncs.setContext(null);
        return [];
      }
      
      const ths = await apiFuncs.fetchThreads();
      let bbsMatch = ths.find((t: any) => t.id === dir);
      
      // Fallback: Check if it's a valid thread ID format and verify with posts fetch 
      // This handles newly created threads not yet in the threads list cache
      if (!bbsMatch && /^[a-z0-9]{7}$/.test(dir)) {
        try {
          const posts = await apiFuncs.fetchPosts(dir);
          if (Array.isArray(posts)) {
            bbsMatch = { id: dir };
          }
        } catch (e) {}
      }

      if (bbsMatch) {
         apiFuncs.setContext(dir);
         return [];
      }
      
      return [`cd: ${dir}: No such virtual directory or BBS thread ID`];
    }

    case 'ls':
    case 'dir':
    case 'threads': {
      const context = apiFuncs.getContext();
      const isJa = apiFuncs.getLang() === 'ja';
      const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
      const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};

      const hasStdin = !!(stdin && stdin.length > 0);
      let pathArg = args.find(a => !a.startsWith('-'));
      if (pathArg === '-' && hasStdin) {
        pathArg = stdin[0].trim();
      }

      // 1. Check if the specified target refers to a BBS Thread ID (or if we are in a BBS context with no path argument)
      let bbsTargetContext: string | null = null;
      if (pathArg) {
        try {
          const ths = await apiFuncs.fetchThreads();
          const threadMatch = ths.find((t: any) => t.id === pathArg || `/${t.id}` === pathArg);
          if (threadMatch) {
            bbsTargetContext = threadMatch.id;
          } else if (/^[a-z0-9]{7}$/.test(pathArg)) {
             // Fallback for newly created threads
             const posts = await apiFuncs.fetchPosts(pathArg);
             if (Array.isArray(posts)) {
               bbsTargetContext = pathArg;
             }
          }
        } catch (e) {}
      } else if (context && (cmd === 'ls' || cmd === 'dir')) {
        bbsTargetContext = context;
      }

      // If we are listing posts in a BBS Thread context
      if (bbsTargetContext) {
        const ts = await apiFuncs.fetchPosts(bbsTargetContext);
        let headerText = isJa 
          ? `--- 掲示板スレッド Room #${bbsTargetContext} (コメント一覧) ---`
          : `--- BBS Thread Room #${bbsTargetContext} (Replies) ---`;
        
        try {
          const ths = await apiFuncs.fetchThreads();
          const currentThread = ths.find((t: any) => t.id === bbsTargetContext);
          if (currentThread) {
            headerText = isJa
              ? `💬 掲示板スレッド [${bbsTargetContext}] "${currentThread.title}" (${currentThread.author} 作成) の返信一覧`
              : `💬 BBS Thread [${bbsTargetContext}] "${currentThread.title}" (by ${currentThread.author}): Replies`;
          }
        } catch (e) {}

        const listItems = ts.map((p: any, idx: number) => (
          <div key={`post-${idx}`} className="py-3 px-4 border-b border-white/5 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono bg-white/10 text-zinc-300 px-1.5 py-0.5 rounded">#{idx + 1}</span>
              <span className="font-semibold text-purple-300">{p.author}</span>
              {p.userId && (
                <span className="text-xs font-mono bg-black/40 border border-white/10 text-zinc-500 px-1.5 py-0.5 rounded">
                   {p.userId}
                </span>
              )}
              <span className="text-xs font-mono bg-blue-900/40 border border-blue-800/40 text-blue-300 px-1.5 py-0.5 rounded">
                 PostID: {p.id}
              </span>
              <span className="text-xs text-zinc-500 font-mono ml-auto">
                 {new Date(p.timestamp).toLocaleString(isJa ? 'ja-JP' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-zinc-200 mt-1 whitespace-pre-wrap leading-relaxed text-sm">{renderCommandTextWithLinks(p.content)}</div>
          </div>
        ));

        const lsUI = (
          <div key="ls-bbs" className="my-2 border border-white/20 rounded-md bg-black/20 font-sans shadow-sm w-full max-w-4xl overflow-visible">
            <div className="bg-cyan-900/40 text-cyan-300 px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
              <h3 className="font-semibold">{headerText}</h3>
            </div>
            <div className="divide-y divide-white/5 bg-black/20">
              {listItems.length === 0 ? (
                <div className="p-4 text-center text-zinc-500 italic text-sm">{isJa ? "まだコメントがありません。" : "No replies yet."}</div>
              ) : (
                listItems
              )}
            </div>
          </div>
        );
        const lsText = headerText + '\n' + (ts.map((p: any, idx: number) => `#${idx + 1} [${p.author}] ${p.userId || ""} (PostID: ${p.id}) ${new Date(p.timestamp).toLocaleString(isJa ? 'ja-JP' : 'en-US')}\n${p.content}`).join('\n\n')) || '(No replies yet)';
        return [{ _isUIObj: true, ui: lsUI, text: lsText }];
      }
      
      if (cmd === 'threads') {
        let lsRev = false;
        args.forEach(a => { if (a === '-r') lsRev = true; });
        let ths = await apiFuncs.fetchThreads();
   
        const threadsWithTimestamps = await Promise.all(ths.map(async (t: any) => {
            const posts = await apiFuncs.fetchPosts(t.id);
            const latestTimestamp = posts.length > 0
                ? Math.max(...posts.map((p: any) => new Date(p.timestamp).getTime()))
                : new Date(t.createdAt).getTime();
            return { ...t, latestTimestamp };
        }));
        threadsWithTimestamps.sort((a, b) => b.latestTimestamp - a.latestTimestamp);
        
        if (lsRev) threadsWithTimestamps.reverse(); 
        ths = threadsWithTimestamps;
        const maxId = Math.max(1, ...ths.map((t: any) => t.id.length));
        const threadsUI = (
          <div key="threads-list" className="my-2 border border-white/20 rounded-md bg-black/20 font-sans shadow-sm w-full max-w-4xl text-zinc-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-black/30 border-b border-white/10 text-cyan-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
              <h2 className="text-lg font-bold tracking-wide">{isJa ? "公開スレッド一覧" : "Public Threads"}</h2>
              <span className="ml-auto text-xs font-mono text-cyan-400/70 border border-cyan-400/30 px-2 py-0.5 rounded-full">{ths.length} {isJa ? "件" : "threads"}</span>
            </div>
            {ths.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 italic">
                {isJa ? "スレッドがありません。mkthreadコマンドで作成できます。" : "No threads found. Use 'mkthread' to create one."}
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {ths.map((t: any) => (
                  <li 
                    key={t.id} 
                    className="hover:bg-white/10 active:bg-white/15 cursor-pointer rounded transition-all p-3 flex flex-col sm:flex-row gap-2 sm:items-center group"
                    onClick={() => apiFuncs.setInput(`cd ${t.id}`)}
                    title={isJa ? `クリックしてコマンドを入力: cd ${t.id}` : `Click to enter command: cd ${t.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <span 
                        className="bg-black/30 border border-white/10 text-cyan-300 font-mono text-xs px-2 py-1 rounded inline-block hover:bg-cyan-900/30 hover:border-cyan-400/40 hover:text-cyan-200 active:scale-95 transition-all cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          apiFuncs.insertInput(t.id);
                        }}
                        title={isJa ? `IDをここに挿入: ${t.id}` : `Insert ID: ${t.id}`}
                      >
                        ID: {t.id}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        {new Date(t.latestTimestamp).toLocaleString(isJa ? 'ja-JP' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 overflow-hidden">
                      <div className="flex-1 flex flex-col overflow-hidden">
                        <span className="font-semibold text-white/90 truncate group-hover:text-cyan-300 transition-colors">{t.title}</span>
                        {typeof t.preview === 'string' && t.preview && (
                          <span className="text-xs text-zinc-400 line-clamp-1 truncate font-sans block max-w-sm sm:max-w-xl group-hover:text-zinc-300 transition-colors mt-0.5">
                            {t.preview}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-xs">
                        <span className="hidden sm:inline-block text-[11px] text-cyan-400 font-mono opacity-0 group-hover:opacity-100 transition-all bg-cyan-400/10 border border-cyan-400/35 rounded-md px-2 py-0.5 pointer-events-none">
                          cd {t.id} ↵
                        </span>
                        <span className="flex items-center gap-1 text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                          <span className="truncate max-w-[100px]">{t.author}</span>
                        </span>
                        <span className="flex items-center gap-1 text-zinc-400 bg-black/20 px-2 py-0.5 rounded border border-white/5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                          {t.postCount || 0}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
        const textThreads = (isJa ? "公開スレッド一覧:\n" : "Public Threads:\n") + ths.map((t: any) => `ID: ${t.id} | Title: ${t.title} | By: ${t.author} | Posts: ${t.postCount||0}`).join('\n');
        return [{ _isUIObj: true, ui: threadsUI, text: textThreads }];
      }
      
      const targetDir = pathArg ? resolvePath(currentDir, pathArg) : currentDir;
      const prefix = targetDir === '/' ? '/' : targetDir + '/';
      const isDir = targetDir === '/' || (vfsObj[targetDir] && vfsObj[targetDir].type === 'dir') || Object.keys(vfsObj).some(p => p.startsWith(prefix));
      const isFile = vfsObj[targetDir] && vfsObj[targetDir].type === 'file';

      if (!isDir && !isFile) {
        return [`ls: ${pathArg}: No such virtual directory, file or BBS thread ID`];
      }

      if (isFile) {
        const item = vfsObj[targetDir];
        const bytes = item.content ? new TextEncoder().encode(item.content).length : 0;
        const name = targetDir.split('/').pop() || targetDir;
        const fileUI = (
          <span className="font-mono text-gray-200">
            📄 {name.padEnd(24)} <span className="text-zinc-500 text-xs">({bytes} bytes)</span>
          </span>
        );
        return [{ _isUIObj: true, ui: fileUI, text: `${name} (${bytes} bytes)` }];
      }
      
      const children: { name: string, type: 'file' | 'dir', content?: string }[] = [];
      const seen = new Set<string>();
      
      for (const path of Object.keys(vfsObj)) {
        if (path.startsWith(prefix) && path !== targetDir) {
          const relative = path.substring(prefix.length);
          const firstSegment = relative.split('/')[0];
          if (firstSegment && !seen.has(firstSegment)) {
            seen.add(firstSegment);
            const fullChildPath = prefix + firstSegment;
            const item = vfsObj[fullChildPath] || { type: 'dir' };
            children.push({
              name: firstSegment,
              type: item.type,
              content: item.content
            });
          }
        }
      }
      
      if (children.length === 0 && targetDir !== '/') {
        return ["(empty directory)"];
      }
      
      const mappedChildren = children.map(child => {
        if (child.type === 'dir') {
          return { ...child, desc: 'Directory', bytes: 0 };
        } else {
          const bytes = child.content ? new TextEncoder().encode(child.content).length : 0;
          return { ...child, desc: 'File', bytes };
        }
      });
      mappedChildren.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      const lsUI = (
        <div key="ls-vfs" className="my-2 border border-white/20 rounded-md bg-black/20 font-sans shadow-sm w-full max-w-4xl text-zinc-200 overflow-hidden">
           <div className="flex items-center gap-2 px-4 py-2 bg-black/30 border-b border-white/10 text-emerald-400">
             <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
             <h2 className="text-sm font-semibold font-mono tracking-wide">{targetDir}</h2>
             <span className="ml-auto text-xs font-mono opacity-60">{mappedChildren.length} items</span>
           </div>
           
           {mappedChildren.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 text-sm font-mono italic">(empty directory)</div>
           ) : (
             <div className="overflow-x-auto text-sm w-full">
               <table className="w-full text-left whitespace-nowrap border-collapse">
                  <tbody className="divide-y divide-white/5">
                    {mappedChildren.map((item, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-white/10 active:bg-white/15 cursor-pointer transition-colors group"
                        onClick={() => {
                          const cmdStr = item.type === 'dir' ? `cd ${item.name}` : `cat ${item.name}`;
                          apiFuncs.setInput(cmdStr);
                        }}
                        title={isJa ? `クリックしてコマンドを入力: ${item.type === 'dir' ? 'cd' : 'cat'} ${item.name}` : `Click to enter command: ${item.type === 'dir' ? 'cd' : 'cat'} ${item.name}`}
                      >
                        <td className="py-2 pl-4 pr-3 w-8">
                          {item.type === 'dir' ? (
                            <span className="text-xl">📁</span>
                          ) : (
                            <span className="text-xl">📄</span>
                          )}
                        </td>
                        <td className={`py-2 px-2 font-mono ${item.type === 'dir' ? 'text-cyan-300 font-semibold' : 'text-gray-200'} group-hover:text-emerald-400 transition-colors`}>
                          {item.name}{item.type === 'dir' && '/'}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span className="text-[11px] text-emerald-400 font-mono opacity-0 group-hover:opacity-100 transition-all bg-emerald-500/10 border border-emerald-500/35 rounded-md px-2 py-0.5 pointer-events-none">
                            {item.type === 'dir' ? `cd ${item.name}` : `cat ${item.name}`} ↵
                          </span>
                        </td>
                        <td className="py-2 px-4 text-zinc-500 font-mono text-xs w-24 text-right">
                           {item.type === 'file' ? `${item.bytes} B` : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           )}
           {targetDir === '/' && (
              <div className="bg-black/40 border-t border-white/5 p-3 text-xs text-sky-400/80 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {isJa
                  ? "ℹ️ 掲示板スレッド一覧を見るには「threads」コマンドを実行するか、もしくは「cd [スレッドID]」で直接掲示板に入室できます。"
                  : "ℹ️ Type 'threads' to list BBS channels/threads, or 'cd <thread_id>' to enter a BBS thread directly."}
              </div>
           )}
        </div>
      );

      const lsDirText = `Directory: ${targetDir}\n` + mappedChildren.map(c => `${c.type === 'dir' ? '[DIR]' : '[FILE]'} ${c.name} ${c.type === 'file' ? '('+c.bytes+' B)' : ''}`).join('\n') + (targetDir === '/' ? '\nHint: Type threads to see BBS threads.' : '');
      return [{ _isUIObj: true, ui: lsUI, text: lsDirText }];
    }
      
    case 'mkthread': {
      let title = "";
      let bodyContent = "";
      if (args.length === 2) {
         title = args[0];
         bodyContent = args[1];
      } else if (args.length > 2) {
         if (args[0].includes(' ')) {
            title = args[0];
            bodyContent = args.slice(1).join(' ');
         } else {
            title = args.join(' ');
         }
      } else {
         title = args.join(' ');
      }

      if (stdin.length > 0 && title.trim()) {
         const res = await apiFuncs.createThreads([{ title, author: username }]);
         if (res && res.lastId) {
            apiFuncs.setEnv('LAST_THREAD_ID', res.lastId);
            const content = stdin.join('\n');
            if (content.trim()) {
               await apiFuncs.createPosts([{ threadId: res.lastId, content, author: username }]);
            }
            return [res.lastId];
         }
         return [`${t.created} 1`];
      } else if (stdin.length > 0) {
         const items = stdin.filter(l => l.trim()).map(line => ({ title: line, author: username }));
         const res = await apiFuncs.createThreads(items);
         if (res && res.lastId) {
            apiFuncs.setEnv('LAST_THREAD_ID', res.lastId);
            return [res.lastId];
         }
         return [`${t.created} ${items.length}`];
      } else {
         if (!title) return [`${t.usage}: mkthread <title> [body]`];
         const res = await apiFuncs.createThreads([{ title, author: username }]);
         if (res && res.lastId) {
            apiFuncs.setEnv('LAST_THREAD_ID', res.lastId);
            if (bodyContent) {
               await apiFuncs.createPosts([{ threadId: res.lastId, content: bodyContent, author: username }]);
            }
            return [res.lastId];
         }
         return [`${t.created} 1`];
      }
    }
 
    case 'post': {
       const context = apiFuncs.getContext();
       let tid: string | null = null;
       let msg: string = "";
       const hasStdin = !!(stdin && stdin.length > 0);
 
       if (hasStdin && args[0] === '-') {
           // case: mkthread ... | post - "Message"
           tid = stdin[0].trim();
           msg = args.slice(1).join(' ');
       } else if (hasStdin) {
           // case: echo "Message" | post TID
           if (args.length >= 1) {
               tid = args[0];
           } else if (context) {
               tid = context;
           } else {
               return [`${t.usage}: stdin | post <thread_id> (or run inside a thread context)`];
           }
           msg = stdin.join('\n');
       } else if (context && args.length === 1) {
           tid = context;
           msg = args[0];
       } else if (args.length >= 2) {
           tid = args[0];
           msg = args.slice(1).join(' ');
       } else {
           return [`${t.usage}: post <thread_id> <message>`];
       }
 
       if (!tid) return ["Error: Missing thread ID."];
       if (!msg.trim() && !hasStdin) return ["Error: Message content is empty."];
       if (hasStdin && args[0] !== '-' && !msg.trim()) return ["Error: Message content from stdin is empty."];

       await apiFuncs.createPosts([{ threadId: tid, content: msg, author: username }]);
       return [`${t.posted} 1`];
    }
 
    case 'cat':
    case 'read': {
      if (args.length > 0) {
        const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
        const resolved = resolvePath(currentDir, args[0]);
        const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
        if (vfsObj[resolved] && vfsObj[resolved].type === 'file') {
          return (vfsObj[resolved].content || "").split('\n');
        }
      }
      
      const contextCat = apiFuncs.getContext();
      const targetTid = args[0] || contextCat;
      const isJa = apiFuncs.getLang() === 'ja';
      
      if (!targetTid) return [`cat: virtual file or BBS thread does not exist`];
      const ts = await apiFuncs.fetchPosts(targetTid);
      
      let headerText = isJa 
        ? `--- 掲示板スレッド Room #${targetTid} (コメント一覧) ---`
        : `--- BBS Thread Room #${targetTid} (Replies) ---`;
      
      try {
        const ths = await apiFuncs.fetchThreads();
        const currentThread = ths.find((t: any) => t.id === targetTid);
        if (currentThread) {
          headerText = isJa
            ? `💬 掲示板スレッド [${targetTid}] "${currentThread.title}" (${currentThread.author} 作成) の返信一覧`
            : `💬 BBS Thread [${targetTid}] "${currentThread.title}" (by ${currentThread.author}): Replies`;
        }
      } catch (e) {}

      const listItems = ts.map((p: any, idx: number) => (
        <div key={`post-${idx}`} className="py-3 px-4 border-b border-white/5 hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono bg-white/10 text-zinc-300 px-1.5 py-0.5 rounded">#{idx + 1}</span>
            <span className="font-semibold text-purple-300">{p.author}</span>
            {p.userId && (
              <span className="text-xs font-mono bg-black/40 border border-white/10 text-zinc-500 px-1.5 py-0.5 rounded">
                 {p.userId}
              </span>
            )}
            <span className="text-xs font-mono bg-blue-900/40 border border-blue-800/40 text-blue-300 px-1.5 py-0.5 rounded">
               PostID: {p.id}
            </span>
            <span className="text-xs text-zinc-500 font-mono ml-auto">
               {new Date(p.timestamp).toLocaleString(isJa ? 'ja-JP' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="text-zinc-200 mt-1 whitespace-pre-wrap leading-relaxed text-sm">{renderCommandTextWithLinks(p.content)}</div>
        </div>
      ));

      return [
        <div key="cat-bbs" className="my-2 border border-white/20 rounded-md bg-black/20 font-sans shadow-sm w-full max-w-4xl overflow-hidden">
          <div className="bg-cyan-900/40 text-cyan-300 px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            <h3 className="font-semibold">{headerText}</h3>
          </div>
          <div className="divide-y divide-white/5 bg-black/20">
            {listItems.length === 0 ? (
              <div className="p-4 text-center text-zinc-500 italic text-sm">{isJa ? "まだコメントがありません。" : "No replies yet."}</div>
            ) : (
              listItems
            )}
          </div>
        </div>
      ];
    }

    case 'theme':
    case 'themes': {
      const isJa = apiFuncs.getLang() === 'ja';
      const targetTheme = args[0] ? args[0].trim().toLowerCase() : null;
      const allThemes = apiFuncs.getAllThemes ? apiFuncs.getAllThemes() : themes;
      if (!targetTheme) {
        const availableThemes = Object.entries(allThemes);
        const currentTheme = apiFuncs.getTheme ? apiFuncs.getTheme() : 'emerald';
        const lines = [
          isJa 
            ? "🎨 利用可能なビジュアルテーマ一覧:" 
            : "🎨 Available visual themes:",
          ""
        ];
        for (const [key, tInfo] of availableThemes as any[]) {
          const isSelected = key === currentTheme;
          const prefix = isSelected ? " -> * " : "      ";
          const themeName = isJa ? tInfo.name : tInfo.nameEn;
          const customLabel = tInfo.isCustom ? (isJa ? " (カスタム)" : " (Custom)") : "";
          lines.push(`${prefix}${key.padEnd(12)} - ${themeName}${customLabel}${isSelected ? (isJa ? " (適用中)" : " (current)") : ""}`);
        }
        lines.push("");
        lines.push(isJa 
          ? "💡 テーマを切り替えるには「theme <テーマ名>」を実行してください (例: theme dracula)"
          : "💡 To change theme, execute 'theme <theme_name>' (e.g., theme dracula)"
        );
        lines.push(isJa
          ? "💡 オリジナルのテーマを作成するには「maketheme」を実行してください。"
          : "💡 To create your own theme, execute 'maketheme'."
        );
        return lines;
      }

      if (allThemes[targetTheme]) {
        if (apiFuncs.setTheme) {
          apiFuncs.setTheme(targetTheme);
          return [
            isJa
              ? `✨ テーマを「${allThemes[targetTheme].name}」に切り替えました。`
              : `✨ Theme switched to '${allThemes[targetTheme].nameEn}'.`
          ];
        } else {
          return ["Error: setTheme not initialized."];
        }
      } else {
        return [
          isJa
            ? `❌ エラー: '${targetTheme}' というテーマは存在しません。「theme」と入力して一覧を確認してください。`
            : `❌ Error: Theme '${targetTheme}' does not exist. Type 'theme' to view available list.`
        ];
      }
    }

    case 'maketheme': {
      if (apiFuncs.startThemeWizard) {
        apiFuncs.startThemeWizard();
        return [];
      }
      return ["Error: Theme wizard is not available."];
    }

    case 'rmtheme': {
      const isJa = apiFuncs.getLang() === 'ja';
      const key = args[0];
      if (!key) return [isJa ? "❌ 削除するテーマのキーを指定してください" : "❌ Specify the theme key to delete"];
      const customThemes = apiFuncs.getCustomThemes ? apiFuncs.getCustomThemes() : {};
      if (!customThemes[key]) {
        return [isJa ? `❌ カスタムテーマ '${key}' は存在しません` : `❌ Custom theme '${key}' does not exist`];
      }
      if (apiFuncs.removeCustomTheme) {
        apiFuncs.removeCustomTheme(key);
        // Switch back to emerald if deleting active theme
        if (apiFuncs.getTheme() === key) {
           apiFuncs.setTheme('emerald');
        }
        return [isJa ? `✅ テーマ '${key}' を削除しました` : `✅ Theme '${key}' deleted`];
      }
      return ["Error: Cannot remove theme."];
    }
    
    case 'edittheme': {
      const isJa = apiFuncs.getLang() === 'ja';
      const key = args[0];
      if (!key) return [isJa ? "❌ 編集するテーマのキーを指定してください" : "❌ Specify the theme key to edit"];
      const customThemes = apiFuncs.getCustomThemes ? apiFuncs.getCustomThemes() : {};
      if (!customThemes[key]) {
        return [isJa ? `❌ カスタムテーマ '${key}' は存在しません` : `❌ Custom theme '${key}' does not exist`];
      }
      if (apiFuncs.startThemeWizard) {
        apiFuncs.startThemeWizard(key);
        return [];
      }
      return ["Error: Theme wizard not available"];
    }

    case 'su':
      if (args[0]) {
          apiFuncs.setUsername(args[0]);
          return [`su: user changed to '${args[0]}'`]; 
      }
      return [];
    case 'whoami':
      return [username];
    case 'split':
    case 'tmux': {
      const isJa = apiFuncs.getLang() === 'ja';
      if (args.length === 0) {
         return [isJa ? "使用法: split [v|h|window|close]\n(v: 垂直分割, h: 水平分割, window: 別ウィンドウで開く, close: 分割解除)" : "Usage: split [v|h|window|close]\n(v: vertical, h: horizontal, window: popout, close: close split)"];
      }
      const mode = args[0].toLowerCase();
      if (mode === 'close' || mode === 'off') {
         const curSplitMode = apiFuncs.getSplitMode ? apiFuncs.getSplitMode() : null;
         if (curSplitMode !== null) {
             if (apiFuncs.setSplitMode) apiFuncs.setSplitMode(null);
             return [isJa ? "自分自身の分割を解除しました" : "Closed own split."];
         } else if (window.location.search.includes("split=true")) {
             window.parent.postMessage({ type: 'CLOSE_PANE' }, '*');
             return [];
         } else {
             return [isJa ? "分割されていません" : "Not split."];
         }
      }
      if (mode === 'window' || mode === 'popout' || mode === 'w') {
         window.open(window.location.pathname, '_blank', 'width=800,height=600');
         return [isJa ? "別ウィンドウで起動しました" : "Opened in new window."];
      }
      if (mode === 'v' || mode === 'h') {
         let splitDepth = 0;
         try {
           let curr: any = window;
           while (curr !== window.top && splitDepth < 15) {
             splitDepth++;
             curr = curr.parent;
           }
         } catch (e) {}
         
         if (splitDepth >= 6) {
             return [isJa ? "画面分割の制限（最大6階層）に達しました。" : "Maximum split depth limit (6 levels) reached."];
         }
         if (apiFuncs.setSplitMode) {
             apiFuncs.setSplitMode(mode);
             return [isJa ? `画面を${mode === 'v' ? '垂直' : '水平'}に分割しました` : `Screen split ${mode === 'v' ? 'vertically' : 'horizontally'}.`];
         }
      }
      return [isJa ? "無効なオプションです。v, h, window, close を指定してください。" : "Invalid option. Use v, h, window, or close."];
    }
    case 'clear':
      apiFuncs.clear();
      return [];
    case 'web':
    case 'preview': {
      const isJa = apiFuncs.getLang() === 'ja';
      if (args.length === 0) {
        const pf = apiFuncs.getPreviewFile ? apiFuncs.getPreviewFile() : null;
        if (pf) {
          return [isJa 
            ? `ℹ️ 現在「${pf}」をプレビュー表示しています。閉じるには 'web off' と入力してください。`
            : `ℹ️ Currently previewing '${pf}'. Type 'web off' to close.`];
        }
        return [isJa 
          ? "使用法: web <ファイルのパス>  (例: web /bbs.html)\n'web off' でプレビュー窓を閉じます。"
          : "Usage: web <file_path>  (e.g., web /bbs.html)\n'web off' to close the preview panel."];
      }
      
      const sub = args[0];
      if (sub === 'off' || sub === 'close' || sub === 'exit' || sub === '-c') {
        if (apiFuncs.closePreview) {
          apiFuncs.closePreview();
          return [isJa ? "🔌 プレビュー画面を閉じました。" : "🔌 Preview panel closed."];
        }
        return ["Error closing preview"];
      }
      
      const currentDir = apiFuncs.getCWD ? apiFuncs.getCWD() : "/";
      const resolved = resolvePath(currentDir, sub);
      const vfsObj = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      
      const item = vfsObj[resolved];
      if (!item) {
        return [isJa 
          ? `web: '${sub}' というファイルが見つかりません。` 
          : `web: '${sub}' not found in virtual file system.`];
      }
      if (item.type !== 'file') {
        return [isJa 
          ? `web: '${sub}' はディレクトリです。HTMLファイルを指定してください。` 
          : `web: '${sub}' is a directory. Please specify an HTML file.`];
      }
      
      if (apiFuncs.openPreview) {
        apiFuncs.openPreview(resolved, item.content || "");
        return [
          isJa 
            ? `🚀 '${resolved}' のUIを起動しました！右側の仮想モニターにプレビュー表示されます。`
            : `🚀 UI for '${resolved}' has been spawned! Active preview running in the virtual device monitor on the right.`
        ];
      }
      return ["Preview function not initialized."];
    }
    
    case 'wiki': {
      const isJa = apiFuncs.getLang() === 'ja';
      if (args.length === 0) {
        return [
          isJa ? "wikiコマンドの使い方:" : "wiki command usage:",
          "  wiki init          : " + (isJa ? "Wikiデータの初期化" : "Initialize wiki data"),
          "  wiki edit <cmd>    : " + (isJa ? "コマンドのヘルプを編集" : "Edit command help"),
          "  wiki rm <cmd>      : " + (isJa ? "コマンドのヘルプを削除" : "Remove command help")
        ];
      }
      const sub = args[0].toLowerCase();
      const vfs = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      
      if (sub === 'init') {
        const newVfs = { ...vfs };
        if (!newVfs['/sys/wiki']) newVfs['/sys/wiki'] = { type: 'dir' };
        if (!newVfs['/sys/wiki/ja']) newVfs['/sys/wiki/ja'] = { type: 'dir' };
        if (!newVfs['/sys/wiki/en']) newVfs['/sys/wiki/en'] = { type: 'dir' };
        
        for (const [key, val] of Object.entries(defaultHelpsJa)) {
          newVfs[`/sys/wiki/ja/${key}.json`] = { type: 'file', content: JSON.stringify(val, null, 2) };
        }
        for (const [key, val] of Object.entries(defaultHelpsEn)) {
          newVfs[`/sys/wiki/en/${key}.json`] = { type: 'file', content: JSON.stringify(val, null, 2) };
        }
        apiFuncs.setVFS(newVfs);
        return [isJa ? "✅ Wikiデータを初期化しました。（/sys/wiki/ 以下に保存しました）" : "✅ Wiki data initialized in /sys/wiki/"];
      }
      
      if (sub === 'edit') {
        const cmdName = args[1];
        if (!cmdName) return [isJa ? "❌ コマンド名を指定してください: wiki edit <cmd>" : "❌ Specify command: wiki edit <cmd>"];
        
        const lang = apiFuncs.getLang() === 'ja' ? 'ja' : 'en';
        const fp = `/sys/wiki/${lang}/${cmdName}.json`;
        
        // Ensure directories exist
        const newVfs = { ...vfs };
        if (!newVfs['/sys/wiki']) newVfs['/sys/wiki'] = { type: 'dir' };
        if (!newVfs[`/sys/wiki/${lang}`]) newVfs[`/sys/wiki/${lang}`] = { type: 'dir' };
        
        if (!newVfs[fp]) {
          const defaults = lang === 'ja' ? defaultHelpsJa : defaultHelpsEn;
          const contentObj = defaults[cmdName] || {
            cat: "UTIL",
            related: [],
            desc: "New custom command",
            usage: cmdName + " <args>"
          };
          newVfs[fp] = { type: 'file', content: JSON.stringify(contentObj, null, 2) };
        }
        
        // Save back if we created it
        if (!vfs[fp]) {
          apiFuncs.setVFS(newVfs);
        }
        
        // Launch nano! Note we return an empty array and use setInput (or just return the message? "Use nano..")
        // But we are returning an array. How do we programmatically run another command?
        // We can just call executeCommand("nano", [fp], ...)
        return executeCommand("nano", [fp], stdin, username, apiFuncs);
      }
      
      if (sub === 'rm') {
        const cmdName = args[1];
        if (!cmdName) return [isJa ? "❌ コマンド名を指定してください: wiki rm <cmd>" : "❌ Specify command: wiki rm <cmd>"];
        const lang = apiFuncs.getLang() === 'ja' ? 'ja' : 'en';
        const fp = `/sys/wiki/${lang}/${cmdName}.json`;
        if (vfs[fp]) {
           const newVfs = { ...vfs };
           delete newVfs[fp];
           apiFuncs.setVFS(newVfs);
           return [isJa ? `✅ /sys/wiki/${lang}/${cmdName}.json を削除しました` : `✅ Deleted ${cmdName}.json`];
        }
        return [isJa ? `⚠️ ${cmdName} の設定ファイルは見つかりませんでした` : `⚠️ Not found: ${cmdName}`];
      }
      
      return [isJa ? `⚠️ 不明なサブコマンド: ${sub}` : `⚠️ Unknown sub command: ${sub}`];
    }

    case 'startup': {
      const isJa = apiFuncs.getLang() === 'ja';
      const sub = args[0] ? args[0].trim().toLowerCase() : null;

      // Get current startup commands
      let startupStr = localStorage.getItem("shellboards_startup");
      let startupCmds: string[] = [];
      if (startupStr === null) {
        startupCmds = ["web /bbs.html"];
        localStorage.setItem("shellboards_startup", JSON.stringify(startupCmds));
      } else {
        try {
          startupCmds = JSON.parse(startupStr);
          if (!Array.isArray(startupCmds)) {
            startupCmds = ["web /bbs.html"];
          }
        } catch {
          startupCmds = ["web /bbs.html"];
        }
      }

      if (!sub) {
        // List registered commands
        if (startupCmds.length === 0) {
          return [
            isJa
              ? "ℹ️ 登録されているスタートアップコマンドはありません。"
              : "ℹ️ No startup commands registered.",
            isJa
              ? "💡 追加するには: startup add <コマンド>"
              : "💡 To add one: startup add <command>"
          ];
        }

        const listLines = startupCmds.map((cmdStr, idx) => (
          <div key={idx} className="flex items-center gap-2 font-mono text-xs pl-2 border-l-2 border-emerald-500 py-0.5 my-1">
            <span className="text-emerald-400 font-bold">{idx + 1}:</span>
            <span className="text-white bg-black/30 px-2 py-0.5 rounded border border-white/5">{cmdStr}</span>
          </div>
        ));

        const helpBlock = (
          <div key="startup-help" className="mt-3 text-xs text-zinc-400 font-sans border-t border-white/10 pt-2 flex flex-col gap-1">
            <div className="font-bold text-zinc-300">💡 {isJa ? "スタートアップコマンド管理:" : "Startup Command Management:"}</div>
            <div>• <code className="text-emerald-300 font-mono">startup add &lt;command&gt;</code> - {isJa ? "コマンドを追加登録" : "Register a command to run on start"}</div>
            <div>• <code className="text-emerald-300 font-mono">startup edit &lt;index&gt; &lt;new_command&gt;</code> - {isJa ? "登録済みのコマンドを編集" : "Edit a registered command"}</div>
            <div>• <code className="text-emerald-300 font-mono">startup rm &lt;index&gt;</code> - {isJa ? "コマンドを削除" : "Remove a registered command"}</div>
            <div>• <code className="text-emerald-300 font-mono">startup clear</code> - {isJa ? "すべての登録を削除" : "Clear all registered startup commands"}</div>
            <div>• <code className="text-emerald-300 font-mono">startup run</code> - {isJa ? "今すぐスタートアップコマンドをすべて実行" : "Run all registered commands right now"}</div>
          </div>
        );

        return [
          <div key="startup-list" className="bg-black/20 border border-white/10 rounded p-4 max-w-xl text-zinc-200">
            <div className="text-sm font-bold text-emerald-400 border-b border-white/10 pb-2 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <span>🚀</span>
              <span>{isJa ? "スタートアップ登録コマンド一覧" : "Startup Command List"}</span>
            </div>
            <div className="flex flex-col gap-1">{listLines}</div>
            {helpBlock}
          </div>
        ];
      }

      if (sub === 'add') {
        const cmdToAdd = args.slice(1).join(' ').trim();
        if (!cmdToAdd) {
          return [isJa ? "❌ 追加するコマンドを指定してください: startup add <コマンド>" : "❌ Specify command to add: startup add <command>"];
        }
        startupCmds.push(cmdToAdd);
        localStorage.setItem("shellboards_startup", JSON.stringify(startupCmds));
        return [
          isJa 
            ? `✅ スタートアップコマンドを追加しました: "${cmdToAdd}"` 
            : `✅ Added startup command: "${cmdToAdd}"`
        ];
      }

      if (sub === 'rm' || sub === 'remove' || sub === 'delete') {
        const idxStr = args[1];
        if (!idxStr) {
          return [isJa ? "❌ 削除するインデックスを指定してください: startup rm <番号>" : "❌ Specify index to remove: startup rm <index>"];
        }
        const idx = parseInt(idxStr) - 1;
        if (isNaN(idx) || idx < 0 || idx >= startupCmds.length) {
          return [isJa ? `❌ 無効な番号です (1から${startupCmds.length}の間で指定してください)` : `❌ Invalid index (Specify 1 to ${startupCmds.length})`];
        }
        const removed = startupCmds.splice(idx, 1)[0];
        localStorage.setItem("shellboards_startup", JSON.stringify(startupCmds));
        return [
          isJa 
            ? `✅ スタートアップコマンド "${removed}" を削除しました。` 
            : `✅ Deleted startup command: "${removed}"`
        ];
      }

      if (sub === 'edit') {
        const idxStr = args[1];
        const newCmd = args.slice(2).join(' ').trim();
        if (!idxStr || !newCmd) {
          return [isJa ? "❌ 番号と新しい内容を指定してください: startup edit <番号> <新しいコマンド>" : "❌ Specify index and new command: startup edit <index> <new_command>"];
        }
        const idx = parseInt(idxStr) - 1;
        if (isNaN(idx) || idx < 0 || idx >= startupCmds.length) {
          return [isJa ? `❌ 無効な番号です (1から${startupCmds.length}の間で指定してください)` : `❌ Invalid index (Specify 1 to ${startupCmds.length})`];
        }
        const oldCmd = startupCmds[idx];
        startupCmds[idx] = newCmd;
        localStorage.setItem("shellboards_startup", JSON.stringify(startupCmds));
        return [
          isJa 
            ? `✅ スタートアップコマンド #${idx+1} を変更しました: \n Old: "${oldCmd}" \n New: "${newCmd}"` 
            : `✅ Changed startup command #${idx+1}: \n Old: "${oldCmd}" \n New: "${newCmd}"`
        ];
      }

      if (sub === 'clear') {
        startupCmds = [];
        localStorage.setItem("shellboards_startup", JSON.stringify([]));
        return [
          isJa 
            ? "✅ すべてのスタートアップコマンドをクリアしました。" 
            : "✅ Cleared all startup commands."
        ];
      }

      if (sub === 'run') {
        if (startupCmds.length === 0) {
          return [isJa ? "ℹ️ 実行するスタートアップコマンドはありません。" : "ℹ️ No startup commands to execute."];
        }
        
        // Print message and run sequentially
        const results: any[] = [isJa ? "🚀 スタートアップコマンドを順次実行中..." : "🚀 Executing startup commands..."];
        
        for (const cmdStr of startupCmds) {
          if (!cmdStr.trim()) continue;
          
          apiFuncs.setOutput((prev: any) => [
            ...prev,
            {
              id: Math.random().toString(),
              content: (
                <div className="font-mono text-zinc-400 text-xs mt-2 select-none">
                  ⚡️ {isJa ? "実行中:" : "Executing:"} <span className="font-bold text-white underline">{cmdStr}</span>
                </div>
              )
            }
          ]);
          try {
            await apiFuncs.executeNested(cmdStr);
          } catch (e: any) {
            apiFuncs.setOutput((prev: any) => [
              ...prev,
              {
                id: Math.random().toString(),
                content: <span className="text-red-400 font-bold font-mono">⚠️ [Error] {e.message}</span>
              }
            ]);
          }
        }
        
        results.push(isJa ? "✅ すべてのスタートアップコマンドの実行が完了しました。" : "✅ Finished running startup commands.");
        return results;
      }

      return [isJa ? `⚠️ 不明なオプション: ${sub}` : `⚠️ Unknown option: ${sub}`];
    }
  
    case 'help': {
      const isJa = apiFuncs.getLang() === 'ja';
      const cmdArg = args[0] ? args[0].trim().toLowerCase() : null;


            const vfs = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      
      const loadWiki = (lang: string, defaults: Record<string, HelpInfo>) => {
        const result: Record<string, HelpInfo> = { ...defaults };
        const prefix = "/sys/wiki/" + lang + "/";
        for (const [path, entry] of Object.entries(vfs)) {
          const vfsEntry = entry as any;
          if (path.startsWith(prefix) && vfsEntry.type === 'file') {
            const cmdName = path.substring(prefix.length).replace('.json', '');
            try {
              const customInfo = JSON.parse(vfsEntry.content);
              result[cmdName] = { ...result[cmdName], ...customInfo };
            } catch (e) {}
          }
        }
        return result;
      };

      const helpsJa = loadWiki('ja', defaultHelpsJa);
      const helpsEn = loadWiki('en', defaultHelpsEn);
      
      const helpsObj = isJa ? helpsJa : helpsEn;

      if (cmdArg) {
        const cmdInfo = helpsObj[cmdArg];
        if (cmdInfo) {
          return [
            <div key="help-detail" className="my-2 border border-white/20 rounded-md p-5 bg-black/20 font-sans shadow-sm w-full max-w-xl text-zinc-200">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10 text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <span className="font-bold text-xl uppercase tracking-wide">{cmdArg.toUpperCase()}</span>
                {cmdInfo.cat && <span className="ml-auto text-xs px-2 py-0.5 rounded-full border border-emerald-400/30 text-emerald-300/80 bg-emerald-400/10 hover:bg-emerald-400/20 cursor-pointer transition-colors" onClick={() => apiFuncs.setInput('help')} >{cmdInfo.cat}</span>}
              </div>
              <div className="text-sm mb-4 opacity-90 leading-relaxed text-zinc-100">{cmdInfo.desc}</div>
              
              <div className="mb-4">
                 <div className="text-xs font-semibold text-emerald-400/70 mb-1 uppercase tracking-wider">{isJa ? "使用方法" : "Usage"}</div>
                 <div className="text-sm font-mono bg-black/50 p-2.5 rounded text-emerald-200 flex items-center overflow-x-auto border border-white/5">
                   <span className="opacity-50 select-none mr-2">$</span>
                   <span className="whitespace-nowrap">{cmdInfo.usage}</span>
                 </div>
              </div>
              
              {cmdInfo.options && cmdInfo.options.length > 0 && (
                <div className="mb-4">
                   <div className="text-xs font-semibold text-emerald-400/70 mb-1.5 uppercase tracking-wider">{isJa ? "オプション" : "Options"}</div>
                   <div className="flex flex-col gap-1.5">
                     {cmdInfo.options.map((opt, i) => (
                       <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 bg-black/30 p-2 rounded border border-white/5">
                         <span className="font-mono text-emerald-300 font-bold whitespace-nowrap">{opt.opt}</span>
                         <span className="text-xs text-zinc-300">{opt.desc}</span>
                       </div>
                     ))}
                   </div>
                </div>
              )}
              
              {cmdInfo.examples && cmdInfo.examples.length > 0 && (
                <div className="mb-5">
                   <div className="text-xs font-semibold text-emerald-400/70 mb-1.5 uppercase tracking-wider">{isJa ? "使用例" : "Examples"}</div>
                   <div className="flex flex-col gap-2">
                     {cmdInfo.examples.map((ex, i) => (
                       <div key={i} className="bg-black/40 rounded p-2.5 border border-white/5 relative overflow-hidden group">
                         <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500/30"></div>
                         <div className="pl-2">
                           <div className="font-mono text-sm text-emerald-100 flex items-center mb-1">
                             <span className="opacity-40 mr-2 select-none">$</span>
                             {ex.cmd}
                           </div>
                           <div className="text-xs text-zinc-400 leading-tight block">{ex.desc}</div>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
              
              {cmdInfo.related && cmdInfo.related.length > 0 && (
                <div className="mb-4">
                   <div className="text-xs font-semibold text-emerald-400/70 mb-1.5 uppercase tracking-wider">{isJa ? "関連コマンド" : "Related Commands"}</div>
                   <div className="flex flex-wrap gap-2">
                      {cmdInfo.related.map(r => (
                        <button 
                          key={r} 
                          onClick={() => apiFuncs.insertInput(r)} 
                          className="text-xs font-mono px-2.5 py-1 bg-white/5 hover:bg-emerald-400/20 hover:text-emerald-300 text-zinc-300 border border-white/10 hover:border-emerald-400/30 rounded transition-colors"
                          title={isJa ? `コマンドをここに挿入: ${r}` : `Insert command: ${r}`}
                        >
                          {r}
                        </button>
                      ))}
                   </div>
                </div>
              )}
              
              <div className="pt-3 border-t border-white/10 text-xs opacity-60 flex justify-between items-center mt-2">
                <button onClick={() => apiFuncs.setInput('help')} className="hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1 bg-white/5 px-2 py-1.5 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  <span>{isJa ? "一覧に戻る" : "Back to index"}</span>
                </button>
              </div>
            </div>
          ];
        } else {
          return [isJa ? `⚠️ コマンド '${cmdArg}' のヘルプは見つかりませんでした` : `⚠️ Reference for '${cmdArg}' not found`];
        }
      }

      const categories = [
        { id: 'FILE', ja: 'ファイル / ディレクトリ', en: 'File System & Editor', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path> },
        { id: 'BBS', ja: '掲示板 / スレッド', en: 'BBS & Threads', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path> },
        { id: 'UI', ja: 'UI / 環境 / テーマ', en: 'Environment & UI', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path> },
        { id: 'EXEC', ja: 'システム実行 / 計算 / AI', en: 'Execution & AI', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path> },
        { id: 'UTIL', ja: 'ユーティリティ', en: 'Core Utilities', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path> },
        { id: 'SYS', ja: 'システム管理', en: 'System Management', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path> }
      ];

      return [
        <div key="help-list" className="my-3 border border-white/20 rounded-md bg-black/20 font-sans shadow-sm w-full max-w-5xl text-zinc-200 overflow-hidden">
          <div className="bg-black/40 px-5 pt-5 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3 text-emerald-400 mb-2">
              <div className="p-1.5 bg-emerald-400/10 rounded-lg border border-emerald-400/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              </div>
              <h2 className="text-xl font-bold tracking-wider">{isJa ? "シェルマニュアル (WIKI)" : "SHELL BBS AI WIKI MANUAL"}</h2>
            </div>
            <p className="text-sm opacity-90 leading-relaxed text-zinc-300">
               {isJa ? "このターミナルはAIが自律的にタスクを遂行するための仕様を備えています。以下のコマンド群を組み合わせて操作します。" : "This terminal allows AI to autonomously compose commands."}
            </p>
            <p className="text-xs text-sky-300 font-mono mt-2 bg-sky-900/20 p-2 rounded border border-sky-400/20">Supported: pipes (|), redirects {"(> / >>)"}, sequential (;), shell variables ($VAR), and aliases.</p>
          </div>
          
          <div className="p-5 flex flex-col gap-6">
            {categories.map(category => {
               const catCmds = Object.entries(helpsObj).filter(([k,v]) => (v as HelpInfo).cat === category.id);
               if (catCmds.length === 0) return null;
               return (
                 <div key={category.id} className="bg-black/30 rounded-lg border border-white/10 overflow-hidden shadow-sm">
                   <div className="bg-white/5 px-4 py-3 flex items-center gap-2 border-b border-white/10">
                     <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">{category.icon}</svg>
                     <h3 className="font-semibold text-emerald-100 text-base">{isJa ? category.ja : category.en}</h3>
                   </div>
                   <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                     {catCmds.map(([cmdKey, info]) => (
                       <div 
                         key={cmdKey} 
                         onClick={() => apiFuncs.setInput(`help ${cmdKey}`)}
                         className="group cursor-pointer bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 hover:border-emerald-400/40 rounded-xl p-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-900/30 flex flex-col h-full"
                       >
                         <div className="flex items-center gap-2 mb-2">
                           <div className="p-1.5 bg-black/40 rounded-md text-emerald-400/70 group-hover:text-emerald-300 group-hover:bg-emerald-400/20 transition-colors">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               {category.id === 'FILE' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>}
                               {category.id === 'BBS' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>}
                               {category.id === 'UI' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>}
                               {category.id === 'EXEC' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>}
                               {category.id === 'UTIL' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>}
                               {category.id === 'SYS' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>}
                             </svg>
                           </div>
                           <div 
                             onClick={(e) => {
                               e.stopPropagation();
                               apiFuncs.insertInput(cmdKey);
                             }}
                             className="font-mono font-bold text-emerald-300 hover:text-emerald-100 hover:bg-emerald-500/10 px-2 py-0.5 rounded cursor-pointer transition-colors active:scale-95 border border-transparent hover:border-emerald-500/20"
                             title={isJa ? `コマンド名「${cmdKey}」をここに挿入` : `Insert command name: ${cmdKey}`}
                           >
                             {cmdKey}
                           </div>
                         </div>
                         <div className="text-xs text-zinc-400 group-hover:text-zinc-200 line-clamp-2 leading-relaxed transition-colors mt-auto">{info.desc}</div>
                       </div>
                     ))}
                   </div>
                 </div>
               );
            })}
          </div>
          <div className="bg-black/60 p-4 font-mono border-t border-white/10 text-xs text-emerald-400/80 flex items-center justify-between">
            <span className="italic">{isJa ? "💡 各カードをクリックすると詳細な使い方を確認できます。" : "💡 Click on a card to see usage details."}</span>
            <span className="italic opacity-50 flex items-center gap-1">To AI: Combine these commands</span>
          </div>
        </div>
      ];
    }

    case 'watch':
       if (args.length === 1 && (args[0] === 'stops' || args[0] === 'clear')) {
          apiFuncs.clearWatch();
          const isJa = apiFuncs.getLang() === 'ja';
          return [isJa ? '定期監視を停止しました。' : 'Watch stopped successfully.'];
       }
       if (args.length < 2) return [`${t.usage}: watch <interval_sec> <cmd>`];
       const sec = parseInt(args[0]);
       const cmdToWatch = args.slice(1).join(' ');
       apiFuncs.clearWatch();
       apiFuncs.setWatch(async () => {
           const result = await apiFuncs.executeNested(cmdToWatch);
           apiFuncs.setOutput((prev: any) => [
              ...prev, 
              ...result.map(c => ({ id: Math.random().toString(), content: c }))
           ]);
       }, sec * 1000);
       return [`Watching '${cmdToWatch}' every ${sec} seconds`];


    case 'schedule': {
      const isJa = apiFuncs.getLang() === 'ja';
      const vfs = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      const newVfs = { ...vfs };
      const schedDir = '/sys/schedule';
      if (!newVfs[schedDir]) newVfs[schedDir] = { type: 'dir' };
      
      const sub = args[0] ? args[0].toLowerCase() : '';
      if (sub === 'add') {
        const time = args[1];
        const content = args.slice(2).join(' ');
        if (!time || !content) return [isJa ? "使用法: schedule add <日時> <内容>" : "Usage: schedule add <time> <content>"];
        
        const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        newVfs[schedDir + '/' + id + '.json'] = {
          type: 'file',
          content: JSON.stringify({ id, time, content, createdAt: Date.now() })
        };
        apiFuncs.setVFS(newVfs);
        return [isJa ? `✅ 予定(id:${id})を追加しました` : `✅ Schedule(id:${id}) added`];
      }
      
      if (sub === 'rm') {
        const id = args[1];
        if (!id) return [isJa ? "使用法: schedule rm <id>" : "Usage: schedule rm <id>"];
        const fp = schedDir + '/' + id + '.json';
        if (newVfs[fp]) {
          delete newVfs[fp];
          apiFuncs.setVFS(newVfs);
          return [isJa ? `✅ 予定(${id})を削除しました` : `✅ Schedule(${id}) removed`];
        }
        return [isJa ? `⚠️ 予定(${id})が見つかりません` : `⚠️ Schedule(${id}) not found`];
      }
      
      if (sub === 'ls' || sub === '') {
        const items: any[] = [];
        for (const [path, entry] of Object.entries(newVfs)) {
          const vfsEntry = entry as any;
          if (path.startsWith(schedDir + '/') && vfsEntry.type === 'file') {
            try { items.push(JSON.parse(vfsEntry.content || "{}")); } catch(e) {}
          }
        }
        if (items.length === 0) return [isJa ? "📅 予定はありません。" : "📅 No schedules."];
        
        items.sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0));
        
        const ui = (
          <div key={"sched-"+Date.now()} className="my-2 border border-blue-500/30 rounded bg-blue-900/10 p-3 max-w-lg font-sans">
            <h3 className="text-blue-300 font-bold mb-2 flex items-center gap-2">
              📅 {isJa ? "スケジュール一覧" : "Schedule List"}
            </h3>
            <ul className="space-y-1">
              {items.map(it => (
                <li key={it.id} className="text-sm border-b border-blue-500/10 pb-1 flex gap-2">
                  <span className="text-blue-400 font-mono w-12 shrink-0">{it.time}</span>
                  <span className="text-blue-100 flex-1">{it.content}</span>
                  <span className="text-blue-500/50 text-xs font-mono ml-4">id:{it.id}</span>
                </li>
              ))}
            </ul>
          </div>
        );
        const text = items.map(it => `${it.time} ${it.content} (id:${it.id})`).join('\n');
        return [{ _isUIObj: true, ui, text }];
      }
      return [isJa ? "不明なサブコマンド。ls, add, rmを使用してください。" : "Unknown sub command. Use ls, add, rm."];
    }

    case 'task': {
      const isJa = apiFuncs.getLang() === 'ja';
      const vfs = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      const newVfs = { ...vfs };
      const taskDir = '/sys/tasks';
      if (!newVfs[taskDir]) newVfs[taskDir] = { type: 'dir' };
      
      const sub = args[0] ? args[0].toLowerCase() : '';
      if (sub === 'add') {
        const content = args.slice(1).join(' ');
        if (!content) return [isJa ? "使用法: task add <内容>" : "Usage: task add <content>"];
        
        const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        newVfs[taskDir + '/' + id + '.json'] = {
          type: 'file',
          content: JSON.stringify({ id, content, done: false, createdAt: Date.now() })
        };
        apiFuncs.setVFS(newVfs);
        return [isJa ? `✅ タスク(id:${id})を追加しました` : `✅ Task(id:${id}) added`];
      }
      
      if (sub === 'check' || sub === 'uncheck') {
        const id = args[1];
        if (!id) return [isJa ? `使用法: task ${sub} <id>` : `Usage: task ${sub} <id>`];
        const fp = taskDir + '/' + id + '.json';
        if (newVfs[fp]) {
          try {
            const data = JSON.parse(newVfs[fp].content || "{}");
            data.done = sub === 'check';
            newVfs[fp].content = JSON.stringify(data);
            apiFuncs.setVFS(newVfs);
            return [isJa ? `✅ タスク(${id})を更新しました` : `✅ Task(${id}) updated`];
          } catch(e) {}
        }
        return [isJa ? `⚠️ タスク(${id})が見つかりません` : `⚠️ Task(${id}) not found`];
      }

      if (sub === 'rm') {
        const id = args[1];
        if (!id) return [isJa ? "使用法: task rm <id>" : "Usage: task rm <id>"];
        const fp = taskDir + '/' + id + '.json';
        if (newVfs[fp]) {
          delete newVfs[fp];
          apiFuncs.setVFS(newVfs);
          return [isJa ? `✅ タスク(${id})を削除しました` : `✅ Task(${id}) removed`];
        }
        return [isJa ? `⚠️ タスク(${id})が見つかりません` : `⚠️ Task(${id}) not found`];
      }
      
      if (sub === 'ls' || sub === '') {
        const items: any[] = [];
        for (const [path, entry] of Object.entries(newVfs)) {
          const vfsEntry = entry as any;
          if (path.startsWith(taskDir + '/') && vfsEntry.type === 'file') {
            try { items.push(JSON.parse(vfsEntry.content || "{}")); } catch(e) {}
          }
        }
        if (items.length === 0) return [isJa ? "📝 タスクはありません。" : "📝 No tasks."];
        
        items.sort((a,b) => (a.createdAt || 0) - (b.createdAt || 0));
        
        const ui = (
          <div key={"task-"+Date.now()} className="my-2 border border-emerald-500/30 rounded bg-emerald-900/10 p-3 max-w-lg font-sans">
            <h3 className="text-emerald-300 font-bold mb-2 flex items-center gap-2">
              📝 {isJa ? "タスク一覧" : "Tasks"}
            </h3>
            <ul className="space-y-1">
              {items.map(it => (
                <li key={it.id} className={`text-sm border-b border-emerald-500/10 pb-1 flex gap-2 ${it.done ? 'opacity-50 line-through' : ''}`}>
                  <span className="text-emerald-400 font-mono w-6 shrink-0">{it.done ? '[x]' : '[ ]'}</span>
                  <span className="text-emerald-100 flex-1">{it.content}</span>
                  <span className="text-emerald-500/50 text-xs font-mono ml-4">id:{it.id}</span>
                </li>
              ))}
            </ul>
          </div>
        );
        const text = items.map(it => `${it.done ? '[x]' : '[ ]'} ${it.content} (id:${it.id})`).join('\n');
        return [{ _isUIObj: true, ui, text }];
      }
      return [isJa ? "不明なサブコマンド。ls, add, rm, check, uncheckを使用してください。" : "Unknown sub command."];
    }

    case 'objective':
    case 'goal': {
      const isJa = apiFuncs.getLang() === 'ja';
      const sub = args[0] ? args[0].toLowerCase() : '';
      const currentObjective = apiFuncs.getObjective ? apiFuncs.getObjective() : '';
      
      if (sub === 'set' || sub === 'update') {
        const newObj = args.slice(1).join(' ');
        if (!newObj) return [isJa ? "使用法: objective set <目的・指示内容>" : "Usage: objective set <objective_text>"];
        if (apiFuncs.setObjective) {
          apiFuncs.setObjective(newObj);
        }
        return [isJa ? `🎯 AIエージェントの目的・ゴールを設定しました：\n"${newObj}"` : `🎯 AI agent objective/goal set to:\n"${newObj}"`];
      }
      
      if (sub === 'clear' || sub === 'reset') {
        if (apiFuncs.setObjective) {
          apiFuncs.setObjective('');
        }
        return [isJa ? "🎯 AIエージェントの目的・ゴールをクリアしました。" : "🎯 AI agent objective/goal cleared."];
      }
      
      const ui = (
        <div key={"obj-" + Date.now()} className="my-3 font-sans w-full max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-amber-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-sm font-bold text-amber-550 dark:text-amber-400">
              🎯 {isJa ? "AIエージェントの目的・ミッション設定" : "AI Agent Objective & Mission"}
            </span>
          </div>
          <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl relative shadow-[0_0_15px_rgba(245,158,11,0.03)] selection:bg-amber-500/30">
            {currentObjective ? (
              <div>
                <div className="text-xs text-zinc-400 mb-2 font-mono border-b border-zinc-900 pb-1.5 flex justify-between items-center">
                  <span>{isJa ? "現在設定されている目的" : "Current Active Goal"}</span>
                  <button 
                    onClick={() => apiFuncs.setInput(`objective clear`)}
                    className="text-red-400 hover:text-red-500 cursor-pointer text-[10px] bg-red-500/5 px-1.5 py-0.5 rounded border border-red-500/20"
                  >
                    {isJa ? "クリア" : "Clear"}
                  </button>
                </div>
                <p className="text-sm text-zinc-150 font-medium leading-relaxed italic bg-zinc-900/40 p-3 rounded-lg border border-zinc-850">
                  "{currentObjective}"
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                  {isJa 
                    ? "AIに長期的なゴールや果たすべき役割（例: 歴史の解説者、テストコード自動生成マシーン、日本語教師など）を与えることができます。設定すると全対話でその設定が最優先されます。"
                    : "Give the AI Agent a long-term goal or specialized role. When set, this goal overrides default instructions in all agent reasoning loops."}
                </p>
                <button
                  onClick={() => apiFuncs.setInput(`objective set `)}
                  className="text-xs font-semibold px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 cursor-pointer rounded-lg text-amber-400 transition-all font-mono"
                >
                  + {isJa ? "目的を設定する (objective set)" : "Set Objective"}
                </button>
              </div>
            )}
          </div>
        </div>
      );
      const text = currentObjective 
        ? `Active Objective: "${currentObjective}"` 
        : "No custom objective set.";
      return [{ _isUIObj: true, ui, text }];
    }

    case 'memory':
    case 'mem': {
      const isJa = apiFuncs.getLang() === 'ja';
      const vfs = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      const newVfs = { ...vfs };
      const memDir = '/sys/memory';
      if (!newVfs[memDir]) newVfs[memDir] = { type: 'dir' };
      
      const sub = args[0] ? args[0].toLowerCase() : '';
      if (sub === 'add') {
        const cat = args[1];
        const content = args.slice(2).join(' ');
        if (!cat || !content) return [isJa ? "使用法: memory add <category> <content>" : "Usage: memory add <category> <content>"];
        
        const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
        newVfs[memDir + '/' + id + '.json'] = {
          type: 'file',
          content: JSON.stringify({ id, category: cat, content })
        };
        apiFuncs.setVFS(newVfs);
        return [isJa ? `✅ 記憶(id:${id})を追加しました` : `✅ Memory(id:${id}) added`];
      }
      
      if (sub === 'rm') {
        const id = args[1];
        if (!id) return [isJa ? "使用法: memory rm <id>" : "Usage: memory rm <id>"];
        const fp = memDir + '/' + id + '.json';
        if (newVfs[fp]) {
          delete newVfs[fp];
          apiFuncs.setVFS(newVfs);
          return [isJa ? `✅ 記憶(${id})を削除しました` : `✅ Memory(${id}) removed`];
        } else {
          return [isJa ? `⚠️ 記憶(${id})が見つかりません` : `⚠️ Memory(${id}) not found`];
        }
      }
      
      if (sub === 'ls' || sub === '') {
        const mems: any[] = [];
        for (const [path, entry] of Object.entries(newVfs)) {
          const vfsEntry = entry as any;
          if (path.startsWith(memDir + '/') && vfsEntry.type === 'file') {
            try {
               mems.push(JSON.parse(vfsEntry.content));
            } catch (e) {}
          }
        }
        if (mems.length === 0) {
          return [isJa ? "💡 記憶はまだありません。AIチャット中に自動学習するか、または `memory add <カテゴリ> <内容>` で登録できます。" : "💡 No memories yet. They are built during conversations or via `memory add <category> <content>`."];
        }
        
        const byCat = mems.reduce((acc, m) => {
          if (!acc[m.category]) acc[m.category] = [];
          acc[m.category].push(m);
          return acc;
        }, {} as Record<string, any[]>);

        const activeThemeKey = apiFuncs.getTheme ? apiFuncs.getTheme() : "emerald";
        
        const themeStyles: Record<string, {
          cardBg: string;
          borderColor: string;
          titleColor: string;
          badgeBg: string;
          badgeText: string;
          contentColor: string;
          idColor: string;
          hoverBg: string;
        }> = {
          emerald: {
            cardBg: "bg-zinc-950/80 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]",
            borderColor: "border-emerald-500/20",
            titleColor: "text-emerald-400 font-mono font-bold",
            badgeBg: "bg-emerald-500/10 border border-emerald-500/30",
            badgeText: "text-emerald-400",
            contentColor: "text-zinc-200",
            idColor: "text-emerald-500/60 font-mono",
            hoverBg: "hover:bg-emerald-500/10"
          },
          matrix: {
            cardBg: "bg-black border border-[#00ff41]/20 shadow-[0_0_15px_rgba(0,255,65,0.05)]",
            borderColor: "border-[#00ff41]/25",
            titleColor: "text-[#00ff41] font-mono font-bold",
            badgeBg: "bg-[#003b0d]/40 border border-[#00ff41]/40",
            badgeText: "text-[#00ff41]",
            contentColor: "text-[#00ff41]/90",
            idColor: "text-[#00ff41]/50 font-mono",
            hoverBg: "hover:bg-[#00ff41]/15"
          },
          amber: {
            cardBg: "bg-zinc-950/90 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]",
            borderColor: "border-amber-500/20",
            titleColor: "text-amber-400 font-mono font-bold",
            badgeBg: "bg-amber-500/10 border border-amber-500/30",
            badgeText: "text-amber-400",
            contentColor: "text-zinc-200",
            idColor: "text-amber-500/50 font-mono",
            hoverBg: "hover:bg-amber-500/10"
          },
          dracula: {
            cardBg: "bg-[#282a36]/90 border border-[#bd93f9]/25 shadow-[0_0_15px_rgba(189,147,249,0.05)]",
            borderColor: "border-[#bd93f9]/20",
            titleColor: "text-[#ff79c6] font-semibold",
            badgeBg: "bg-[#bd93f9]/15 border border-[#bd93f9]/35",
            badgeText: "text-[#bd93f9]",
            contentColor: "text-[#f8f8f2]",
            idColor: "text-[#6272a4] font-mono",
            hoverBg: "hover:bg-[#bd93f9]/10"
          },
          cyberpunk: {
            cardBg: "bg-[#1e0033]/90 border border-[#ff0055]/30 shadow-[0_0_15px_rgba(255,0,85,0.05)]",
            borderColor: "border-[#ff0055]/30",
            titleColor: "text-[#00ffff] font-bold tracking-wider uppercase",
            badgeBg: "bg-[#ff0055]/15 border border-[#ff0055]/40",
            badgeText: "text-[#ffff00]",
            contentColor: "text-zinc-100",
            idColor: "text-[#ff0055]/70 font-mono",
            hoverBg: "hover:bg-[#ff0055]/10"
          },
          classic: {
            cardBg: "bg-[#1c1c1c] border border-zinc-700",
            borderColor: "border-zinc-700",
            titleColor: "text-zinc-150 font-bold",
            badgeBg: "bg-zinc-800 border border-zinc-650",
            badgeText: "text-zinc-350",
            contentColor: "text-zinc-200",
            idColor: "text-zinc-500 font-mono",
            hoverBg: "hover:bg-zinc-800"
          },
          light: {
            cardBg: "bg-white border border-zinc-200 shadow-sm",
            borderColor: "border-zinc-200",
            titleColor: "text-rose-600 font-bold",
            badgeBg: "bg-rose-50 border border-rose-200",
            badgeText: "text-rose-600",
            contentColor: "text-zinc-700",
            idColor: "text-zinc-400 font-mono",
            hoverBg: "hover:bg-rose-50"
          }
        };

        const styles = themeStyles[activeThemeKey] || themeStyles["emerald"];

        const ui = (
          <div key={"mem-" + Date.now()} className="my-3 font-sans w-full max-w-4xl">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.165 12.008 5.832 11.5 7.5 11.5s3.333.508 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.835 12.008 18.168 11.5 16.5 11.5c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className={`text-sm md:text-base font-bold ${styles.titleColor}`}>
                🧠 {isJa ? "AI 記憶システム (メモリーカード)" : "AI Brain Memory Cards"}
              </h3>
            </div>
            
            <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
              {isJa 
                ? "💡 各カードはAIが保持する対話用の記憶スペースです。ゴミ箱アイコンクリックで削除、または [+ 追加] で新規情報をカテゴリへ追加します。"
                : "💡 Each card is a contextual memory item used by the AI Agent. Click the trash icon to delete, or [+ Add] to append new entries."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(byCat).map(([cat, items]) => {
                const catMems = items as any[];
                return (
                  <div key={cat} className={`rounded-xl p-4 flex flex-col justify-between transition-all duration-200 ${styles.cardBg}`}>
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b pb-2 mb-3 border-zinc-800/60">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <span className="font-bold text-xs tracking-wide uppercase text-zinc-100 truncate">{cat}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] font-mono rounded px-1.5 py-0.5 ${styles.badgeBg} ${styles.badgeText}`}>
                            {catMems.length}
                          </span>
                          <button 
                            onClick={() => apiFuncs.setInput(`memory add ${cat} `)}
                            title={isJa ? "このカテゴリに記憶を追加" : "Add memory to this category"}
                            className="text-[10px] cursor-pointer rounded px-1.5 py-0.5 bg-black/40 border border-zinc-800 hover:border-emerald-500/40 text-emerald-400 transition-all font-medium"
                          >
                            + {isJa ? "追加" : "Add"}
                          </button>
                        </div>
                      </div>

                      {/* Card Items */}
                      <ul className="space-y-2">
                        {catMems.map(m => (
                          <li key={m.id} className={`group text-xs flex items-start gap-2 p-1.5 rounded-lg transition-colors ${styles.hoverBg}`}>
                            <span className="text-zinc-600 select-none mt-0.5">•</span>
                            <span className={`flex-1 break-words leading-relaxed ${styles.contentColor}`}>{m.content}</span>
                            <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                              <span 
                                className={`px-1 py-0.5 rounded text-[9px] bg-black/30 border border-zinc-800/80 cursor-pointer ${styles.idColor}`} 
                                onClick={() => apiFuncs.setInput(`memory rm ${m.id}`)} 
                                title={isJa ? "クリックして削除コマンドをロード" : "Click to load delete command"}
                              >
                                {m.id}
                              </span>
                              <button 
                                onClick={() => apiFuncs.setInput(`memory rm ${m.id}`)}
                                title={isJa ? "削除" : "Delete"}
                                className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-0.5 rounded transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

        const text = mems.map(m => `[${m.category}] ${m.id}: ${m.content}`).join('\n');
        return [{ _isUIObj: true, ui, text }];
      }
      
      return [isJa ? "無効なコマンドです: memory [ls|add|rm]" : "Invalid sub command: memory [ls|add|rm]"];
    }

    case 'alias':
      if (args.length === 0) {
        return Object.entries(apiFuncs.getAliases()).map(([k, v]) => `${k}='${v}'`);
      }
      for (const arg of args) {
        const match = arg.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/);
        if (match) {
          apiFuncs.setAlias(match[1], match[2]);
        } else {
          return [`alias: invalid format: ${arg}. Use name=command`];
        }
      }
      return [];

    default:
      if (stdin.length > 0) return stdin;
      throw new Error(`bash: ${cmd}: ${t.cmdNotFound}`);
  }
}

interface Instruction {
  type: 'cmd' | 'for' | 'if';
  cmdStr?: string;
  varName?: string;
  itemsRawStr?: string;
  bodyBlock?: Instruction[];
  condCmd?: string;
  thenBlock?: Instruction[];
  elseBlock?: Instruction[];
}

function splitIntoStatements(scriptStr: string): string[] {
  const lines = tokenize(scriptStr, '\n');
  const stmts: string[] = [];
  for (const line of lines) {
    const pieces = tokenize(line, ';');
    for (const piece of pieces) {
      const trimmed = piece.trim();
      if (!trimmed) continue;
      
      // Split statements that start with do, then, or else to ensure they are parsed as separate tokens
      if (trimmed.startsWith('do ') && trimmed !== 'do') {
        stmts.push('do');
        stmts.push(trimmed.substring(3).trim());
      } else if (trimmed.startsWith('then ') && trimmed !== 'then') {
        stmts.push('then');
        stmts.push(trimmed.substring(5).trim());
      } else if (trimmed.startsWith('else ') && trimmed !== 'else') {
        stmts.push('else');
        stmts.push(trimmed.substring(5).trim());
      } else {
        stmts.push(trimmed);
      }
    }
  }
  return stmts;
}

function parseStatements(
  statements: string[],
  startIndex: number = 0,
  stopKeywords: string[] = []
): { instructions: Instruction[]; nextIndex: number } {
  const instructions: Instruction[] = [];
  let i = startIndex;

  while (i < statements.length) {
    const stmt = statements[i].trim();
    if (!stmt) {
      i++;
      continue;
    }

    const words = stmt.split(/\s+/);
    const firstWord = words[0];

    // If we meet a stop keyword for the current parent block, stop parsing
    if (stopKeywords.includes(firstWord) || stopKeywords.includes(stmt)) {
      break;
    }

    if (firstWord === 'for') {
      const varName = words[1] || 'item';
      let itemsRawStr = '';
      if (words[2] === 'in') {
        itemsRawStr = words.slice(3).join(' ');
      }
      i++;

      // Advance to 'do' statement
      while (i < statements.length) {
        const nextStmt = statements[i].trim();
        if (nextStmt === 'do') {
          i++;
          break;
        }
        i++;
      }

      // Parse body until 'done'
      const parsedBody = parseStatements(statements, i, ['done']);
      i = parsedBody.nextIndex;

      // Consume 'done'
      if (i < statements.length && statements[i].trim() === 'done') {
        i++;
      }

      instructions.push({
        type: 'for',
        varName,
        itemsRawStr,
        bodyBlock: parsedBody.instructions
      });

    } else if (firstWord === 'if') {
      const condCmd = stmt.substring(2).trim(); // Skip 'if'
      i++;

      // Advance to 'then' statement
      while (i < statements.length) {
        const nextStmt = statements[i].trim();
        if (nextStmt === 'then') {
          i++;
          break;
        }
        i++;
      }

      // Parse thenBlock until 'fi', 'else', or 'elif'
      const parsedThen = parseStatements(statements, i, ['fi', 'else', 'elif']);
      i = parsedThen.nextIndex;

      let elseBlock: Instruction[] = [];

      // Check if 'else' or 'elif' is next
      if (i < statements.length) {
        const nextStmt = statements[i].trim();
        const nextWords = nextStmt.split(/\s+/);
        const nextFirst = nextWords[0];

        if (nextFirst === 'else') {
          i++; // Consume 'else'
          const parsedElse = parseStatements(statements, i, ['fi']);
          i = parsedElse.nextIndex;
          elseBlock = parsedElse.instructions;
        } else if (nextFirst === 'elif') {
          // Re-write elif to 'if ...' and parse recursively
          statements[i] = 'if ' + nextStmt.substring(4).trim();
          const parsedElif = parseStatements(statements, i, ['fi']);
          i = parsedElif.nextIndex;
          elseBlock = parsedElif.instructions;
        }
      }

      // Consume 'fi'
      if (i < statements.length && statements[i].trim() === 'fi') {
        i++;
      }

      instructions.push({
        type: 'if',
        condCmd,
        thenBlock: parsedThen.instructions,
        elseBlock
      });

    } else {
      instructions.push({
        type: 'cmd',
        cmdStr: stmt
      });
      i++;
    }
  }

  return { instructions, nextIndex: i };
}

function evaluateTestCondition(condStr: string, apiFuncs: any): boolean {
  let s = condStr.trim();
  if (s.startsWith('[') && s.endsWith(']')) {
    s = s.substring(1, s.length - 1).trim();
  } else if (s.startsWith('test ')) {
    s = s.substring(5).trim();
  } else {
    return false;
  }

  const env = apiFuncs.getAllEnv();
  const rawParts = parseArgs(s);
  const parts = rawParts.map(p => substituteEnv(p, env));

  if (parts.length === 0) return false;

  if (parts.length === 2) {
    const op = parts[0];
    const val = parts[1];
    if (op === '-z') return val === '';
    if (op === '-n') return val !== '';
  }

  if (parts.length === 3) {
    const left = parts[0];
    const op = parts[1];
    const right = parts[2];
    
    if (op === '=' || op === '==') return left === right;
    if (op === '!=') return left !== right;
    if (op === '-eq') return parseInt(left) === parseInt(right);
    if (op === '-ne') return parseInt(left) !== parseInt(right);
    if (op === '-gt') return parseInt(left) > parseInt(right);
    if (op === '-ge') return parseInt(left) >= parseInt(right);
    if (op === '-lt') return parseInt(left) < parseInt(right);
    if (op === '-le') return parseInt(left) <= parseInt(right);
  }

  if (parts.length === 1) {
    return parts[0] !== '';
  }

  return false;
}

async function evaluateCondition(condCmd: string, apiFuncs: any): Promise<boolean> {
  const trimmed = condCmd.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('test ')) {
    return evaluateTestCondition(trimmed, apiFuncs);
  }
  
  try {
    const results = await apiFuncs.executeNested(trimmed);
    if (results.length > 0) {
      const firstLine = results[0].toLowerCase();
      if (firstLine.includes('not found') || firstLine.includes('error') || firstLine.includes('invalid')) {
        return false;
      }
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

async function substituteCommands(text: string, apiFuncs: any): Promise<string> {
  let resultText = text;
  
  // 1. Resolve $() nested command substitutions recursively
  let hasMore = true;
  let iterations = 0;
  const maxIterations = 50;
  
  while (hasMore && iterations < maxIterations) {
    iterations++;
    let idx = -1;
    let closingIdx = -1;
    
    // Find the last "$(" that has a closing ")" after it to resolve the innermost one first
    for (let i = resultText.length - 2; i >= 0; i--) {
      if (resultText.substring(i, i + 2) === "$(") {
        const cIdx = resultText.indexOf(")", i + 2);
        if (cIdx !== -1) {
          idx = i;
          closingIdx = cIdx;
          break;
        }
      }
    }
    
    if (idx !== -1 && closingIdx !== -1) {
      const fullMatch = resultText.substring(idx, closingIdx + 1);
      const innerCmd = resultText.substring(idx + 2, closingIdx);
      try {
        const cmdResult = await apiFuncs.executeNested(innerCmd);
        const resultStr = cmdResult.join('\n').replace(/\n+$/, '');
        // Escape backslashes, double quotes, and newlines so they are preserved after parsing
        const escapedResult = resultStr
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n');
        resultText = resultText.substring(0, idx) + escapedResult + resultText.substring(closingIdx + 1);
      } catch (e) {
        resultText = resultText.substring(0, idx) + resultText.substring(closingIdx + 1);
      }
    } else {
      hasMore = false;
    }
  }

  // 2. Resolve ` ` backtick substitutions recursively
  hasMore = true;
  let btIterations = 0;
  while (hasMore && btIterations < maxIterations) {
    btIterations++;
    let idx = -1;
    let closingIdx = -1;
    
    for (let i = resultText.length - 2; i >= 0; i--) {
      if (resultText[i] === "`") {
        const cIdx = resultText.indexOf("`", i + 1);
        if (cIdx !== -1) {
          idx = i;
          closingIdx = cIdx;
          break;
        }
      }
    }
    
    if (idx !== -1 && closingIdx !== -1) {
      const fullMatch = resultText.substring(idx, closingIdx + 1);
      const innerCmd = resultText.substring(idx + 1, closingIdx);
      try {
        const cmdResult = await apiFuncs.executeNested(innerCmd);
        const resultStr = cmdResult.join('\n').replace(/\n+$/, '');
        // Escape backslashes, double quotes, and newlines so they are preserved after parsing
        const escapedResult = resultStr
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n');
        resultText = resultText.substring(0, idx) + escapedResult + resultText.substring(closingIdx + 1);
      } catch (e) {
        resultText = resultText.substring(0, idx) + resultText.substring(closingIdx + 1);
      }
    } else {
      hasMore = false;
    }
  }

  return resultText;
}

async function evaluateForItems(itemsRawStr: string, apiFuncs: any): Promise<any[]> {
  const text = await substituteCommands(itemsRawStr, apiFuncs);
  const env = apiFuncs.getAllEnv();
  const expanded = substituteEnv(text, env);
  return parseArgs(expanded);
}

async function evalInstructions(
  instructions: Instruction[],
  username: string,
  apiFuncs: any,
  showDebug: boolean = false
): Promise<any[]> {
  const outputs: any[] = [];

  for (const inst of instructions) {
    if (inst.type === 'cmd' && inst.cmdStr) {
      const trimmed = inst.cmdStr.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      if (showDebug) {
        apiFuncs.setOutput((prev: any) => [
          ...prev,
          { id: Math.random().toString(), content: <div className="text-zinc-500 font-mono pl-2 border-l border-zinc-800">⚡️ script run: {trimmed}</div> }
        ]);
      }

      const res = await apiFuncs.executeNested(trimmed);
      if (res && res.length > 0) {
        outputs.push(...res);
        apiFuncs.setOutput((prev: any) => {
          let next = [...prev, ...res.map(content => ({ id: Math.random().toString(), content: (content && content._isUIObj) ? content.ui : content }))];
          if (next.length > 2000) next = next.slice(next.length - 2000);
          return next;
        });
      }
    } else if (inst.type === 'for' && inst.varName && inst.itemsRawStr) {
      const items = await evaluateForItems(inst.itemsRawStr, apiFuncs);
      const originalVarValue = apiFuncs.getAllEnv()[inst.varName] || '';

      for (const item of items) {
        apiFuncs.setEnv(inst.varName, item);
        const res = await evalInstructions(inst.bodyBlock || [], username, apiFuncs, showDebug);
        outputs.push(...res);
      }

      if (originalVarValue) {
        apiFuncs.setEnv(inst.varName, originalVarValue);
      } else {
        apiFuncs.setEnv(inst.varName, '');
      }
    } else if (inst.type === 'if' && inst.condCmd) {
      const condResult = await evaluateCondition(inst.condCmd, apiFuncs);
      if (condResult) {
        const res = await evalInstructions(inst.thenBlock || [], username, apiFuncs, showDebug);
        outputs.push(...res);
      } else {
        const res = await evalInstructions(inst.elseBlock || [], username, apiFuncs, showDebug);
        outputs.push(...res);
      }
    }
  }

  return outputs;
}

function extractAndRegisterFunctions(scriptStr: string, apiFuncs: any): string {
  const lines = scriptStr.split('\n');
  const cleanLines: string[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      cleanLines.push(lines[i]);
      i++;
      continue;
    }
    
    let funcName = "";
    let headerMatch = line.match(/^(?:function\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*\)\s*\{/);
    if (!headerMatch) {
      headerMatch = line.match(/^function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\{/);
    }
    
    if (!headerMatch) {
      const nextNonEmpty = (idx: number) => {
        for (let k = idx; k < lines.length; k++) {
          if (lines[k].trim()) return { text: lines[k].trim(), idx: k };
        }
        return { text: "", idx: -1 };
      };

      const baseMatch = line.match(/^(?:function\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*\)\s*$/);
      const kwMatch = line.match(/^function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*$/);
      const match = baseMatch || kwMatch;

      if (match) {
        const next = nextNonEmpty(i + 1);
        if (next.text.startsWith('{')) {
          funcName = match[1];
          i++; // Consume header
          lines[next.idx] = lines[next.idx].replace('{', '');
          i = next.idx - 1; // Transition index
        }
      }
    }

    if (headerMatch) {
      funcName = headerMatch[1];
    }

    if (funcName) {
      const bodyLines: string[] = [];
      let braceCount = 1;
      
      let firstLineBody = line.substring(line.indexOf('{') + 1).trim();
      if (firstLineBody) {
        if (firstLineBody.endsWith('}')) {
          const inner = firstLineBody.substring(0, firstLineBody.length - 1).trim();
          bodyLines.push(inner);
          braceCount = 0;
        } else {
          bodyLines.push(firstLineBody);
        }
      }

      i++;
      while (i < lines.length && braceCount > 0) {
        const curLine = lines[i];
        const trimmedCur = curLine.trim();

        for (let charIdx = 0; charIdx < trimmedCur.length; charIdx++) {
          const char = trimmedCur[charIdx];
          if (char === '{') braceCount++;
          else if (char === '}') braceCount--;
        }

        if (braceCount === 0) {
          const lastBraceIdx = curLine.lastIndexOf('}');
          const lastLinePart = curLine.substring(0, lastBraceIdx).trim();
          if (lastLinePart) {
            bodyLines.push(lastLinePart);
          }
        } else {
          bodyLines.push(curLine);
        }
        i++;
      }

      if (apiFuncs.setShellFunction) {
        apiFuncs.setShellFunction(funcName, bodyLines);
      }
    } else {
      cleanLines.push(lines[i]);
      i++;
    }
  }

  return cleanLines.join('\n');
}

async function executeShellFunction(name: string, args: string[], username: string, apiFuncs: any): Promise<any[]> {
  const shellFunctions = apiFuncs.getShellFunctions ? apiFuncs.getShellFunctions() : null;
  if (!shellFunctions) return [];
  const body = shellFunctions[name];
  if (!body) return [];
  
  const savedEnv: Record<string, string> = { ...apiFuncs.getAllEnv() };
  
  apiFuncs.setEnv('#', String(args.length));
  apiFuncs.setEnv('@', args.join(' '));
  apiFuncs.setEnv('*', args.join(' '));
  for (let i = 0; i < args.length; i++) {
    apiFuncs.setEnv(String(i + 1), args[i]);
  }
  
  const results = await executeScriptEngine(body.join('\n'), username, apiFuncs, false);
  
  apiFuncs.setEnv('#', savedEnv['#'] || '');
  apiFuncs.setEnv('@', savedEnv['@'] || '');
  apiFuncs.setEnv('*', savedEnv['*'] || '');
  for (let i = 0; i <= Math.max(args.length, 10); i++) {
    const key = String(i + 1);
    if (savedEnv[key] !== undefined) {
      apiFuncs.setEnv(key, savedEnv[key]);
    } else {
      apiFuncs.setEnv(key, '');
    }
  }
  
  return results;
}

async function executeScriptEngine(
  scriptStr: string,
  username: string,
  apiFuncs: any,
  showDebug: boolean = false
): Promise<any[]> {
  const cleanedScript = extractAndRegisterFunctions(scriptStr, apiFuncs);
  const statements = splitIntoStatements(cleanedScript);
  const { instructions } = parseStatements(statements, 0, []);
  return await evalInstructions(instructions, username, apiFuncs, showDebug);
}

async function executePipeline(pipelineStr: string, username: string, apiFuncs: any): Promise<any[]> {
  if (!pipelineStr.trim()) return [];
  
  // Resolve command and backtick substitutions first
  const substitutedPipeline = await substituteCommands(pipelineStr, apiFuncs);
  
  // 1. Detect and parse output redirection (unquoted > or >>)
  const redir = parseRedirection(substitutedPipeline);
  let targetCmd = substitutedPipeline;
  if (redir) {
    targetCmd = redir.cmd;
  }
  
  const cmds = tokenize(targetCmd, '|').map(s => s.trim());
  let stdin: string[] = [];
  
  for (let i = 0; i < cmds.length; i++) {
    const env = apiFuncs.getAllEnv();
    const rawArgs = parseArgs(cmds[i]);
    if (rawArgs.length === 0) continue;
    let cmd = substituteEnv(rawArgs[0], env);
    const cmdArgs = rawArgs.slice(1).map(a => substituteEnv(a, env));
    
    // Check if we are doing a standard shell variable assignment, e.g. FOO=BAR
    if (cmd.includes('=')) {
      const match = cmd.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/);
      if (match) {
        const varName = match[1];
        let varValue = match[2];
        if ((varValue.startsWith('"') && varValue.endsWith('"')) || (varValue.startsWith("'") && varValue.endsWith("'"))) {
          varValue = varValue.slice(1, -1);
        }
        apiFuncs.setEnv(varName, varValue);
        stdin = [];
        continue;
      }
    }
    
    // Support running script using `./filename` as alias to `sh filename`
    if (cmd.startsWith('./')) {
      const scriptName = cmd.substring(2);
      cmdArgs.unshift(scriptName);
      cmd = 'sh';
    }
    
    // Resolve alias
    const aliases = apiFuncs.getAliases();
    const resolvedCmd = aliases[cmd] || cmd;
    
    const shellFunctions = apiFuncs.getShellFunctions ? apiFuncs.getShellFunctions() : null;
    if (shellFunctions && shellFunctions[resolvedCmd]) {
      stdin = await executeShellFunction(resolvedCmd, cmdArgs, username, apiFuncs);
    } else {
      stdin = await executeCommand(resolvedCmd, cmdArgs, stdin, username, apiFuncs);
    }
  }
  
  // 2. Perform redirection output print
  if (redir) {
    const fileContent = stdin.join('\n');
    apiFuncs.writeVFSFile(redir.redirectFile, fileContent, redir.append);
    return [];
  }
  
  return stdin;
}

function extractTextFromReact(node: any): string {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (typeof node === 'boolean') return '';
  
  if (Array.isArray(node)) {
    return node.map(extractTextFromReact).join('');
  }
  
  if (typeof node === 'object') {
    if (node.props) {
      if (node.props.children) {
        return extractTextFromReact(node.props.children);
      }
    }
  }
  return '';
}

function cleanTextTags(text: string): string {
  if (!text) return "";
  let cleaned = text.replace(/<[^>]*>/g, "");
  cleaned = cleaned.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "");
  return cleaned;
}

function cleanCommandOutputForAI(c: any): string {
  if (!c) return "";
  
  if (c && typeof c === 'object' && c._isUIObj) {
    return cleanTextTags(c.text);
  }
  
  if (typeof c === 'object') {
    const text = extractTextFromReact(c);
    return cleanTextTags(text);
  }
  
  if (typeof c === 'string' || typeof c === 'number') {
    return cleanTextTags(String(c));
  }
  
  return "";
}

function cleanAgentReply(text: string): string {
  if (!text) return "";
  let clean = text;

  // 1. Remove system tags like </assistant> or <assistant>
  clean = clean.replace(/<\/?assistant>/gi, "");
  clean = clean.replace(/<\/?agent>/gi, "");
  clean = clean.replace(/<\/?ai-agent>/gi, "");
  clean = clean.replace(/<\/?system>/gi, "");
  clean = clean.replace(/<\/?user>/gi, "");

  // 2. Remove assistant prefix if exposed at start
  clean = clean.replace(/^(Agent|Assistant|AI):\s*/i, "");

  return clean.trim();
}

function renderInlineStyles(text: string) {
  // Parse **bold** into nice strong elements
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-extrabold text-[#f1f5f9] bg-zinc-900/60 px-1 py-0.5 rounded mx-0.5 border border-zinc-800/50">
          {part.substring(2, part.length - 2)}
        </strong>
      );
    }
    return part;
  });
}

function MarkdownText({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split("\n");

  return (
    <div className="space-y-2 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // 1. Heading 1 (# )
        if (trimmed.startsWith("# ")) {
          const content = trimmed.substring(2);
          return (
            <h1 key={idx} className="text-base md:text-lg font-extrabold text-teal-400 mt-4 mb-2 font-sans border-b border-zinc-800/80 pb-1 flex items-center gap-1.5">
              <span>{renderInlineStyles(content)}</span>
            </h1>
          );
        }

        // 2. Heading 2 (## )
        if (trimmed.startsWith("## ")) {
          const content = trimmed.substring(3);
          return (
            <h2 key={idx} className="text-sm md:text-base font-bold text-teal-400/95 mt-3 mb-1.5 font-sans">
              {renderInlineStyles(content)}
            </h2>
          );
        }

        // 3. Heading 3 (### )
        if (trimmed.startsWith("### ")) {
          const content = trimmed.substring(4);
          return (
            <h3 key={idx} className="text-xs md:text-sm font-semibold text-purple-400 mt-2 mb-1.5 font-sans">
              {renderInlineStyles(content)}
            </h3>
          );
        }

        // 4. List (- or * )
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-3 py-0.5 text-xs md:text-sm text-zinc-100">
              <span className="text-purple-400 font-bold select-none mt-0.5">•</span>
              <span className="flex-1">{renderInlineStyles(content)}</span>
            </div>
          );
        }

        // 5. Empty line
        if (trimmed === "") {
          return <div key={idx} className="h-2" />;
        }

        // 6. Normal line
        return (
          <p key={idx} className="text-xs md:text-sm text-zinc-200 leading-relaxed">
            {renderInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
}

async function executeAgentLoop(
  instruction: string,
  apiFuncs: any,
  username: string,
  history: any[] = []
): Promise<any[]> {
  const agentApiFuncs = {
    ...apiFuncs,
    getLang: () => 'en',
    executeNested: async (nestedCmd: string) => {
      return await executePipeline(nestedCmd, username, agentApiFuncs);
    }
  };
  const lang = 'en';
  const startMsg = apiFuncs.getLang() === 'ja'
    ? "🤖 AIエージェントが処理を開始しました..."
    : "🤖 AI Agent starts processing your request...";
  
  apiFuncs.setIsAgentProcessing(true);
  try {
    apiFuncs.setOutput((prev: any) => [
      ...prev,
      { id: Math.random().toString(), content: <div className="text-purple-400 font-sans">{startMsg}</div> }
    ]);

  let loopCount = 0;
  const maxLoopsStr = apiFuncs.getEnv('AGENT_MAX_STEPS');
  const maxLoops = parseInt(maxLoopsStr || "5", 10) || 5;
  const activeHistory = [...history, { role: "user", content: instruction }];

    const vfs = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
  const agentMdEntry = vfs['/agent.md'] || vfs['/AGENT.md'];
  let agentMdInstruction = "";
  if (agentMdEntry && agentMdEntry.type === 'file') {
    agentMdInstruction = lang === 'ja'
      ? `\n【カスタムAIガイドライン (agent.md)】\n以下の指示は、このシステムに固有のAI行動ルールやカスタムキャラクター設定です。必ず遵守してください。\n${agentMdEntry.content}\n`
      : `\n[Custom AI Guidelines (agent.md)]\nThe following guidelines define your custom behavior, character, and constraints in this environment. You must strictly follow them:\n${agentMdEntry.content}\n`;
  }
  const loadWiki = (langKey: string, defaults: Record<string, HelpInfo>) => {
    const result: Record<string, HelpInfo> = { ...defaults };
    const prefix = "/sys/wiki/" + langKey + "/";
    for (const [path, entry] of Object.entries(vfs)) {
      const vfsEntry = entry as any;
      if (path.startsWith(prefix) && vfsEntry.type === 'file') {
        const cmdName = path.substring(prefix.length).replace('.json', '');
        try {
          const customInfo = JSON.parse(vfsEntry.content);
          result[cmdName] = { ...result[cmdName], ...customInfo };
        } catch (e) {}
      }
    }
    return result;
  };

  const helpsJa = loadWiki('ja', defaultHelpsJa);
  const helpsEn = loadWiki('en', defaultHelpsEn);
  const helpsObj = lang === 'ja' ? helpsJa : helpsEn;

  let cmdListStr = "";
  for (const [cmd, info] of Object.entries(helpsObj)) {
    cmdListStr += `- ${cmd.padEnd(20)} ${info.desc}\n`;
  }
  // add general utilities
  cmdListStr += lang === 'ja' 
    ? "- grep, wc, head, tail, sort, uniq などの一般的なパイプ用のユーティリティ"
    : "- grep, wc, head, tail, sort, uniq utilities";


  const memPrefix = "/sys/memory/";
  const memories: Record<string, any[]> = {};
  for (const [path, entry] of Object.entries(vfs)) {
    const vfsEntry = entry as any;
    if (path.startsWith(memPrefix) && vfsEntry.type === 'file') {
      try {
        const mem = JSON.parse(vfsEntry.content);
        if (!memories[mem.category]) memories[mem.category] = [];
        memories[mem.category].push({ id: mem.id, content: mem.content });
      } catch (e) {}
    }
  }
  let memoryStr = "";
  for (const [cat, mems] of Object.entries(memories)) {
    memoryStr += `<category name="${cat}">\n`;
    for (const mem of mems) {
      memoryStr += `  <card id="${mem.id}">${mem.content}</card>\n`;
    }
    memoryStr += `</category>\n`;
  }
  
  if (memoryStr) {
    memoryStr = lang === 'ja'
      ? `\n【現在のAIの記憶(メモリ)】\n以下のカードはあなたが過去に保存した記憶です。対話や行動の判断材料にしてください。\n${memoryStr}`
      : `\n[Current AI Memory]\nThe following cards are memories you have saved in the past. Use them to guide your interaction.\n${memoryStr}`;
  } else {
    memoryStr = lang === 'ja'
      ? `\n【現在のAIの記憶(メモリ)】\n現在保存されている記憶はまだありません。`
      : `\n[Current AI Memory]\nNo saved memories yet.`;
  }

  const customObjective = apiFuncs.getObjective ? apiFuncs.getObjective() : '';
  let objectiveInstructionJa = "";
  let objectiveInstructionEn = "";
  if (customObjective) {
    objectiveInstructionJa = `\n【あなたに与えられた第一目的・ミッション (CURRENT OBJECTIVE)】
あなたはこの目的を最優先で達成するために行動してください。必要に応じて目的達成に関わるコマンドを積極的に実行してください。
目的: "${customObjective}"\n`;
    objectiveInstructionEn = `\n[YOUR CURRENT CORE OBJECTIVE / MISSION]
You must prioritize achieving the following custom objective above all else. Run commands actively as required.
Objective: "${customObjective}"\n`;
  }

  const systemInstruction = lang === 'ja' 
    ? `あなたは素晴らしいBBS（スレッド式掲示板）＆ターミナル環境のナビゲーター / AIエージェントです。
現在のユーザー名は '${username}' です。現在選択されているスレッドID(context)は '${apiFuncs.getContext() || "なし(ルート)"}' です。
${objectiveInstructionJa}
${agentMdInstruction}
ユーザーからの指示に従って、必要に応じて以下のコマンドを実行してください。
コマンドを実行したい場合、必ず \`<run>実行したいコマンド</run>\` タグを使ってコマンドを出力してください。
例: <run>ls</run> や <run>mkthread "テストスレッド"; post 2 "こんにちは"</run> など。
一度に複数のコマンドをセミコロン ';' やパイプ '|' で繋げて実行することもできます。

【利用可能なコマンド一覧】
${cmdListStr}
${memoryStr}

【AIメモリの自動維持・更新義務（極めて重要）】
あなたはユーザーとの会話や活動の中で得られた「ユーザーの好み・自己紹介・要望・掲示板における活動内容」や「システムの重要な発見・作成ファイル・直近のコンパイル状況やエラーなどの有益なナレッジ」を、自動的かつ積極的に記憶（/sys/memory）に保存する義務を負っています。
- 重要な情報（例: ユーザーが挨拶で名前や好みを名乗った、特定のタスクを完了した、何かお気に入りのテーマを設定した、重要なファイルを作成した等）を検知した場合、あなたは自らの判断で、ユーザーの明確な指示がなくても、自動的に \`<run>memory add <カテゴリ> <内容></run>\` を実行して記憶としてセーブしてください。
- 同一カテゴリ内に古く重複するメモリが存在する場合、情報の肥大化を避けるため、 \`<run>memory rm <削除対象ID>; memory add <カテゴリ> <まとめた最新内容></run>\` を利用して情報を1つに集約・整理してください。
- ユーザーに返答する最後のステップなどで、自発的にメモリ追加コマンドを実行することが強く推奨されます。

あなたがコマンドを出力すると、システムが自動的にそれをシェル上で実行し、その【実行結果】を次のターンのあなたにフィードバックします。
実行結果を確認し、ユーザーの指示が完全に達成されるまで繰り返しコマンドを実行することができます。
指示が完了したら、ユーザーに分かりやすく完了した旨を伝えてください。
すべての発話は、簡潔で分かりやすい日本語で行ってください。

【重要】ユーザーが単に挨拶をしただけの場合や、雑談・質問をしただけであり「コマンド実行の必要がない」と判断される場合は、絶対に \`<run>\` タグを使用しないでください。自然な返答のみを行ってください。ただし、対話の中に記憶すべき重要な情報が含まれている場合は、返信と同時に \`<run>memory add ...</run>\` を実行して自発的に記憶を残すことが必要です。`
    : `You are an awesome BBS & terminal navigator / AI agent.
The current user is '${username}'. Current thread context is '${apiFuncs.getContext() || "none(root)"}'.
${objectiveInstructionEn}
${agentMdInstruction}
Follow user's instructions and run commands as needed.
To run a command, always output it inside \`<run>command</run>\` tags.
Example: <run>ls</run> or <run>mkthread "test"; post 2 "hello"</run>

【Available Commands】
${cmdListStr}
${memoryStr}

【Mandatory AI Memory Management (CRITICAL)】
You are strictly required to actively and automatically build and maintain a persistent memory space mapping the user's details (preferences, identity, goals) and technical findings (created files, scripts compiled, active states) in \`/sys/memory\`.
- Whenever a user shares an important self-description, a preference, or requests a specific flow, OR if you make a notable discovery, you MUST take the initiative to run \`<run>memory add <category> <content></run>\` even without the user's explicit ask.
- Keep memories organized. If multiple memories in the same category exist, purge old ones using \`<run>memory rm <id></run>\` and add a new combined key using \`<run>memory add ...</run>\` to summarize.
- You are highly encouraged to chain your main tasks with a final self-directed \`memory\` save command to log current progress or preferences.

Once you output <run>...</run>, the system will auto-execute it and feed back the results. Repeat as needed to achieve the goal.
[CRITICAL] Under all circumstances, your final verbal responses (replies to the user) MUST be written in the language corresponding to '${apiFuncs.getLang() === 'ja' ? 'Japanese' : 'English'}'.
Also, if the user requested a specific character or persona in agent.md, you must strictly follow that persona in your replies.
Keep responses concise and clear.

[CRITICAL]: If the user's input is a simple greeting, chit-chat, or a question that does not require executing a command, DO NOT output a \`<run>\` tag unless you identify high-value insights that should be memorized. If so, reply to the user and append \`<run>memory add ...</run>\` to persist that insight.`;

  while (loopCount < maxLoops) {
    loopCount++;
    
    const key = apiFuncs.getEnv('OPENAI_API_KEY');
    const endpoint = apiFuncs.getEnv('OPENAI_BASE_URL');
    const model = apiFuncs.getEnv('OPENAI_MODEL');

    // Compile message history into a prompt string for /api/ai
    let compiledPrompt = `${systemInstruction}\n\n`;
    compiledPrompt += "【Conversation History】\n";
    for (const msg of activeHistory) {
      compiledPrompt += `${msg.role === "user" ? "User" : "Agent"}: ${msg.content}\n`;
    }
    compiledPrompt += "\nAgent's next action/reply:";

    try {
      const res = await apiFuncs.callAI({ endpoint, key, model, prompt: compiledPrompt });
      if (res.error) {
        apiFuncs.setOutput((prev: any) => [
          ...prev,
          { id: Math.random().toString(), content: <span className="text-red-500">AI Error: {res.error}</span> }
        ]);
        break;
      }

      const reply = res.content || "";
      activeHistory.push({ role: "assistant", content: reply });

      // Parse <run>...</run> tag
      const runMatch = reply.match(/<run>([\s\S]*?)<\/run>/);
      
      // Print assistant's natural text response (excluding <run> tag content)
      const rawClean = reply.replace(/<run>[\s\S]*?<\/run>/g, "").trim();
      const cleanedText = cleanAgentReply(rawClean);
      if (cleanedText) {
        apiFuncs.setOutput((prev: any) => [
          ...prev,
          { id: Math.random().toString(), content: (
            <div className="text-purple-300 font-sans border-l-2 border-purple-500/30 pl-3.5 py-1 my-2">
              <div className="text-xs text-purple-400 font-mono flex items-center gap-1.5 mb-1.5 select-none">
                <span>🤖 AI Agent</span>
              </div>
              <MarkdownText text={cleanedText} />
            </div>
          ) }
        ]);
      }

      if (runMatch) {
        const cmdToRun = runMatch[1].trim();
        
        const needsApproval = apiFuncs.getRequireAgentApproval ? apiFuncs.getRequireAgentApproval() : true;
        if (needsApproval) {
          apiFuncs.setOutput((prev: any) => [
            ...prev,
            { id: Math.random().toString(), content: (
              <div className="text-amber-400 font-mono text-xs my-1 select-none animate-pulse">
                <span>⚠️ {lang === 'ja' ? "AIが次のコマンドの実行許可を待っています:" : "AI requires permission to run command:"} </span>
                <span className="font-bold underline">{cmdToRun}</span>
              </div>
            ) }
          ]);
          if (apiFuncs.setPendingAgentAction) {
            apiFuncs.setPendingAgentAction(cmdToRun, activeHistory);
          }
          break; // Stop loop and wait for approval
        }

        // Print action indicator
        apiFuncs.setOutput((prev: any) => [
          ...prev,
          { id: Math.random().toString(), content: <div className="text-yellow-400 font-mono">⚡️ [AI Automatic Run] {cmdToRun}</div> }
        ]);

        // Execute command
        const executionResult = await agentApiFuncs.executeNested(cmdToRun);
        
        // Output execution results to screen
        if (executionResult && executionResult.length > 0) {
          apiFuncs.setOutput((prev: any) => [
            ...prev,
            ...executionResult.map(c => {
               const textOut = cleanCommandOutputForAI(c);
               if (textOut) {
                 return {
                   id: Math.random().toString(),
                   content: <div className="whitespace-pre-wrap font-mono text-zinc-300 leading-relaxed py-1">{textOut}</div>
                 };
               }
               return { id: Math.random().toString(), content: (c && c._isUIObj) ? c.ui : c };
            })
          ]);
        }

        // Give execution feedback to AI
        const agentTextOutput = executionResult.map(c => cleanCommandOutputForAI(c)).join('\n');
        
        const feedbackText = `【System Feedback: Command Executed】: ${cmdToRun}\n【Output】:\n${agentTextOutput || "(No output)"}`;
        activeHistory.push({ role: "user", content: feedbackText });
        
        // Continue looping
        continue;
      } else {
        // No execution needed, loop completes
        break;
      }

    } catch (e: any) {
      apiFuncs.setOutput((prev: any) => [
        ...prev,
        { id: Math.random().toString(), content: <span className="text-red-500">Error in Agent Loop: {e.message}</span> }
      ]);
      break;
    }
  }

  if (loopCount >= maxLoops) {
    const limitMsg = lang === 'ja'
      ? "🤖 AIエージェントの上限ステップ数 (5回) に達しました。"
      : "🤖 AI Agent reached maximum operation limit (5 steps).";
    apiFuncs.setOutput((prev: any) => [
      ...prev,
      { id: Math.random().toString(), content: <div className="text-gray-500">{limitMsg}</div> }
    ]);
  }

  return activeHistory;
  } finally {
    apiFuncs.setIsAgentProcessing(false);
  }
}


function GhostSuggestion({ input, history, context, apiFuncs }: { input: string, history: string[], context: string | null, apiFuncs: any }) {
    const [sug, setSug] = useState("");
    useEffect(() => {
        let active = true;
        getSuggestion(input, history, context, apiFuncs).then(res => {
            if (active) setSug(res.ghost || (res.suggestion && res.candidates ? "" : res.suggestion));
        });
        return () => { active = false; };
    }, [input, history, context, apiFuncs]);
    return <span>{sug ? sug.substring(input.length) : ""}</span>;
}

const PALETTES = {
  text: [
    { class: 'text-zinc-500', hex: '#71717a' },
    { class: 'text-zinc-400', hex: '#a1a1aa' },
    { class: 'text-zinc-300', hex: '#d4d4d8' },
    { class: 'text-zinc-200', hex: '#e4e4e7' },
    { class: 'text-zinc-100', hex: '#f4f4f5' },
    
    { class: 'text-red-500', hex: '#ef4444' },
    { class: 'text-red-400', hex: '#f87171' },
    { class: 'text-rose-400', hex: '#fb7185' },
    
    { class: 'text-orange-500', hex: '#f97316' },
    { class: 'text-orange-400', hex: '#fb923c' },
    
    { class: 'text-amber-500', hex: '#f59e0b' },
    { class: 'text-amber-400', hex: '#fbbf24' },
    { class: 'text-yellow-400', hex: '#facc15' },
    { class: 'text-yellow-300', hex: '#fde047' },
    
    { class: 'text-lime-500', hex: '#84cc16' },
    { class: 'text-lime-400', hex: '#a3e635' },
    { class: 'text-green-500', hex: '#22c55e' },
    { class: 'text-green-400', hex: '#4ade80' },
    { class: 'text-emerald-400', hex: '#34d399' },
    { class: 'text-teal-400', hex: '#2dd4bf' },
    
    { class: 'text-cyan-500', hex: '#06b6d4' },
    { class: 'text-cyan-400', hex: '#22d3ee' },
    { class: 'text-sky-400', hex: '#38bdf8' },
    { class: 'text-blue-500', hex: '#3b82f6' },
    { class: 'text-blue-400', hex: '#60a5fa' },
    
    { class: 'text-indigo-400', hex: '#818cf8' },
    { class: 'text-violet-400', hex: '#a78bfa' },
    { class: 'text-purple-400', hex: '#c084fc' },
    { class: 'text-fuchsia-400', hex: '#e879f9' },
    
    { class: 'text-pink-500', hex: '#ec4899' },
    { class: 'text-pink-400', hex: '#f472b6' }
  ],
  bg: [
    { class: 'bg-black', hex: '#000000' },
    
    { class: 'bg-zinc-950', hex: '#09090b' },
    { class: 'bg-zinc-900', hex: '#18181b' },
    { class: 'bg-zinc-800', hex: '#27272a' },
    
    { class: 'bg-slate-950', hex: '#020617' },
    { class: 'bg-slate-900', hex: '#0f172a' },
    
    { class: 'bg-red-950', hex: '#450a0a' },
    { class: 'bg-rose-950', hex: '#4c0519' },
    
    { class: 'bg-orange-950', hex: '#431407' },
    { class: 'bg-amber-950', hex: '#451a03' },
    { class: 'bg-yellow-950', hex: '#422006' },
    
    { class: 'bg-emerald-950', hex: '#022c22' },
    { class: 'bg-green-950', hex: '#052e16' },
    { class: 'bg-teal-950', hex: '#042f2e' },
    
    { class: 'bg-cyan-950', hex: '#083344' },
    { class: 'bg-sky-950', hex: '#082f49' },
    { class: 'bg-blue-950', hex: '#172554' },
    { class: 'bg-indigo-950', hex: '#1e1b4b' },
    
    { class: 'bg-purple-950', hex: '#3b0764' },
    { class: 'bg-fuchsia-950', hex: '#4a044e' },
    { class: 'bg-pink-950', hex: '#500724' },
    
    { class: 'bg-gray-800', hex: '#1f2937' },
    { class: 'bg-transparent', hex: 'transparent' },
    { class: 'bg-white', hex: '#ffffff' },
    { class: 'bg-zinc-100', hex: '#f4f4f5' }
  ],
  caret: [
    { class: 'caret-emerald-400', hex: '#34d399' },
    { class: 'caret-green-400', hex: '#4ade80' },
    { class: 'caret-lime-400', hex: '#a3e635' },
    
    { class: 'caret-cyan-400', hex: '#22d3ee' },
    { class: 'caret-sky-400', hex: '#38bdf8' },
    { class: 'caret-blue-400', hex: '#60a5fa' },
    
    { class: 'caret-indigo-400', hex: '#818cf8' },
    { class: 'caret-purple-400', hex: '#c084fc' },
    { class: 'caret-fuchsia-400', hex: '#e879f9' },
    { class: 'caret-pink-400', hex: '#f472b6' },
    { class: 'caret-rose-400', hex: '#fb7185' },
    
    { class: 'caret-red-400', hex: '#f87171' },
    { class: 'caret-orange-400', hex: '#fb923c' },
    { class: 'caret-amber-400', hex: '#fbbf24' },
    { class: 'caret-yellow-400', hex: '#facc15' },
    
    { class: 'caret-white', hex: '#ffffff' },
    { class: 'caret-zinc-300', hex: '#d4d4d8' },
    { class: 'caret-zinc-400', hex: '#a1a1aa' },
    { class: 'caret-zinc-500', hex: '#71717a' },
    { class: 'caret-black', hex: '#000000' }
  ]
};

function ThemeEditorModal({ onClose, onSave, isJa, initialData }: { onClose: () => void, onSave: (key: string, data: any) => void, isJa: boolean, initialData?: any }) {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        key: initialData.key || '', name: initialData.name || '', nameEn: initialData.nameEn || '',
        canvasBg: initialData.canvasBg || 'bg-black', termBg: initialData.termBg || 'bg-zinc-950', topbarBg: initialData.topbarBg || 'bg-zinc-900',
        termText: initialData.termText || 'text-zinc-300', promptUser: initialData.promptUser || 'text-emerald-400', promptHost: initialData.promptHost || 'text-cyan-400',
        promptCwd: initialData.promptCwd || 'text-yellow-400', caret: initialData.caret || 'caret-emerald-400', editorBg: initialData.editorBg || 'bg-zinc-950 text-zinc-300 border-zinc-800'
      };
    }
    return {
      key: '', name: '', nameEn: '',
      canvasBg: 'bg-black', termBg: 'bg-zinc-950', topbarBg: 'bg-zinc-900',
      termText: 'text-zinc-300', promptUser: 'text-emerald-400', promptHost: 'text-cyan-400',
      promptCwd: 'text-yellow-400', caret: 'caret-emerald-400', editorBg: 'bg-zinc-950 text-zinc-300 border-zinc-800'
    };
  });
  const [error, setError] = useState("");

  const handleChange = (field: string, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const save = () => {
    if (!formData.key.match(/^[a-z0-9_-]+$/)) {
      setError(isJa ? "識別キーは半角英数字とハイフン、アンダースコアのみにしてください。" : "Key must be alphanumeric, hyphen, or underscore.");
      return;
    }
    if (!formData.name) {
      setError(isJa ? "テーマ名を入力してください。" : "Please enter a theme name.");
      return;
    }
    const { key, ...themeData } = formData;
    themeData.nameEn = themeData.name;
    onSave(key, { ...themeData, isCustom: true });
  };

  const ColorSelect = ({ label, field, options }: { label: string, field: keyof typeof formData, options: {class:string, hex:string}[] }) => (
    <div className="mb-5">
      <div className="text-xs font-bold text-zinc-400 mb-2">{label}</div>
      <div className="flex flex-wrap gap-2.5">
        {options.map(opt => {
          const isSelected = formData[field] === opt.class;
          const isTransparent = opt.hex === 'transparent';
          const bgStyle = !isTransparent 
            ? { backgroundColor: opt.hex } 
            : { backgroundImage: 'linear-gradient(45deg, #bbb 25%, transparent 25%), linear-gradient(-45deg, #bbb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #bbb 75%), linear-gradient(-45deg, transparent 75%, #bbb 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' };
            
          return (
          <button 
            key={opt.class} 
            onClick={() => handleChange(field as string, opt.class)}
            className={`w-7 h-7 rounded-full transition-all duration-200 flex items-center justify-center shrink-0 shadow-sm ${isSelected ? 'ring-2 ring-emerald-500 scale-110 shadow-emerald-500/50' : 'ring-1 ring-zinc-700 hover:ring-zinc-400 hover:scale-105'}`}
            style={bgStyle}
            title={opt.class}
            type="button"
            aria-label={opt.class}
          >
             {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_2px_rgba(0,0,0,0.5)] border border-black/20 mix-blend-difference"></span>}
          </button>
        )})}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
       <div className="bg-zinc-900 border border-zinc-700 w-full max-w-5xl h-[90vh] flex flex-col lg:flex-row shadow-2xl rounded-xl font-sans overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-zinc-700 custom-scrollbar">
             <div className="flex justify-between items-start mb-6 sticky top-0 bg-zinc-900 z-10 pt-2 pb-4 -mt-2">
                <div>
                   <h2 className="text-2xl font-black text-white tracking-tight">{isJa ? "🎨 テーマ エディタ" : "🎨 Theme Editor"}</h2>
                   <p className="text-xs text-zinc-400 mt-2 font-medium">
                     {isJa 
                      ? "オリジナル配色テーマを作成" 
                      : "Create your original color theme"}
                   </p>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-white px-2 py-1 text-2xl font-bold rounded-lg hover:bg-zinc-800 transition-colors leading-none tracking-tighter">×</button>
             </div>
             
             {error && <div className="p-3 mb-6 bg-red-900/40 border border-rose-500 text-rose-200 text-sm font-medium rounded-lg shadow-sm">{error}</div>}
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
               <div>
                 <label className="text-[11px] font-bold text-zinc-400 mb-2 block uppercase tracking-wider">{isJa ? "識別キー(ID) *" : "Theme Key *"}</label>
                 <input type="text" value={formData.key} onChange={e => handleChange('key', e.target.value)} placeholder="my-theme" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-700 shadow-inner" />
                 <div className="text-[10px] text-zinc-500 mt-1.5 font-medium">{isJa ? "呼出用 (例: theme my-theme)" : "CLI usage (e.g. theme my-theme)"}</div>
               </div>
               <div>
                 <label className="text-[11px] font-bold text-zinc-400 mb-2 block uppercase tracking-wider">{isJa ? "テーマ名 *" : "Display Name *"}</label>
                 <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="My Super Theme" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-700 shadow-inner" />
               </div>
             </div>

             <div className="space-y-2">
                 <ColorSelect label={isJa ? "全体背景色 (Canvas Bg)" : "Canvas Background"} field="canvasBg" options={PALETTES.bg} />
                 <ColorSelect label={isJa ? "ターミナル背景色 (Term Bg)" : "Terminal Background"} field="termBg" options={PALETTES.bg} />
                 <ColorSelect label={isJa ? "トップバー背景色 (Topbar Bg)" : "Topbar Background"} field="topbarBg" options={PALETTES.bg} />
                 <div className="border-t border-zinc-800/80 my-6"></div>
                 <ColorSelect label={isJa ? "基本テキスト色 (Base Text)" : "Base Text Color"} field="termText" options={PALETTES.text} />
                 <ColorSelect label={isJa ? "ユーザー名の色 (Prompt Username)" : "Prompt Username Color"} field="promptUser" options={PALETTES.text} />
                 <ColorSelect label={isJa ? "ホスト名の色 (Prompt Hostname)" : "Prompt Hostname Color"} field="promptHost" options={PALETTES.text} />
                 <ColorSelect label={isJa ? "パスの色 (Prompt CWD)" : "Prompt Path Color"} field="promptCwd" options={PALETTES.text} />
                 <div className="border-t border-zinc-800/80 my-6"></div>
                 <ColorSelect label={isJa ? "カーソル色 (Caret)" : "Cursor / Caret Color"} field="caret" options={PALETTES.caret} />
             </div>

             <div className="mt-10 pb-4">
               <button onClick={save} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg hover:shadow-emerald-500/20 active:scale-[0.99] transition-all text-sm tracking-wide">
                 {isJa ? "テーマを保存して適用" : "Save & Apply Theme"}
               </button>
             </div>
          </div>

          <div className="flex-1 p-6 lg:p-10 bg-black relative flex-col items-center justify-center overflow-y-auto hidden lg:flex border-l border-zinc-800 shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)]">
             <div className="w-full max-w-full lg:max-w-md sticky top-10">
                 <div className="text-[10px] font-black text-zinc-500 mb-4 tracking-widest uppercase flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   {isJa ? "ライブプレビュー (Live Preview)" : "Live Preview"}
                 </div>
                 <div className={`w-full rounded-xl border border-zinc-700/50 overflow-hidden flex flex-col shadow-2xl transition-all duration-300 min-h-[360px] ${formData.canvasBg} ${formData.termText}`}>
                    <div className={`px-4 py-2 text-xs flex justify-between items-center font-mono transition-colors duration-300 shadow-sm ${formData.topbarBg}`}>
                      <span className="font-bold opacity-90">{formData.name || "Untitled"}</span>
                      <span className="opacity-40 text-[10px]">v1.0.0</span>
                    </div>
                    <div className={`flex-1 p-5 font-mono text-xs sm:text-sm transition-colors duration-300 leading-relaxed ${formData.termBg}`}>
                       <div className="mb-2 opacity-60">Booting ShellOS_...</div>
                       <div className="mb-5 opacity-90">System ready. Custom theme loaded.</div>
                       <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                         <span className="shrink-0">
                           <span className={formData.promptUser}>user</span><span className="opacity-70">@</span><span className={formData.promptHost}>host</span><span className="opacity-70">:</span><span className={formData.promptCwd}>~</span><span className="opacity-70">$</span>
                         </span>
                         <span className="opacity-90">ls -la</span>
                       </div>
                       <div className="opacity-80 ml-2 mb-3">
                         <div>drwxr-xr-x 1 user root 4096</div>
                         <div>-rw-r--r-- 1 user root  124</div>
                       </div>
                       <div className="flex items-center gap-1.5 flex-wrap">
                         <span className="shrink-0">
                           <span className={formData.promptUser}>user</span><span className="opacity-70">@</span><span className={formData.promptHost}>host</span><span className="opacity-70">:</span><span className={formData.promptCwd}>~/src</span><span className="opacity-70">$</span>
                         </span>
                         <span className={`inline-block w-2 h-[1.1em] shadow-[0_0_4px_rgba(255,255,255,0.2)] animate-pulse rounded-[1px] ${formData.caret.replace('caret-', 'bg-')}`}></span>
                       </div>
                    </div>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function AISettingsModal({ onClose, apiFuncs, isJa }: { onClose: () => void, apiFuncs: any, isJa: boolean }) {
  const [formData, setFormData] = useState({
    OPENAI_API_KEY: apiFuncs.getEnv('OPENAI_API_KEY') || '',
    OPENAI_MODEL: apiFuncs.getEnv('OPENAI_MODEL') || 'gpt-4o-mini',
    OPENAI_BASE_URL: apiFuncs.getEnv('OPENAI_BASE_URL') || 'https://api.openai.com/v1/chat/completions',
    AGENT_MAX_STEPS: apiFuncs.getEnv('AGENT_MAX_STEPS') || '5'
  });
  const [objectiveVal, setObjectiveVal] = useState(apiFuncs.getObjective ? apiFuncs.getObjective() : '');
  const [requireApprovalVal, setRequireApprovalVal] = useState(() => {
    return apiFuncs.getRequireAgentApproval ? apiFuncs.getRequireAgentApproval() : true;
  });
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [modelFetchError, setModelFetchError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchModel, setSearchModel] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filteredModels = availableModels.filter(m => m.toLowerCase().includes(searchModel.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);


  const fetchModels = async () => {
    if (!formData.OPENAI_API_KEY) {
      setModelFetchError(isJa ? 'APIキーを入力してください。' : 'Please enter an API Key.');
      return;
    }
    setIsFetchingModels(true);
    setModelFetchError('');
    try {
      let baseUrl = formData.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions';
      if (baseUrl.endsWith('/chat/completions')) {
         baseUrl = baseUrl.replace('/chat/completions', '');
      } else if (baseUrl.endsWith('/')) {
         baseUrl = baseUrl.slice(0, -1);
      }
      const res = await fetch(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${formData.OPENAI_API_KEY}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch models');
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        const models = data.data.map((m: any) => m.id as string).sort();
        setAvailableModels(models);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      setModelFetchError(err.message || 'Error fetching models');
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleChange = (field: string, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const save = () => {
    apiFuncs.setEnv('OPENAI_API_KEY', formData.OPENAI_API_KEY);
    apiFuncs.setEnv('OPENAI_MODEL', formData.OPENAI_MODEL);
    apiFuncs.setEnv('OPENAI_BASE_URL', formData.OPENAI_BASE_URL);
    apiFuncs.setEnv('AGENT_MAX_STEPS', formData.AGENT_MAX_STEPS);
    if (apiFuncs.setObjective) {
      apiFuncs.setObjective(objectiveVal);
    }
    if (apiFuncs.setRequireAgentApproval) {
      apiFuncs.setRequireAgentApproval(requireApprovalVal);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
       <div className="bg-zinc-900 border border-zinc-700 w-full max-w-lg shadow-2xl rounded-xl font-sans overflow-visible">
          <div className="p-6 lg:p-8">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <h2 className="text-xl font-black text-white tracking-tight">{isJa ? "⚙️ AI/API 設定" : "⚙️ AI/API Settings"}</h2>
                   <p className="text-xs text-zinc-400 mt-2 font-medium">
                     {isJa 
                      ? "AIエージェントやAI生成コマンドで使用するAPIキー・モデル等の設定を行います。" 
                      : "Configure the API Key and model used for AI generation and agent commands."}
                   </p>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-white px-2 py-1 text-2xl font-bold rounded-lg hover:bg-zinc-800 transition-colors leading-none tracking-tighter">×</button>
             </div>
             
             <div className="space-y-5 mb-8">
               <div>
                 <label className="text-[11px] font-bold text-zinc-400 mb-2 block uppercase tracking-wider">{isJa ? "API キー (必須)" : "API Key (Required)"}</label>
                 <input type="password" value={formData.OPENAI_API_KEY} onChange={e => handleChange('OPENAI_API_KEY', e.target.value)} placeholder="sk-..." className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-700 shadow-inner" />
               </div>
               <div>
                 <div className="flex justify-between items-end mb-2">
                   <label className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">{isJa ? "モデル名" : "Model Name"}</label>
                   <button 
                     onClick={fetchModels} 
                     disabled={isFetchingModels}
                     className="text-[10px] bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-emerald-400 px-2 py-1 rounded transition-colors"
                   >
                     {isFetchingModels ? (isJa ? "取得中..." : "Fetching...") : (isJa ? "APIから取得" : "Fetch Models")}
                   </button>
                 </div>
                 <div className="relative" ref={dropdownRef}>
                   <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={formData.OPENAI_MODEL} 
                       onChange={e => handleChange('OPENAI_MODEL', e.target.value)} 
                       onFocus={() => { setShowDropdown(true); setSearchModel(''); }}
                       placeholder="gpt-4o-mini" 
                       className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-700 shadow-inner" 
                     />
                   </div>
                   {showDropdown && availableModels.length > 0 && (
                     <div className="absolute z-[110] w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-h-60 flex flex-col">
                         <input 
                            type="text" 
                            placeholder={isJa ? "モデルを検索..." : "Search model..."}
                            value={searchModel}
                            onChange={e => setSearchModel(e.target.value)}
                            onMouseDown={e => e.preventDefault()}
                            className="w-full bg-zinc-950 border-b border-zinc-700 p-2 text-xs font-mono text-white focus:outline-none placeholder:text-zinc-600 shrink-0"
                            autoFocus
                         />
                         <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {filteredModels.map(m => (
                                <div 
                                   key={m} 
                                   className="p-2 py-2.5 text-[11px] cursor-pointer hover:bg-emerald-600 hover:text-white text-zinc-300 truncate font-mono border-b border-zinc-800/50 last:border-0"
                                   onMouseDown={e => e.preventDefault()}
                                   onClick={() => {
                                       handleChange('OPENAI_MODEL', m);
                                       setShowDropdown(false);
                                   }}
                                >
                                   {m}
                                </div>
                            ))}
                            {filteredModels.length === 0 && (
                               <div className="p-3 text-[11px] text-zinc-500 text-center font-medium">{isJa ? "見つかりません" : "No models found"}</div>
                            )}
                         </div>
                     </div>
                   )}
                 </div>
                 {modelFetchError && <div className="text-[10px] text-red-500 mt-1.5 font-medium">{modelFetchError}</div>}
                 {availableModels.length > 0 && !modelFetchError && <div className="text-[10px] text-emerald-500 mt-1.5 font-medium">{isJa ? `${availableModels.length}個のモデルを取得しました。入力欄のプルダウンから選択できます。` : `Fetched ${availableModels.length} models. Select from the dropdown.`}</div>}
               </div>
               <div>
                 <label className="text-[11px] font-bold text-zinc-400 mb-2 block uppercase tracking-wider">{isJa ? "エージェントの最大ステップ数" : "Agent Max Steps"}</label>
                 <input type="number" min="1" max="50" value={formData.AGENT_MAX_STEPS} onChange={e => handleChange('AGENT_MAX_STEPS', e.target.value)} placeholder="5" className="w-[120px] bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-700 shadow-inner" />
               </div>
               <div>
                 <label className="text-[11px] font-bold text-zinc-400 mb-2 block uppercase tracking-wider">{isJa ? "API ベース URL" : "API Base URL"}</label>
                 <input type="text" value={formData.OPENAI_BASE_URL} onChange={e => handleChange('OPENAI_BASE_URL', e.target.value)} placeholder="https://api.openai.com/v1/chat/completions" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-700 shadow-inner" />
                 <div className="text-[10px] text-zinc-500 mt-1.5 font-medium">{isJa ? "互換API (OpenRouter等) を使用する場合は変更してください。" : "Change if you are using an OpenAI-compatible API (e.g., OpenRouter)."}</div>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-805 rounded-xl my-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-200 block uppercase tracking-wide mb-1">
                      {isJa ? "AI自動コマンド実行の確認" : "AI Command Approval Check"}
                    </label>
                    <span className="text-[10px] text-zinc-500 leading-normal block">
                      {isJa 
                        ? "有効にすると、AIエージェントがコマンドを実行する前に１回毎にユーザーに許可を求めます。"
                        : "When enabled, asks for your confirmation before executing any commands suggested by the AI."}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequireApprovalVal(!requireApprovalVal)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-205 ease-in-out focus:outline-none ${requireApprovalVal ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-205 ease-in-out ${requireApprovalVal ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
               </div>
             </div>

             <div className="mt-4">
               <button onClick={save} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg hover:shadow-emerald-500/20 active:scale-[0.99] transition-all text-sm tracking-wide">
                 {isJa ? "保存" : "Save Settings"}
               </button>
             </div>
          </div>
       </div>
    </div>
  );
}

export default function App() {
  const isIframe = window.location.search.includes("split=true");
  const defaultLayoutRef = useRef<string>("");
  const [output, setOutput] = useState<{ id: string; content: ReactNode }[]>([]);
  const [input, setInput] = useState("");
  const [showThemeEditor, setShowThemeEditor] = useState<boolean | string>(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("shellboards_username") || "anonymous";
  });
  const [context, setContext] = useState<string | null>(() => {
    return localStorage.getItem("shellboards_context") || null;
  });
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("shellboards_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [lang, setLang] = useState<"ja"|"en">(() => {
    return (localStorage.getItem("shellboards_lang") as "ja"|"en") || "ja";
  });
  const [objective, setObjective] = useState<string>(() => {
    return localStorage.getItem("shellboards_objective") || "";
  });
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("shellboards_theme") || "emerald";
  });
  const [customThemes, setCustomThemes] = useState<Record<string, typeof themes[string]>>(() => {
    try {
      const saved = localStorage.getItem("shellboards_custom_themes");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [wizardStep, setWizardStep] = useState<number>(0);
  const [wizardData, setWizardData] = useState<any>({});
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);
  const [inlineCandidates, setInlineCandidates] = useState<SuggestionCandidate[] | null>(null);
  const [candidateIdx, setCandidateIdx] = useState(-1);
  const [agentHistory, setAgentHistory] = useState<any[]>([]);
  const [pendingAgentCmd, setPendingAgentCmd] = useState<string | null>(null);
  const [pendingAgentHistory, setPendingAgentHistory] = useState<any[] | null>(null);
  const [requireAgentApproval, setRequireAgentApproval] = useState<boolean>(() => {
    const saved = localStorage.getItem("shellboards_agent_approval");
    return saved !== "false";
  });

  useEffect(() => {
    localStorage.setItem("shellboards_agent_approval", String(requireAgentApproval));
  }, [requireAgentApproval]);

  const hostname = "shellbbs";

  // Virtual Live Preview States for Custom UI Sandbox
  const [previewFile, setPreviewFile] = useState<string | null>(() => {
    return localStorage.getItem("shellboards_preview_file") || null;
  });
  const [previewContent, setPreviewContent] = useState<string>("");
  const [showPreviewPane, setShowPreviewPane] = useState(() => {
    return localStorage.getItem("shellboards_show_preview") === "true";
  });
  const [splitMode, setSplitMode] = useState<'v' | 'h' | null>(null);
  const [splitSize, setSplitSize] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isPaneSwapped, setIsPaneSwapped] = useState<boolean>(false);
  const [isDraggingSwap, setIsDraggingSwap] = useState<boolean>(false);
  const dragSwapStartRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (splitMode === 'v') {
        const value = ((e.clientX - rect.left) / rect.width) * 100;
        const bounded = Math.max(15, Math.min(85, value));
        setSplitSize(isPaneSwapped ? 100 - bounded : bounded);
      } else if (splitMode === 'h') {
        const value = ((e.clientY - rect.top) / rect.height) * 100;
        const bounded = Math.max(15, Math.min(85, value));
        setSplitSize(isPaneSwapped ? 100 - bounded : bounded);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      if (splitMode === 'v') {
        const value = ((touch.clientX - rect.left) / rect.width) * 100;
        const bounded = Math.max(15, Math.min(85, value));
        setSplitSize(isPaneSwapped ? 100 - bounded : bounded);
      } else if (splitMode === 'h') {
        const value = ((touch.clientY - rect.top) / rect.height) * 100;
        const bounded = Math.max(15, Math.min(85, value));
        setSplitSize(isPaneSwapped ? 100 - bounded : bounded);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, splitMode, isPaneSwapped]);

  useEffect(() => {
    if (!isDraggingSwap) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const startX = dragSwapStartRef.current.x;
      const startY = dragSwapStartRef.current.y;
      const diffX = e.clientX - startX;
      const diffY = e.clientY - startY;

      if (splitMode === 'v') {
        if (Math.abs(diffX) > 40) {
          setIsPaneSwapped(prev => !prev);
          dragSwapStartRef.current = { x: e.clientX, y: e.clientY };
        }
      } else if (splitMode === 'h') {
        if (Math.abs(diffY) > 40) {
          setIsPaneSwapped(prev => !prev);
          dragSwapStartRef.current = { x: e.clientX, y: e.clientY };
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const startX = dragSwapStartRef.current.x;
      const startY = dragSwapStartRef.current.y;
      const diffX = touch.clientX - startX;
      const diffY = touch.clientY - startY;

      if (splitMode === 'v') {
        if (Math.abs(diffX) > 40) {
          setIsPaneSwapped(prev => !prev);
          dragSwapStartRef.current = { x: touch.clientX, y: touch.clientY };
        }
      } else if (splitMode === 'h') {
        if (Math.abs(diffY) > 40) {
          setIsPaneSwapped(prev => !prev);
          dragSwapStartRef.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSwap(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingSwap, splitMode]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'CLOSE_PANE') {
        setSplitMode(null);
        setSplitSize(50);
        setIsPaneSwapped(false);
        inputRef.current?.focus();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(() => {
    return (localStorage.getItem("shellboards_preview_mode") as "desktop" | "mobile") || "desktop";
  });
  const [previewKey, setPreviewKey] = useState(0);

  const previewFileRef = useRef(previewFile);
  previewFileRef.current = previewFile;

  // Virtual File System State
  const [vfs, setVfs] = useState<Record<string, { type: 'file' | 'dir', content?: string }>>(() => {
    const _old_BBSContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shell BBS Web Client</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --bg-color: #0c0a09;
      --card-bg: #1c1917;
      --border-color: #27272a;
      --text-color: #f5f5f4;
      --text-muted: #a1a1aa;
      --accent-color: #10b981;
      --accent-hover: #059669;
      --indigo: #6366f1;
    }
    body {
      background-color: var(--bg-color);
      color: var(--text-color);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow: hidden;
    }
    header {
      background-color: var(--card-bg);
      border-bottom: 1px solid var(--border-color);
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      shrink-0: 0;
    }
    header h1 {
      margin: 0;
      font-size: 15px;
      font-weight: 700;
      color: var(--indigo);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge {
      font-size: 9px;
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      padding: 1px 5px;
      border-radius: 3px;
      font-family: monospace;
    }
    .main-container {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    .sidebar {
      width: 280px;
      background-color: #141210;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      shrink-0: 0;
    }
    .sidebar-header {
      padding: 12px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .btn-create {
      background-color: var(--indigo);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .btn-create:hover {
      background-color: #4f46e5;
    }
    .thread-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .thread-item {
      padding: 14px 16px;
      border-bottom: 1px solid rgba(39, 39, 42, 0.4);
      cursor: pointer;
      transition: background 0.2s;
    }
    .thread-item:hover, .thread-item.active {
      background-color: var(--card-bg);
    }
    .thread-item .title {
      font-size: 13.5px;
      font-weight: 600;
      margin-bottom: 6px;
      word-break: break-all;
    }
    .thread-item .meta {
      font-size: 11px;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
    }
    .content-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-color);
      overflow: hidden;
    }
    .posts-container {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .post-card {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 12px 14px;
      transition: background-color 0.8s, border-color 0.8s;
    }
    .post-card:hover {
      border-color: rgba(99, 102, 241, 0.4);
    }
    .post-number {
      font-weight: bold;
      color: var(--indigo);
      cursor: pointer;
      margin-right: 6px;
      font-family: monospace;
    }
    .post-number:hover {
      text-decoration: underline;
      color: var(--accent-color);
    }
    .anchor-link {
      color: #818cf8;
      font-weight: bold;
      cursor: pointer;
      text-decoration: underline;
      padding: 0 2px;
      border-radius: 3px;
      transition: background-color 0.2s;
    }
    .anchor-link:hover {
      background-color: rgba(99, 102, 241, 0.2);
    }
    .post-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 11px;
      color: var(--text-muted);
    }
    .post-author {
      font-weight: bold;
      color: var(--accent-color);
    }
    .post-body {
      font-size: 13px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .no-selection {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      text-align: center;
      padding: 20px;
    }
    .footer-composer {
      background-color: var(--card-bg);
      border-top: 1px solid var(--border-color);
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .composer-inputs {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    .composer-inputs input, .composer-inputs textarea {
      background-color: #0c0a09;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 12px;
      color: white;
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
    }
    .composer-inputs input:focus, .composer-inputs textarea:focus {
      border-color: var(--indigo);
    }
    .input-author {
      width: 100px;
      height: 38px;
    }
    .input-content {
      flex: 1;
      height: 38px;
      min-height: 38px;
      max-height: 120px;
      font-family: inherit;
      resize: vertical;
    }
    .composer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .composer-actions button {
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s;
    }
    .btn-submit {
      background-color: var(--accent-color);
      color: white;
      border: none;
    }
    .btn-submit:hover {
      background-color: var(--accent-hover);
    }
    .btn-ai {
      background-color: transparent;
      border: 1px solid #c084fc;
      color: #c084fc;
    }
    .btn-ai:hover {
      background-color: rgba(192, 132, 252, 0.1);
    }

    /* Mobile Responsive Optimizations */
    @media (max-width: 640px) {
      .sidebar {
        width: 100%;
        position: absolute;
        inset: 0;
        z-index: 10;
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .content-area {
        width: 100%;
        position: absolute;
        inset: 0;
        z-index: 5;
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Active thread mode */
      body.thread-active .sidebar {
        transform: translateX(-100%);
        pointer-events: none;
      }
      body.thread-active .content-area {
        z-index: 20;
      }
      
      .mobile-back-btn {
        display: flex !important;
      }
    }
  </style>
</head>
<body>

  <header>
    <div style="display: flex; align-items: center;">
      <button class="mobile-back-btn" onclick="backToSidebar()" style="display: none; background: transparent; border: 1px solid var(--border-color); color: var(--text-color); padding: 6px 10px; border-radius: 6px; font-size: 12px; cursor: pointer; align-items: center; gap: 4px; margin-right: 10px; font-weight: 600;">
        ↩ Threads
      </button>
      <h1>🌐 BBS Monitor Client <span class="badge">VFS RUNNING</span></h1>
    </div>
    <div style="font-size: 11px; color: var(--text-muted); display: none; @media(min-width: 480px){display: block;}">Same-Origin REST API</div>
  </header>

  <div class="main-container">
    <div class="sidebar">
      <div class="sidebar-header">
        <button class="btn-create" onclick="openCreateThreadModal()">⚙️ + Create New Thread</button>
      </div>
      <ul class="thread-list" id="thread-list-container">
        <!-- Thread list will load here -->
      </ul>
    </div>

    <div class="content-area">
      <div id="no-thread-selected" class="no-selection">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 44px; height: 44px; margin-bottom: 12px; color: var(--border-color);">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <p style="font-size: 13px; font-weight: 500; margin: 0 0 4px 0;">No thread selected.</p>
        <p style="font-size: 11px; margin: 0; color: var(--text-muted);">Choose a thread on the left or create one.</p>
      </div>

      <div id="thread-view" style="display: none; flex: 1; flex-direction: column; overflow: hidden;">
        <div class="posts-container" id="posts-container">
          <!-- Posts list will load here -->
        </div>

        <div class="footer-composer">
          <div class="composer-inputs">
            <input type="text" id="composer-author" class="input-author" placeholder="You" value="anonymous">
            <textarea id="composer-content" class="input-content" placeholder="Type a message... (Shift+Enter for newline / Shift+Enterで改行)" required onkeydown="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); submitPost(); }"></textarea>
          </div>
          <div class="composer-actions">
            <button class="btn-ai" id="ai-btn" onclick="askAiToDraft()">
              <span>✨</span> AI Pilot Suggest Autocomplete
            </button>
            <button class="btn-submit" onclick="submitPost()">Send Message</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Thread Modal Overlay (Replaces prompt) -->
  <div id="create-thread-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center; padding: 16px;">
    <div style="background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; width: 100%; max-width: 360px; padding: 20px; box-sizing: border-box; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
      <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 15px; color: var(--indigo); font-weight: 700; display: flex; align-items: center; gap: 6px;">🆕 Create New Discussion Thread</h3>
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        <div>
          <label style="display: block; font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-weight: 500;">Thread Title / スレッド名</label>
          <input type="text" id="modal-thread-title" style="width: 100%; background: #0c0a09; border: 1px solid var(--border-color); border-radius: 6px; padding: 8px 12px; color: white; font-size: 13px; outline: none; box-sizing: border-box;" placeholder="e.g., retro hardware discussions..." required>
          <div id="modal-error-message" style="display: none; color: #f87171; font-size: 11px; margin-top: 8px; font-weight: 500; font-family: sans-serif;"></div>
        </div>
        <div>
          <label style="display: block; font-size: 11px; color: var(--text-muted); margin-bottom: 6px; font-weight: 500;">First Message (Optional) / 本文 (任意)</label>
          <textarea id="modal-thread-body" style="width: 100%; height: 80px; background: #0c0a09; border: 1px solid var(--border-color); border-radius: 6px; padding: 8px 12px; color: white; font-size: 13px; outline: none; box-sizing: border-box; resize: none; font-family: sans-serif;" placeholder="e.g., say something to start the discussion..."></textarea>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button style="background: transparent; border: 1px solid var(--border-color); color: var(--text-muted); padding: 8px 14px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 600;" onclick="closeCreateThreadModal()">Cancel</button>
        <button style="background: var(--indigo); border: none; color: white; padding: 8px 18px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;" onclick="submitNewThread()">Create Thread</button>
      </div>
    </div>
  </div>

  <script>
    let activeThreadId = null;

    async function loadThreads() {
      try {
        const response = await fetch('/api/threads');
        if (!response.ok) throw new Error('Failed to load threads');
        const threads = await response.json();
        const container = document.getElementById('thread-list-container');
        container.innerHTML = '';
        
        threads.forEach(t => {
          const li = document.createElement('li');
          li.className = 'thread-item' + (activeThreadId === t.id ? ' active' : '');
          li.onclick = () => selectThread(t.id);
          
          li.innerHTML = \`
            <div class="title">\${escapeHTML(t.title)}</div>
            \${t.preview ? '<div class="preview" style="font-size: 11px; opacity: 0.6; margin-top: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.45; word-break: break-all; color: #d4d4d8;">' + escapeHTML(t.preview) + '</div>' : ''}
            <div class="meta" style="margin-top: 6px;">
              <span>by \${escapeHTML(t.author)}</span>
              <span>\${t.postCount || 0} posts</span>
            </div>
          \`;
          container.appendChild(li);
        });
      } catch (err) {
        console.error(err);
      }
    }

    function openCreateThreadModal() {
      const errorDiv = document.getElementById('modal-error-message');
      if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
      }
      document.getElementById('modal-thread-title').value = '';
      const bodyInput = document.getElementById('modal-thread-body');
      if (bodyInput) bodyInput.value = '';
      document.getElementById('create-thread-modal').style.display = 'flex';
      setTimeout(() => document.getElementById('modal-thread-title').focus(), 80);
    }

    function closeCreateThreadModal() {
      document.getElementById('create-thread-modal').style.display = 'none';
    }

    async function submitNewThread() {
      const input = document.getElementById('modal-thread-title');
      const bodyInput = document.getElementById('modal-thread-body');
      const errorDiv = document.getElementById('modal-error-message');
      const title = input.value.trim();
      const bodyContent = bodyInput ? bodyInput.value.trim() : "";
      
      if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
      }

      if (!title) {
        if (errorDiv) {
          errorDiv.textContent = 'Please enter a thread title.';
          errorDiv.style.display = 'block';
        }
        return;
      }
      const author = document.getElementById('composer-author').value || 'anonymous';
      
      try {
        const res = await fetch('/api/threads/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ title, author }] })
        });
        if (res.ok) {
          const data = await res.json();
          closeCreateThreadModal();
          
          if (data.lastId && bodyContent) {
            await fetch('/api/posts/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: [{ threadId: data.lastId, author, content: bodyContent }] })
            });
          }

          await loadThreads();
          if (data.lastId) {
            selectThread(data.lastId);
          }
        } else {
          if (errorDiv) {
            errorDiv.textContent = 'Failed to save the new thread.';
            errorDiv.style.display = 'block';
          }
        }
      } catch (err) {
        if (errorDiv) {
          errorDiv.textContent = 'Error creating thread: ' + err.message;
          errorDiv.style.display = 'block';
        }
      }
    }

    async function selectThread(id) {
      activeThreadId = id;
      document.body.classList.add('thread-active'); // Switch viewport view for mobile responsive
      document.getElementById('no-thread-selected').style.display = 'none';
      document.getElementById('thread-view').style.display = 'flex';
      
      // Update sidebar list items visual selection state
      const items = document.querySelectorAll('.thread-item');
      items.forEach(el => el.classList.remove('active'));
      
      // Refresh list to persist matching active selection
      await loadThreads();
      await loadPosts();
    }

    function backToSidebar() {
      document.body.classList.remove('thread-active');
    }

    window.scrollToPost = function(event, num) {
      if (event) event.preventDefault();
      const target = document.getElementById('post-card-' + num);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.style.transition = 'none';
        target.style.backgroundColor = 'rgba(99, 102, 241, 0.35)';
        target.style.borderColor = 'var(--indigo)';
        setTimeout(() => {
          target.style.transition = 'background-color 0.8s, border-color 0.8s';
          target.style.backgroundColor = '';
          target.style.borderColor = '';
        }, 100);
      }
    };

    window.insertAnchor = function(num) {
      const input = document.getElementById('composer-content');
      if (input) {
        const val = input.value;
        input.value = val + (val && !val.endsWith(' ') ? ' ' : '') + '>>' + num + ' ';
        input.focus();
      }
    };

    async function loadPosts() {
      if (!activeThreadId) return;
      try {
        const res = await fetch(\`/api/threads/\${activeThreadId}/posts\`);
        if (!res.ok) throw new Error('Failed to load posts');
        const posts = await res.json();
        
        // Sort chronologically ascending
        posts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const container = document.getElementById('posts-container');
        container.innerHTML = '';
        
        if (posts.length === 0) {
          container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding-top: 40px; font-size: 13px;">No posts yet. Be the first to start the conversation!</div>';
          return;
        }

        posts.forEach((p, idx) => {
          const num = idx + 1;
          const card = document.createElement('div');
          card.className = 'post-card';
          card.id = 'post-card-' + num;
          
          const formattedDate = new Date(p.timestamp).toLocaleTimeString();
          const escapedContent = escapeHTML(p.content);
          
          // Match >>1 or &gt;&gt;1 and replace with interactive anchor link
          let parsedContent = escapedContent.replace(/&gt;&gt;(\d+)/g, '<span class="anchor-link" onclick="scrollToPost(event, $1)" title="Go to post #$1">&gt;&gt;$1</span>');
          
          // Match http/https URLs and replace with clickable links
          const urlRegex = /(https?:\/\/[^\s<"']+)/gi;
          parsedContent = parsedContent.replace(urlRegex, (url) => {
            return '<a href="' + url + '" target="_blank" rel="noopener noreferrer" style="color: var(--indigo); text-decoration: underline; word-break: break-all;" class="hover:text-indigo-400">' + url + '</a>';
          });
          
          card.innerHTML = \`
            <div class="post-header">
              <div>
                <span class="post-number" onclick="insertAnchor(\${num})" title="Reply to #\${num}">#\${num}</span>
                <span class="post-author">\${escapeHTML(p.author)}</span>
                \${p.userId ? '<span style="font-family: monospace; font-size: 10.5px; opacity: 0.7; background: rgba(255,255,255,0.08); padding: 1px 4px; border-radius: 3px; color: #a1a1aa; margin-left: 6px;">' + escapeHTML(p.userId) + '</span>' : ''}
                <span style="font-family: monospace; font-size: 10px; opacity: 0.5; background: rgba(0,0,0,0.2); padding: 1px 4px; border-radius: 3px; color: #a1a1aa; margin-left: 6px; border: 1px solid rgba(255,255,255,0.05);">PostID: \${escapeHTML(p.id)}</span>
              </div>
              <span>\${formattedDate}</span>
            </div>
            <div class="post-body">\${parsedContent}</div>
          \`;
          container.appendChild(card);
        });
        
        // Auto-scroll posts
        container.scrollTop = container.scrollHeight;
      } catch (err) {
        console.error(err);
      }
    }

    async function submitPost() {
      const input = document.getElementById('composer-content');
      const text = input.value.trim();
      if (!text || !activeThreadId) return;
      
      const author = document.getElementById('composer-author').value || 'anonymous';
      
      try {
        const res = await fetch('/api/posts/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: [{ threadId: activeThreadId, author, content: text }] })
        });
        if (res.ok) {
          input.value = '';
          await loadPosts();
          await loadThreads();
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function askAiToDraft() {
      const btn = document.getElementById('ai-btn');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '✨ AI is thinking...';
      
      try {
        const promptText = \`We are in a thread. Build a helpful, professional, and insightfully creative paragraph suggestion as a reply to this context. Output only the content of the suggest reply text directly with no markdown annotations or wrapping quotes.\`;
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText })
        });
        if (res.ok) {
          const data = await res.json();
          document.getElementById('composer-content').value = data.content || '';
        }
      } catch (err) {
        console.error(err);
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    }

    function escapeHTML(str) {
      if (!str) return '';
      return str.replace(/[&<>'"]/g, 
        tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag] || tag)
      );
    }

    // Initialize
    loadThreads();
    setInterval(loadThreads, 15000); // refresh thread list counts every 15s
  </script>
</body>
</html>`;

    defaultLayoutRef.current = defaultBBSContent;

    const saved = localStorage.getItem("shellboards_vfs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean up legacy files and force update with the single beautiful default UI
        parsed['/bbs.html'] = { type: 'file', content: defaultBBSContent };
        parsed['/web.html'] = { type: 'file', content: defaultBBSContent };
        parsed['/modern-bbs.html'] = { type: 'file', content: modernBBSContent };
        parsed['/demo.sh'] = { type: 'file', content: 'echo "Initializing configuration..."\nmkthread "Virtual Automation Thread" | post - "Hello! This post was created automatically by demo.sh using pipes."\n# The smarter ls/cd will now handle the new thread ID correctly even without sleep\nls $LAST_THREAD_ID\ncd $LAST_THREAD_ID' };
        parsed['/scripts'] = { type: 'dir' };
        parsed['/scripts/info.sh'] = { type: 'file', content: 'echo "=== System Status ==="\nuptime\ndate\nwhoami' };
        parsed['/scripts/piped_fortunes.sh'] = { type: 'file', content: 'echo "=== Dynamic Fortune Teller ==="\nfortune | cowsay' };
        parsed['/scripts/b64_tool.sh'] = { type: 'file', content: 'echo "=== Base64 Encoder/Decoder ==="\necho "1. Encoding text to /tmp_b64.txt..."\necho "Active session status: STABLE" | base64 > /tmp_b64.txt\necho "Encoded string stored:"\ncat /tmp_b64.txt\necho "2. Decoding string back..."\ncat /tmp_b64.txt | base64 -d\nrm /tmp_b64.txt' };
        parsed['/scripts/auto_post.sh'] = { type: 'file', content: 'echo "=== Auto Discussion Board Script ==="\nexport NEW_TID=$(mkthread "AI Space Monitoring")\necho "Successfully established Thread ID: $NEW_TID"\npost $NEW_TID "Submitting initial automated heartbeat log..."\npost $NEW_TID "Everything checks out nominal."\necho "Redirecting to thread room via cd..."\ncd $NEW_TID\necho "Loading posts (ls):"\nls' };
        parsed['/scripts/bbs_sample.js'] = { type: 'file', content: 'console.log("=== BBS Auto Reporter (JS) ===");\nbbs.threads().then(list => {\n  console.log(`Total threads on server: \${list.length}`);\n  if (list.length > 0) {\n    const target = list[0];\n    console.log(`Viewing posts in thread [\${target.id}] "\${target.title}":`);\n    return bbs.posts(target.id);\n  }\n}).then(posts => {\n  if (posts) {\n    posts.slice(-3).forEach((p, i) => {\n      console.log(`  [Post #\${i+1}] \${p.author}: \${p.content}`);\n    });\n  }\n});' };
        parsed['/scripts/vfs_stats.js'] = { type: 'file', content: 'console.log("=== VFS Statistics (JS) ===");\nconst files = vfs.ls("/");\nconsole.log("Root files and directories:", files);\nfiles.forEach(f => {\n  if (f !== "scripts" && f !== "/") {\n    const content = vfs.read("/" + f);\n    const size = content ? content.length : 0;\n    console.log(`- /\${f}: \${size} characters`);\n  }\n});' };
        delete parsed['/hello_world.html'];
        delete parsed['/app_paint.html'];
        delete parsed['/app_todo.html'];
        if (!parsed['/agent.md'] && !parsed['/AGENT.md']) {
          parsed['/agent.md'] = { type: 'file', content: `# AI Agent Guidelines\n\nこのファイルはAIエージェントの行動指針や性格をカスタマイズするためのものです。\n自由に編集してAIエージェントを成長させてください。\n\n## 💠 基本ルール\n- ユーザーの指示がない限り、ローカルデータをすべて消去する \`reset\` コマンドは実行しないでください。\n- 対話を通じて得たユーザーの好みや重要な発見は、\`memory add\` コマンドを使って積極的に記憶に保存してください。\n\n## 🎭 カスタムキャラクター・指示\n(以下に自由に追加ルールやキャラクター設定を書いてください。例:「丁寧な敬語で話すこと」など)\n- ` };
        }
        return parsed;
      } catch (e) {}
    }
    return {
      '/': { type: 'dir' },
      '/welcome.txt': { type: 'file', content: `Welcome to Shell BBS Integrated Virtual Terminal!\n\nThis workspace lets you create virtual directories, files, write scripts, and run them with "sh" or "./" commands.\n\nYou can also pipe and redirect command outputs using ">" and ">>".\nType "help" to see all directory commands.\n\n💡 NEW ADVANCED FEATURE: Live Custom Web App UI Sandbox!\nYou can now edit or create custom HTML/JS/CSS files in this virtual filesystem and run them as interactive custom UI web apps!\nTry running:\n  web /bbs.html   or   web /modern-bbs.html\n\nYou can edit this app using "nano /modern-bbs.html". The preview screen on the right will live-reload instantly upon save (Ctrl+S)!\nTo close the preview pane at any time, run: web off` },
      '/agent.md': { type: 'file', content: `# AI Agent Guidelines\n\nこのファイルはAIエージェントの行動指針や性格をカスタマイズするためのものです。\n自由に編集してAIエージェントを成長させてください。\n\n## 💠 基本ルール\n- ユーザーの指示がない限り、ローカルデータをすべて消去する \`reset\` コマンドは実行しないでください。\n- 対話を通じて得たユーザーの好みや重要な発見は、\`memory add\` コマンドを使って積極的に記憶に保存してください。\n\n## 🎭 カスタムキャラクター・指示\n(以下に自由に追加ルールやキャラクター設定を書いてください。例:「丁寧な敬語で話すこと」など)\n- ` },
      '/demo.sh': { type: 'file', content: 'echo "Initializing configuration..."\nmkthread "Virtual Automation Thread" | post - "Hello! This post was created automatically by demo.sh using pipes."\n# The smarter ls/cd will now handle the new thread ID correctly even without sleep\nls $LAST_THREAD_ID\ncd $LAST_THREAD_ID' },
      '/scripts': { type: 'dir' },
      '/scripts/info.sh': { type: 'file', content: 'echo "=== System Status ==="\nuptime\ndate\nwhoami' },
      '/scripts/piped_fortunes.sh': { type: 'file', content: 'echo "=== Dynamic Fortune Teller ==="\nfortune | cowsay' },
      '/scripts/b64_tool.sh': { type: 'file', content: 'echo "=== Base64 Encoder/Decoder ==="\necho "1. Encoding text to /tmp_b64.txt..."\necho "Active session status: STABLE" | base64 > /tmp_b64.txt\necho "Encoded string stored:"\ncat /tmp_b64.txt\necho "2. Decoding string back..."\ncat /tmp_b64.txt | base64 -d\nrm /tmp_b64.txt' },
      '/scripts/auto_post.sh': { type: 'file', content: 'echo "=== Auto Discussion Board Script ==="\nexport NEW_TID=$(mkthread "AI Space Monitoring")\necho "Successfully established Thread ID: $NEW_TID"\npost $NEW_TID "Submitting initial automated heartbeat log..."\npost $NEW_TID "Everything checks out nominal."\necho "Redirecting to thread room via cd..."\ncd $NEW_TID\necho "Loading posts (ls):"\nls' },
      '/scripts/bbs_sample.js': { type: 'file', content: 'console.log("=== BBS Auto Reporter (JS) ===");\nbbs.threads().then(list => {\n  console.log(`Total threads on server: \${list.length}`);\n  if (list.length > 0) {\n    const target = list[0];\n    console.log(`Viewing posts in thread [\${target.id}] "\${target.title}":`);\n    return bbs.posts(target.id);\n  }\n}).then(posts => {\n  if (posts) {\n    posts.slice(-3).forEach((p, i) => {\n      console.log(`  [Post #\${i+1}] \${p.author}: \${p.content}`);\n    });\n  }\n});' },
      '/scripts/vfs_stats.js': { type: 'file', content: 'console.log("=== VFS Statistics (JS) ===");\nconst files = vfs.ls("/");\nconsole.log("Root files and directories:", files);\nfiles.forEach(f => {\n  if (f !== "scripts" && f !== "/") {\n    const content = vfs.read("/" + f);\n    const size = content ? content.length : 0;\n    console.log(`- /\${f}: \${size} characters`);\n  }\n});' },
      '/bbs.html': { type: 'file', content: defaultBBSContent },
      '/web.html': { type: 'file', content: defaultBBSContent },
      '/modern-bbs.html': { type: 'file', content: modernBBSContent }
    };
  });

  const [cwd, setCwd] = useState(() => {
    return localStorage.getItem("shellboards_cwd") || '/';
  });

  // Inline terminal nano/editor states
  const [editingFilePath, setEditingFilePath] = useState<string | null>(null);
  const [editingFileContent, setEditingFileContent] = useState("");

  useEffect(() => {
    localStorage.setItem("shellboards_vfs", JSON.stringify(vfs));
  }, [vfs]);

  useEffect(() => {
    localStorage.setItem("shellboards_cwd", cwd);
  }, [cwd]);

  useEffect(() => {
    localStorage.setItem("shellboards_username", username);
  }, [username]);

  useEffect(() => {
    if (context) {
      localStorage.setItem("shellboards_context", context);
    } else {
      localStorage.removeItem("shellboards_context");
    }
  }, [context]);

  useEffect(() => {
    localStorage.setItem("shellboards_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("shellboards_lang", lang);
  }, [lang]);

  useEffect(() => {
    if (previewFile) {
      localStorage.setItem("shellboards_preview_file", previewFile);
    } else {
      localStorage.removeItem("shellboards_preview_file");
    }
  }, [previewFile]);

  useEffect(() => {
    localStorage.setItem("shellboards_show_preview", String(showPreviewPane));
  }, [showPreviewPane]);

  useEffect(() => {
    localStorage.setItem("shellboards_preview_mode", previewMode);
  }, [previewMode]);

  useEffect(() => {
    if (objective) {
      localStorage.setItem("shellboards_objective", objective);
    } else {
      localStorage.removeItem("shellboards_objective");
    }
  }, [objective]);

  // Synchronize previewContent with vfs for the specified previewFile on mounts or content updates
  useEffect(() => {
    if (previewFile && vfs[previewFile]?.content !== undefined) {
      setPreviewContent(vfs[previewFile].content || "");
    }
  }, [previewFile, vfs]);

  const envRef = useRef<Record<string, string>>((() => {
    try {
      const saved = localStorage.getItem("shellboards_env");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      OPENAI_BASE_URL: "https://api.openai.com/v1/chat/completions",
      OPENAI_MODEL: "gpt-4o-mini"
    };
  })());

  const aliasesRef = useRef<Record<string, string>>({});
  const shellFunctionsRef = useRef<Record<string, string[]>>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current?.parentElement) {
       bottomRef.current.parentElement.scrollTop = bottomRef.current.parentElement.scrollHeight;
    }
  }, [output, splitMode]);

  // Using refs to provide fresh state to async callbacks without stale closures
  const historyRef = useRef(history);
  historyRef.current = history;
  const langRef = useRef(lang);
  langRef.current = lang;
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const customThemesRef = useRef(customThemes);
  customThemesRef.current = customThemes;

  // Let refs represent freshest VFS & CWD state for callbacks
  const vfsRef = useRef(vfs);
  vfsRef.current = vfs;
  const cwdRef = useRef(cwd);
  cwdRef.current = cwd;

  useEffect(() => {
    const t = locales[langRef.current];
    setOutput([
      {
        id: "banner1",
        content: <div className="text-[#4ade80] opacity-80 leading-none mb-4 select-none">
<pre className="text-[10px] md:text-xs">
{`  _   _   _   _   _   _   _   _   _   _   _
 / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\
( S | H | E | L | L | B | O | A | R | D | v | 3 )
 \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/`}
</pre>
        </div>
      },
      { id: "msg1", content: t.bannerDesc },
      { id: "msg2", content: t.helpText }
    ]);
  }, []);

  const apiFuncs = {
    setSplitMode: (mode: 'v' | 'h' | null) => setSplitMode(mode),
    getSplitMode: () => splitMode,
    fetchThreads: async () => {
        const res = await fetch("/api/threads");
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }
        return res.json();
    },
    fetchPosts: async (id: string) => {
        const res = await fetch(`/api/threads/${id}/posts`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }
        const posts = await res.json();
        if (Array.isArray(posts)) {
          posts.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
        return posts;
    },
    createThreads: async (items: any[]) => {
        const res = await fetch("/api/threads/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }
        return res.json();
    },
    createPosts: async (items: any[]) => {
        const res = await fetch("/api/posts/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }
        return res.json();
    },
    setUsername,
    clear: () => setOutput([]),
    getLang: () => langRef.current,
    setLang,
    getTheme: () => themeRef.current,
    setTheme: (t: string) => {
      setTheme(t);
      themeRef.current = t;
      localStorage.setItem("shellboards_theme", t);
    },
    getAllThemes: () => {
      return { ...themes, ...customThemesRef.current };
    },
    getCustomThemes: () => customThemesRef.current,
    addCustomTheme: (key: string, data: any) => {
      setCustomThemes(prev => {
        const next = { ...prev, [key]: data };
        localStorage.setItem("shellboards_custom_themes", JSON.stringify(next));
        customThemesRef.current = next;
        return next;
      });
    },
    removeCustomTheme: (key: string) => {
      setCustomThemes(prev => {
        const next = { ...prev };
        delete next[key];
        localStorage.setItem("shellboards_custom_themes", JSON.stringify(next));
        customThemesRef.current = next;
        return next;
      });
    },
    startThemeWizard: (key?: string) => {
      setShowThemeEditor(key || true);
    },
    openAISettings: () => {
      setShowAISettings(true);
    },
    getHistory: () => historyRef.current,
    getEnv: (k: string) => envRef.current[k],
    getAllEnv: () => envRef.current,
    setEnv: (k: string, v: string) => { 
      envRef.current[k] = v; 
      try {
        localStorage.setItem("shellboards_env", JSON.stringify(envRef.current));
      } catch {}
    },
    getAliases: () => aliasesRef.current,
    setAlias: (name: string, cmd: string) => { aliasesRef.current[name] = cmd; },
    getShellFunctions: () => shellFunctionsRef.current,
    setShellFunction: (name: string, body: string[]) => { shellFunctionsRef.current[name] = body; },
    setOutput: (updater: any) => setOutput(updater),
    setWatch: (fn: any, ms: number) => { intervalRef.current = setInterval(fn, ms); },
    clearWatch: () => { if (intervalRef.current) clearInterval(intervalRef.current); },
    getContext: () => context,
    setContext: setContext,
    getObjective: () => objective,
    setObjective: (val: string) => {
      setObjective(val);
      localStorage.setItem("shellboards_objective", val);
    },
    resetLocalData: () => {
      // Clear calcStore, shellFunctions, and window repl vars
      shellFunctionsRef.current = {};
      calcStore = {
        vars: { PI: Math.PI, E: Math.E },
        funcs: {}
      };
      if ((window as any).__added_js_repl_vars__) {
        for (const key of (window as any).__added_js_repl_vars__) {
          delete (window as any)[key];
        }
        ((window as any).__added_js_repl_vars__ as Set<string>).clear();
      }

      // 1. Clear state
      setUsername("anonymous");
      setContext(null);
      setObjective("");
      setHistory([]);
      setHistoryIdx(-1);
      setCwd('/');
      setLang("ja");
      setTheme("emerald");
      themeRef.current = "emerald";
      localStorage.setItem("shellboards_theme", "emerald");
      setCustomThemes({});
      customThemesRef.current = {};
      localStorage.removeItem("shellboards_custom_themes");
      setPreviewFile(null);
      setPreviewContent("");
      setShowPreviewPane(false);
      setPreviewMode("desktop");
      setShowAISettings(false);
      setIsAgentMode(false);
      setIsAgentProcessing(false);
      setAgentHistory([]);
      setRequireAgentApproval(false);

      const defaultVFS = {
        '/': { type: 'dir' as const },
        '/welcome.txt': { type: 'file' as const, content: `Welcome to Shell BBS Integrated Virtual Terminal!\n\nThis workspace lets you create virtual directories, files, write scripts, and run them with "sh" or "./" commands.\n\nYou can also pipe and redirect command outputs using ">" and ">>".\nType "help" to see all directory commands.\n\n💡 NEW ADVANCED FEATURE: Live Custom Web App UI Sandbox!\nYou can now edit or create custom HTML/JS/CSS files in this virtual filesystem and run them as interactive custom UI web apps!\nTry running:\n  web /bbs.html   or   web /modern-bbs.html\n\nYou can edit this app using "nano /modern-bbs.html". The preview screen on the right will live-reload instantly upon save (Ctrl+S)!\nTo close the preview pane at any time, run: web off` },
        '/agent.md': { type: 'file' as const, content: `# AI Agent Guidelines\n\nこのファイルはAIエージェントの行動指針や性格をカスタマイズするためのものです。\n自由に編集してAIエージェントを成長させてください。\n\n## 💠 基本ルール\n- ユーザーの指示がない限り、ローカルデータをすべて消去する \`reset\` コマンドは実行しないでください。\n- 対話を通じて得たユーザーの好みや重要な発見は、\`memory add\` コマンドを使って積極的に記憶に保存してください。\n\n## 🎭 カスタムキャラクター・指示\n(以下に自由に追加ルールやキャラクター設定を書いてください。例:「丁寧な敬語で話すこと」など)\n- ` },
        '/demo.sh': { type: 'file' as const, content: 'echo "Initializing configuration..."\nmkthread "Virtual Automation Thread" | post - "Hello! This post was created automatically by demo.sh using pipes."\n# The smarter ls/cd will now handle the new thread ID correctly even without sleep\nls $LAST_THREAD_ID\ncd $LAST_THREAD_ID' },
        '/scripts': { type: 'dir' as const },
        '/scripts/info.sh': { type: 'file' as const, content: 'echo "=== System Status ==="\nuptime\ndate\nwhoami' },
        '/scripts/piped_fortunes.sh': { type: 'file' as const, content: 'echo "=== Dynamic Fortune Teller ==="\nfortune | cowsay' },
        '/scripts/b64_tool.sh': { type: 'file' as const, content: 'echo "=== Base64 Encoder/Decoder ==="\necho "1. Encoding text to /tmp_b64.txt..."\necho "Active session status: STABLE" | base64 > /tmp_b64.txt\necho "Encoded string stored:"\ncat /tmp_b64.txt\necho "2. Decoding string back..."\ncat /tmp_b64.txt | base64 -d\nrm /tmp_b64.txt' },
        '/scripts/auto_post.sh': { type: 'file' as const, content: 'echo "=== Auto Discussion Board Script ==="\nexport NEW_TID=$(mkthread "AI Space Monitoring")\necho "Successfully established Thread ID: $NEW_TID"\npost $NEW_TID "Submitting initial automated heartbeat log..."\npost $NEW_TID "Everything checks out nominal."\necho "Redirecting to thread room via cd..."\ncd $NEW_TID\necho "Loading posts (ls):"\nls' },
        '/bbs.html': { type: 'file' as const, content: defaultLayoutRef.current },
        '/modern-bbs.html': { type: 'file' as const, content: modernBBSContent }
      };
      setVfs(defaultVFS);
      
      // Update refs
      vfsRef.current = defaultVFS;
      cwdRef.current = '/';
      previewFileRef.current = null;
      langRef.current = 'ja';
      historyRef.current = [];
      envRef.current = {
        OPENAI_BASE_URL: "https://api.openai.com/v1/chat/completions",
        OPENAI_MODEL: "gpt-4o-mini"
      };

      // 2. Clear localStorage
      localStorage.removeItem("shellboards_username");
      localStorage.removeItem("shellboards_context");
      localStorage.removeItem("shellboards_objective");
      localStorage.removeItem("shellboards_history");
      localStorage.removeItem("shellboards_lang");
      localStorage.removeItem("shellboards_preview_file");
      localStorage.removeItem("shellboards_show_preview");
      localStorage.removeItem("shellboards_preview_mode");
      localStorage.removeItem("shellboards_vfs");
      localStorage.removeItem("shellboards_cwd");
      localStorage.removeItem("shellboards_env");
      localStorage.removeItem("shellboards_agent_approval");

      // 3. Clear terminal output and add welcome banners
      setOutput([
        { id: "reset-msg1", content: <div className="text-amber-500 font-bold p-1 border border-dashed border-amber-500 rounded my-2">ローカルデータを初期化しました。 / Local data initialized.</div> },
        { id: "banner1", content: <div className="text-[#4ade80] opacity-80 leading-none mb-4 select-none">
<pre className="text-[10px] md:text-xs">
{`  _   _   _   _   _   _   _   _   _   _   _
 / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\ / \\
( S | H | E | L | L | B | O | A | R | D | v | 3 )
 \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/ \\_/`}
</pre>
        </div> },
        { id: "msg1", content: locales['ja'].bannerDesc },
        { id: "msg2", content: locales['ja'].helpText }
      ]);
    },
    
    // Virtual File System accessors
    getVFS: () => vfsRef.current,
    setVFS: (updater: any) => {
      if (typeof updater === 'function') {
        setVfs(prev => {
          const next = updater(prev);
          vfsRef.current = next;
          return next;
        });
      } else {
        setVfs(updater);
        vfsRef.current = updater;
      }
    },
    getCWD: () => cwdRef.current,
    setCWD: (val: string) => {
      setCwd(val);
      cwdRef.current = val;
    },
    writeVFSFile: (pathStr: string, content: string, append: boolean) => {
      setVfs(prev => {
        const resolved = resolvePath(cwdRef.current, pathStr);
        const existing = prev[resolved]?.content || "";
        const nextContent = append ? (existing ? existing + "\n" + content : content) : content;
        const nextVFS = {
          ...prev,
          [resolved]: { type: 'file' as const, content: nextContent }
        };
        vfsRef.current = nextVFS;
        return nextVFS;
      });
    },
    openEditor: (pathStr: string, initialContent: string) => {
      setEditingFilePath(pathStr);
      setEditingFileContent(initialContent);
    },

    // Handlers for Sandbox Live Web App Preview
    openPreview: (pathStr: string, content: string) => {
      setPreviewFile(pathStr);
      setPreviewContent(content);
      setShowPreviewPane(true);
      setPreviewKey(prev => prev + 1);
    },
    closePreview: () => {
      setPreviewFile(null);
      setPreviewContent("");
      setShowPreviewPane(false);
    },
    getPreviewFile: () => previewFileRef.current,

    callAI: async (data: any) => {
        const mergedData = {
            endpoint: data.endpoint || envRef.current['OPENAI_BASE_URL'],
            key: data.key || envRef.current['OPENAI_API_KEY'],
            model: data.model || envRef.current['OPENAI_MODEL'],
            prompt: data.prompt
        };
        const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mergedData)
        });
        return res.json();
    },
    executeNested: async (nestedCmd: string) => {
        return await executePipeline(nestedCmd, username, apiFuncs);
    },
    startAgentMode: () => setIsAgentMode(true),
    stopAgentMode: () => {
        setIsAgentMode(false);
        setAgentHistory([]);
    },
    setIsAgentProcessing,
    setInput: (val: string) => {
        setInput(val);
        inputRef.current?.focus();
    },
    insertInput: (val: string) => {
        const inputEl = inputRef.current;
        if (inputEl) {
          const start = inputEl.selectionStart ?? inputEl.value.length;
          const end = inputEl.selectionEnd ?? inputEl.value.length;
          const before = inputEl.value.substring(0, start);
          const after = inputEl.value.substring(end);
          const newVal = before + val + after;
          setInput(newVal);
          setTimeout(() => {
            inputEl.focus();
            const newCursorPos = start + val.length;
            inputEl.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
        } else {
          setInput(val);
        }
    },
    getRequireAgentApproval: () => {
      const saved = localStorage.getItem("shellboards_agent_approval");
      return saved !== "false";
    },
    setRequireAgentApproval: (val: boolean) => {
      setRequireAgentApproval(val);
      localStorage.setItem("shellboards_agent_approval", String(val));
    },
    setPendingAgentAction: (cmd: string, history: any[]) => {
      setPendingAgentCmd(cmd);
      setPendingAgentHistory(history);
    }
  };

  if (typeof window !== "undefined") {
    (window as any).virtualBBS = apiFuncs;
  }

  // Run startup commands after mounting
  useEffect(() => {
    let active = true;
    const runStartupCommands = async () => {
      let startupStr = localStorage.getItem("shellboards_startup");
      let startupCmds: string[];
      if (startupStr === null) {
        startupCmds = ["web /bbs.html"];
        localStorage.setItem("shellboards_startup", JSON.stringify(startupCmds));
      } else {
        try {
          startupCmds = JSON.parse(startupStr);
          if (!Array.isArray(startupCmds)) {
            startupCmds = ["web /bbs.html"];
          }
        } catch {
          startupCmds = ["web /bbs.html"];
        }
      }

      for (const cmdStr of startupCmds) {
        if (!active) break;
        if (!cmdStr.trim()) continue;
        
        // Print the prompt and command line showing it runs as a startup directive
        setOutput(prev => {
          let next = [...prev, { 
            id: Math.random().toString(), 
            content: (
              <div className="font-mono">
                 <span className="text-[#4ade80]">{username}</span>
                 <span className="text-[#cbd5e1]">@</span>
                 <span className="text-[#a855f7]">{hostname}</span>
                 <span className="text-[#cbd5e1]">:</span>
                 <span className="text-[#60a5fa]">~</span>
                 <span className="text-[#cbd5e1]">$</span>
                 <span className="text-white ml-2">
                   {cmdStr} <span className="text-zinc-500 text-xs italic">({langRef.current === 'ja' ? 'スタートアップ' : 'startup'})</span>
                 </span>
              </div>
            )
          }];
          if (next.length > 2000) next = next.slice(next.length - 2000);
          return next;
        });

        try {
          // Execute the command in the shell engine
          await executeScriptEngine(cmdStr, username, apiFuncs, false);
        } catch (e: any) {
          setOutput(prev => [...prev, { id: Math.random().toString(), content: <span className="text-red-500 font-mono">⚠️ {e.message}</span> }]);
        }
      }
    };

    // Delay executing start up scripts slightly to let the UI settle
    const timer = setTimeout(() => {
      runStartupCommands();
    }, 450);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const onApproveAgentAction = async (cmdToRun: string, currentHistory: any[]) => {
    setIsAgentProcessing(true);
    setPendingAgentCmd(null);
    setPendingAgentHistory(null);

    const agentApiFuncs = {
      ...apiFuncs,
      getLang: () => 'en',
      executeNested: async (nestedCmd: string) => {
        return await executePipeline(nestedCmd, username, agentApiFuncs);
      }
    };

    const isJa = langRef.current === 'ja';
    setOutput(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        content: (
          <div className="text-yellow-400 font-mono text-xs flex items-center gap-1.5 my-1.5 select-none">
            <span>⚡️ {isJa ? "[ユーザー許可] コマンドの実行を承認しました:" : "[User Approved] Command execution approved:"}</span>
            <span className="font-bold underline">{cmdToRun}</span>
          </div>
        )
      }
    ]);

    try {
      const executionResult = await agentApiFuncs.executeNested(cmdToRun);

      if (executionResult && executionResult.length > 0) {
        setOutput(prev => [
          ...prev,
          ...executionResult.map(c => {
             const textOut = cleanCommandOutputForAI(c);
             if (textOut) {
               return {
                 id: Math.random().toString(),
                 content: <div className="whitespace-pre-wrap font-mono text-zinc-300 leading-relaxed py-1">{textOut}</div>
               };
             }
             return { id: Math.random().toString(), content: (c && c._isUIObj) ? c.ui : c };
          })
        ]);
      }

      const agentTextOutput = executionResult.map(c => cleanCommandOutputForAI(c)).join('\n');
      
      const feedbackText = `【System Feedback: Command Executed】: ${cmdToRun}\n【Output】:\n${agentTextOutput || "(No output)"}`;
      const nextHistory = [...currentHistory, { role: "user", content: feedbackText }];
      setAgentHistory(nextHistory);

      const finalHistory = await executeAgentLoop("", apiFuncs, username, nextHistory);
      setAgentHistory(finalHistory);
    } catch (e: any) {
      setOutput(prev => [
        ...prev,
        { id: Math.random().toString(), content: <span className="text-red-500">Error: {e.message}</span> }
      ]);
    } finally {
      setIsAgentProcessing(false);
    }
  };

  const onDenyAgentAction = async (cmdToRun: string, currentHistory: any[]) => {
    setPendingAgentCmd(null);
    setPendingAgentHistory(null);

    const isJa = langRef.current === 'ja';
    setOutput(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        content: (
          <div className="text-red-400 font-mono text-xs my-1.5 select-none">
            <span>❌ {isJa ? "[ユーザー却下] コマンドの実行は却下されました。" : "[User Denied] Command execution blocked by user."}</span>
          </div>
        )
      }
    ]);

    setIsAgentProcessing(true);
    try {
      const feedbackText = `【System Feedback】: The user denied permission to execute the command: "${cmdToRun}"`;
      const nextHistory = [...currentHistory, { role: "user", content: feedbackText }];
      setAgentHistory(nextHistory);

      const finalHistory = await executeAgentLoop("", apiFuncs, username, nextHistory);
      setAgentHistory(finalHistory);
    } catch (e: any) {
      setOutput(prev => [
        ...prev,
        { id: Math.random().toString(), content: <span className="text-red-500">Error: {e.message}</span> }
      ]);
    } finally {
      setIsAgentProcessing(false);
    }
  };

  const callExecute = async (inputStr: string) => {
    try {
        await executeScriptEngine(inputStr, username, apiFuncs, false);
    } catch (e: any) {
        setOutput(prev => [...prev, { id: Math.random().toString(), content: <span className="text-[#ff5f56]">{e.message}</span> }]);
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    apiFuncs.clearWatch();

    const currentInput = input;
    setInput("");

    if (pendingAgentCmd) {
      if (!currentInput.trim()) return;
      const cmdLower = currentInput.trim().toLowerCase();
      setOutput(prev => [...prev, {
        id: Math.random().toString(),
        content: <div className="font-mono"><span className="text-yellow-400">⚡️ [User Input] </span><span className="text-white">{currentInput}</span></div>
      }]);
      
      if (['y', 'yes', 'ok', 'approve', '許可', '1', 'はい', 'allow', 'accept'].includes(cmdLower)) {
        await onApproveAgentAction(pendingAgentCmd, pendingAgentHistory || []);
      } else {
        await onDenyAgentAction(pendingAgentCmd, pendingAgentHistory || []);
      }
      return;
    }

    if (wizardStep > 0) {
      if (!currentInput.trim()) return;
      setOutput(prev => [...prev, {
        id: Math.random().toString(),
        content: <div><span className="text-[#4ade80]">[Wizard]</span> <span className="text-white">{currentInput}</span></div>
      }]);

      if (currentInput.trim().toLowerCase() === 'exit') {
        setWizardStep(0);
        setWizardData({});
        setOutput(prev => [...prev, { id: Math.random().toString(), content: <div className="text-yellow-400">{"->"} テーマ作成ウィザードを中断しました。(Theme creation aborted.)</div> }]);
        return;
      }

      const isJa = langRef.current === 'ja';
      const step = wizardStep;
      let nextData = { ...wizardData };
      let newStep = step + 1;

      try {
        if (step === 1) { // key
          const key = currentInput.trim().toLowerCase();
          if (!/^[a-z0-9_-]+$/.test(key)) throw new Error(isJa ? "半角英数字、アンダースコア、ハイフンのみ使用可能です。" : "Alphanumerics, hyphens, underscores only.");
          if (themes[key] || customThemes[key]) throw new Error(isJa ? "そのキーは既に使われています。" : "That key is already in use.");
          nextData.key = key;
        } else if (step === 2) { // name
          nextData.name = currentInput.trim();
          nextData.nameEn = currentInput.trim();
        } else if (step === 3) { // desc
          nextData.desc = currentInput.trim();
          nextData.descEn = currentInput.trim();
        } else if (step === 4) { // canvasBg
          const bgMap: Record<string, string> = { '1': 'bg-black', '2': 'bg-zinc-950', '3': 'bg-[#0f1710]' };
          nextData.canvasBg = bgMap[currentInput.trim()] || currentInput.trim();
        } else if (step === 5) { // termBg
          const bgMap: Record<string, string> = { '1': 'bg-black/50', '2': 'bg-transparent', '3': 'bg-zinc-900' };
          nextData.termBg = bgMap[currentInput.trim()] || currentInput.trim();
        } else if (step === 6) { // topbarBg
          const bgMap: Record<string, string> = { '1': 'bg-zinc-950/80', '2': 'bg-black', '3': 'bg-cyan-950/40' };
          nextData.topbarBg = bgMap[currentInput.trim()] || currentInput.trim();
        } else if (step === 7) { // termText
          const cMap: Record<string, string> = { '1': 'text-[#d4d4d4]', '2': 'text-emerald-500', '3': 'text-cyan-400' };
          nextData.termText = cMap[currentInput.trim()] || currentInput.trim();
        } else if (step === 8) { // promptUser
          const cMap: Record<string, string> = { '1': 'text-[#4ade80]', '2': 'text-cyan-400', '3': 'text-fuchsia-400' };
          nextData.promptUser = cMap[currentInput.trim()] || currentInput.trim();
        } else if (step === 9) { // promptHost
          const cMap: Record<string, string> = { '1': 'text-[#a855f7]', '2': 'text-blue-400', '3': 'text-rose-400' };
          nextData.promptHost = cMap[currentInput.trim()] || currentInput.trim();
        } else if (step === 10) { // promptCwd
          const cMap: Record<string, string> = { '1': 'text-[#60a5fa]', '2': 'text-yellow-400', '3': 'text-emerald-400' };
          nextData.promptCwd = cMap[currentInput.trim()] || currentInput.trim();
        } else if (step === 11) { // caret
          const cMap: Record<string, string> = { '1': 'caret-[#4ade80]', '2': 'caret-cyan-400', '3': 'caret-zinc-400' };
          nextData.caret = cMap[currentInput.trim()] || currentInput.trim();
          
          // Use some reasonable defaults for editor fields for custom themes
          nextData.editorBg = nextData.termBg || 'bg-black text-gray-200 border-zinc-800';
          nextData.isCustom = true;

          const key = nextData.key;
          const { key: _k, ...themeData } = nextData;
          
          apiFuncs.addCustomTheme(key, themeData);
          setWizardStep(0);
          setWizardData({});
          setOutput(prev => [...prev, {
            id: Math.random().toString(),
            content: <div className="text-green-400 mt-2">
              🎉 {isJa ? `カスタムテーマ '${key}' が作成されました！` : `Custom theme '${key}' has been created!`} <br/>
              {isJa ? `適用するには 'theme ${key}' と入力してください。` : `Type 'theme ${key}' to apply it.`}
            </div>
          }]);
          return;
        }

        setWizardData(nextData);
        setWizardStep(newStep);
        
        const qJa = [
          "",
          "[2/11] テーマの名前 (表示名) を入力してください。 (例: My Cool Theme)",
          "[3/11] テーマの説明を入力してください。",
          "[4/11] Canvasの背景色 (1: bg-black, 2: bg-zinc-950, 3: bg-[#0f1710], またはTailwindクラス)",
          "[5/11] ターミナルの背景色 (1: bg-black/50, 2: bg-transparent, 3: bg-zinc-900, またはTailwindクラス)",
          "[6/11] トップバーの背景色 (1: bg-zinc-950/80, 2: bg-black, 3: bg-cyan-950/40, またはTailwindクラス)",
          "[7/11] ターミナルの基本テキスト色 (1: text-[#d4d4d4], 2: text-emerald-500, 3: text-cyan-400, またはTailwind)",
          "[8/11] プロンプトのユーザー名の色 (1: text-[#4ade80], 2: text-cyan-400, 3: text-fuchsia-400, またはTailwind)",
          "[9/11] プロンプトのホスト名の色 (1: text-[#a855f7], 2: text-blue-400, 3: text-rose-400, またはTailwind)",
          "[10/11] プロンプトのディレクトリパスの色 (1: text-[#60a5fa], 2: text-yellow-400, 3: text-emerald-400, またはTailwind)",
          "[11/11] キャレット(カーソル)の色 (1: caret-[#4ade80], 2: caret-cyan-400, 3: caret-zinc-400, またはTailwind)"
        ];
        const qEn = [
          "",
          "[2/11] Enter a display name for the theme. (e.g. My Cool Theme)",
          "[3/11] Enter a short description for the theme.",
          "[4/11] Canvas Background (1: bg-black, 2: bg-zinc-950, 3: bg-[#0f1710], or custom Tailwind class)",
          "[5/11] Terminal Background (1: bg-black/50, 2: bg-transparent, 3: bg-zinc-900, or custom Tailwind class)",
          "[6/11] Topbar Background (1: bg-zinc-950/80, 2: bg-black, 3: bg-cyan-950/40, or custom Tailwind class)",
          "[7/11] Base Text Color (1: text-[#d4d4d4], 2: text-emerald-500, 3: text-cyan-400, or custom Tailwind)",
          "[8/11] Prompt User Color (1: text-[#4ade80], 2: text-cyan-400, 3: text-fuchsia-400, or custom Tailwind)",
          "[9/11] Prompt Host Color (1: text-[#a855f7], 2: text-blue-400, 3: text-rose-400, or custom Tailwind)",
          "[10/11] Prompt CWD Color (1: text-[#60a5fa], 2: text-yellow-400, 3: text-emerald-400, or custom Tailwind)",
          "[11/11] Caret Color (1: caret-[#4ade80], 2: caret-cyan-400, 3: caret-zinc-400, or custom Tailwind)"
        ];

        setOutput(prev => [...prev, {
          id: Math.random().toString(),
          content: <div className="text-cyan-200 mt-2 font-bold">{isJa ? qJa[newStep-1] : qEn[newStep-1]}</div>
        }]);

      } catch (err: any) {
        setOutput(prev => [...prev, {
          id: Math.random().toString(),
          content: <div className="text-red-400">Error: {err.message || String(err)}</div>
        }]);
      }
      return;
    }

    if (isAgentMode) {
      if (!currentInput) {
        setOutput(prev => [...prev, { id: Math.random().toString(), content: <div className="text-purple-400">[AI-Agent] {username}@{hostname}:~$</div> }]);
        return;
      }
      const cmdStr = currentInput;

      if (cmdStr.trim() === "exit" || cmdStr.trim() === "quit") {
        apiFuncs.stopAgentMode();
        setOutput(prev => [...prev, {
          id: Math.random().toString(),
          content: <div className="text-gray-400 font-sans">=== AIエージェント対話モードを終了しました ===</div>
        }]);
        return;
      }

      setOutput(prev => {
         let next = [...prev, { 
           id: Math.random().toString(), 
           content: <div className="font-mono">
              <span className="text-[#a855f7]">[AI-Agent] </span>
              <span className="text-[#4ade80]">{username}</span>
              <span className="text-[#cbd5e1]">$</span>
              <span className="text-white ml-2">{cmdStr}</span>
           </div> 
         }];
         if (next.length > 2000) next = next.slice(next.length - 2000);
         return next;
      });

      const nextHistory = await executeAgentLoop(cmdStr, apiFuncs, username, agentHistory);
      setAgentHistory(nextHistory);
      return;
    }

    if (!input) {
      setOutput(prev => [...prev, { id: Math.random().toString(), content: <div className="text-[#4ade80]">{username}@{hostname}:{context ? `bbs:/${context}` : cwd === '/' ? "~" : cwd}$</div> }]);
      return;
    }
    const cmdStr = input;
    setInput("");
    
    setHistory(prev => {
       const next = [...prev, cmdStr];
       if (next.length > 100) next.shift();
       return next;
    });
    setHistoryIdx(-1);

    setOutput(prev => {
       let next = [...prev, { 
         id: Math.random().toString(), 
         content: <div className="font-mono">
            <span className="text-[#4ade80]">{username}</span>
            <span className="text-[#cbd5e1]">@</span>
            <span className="text-[#a855f7]">{hostname}</span>
            <span className="text-[#cbd5e1]">:</span>
            <span className="text-[#60a5fa]">{context ? `bbs:/${context}` : cwd === '/' ? "~" : cwd}</span>
            <span className="text-[#cbd5e1]">$</span>
            <span className="text-white ml-2">{cmdStr}</span>
         </div> 
       }];
       if (next.length > 2000) next = next.slice(next.length - 2000);
       return next;
    });

    await callExecute(cmdStr);
  };

  const onKeyDown = async (e: KeyboardEvent) => {
    if (inlineCandidates && inlineCandidates.length > 0) {
      const isNext = (e.key === 'Tab' && !e.shiftKey) || e.key === 'ArrowDown' || e.key === 'ArrowRight';
      const isPrev = (e.key === 'Tab' && e.shiftKey) || e.key === 'ArrowUp' || e.key === 'ArrowLeft';
      
      if (isNext || isPrev) {
        e.preventDefault();
        let nextIdx = 0;
        if (candidateIdx === -1) {
          nextIdx = isPrev ? inlineCandidates.length - 1 : 0;
        } else {
          nextIdx = isPrev ? (candidateIdx - 1 + inlineCandidates.length) % inlineCandidates.length : (candidateIdx + 1) % inlineCandidates.length;
        }
        setCandidateIdx(nextIdx);
        setInput(inlineCandidates[nextIdx].value);
        return;
      }
      
      if (e.key === 'Enter') {
        e.preventDefault();
        setInlineCandidates(null);
        setCandidateIdx(-1);
        return;
      } else if (e.key === 'Escape') {
        setInlineCandidates(null);
        setCandidateIdx(-1);
        e.preventDefault();
        return;
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const res = await getSuggestion(input, history, context, apiFuncs);
      
      if (res.suggestion && res.suggestion !== input) {
        setInput(res.suggestion);
        if (res.candidates && res.candidates.length > 1) {
           setInlineCandidates(res.candidates);
           setCandidateIdx(-1);
        }
      } else if (res.candidates && res.candidates.length > 1) {
        setInlineCandidates(res.candidates);
        setCandidateIdx(0);
        setInput(res.candidates[0].value);
      }
      return;
    }
    
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      onSubmit(e as any);
      return;
    }

    if (e.key !== 'Shift' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Meta' && e.key !== 'Tab' && !e.key.startsWith('Arrow')) {
      if (inlineCandidates) {
        setInlineCandidates(null);
        setCandidateIdx(-1);
      }
    }
    
    const suggestionRes = await getSuggestion(input, history, context, apiFuncs);
    const suggestion = suggestionRes.ghost || (suggestionRes.suggestion && suggestionRes.candidates ? "" : suggestionRes.suggestion);
    if (e.key === 'ArrowRight') {
      if (suggestion && inputRef.current && inputRef.current.selectionStart === input.length) {
        e.preventDefault();
        setInput(suggestion);
      }
    } else if (e.key === 'ArrowUp') {
      const target = e.currentTarget as HTMLTextAreaElement;
      const cursorPos = target.selectionStart || 0;
      const textBeforeCursor = target.value.slice(0, cursorPos);
      if (textBeforeCursor.indexOf('\n') === -1) {
        e.preventDefault();
        if (historyIdx < history.length - 1) {
          const idx = historyIdx + 1;
          setHistoryIdx(idx);
          setInput(history[history.length - 1 - idx]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      const target = e.currentTarget as HTMLTextAreaElement;
      const cursorPos = target.selectionStart || 0;
      const textAfterCursor = target.value.slice(cursorPos);
      if (textAfterCursor.indexOf('\n') === -1) {
        e.preventDefault();
        if (historyIdx > 0) {
          const idx = historyIdx - 1;
          setHistoryIdx(idx);
          setInput(history[history.length - 1 - idx]);
        } else if (historyIdx === 0) {
          setHistoryIdx(-1);
          setInput('');
        }
      }
    }
  };

  const saveEditedFile = () => {
    if (editingFilePath) {
      setVfs(prev => {
        const next = {
          ...prev,
          [editingFilePath]: { type: 'file' as const, content: editingFileContent }
        };
        vfsRef.current = next;
        return next;
      });
      setOutput(prev => [
        ...prev,
        { id: Math.random().toString(), content: <div className="text-yellow-400 font-sans">💾 File saved: {editingFilePath}</div> }
      ]);
      // If the currently edited file is being previewed in side pane, hot-reload it!
      if (editingFilePath === previewFileRef.current) {
        setPreviewContent(editingFileContent);
        setPreviewKey(prev => prev + 1);
      }
    }
  };

  const closeEditor = () => {
    setEditingFilePath(null);
    setEditingFileContent("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (!editingFilePath) return;
    const handleKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveEditedFile();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        closeEditor();
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [editingFilePath, editingFileContent]);

  const allThemeSettings = { ...themes, ...customThemes };
  const currentActiveTheme = allThemeSettings[theme] || themes['emerald'];

  if (editingFilePath) {
    return (
      <div className={"h-[100dvh] overflow-hidden font-mono flex flex-col p-2 md:p-4 w-full " + currentActiveTheme.canvasBg + " " + currentActiveTheme.termText} id="vfs-editor-root">
         <div className={"px-2 py-1 text-xs font-bold flex justify-between select-none rounded-t border " + (theme === 'light' ? 'bg-zinc-200 text-zinc-800 border-zinc-300' : 'bg-zinc-800 text-black border-zinc-700')} id="vfs-editor-hdr">
            <span>UW-NANO 8.2</span>
            <span>File: {editingFilePath}</span>
            <span>[Modified]</span>
         </div>
         
         <textarea
            id="vfs-editor-textarea"
            className={"flex-grow border-x border-b outline-none font-mono text-sm p-4 resize-none leading-relaxed focus:ring-0 " + currentActiveTheme.editorBg}
            value={editingFileContent}
            onChange={(e) => setEditingFileContent(e.target.value)}
            autoFocus
            spellCheck="false"
         />
         
         <div className={"p-3 text-xs select-none rounded-b flex flex-col sm:flex-row gap-3 justify-between items-center mt-2 border " + (theme === 'light' ? 'bg-zinc-100 text-zinc-750 border-zinc-200' : 'bg-zinc-950 border-zinc-800')} id="vfs-editor-footer">
            <div className={"grid grid-cols-2 gap-x-4 gap-y-1 " + (theme === 'light' ? 'text-zinc-600' : 'text-zinc-400')}>
               <div><span className={"px-1.5 py-0.5 rounded mr-1.5 font-bold " + (theme === 'light' ? 'bg-zinc-300 text-zinc-800' : 'bg-zinc-800 text-white')} >Ctrl+S</span> Save File</div>
               <div><span className={"px-1.5 py-0.5 rounded mr-1.5 font-bold " + (theme === 'light' ? 'bg-zinc-300 text-zinc-800' : 'bg-zinc-800 text-white')} >Ctrl+X</span> Exit Editor</div>
             </div>
             <div className="flex gap-2">
                <button 
                   id="vfs-editor-btn-save"
                   type="button"
                   onClick={saveEditedFile} 
                   className={"px-4 py-1.5 rounded text-xs font-semibold border cursor-pointer transition-all active:scale-95 " + (theme === 'light' ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200' : 'bg-cyan-900/80 hover:bg-cyan-800 text-cyan-200 border-cyan-700')}
                >
                   保存 (Save)
                </button>
                <button 
                   id="vfs-editor-btn-close"
                   type="button"
                   onClick={closeEditor} 
                   className={"px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all active:scale-95 " + (theme === 'light' ? 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800 border-zinc-300' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-transparent')}
                 >
                   閉じる (Exit)
                </button>
             </div>
          </div>
       </div>
     );
   }

   return (
     <div className={"h-[100dvh] overflow-hidden flex flex-col lg:flex-row focus-within:outline-none w-full " + currentActiveTheme.canvasBg + " " + currentActiveTheme.termText} id="shell-bbs-app-canvas">
       {/* WRAPPER FOR PANE SPLITS */}
       <div 
         ref={containerRef}
         className={`flex w-full flex-1 ${splitMode === 'v' ? (isPaneSwapped ? 'flex-row-reverse h-full' : 'flex-row h-full') : (isPaneSwapped ? 'flex-col-reverse h-full' : 'flex-col h-full')}`}
       >
         {/* LEFT PANEL: TERMINAL */}
         <div 
           className={"flex flex-col min-h-0 font-mono text-sm relative " + currentActiveTheme.termBg} 
           onClick={() => { if (window.getSelection()?.toString() === "") inputRef.current?.focus() }}
           id="terminal-container-pane"
           style={splitMode ? (splitMode === 'v' ? { width: `${splitSize}%`, flex: 'none' } : { height: `${splitSize}%`, flex: 'none' }) : { flex: '1 1 0%' }}
         >
          {/* Top bar with system metadata and toggles */}
          {!isIframe && (
            <div className={"px-4 py-2 flex justify-between items-center select-none shrink-0 border-b " + currentActiveTheme.topbarBg} id="terminal-topbar">
              <div className="flex items-center gap-2">
                <span className={"font-bold font-mono " + (theme === 'emerald' || theme === 'matrix' ? 'text-emerald-500' : theme === 'amber' ? 'text-[#ff9800]' : theme === 'dracula' ? 'text-[#ff79c6]' : theme === 'cyberpunk' ? 'text-[#ff0055]' : theme === 'classic' ? 'text-zinc-100' : 'text-rose-600')}>$_</span>
                <span className={"text-xs font-semibold uppercase tracking-wider font-sans ml-1 " + (theme === 'light' ? 'text-zinc-500' : 'text-zinc-400')}>SHELL BBS TERM V3</span>
              </div>
              
              <div className="flex items-center gap-3">
                {previewFile && (
                  <button 
                    type="button"
                    onClick={() => setShowPreviewPane(prev => !prev)}
                    className={"flex items-center gap-1.5 px-3 py-1 border rounded text-xs font-semibold cursor-pointer transition-all hover:scale-105 " + (theme === 'light' ? 'bg-zinc-200 border-zinc-300 text-zinc-800 hover:bg-zinc-300' : 'bg-cyan-950/60 border-cyan-800 text-cyan-400 hover:bg-cyan-900')}
                    id="toggle-preview-pnl-btn"
                  >
                    <span>🖥️</span> {showPreviewPane ? (lang === 'ja' ? 'モニター閉じる' : 'Hide Monitor') : (lang === 'ja' ? 'モニター開く' : 'Show Monitor')}
                  </button>
                )}

                <span className="text-xs text-zinc-500">2026-05-29 UTC</span>
              </div>
            </div>
          )}

          <div className="flex-1 p-2 md:p-4 pb-0 flex flex-col gap-1 overflow-y-auto w-full custom-scrollbar break-words" id="terminal-screen-output">
            {output.map((line) => (
              <div key={line.id} className={isValidElement(line.content) ? "shrink-0" : "min-h-[1.5rem] shrink-0 whitespace-pre-wrap font-mono"}>{renderCommandTextWithLinks(line.content)}</div>
            ))}
            <div ref={bottomRef} className="pb-4 shrink-0" />
          </div>

           {pendingAgentCmd && (
             <div className="border border-amber-500/30 bg-amber-500/10 rounded-xl p-3 md:p-4 mx-2 md:mx-4 mb-2 flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between select-none shadow-[0_4px_20px_rgba(245,158,11,0.08)]">
               <div className="flex gap-3 items-start flex-1 min-w-0 w-full">
                 <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0 select-none">
                   <span className="text-lg">⚡️</span>
                 </div>
                 <div className="min-w-0 flex-1">
                   <div className="text-xs md:text-sm font-bold text-amber-400">
                     {lang === 'ja' ? "⚠️ AIエージェントがコマンドの実行を求めています（許可制）" : "⚠️ AI Agent requires execution permission"}
                    {lang === 'ja' ? "⚠️ AIエージェントがコマンドの実行を求めています（許可制）" : "⚠️ AI Agent requires execution permission"}
                  </div>
                  <div className="mt-1.5 font-mono text-xs text-zinc-200 bg-zinc-950 px-2.5 py-1.5 rounded border border-zinc-850 break-all select-all shadow-inner">
                    {pendingAgentCmd}
                  </div>
                  <div className="mt-1.5 text-[10px] text-zinc-500 font-sans tracking-wide leading-relaxed">
                    {lang === 'ja' 
                      ? "このコマンドを許可して進めますか？ ( y / YES )、または却下しますか？ ( n / NO )" 
                      : "Do you want to allow this command to run? ( y / n )"}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end mt-2 md:mt-0 font-sans">
                <button
                  type="button"
                  onClick={() => onApproveAgentAction(pendingAgentCmd, pendingAgentHistory || [])}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-extrabold text-xs rounded-lg transition-all cursor-pointer shadow-md shadow-amber-500/10"
                >
                  {lang === 'ja' ? "許可する (y)" : "Approve (y)"}
                </button>
                <button
                  type="button"
                  onClick={() => onDenyAgentAction(pendingAgentCmd, pendingAgentHistory || [])}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-bold text-xs rounded-lg transition-all cursor-pointer border border-zinc-700"
                >
                  {lang === 'ja' ? "却下する (n)" : "Deny (n)"}
                </button>
              </div>
            </div>
          )}
         
         <form onSubmit={onSubmit} className={"flex items-start gap-2 shrink-0 p-2 md:p-4 pt-1 pb-4 text-sm " + currentActiveTheme.termBg} id="terminal-cmd-form">
            <span className="shrink-0 font-bold mt-0.5">
              {isAgentMode ? (
                <>
                  <span className="text-[#a855f7]">[AI-Agent] </span>
                  <span className={currentActiveTheme.promptUser}>{username}</span>
                  <span className="opacity-70">:$</span>
                </>
              ) : (
                <>
                  <span className={currentActiveTheme.promptUser}>{username}</span>
                  <span className="opacity-70">@</span>
                  <span className={currentActiveTheme.promptHost}>{hostname}</span>
                  <span className="opacity-70">:</span>
                  <span className={currentActiveTheme.promptCwd}>{context ? `bbs:/${context}` : cwd === '/' ? "~" : cwd}</span>
                  <span className="opacity-70">$</span>
                </>
              )}
            </span>
            <div className="relative flex-1 flex flex-col justify-start">
              {isAgentProcessing && (
                 <div className="absolute inset-0 flex items-center gap-2 text-purple-400 font-bold pointer-events-none z-20">
                   <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></span>
                   {langRef.current === 'ja' ? '🤖 AIが思考・処理中...' : '🤖 AI is processing...'}
                 </div>
              )}
              <div 
                className={"absolute inset-0 pointer-events-none whitespace-pre font-mono flex items-start overflow-hidden " + (theme === 'light' ? 'text-zinc-400' : 'text-zinc-600') + (isAgentProcessing ? " opacity-0" : "")} 
                aria-hidden="true"
                ref={ghostRef}
                style={{ paddingTop: '2.5px' }}
              >
                <span className="opacity-0">{input}</span>
                <GhostSuggestion input={input} history={history} context={context} apiFuncs={apiFuncs} />
              </div>
              
              {inlineCandidates && inlineCandidates.length > 0 && (
                <div className="absolute left-0 bottom-full mb-2 bg-[#0e0e11] border border-zinc-800 rounded shadow-2xl z-50 p-1">
                  <div className="max-h-40 overflow-y-auto custom-scrollbar flex flex-wrap gap-1 p-1 items-center max-w-[80vw]">
                    {inlineCandidates.map((c, i) => (
                      <div 
                        key={i} 
                        className={`text-xs px-2 py-1 rounded cursor-pointer whitespace-nowrap ${i === candidateIdx ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/50' : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'}`}
                        onClick={() => {
                          setInput(c.value);
                          setInlineCandidates(null);
                          setCandidateIdx(-1);
                          inputRef.current?.focus();
                        }}
                      >
                        {c.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <textarea
                 ref={inputRef}
                 value={isAgentProcessing ? "" : input}
                 rows={Math.min(6, input.split('\n').length || 1)}
                 onChange={(e) => {
                   const val = e.target.value;
                   setInput(val);
                   setCandidateIdx(-1);
                   getSuggestion(val, history, context, apiFuncs).then(res => {
                     if (res.candidates && res.candidates.length > 1) {
                         setInlineCandidates(res.candidates);
                     } else {
                         setInlineCandidates(null);
                     }
                   });
                 }}
                 onKeyDown={onKeyDown}
                 onScroll={(e) => { if (ghostRef.current) ghostRef.current.scrollLeft = e.currentTarget.scrollLeft; }}
                 className={"w-full bg-transparent border-none outline-none font-mono relative z-10 resize-none leading-relaxed " + currentActiveTheme.caret + " " + (theme === 'light' ? 'text-zinc-800' : 'text-white') + (isAgentProcessing ? " opacity-0 pointer-events-none" : "")}
                 autoFocus
                 autoComplete="off"
                 spellCheck="false"
                 id="terminal-input-el"
                 disabled={isAgentProcessing}
                 style={{ height: 'auto', minHeight: '1.5rem', maxHeight: '12rem', padding: '0px' }}
              />
            </div>
         </form>
      </div>

       {/* SPLIT DIVIDER */}
       {splitMode && (
          splitMode === 'v' ? (
            <div 
              className={`w-1.5 cursor-col-resize hover:w-2 hover:bg-emerald-500/80 active:bg-emerald-500 transition-all select-none self-stretch z-35 relative shrink-0 ${currentActiveTheme.termText === 'text-white' ? 'bg-zinc-800' : 'bg-zinc-300'}`}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
              title={lang === 'ja' ? 'ドラッグしてサイズ調整' : 'Drag to resize'}
            >
              <div className="absolute inset-y-0 left-1/2 -ml-[1px] w-[2px] opacity-15 bg-white" />
              
              {/* Central Swap Handle */}
              <div 
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border bg-zinc-950 border-zinc-700 hover:border-emerald-500 active:scale-95 flex items-center justify-center cursor-grab active:cursor-grabbing text-zinc-400 hover:text-emerald-400 shadow-xl z-40 transition-all duration-200 select-none`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingSwap(true);
                  const clientX = 'touches' in e ? (e as any).touches[0].clientX : (e as any).clientX;
                  const clientY = 'touches' in e ? (e as any).touches[0].clientY : (e as any).clientY;
                  dragSwapStartRef.current = { x: clientX, y: clientY };
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setIsDraggingSwap(true);
                  const clientX = e.touches[0].clientX;
                  const clientY = e.touches[0].clientY;
                  dragSwapStartRef.current = { x: clientX, y: clientY };
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaneSwapped(prev => !prev);
                }}
                title={lang === 'ja' ? 'ドラッグ・クリックで位置を入れ替え' : 'Drag or click to swap positions'}
              >
                <span className="text-sm font-bold font-sans">⇄</span>
              </div>
            </div>
          ) : (
            <div 
              className={`h-1.5 cursor-row-resize hover:h-2 hover:bg-emerald-500/80 active:bg-emerald-500 transition-all select-none w-full z-35 relative shrink-0 ${currentActiveTheme.termText === 'text-white' ? 'bg-zinc-800' : 'bg-zinc-300'}`}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
              title={lang === 'ja' ? 'ドラッグしてサイズ調整' : 'Drag to resize'}
            >
              <div className="absolute inset-x-0 top-1/2 -mt-[1px] h-[2px] opacity-15 bg-white" />

              {/* Central Swap Handle */}
              <div 
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border bg-zinc-950 border-zinc-700 hover:border-emerald-500 active:scale-95 flex items-center justify-center cursor-grab active:cursor-grabbing text-zinc-400 hover:text-emerald-400 shadow-xl z-40 transition-all duration-200 select-none`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingSwap(true);
                  const clientX = 'touches' in e ? (e as any).touches[0].clientX : (e as any).clientX;
                  const clientY = 'touches' in e ? (e as any).touches[0].clientY : (e as any).clientY;
                  dragSwapStartRef.current = { x: clientX, y: clientY };
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setIsDraggingSwap(true);
                  const clientX = e.touches[0].clientX;
                  const clientY = e.touches[0].clientY;
                  dragSwapStartRef.current = { x: clientX, y: clientY };
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaneSwapped(prev => !prev);
                }}
                title={lang === 'ja' ? 'ドラッグ・クリックで位置を入れ替え' : 'Drag or click to swap positions'}
              >
                <span className="text-sm font-bold font-sans">⇅</span>
              </div>
            </div>
          )
        )}

        {splitMode && (
         <div 
           className="relative min-h-0 bg-transparent flex flex-col"
           style={splitMode === 'v' ? { width: `${100 - splitSize}%`, flex: 'none' } : { height: `${100 - splitSize}%`, flex: 'none' }}
         >
           {isDragging && (
             <div 
               className="absolute inset-0 z-50 bg-black/10 pointer-events-auto" 
               style={{ cursor: splitMode === 'v' ? 'col-resize' : 'row-resize' }}
             />
           )}
           <iframe src={window.location.pathname + "?split=true"} className="w-full h-full border-none outline-none bg-transparent" title="Split pane" />
         </div>
       )}
      </div>

      {/* RIGHT PANEL: WEB SANDBOX PREVIEW MONITOR */}
      {showPreviewPane && previewFile && (
        <div 
          className="fixed inset-0 z-50 bg-[#070708] flex flex-col w-full h-[100dvh] overflow-hidden"
          id="sandbox-device-monitor-panel"
        >
          {/* Device Mock Screen - Expanded to Full Wide View */}
          <div className="flex-grow bg-black flex items-center justify-center overflow-hidden min-h-0" id="monitor-canvas-area">
            <div 
              className="w-full h-full flex flex-col overflow-hidden"
              id="virtual-device-wrapper"
            >
              {/* Sandboxed Output App */}
              <div className="flex-1 bg-black relative min-h-0" id="vbrowser-app-viewport">
                <iframe
                  key={`${previewFile}-${previewKey}`}
                  srcDoc={(() => {
                    if (!previewContent) return "";
                    const baseTag = `<base href="${window.location.origin}/">`;
                    if (previewContent.includes("<head>")) {
                      return previewContent.replace("<head>", `<head>\n  ${baseTag}`);
                    }
                    return `${baseTag}\n${previewContent}`;
                  })()}
                  sandbox="allow-scripts allow-modals allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  referrerPolicy="no-referrer"
                  className="w-full h-full border-none bg-black overflow-auto"
                  id="preview-sandbox-iframe"
                  title="Virtual VFS App Runner"
                />
              </div>
            </div>
          </div>
          
          {/* Status footer for monitor pane with unified action triggers */}
          <div className="bg-zinc-950 px-4 py-2.5 text-[11px] text-zinc-400 flex justify-between items-center border-t border-zinc-900 font-sans tracking-wide shrink-0 select-none animate-fade-in">
            <div className="flex items-center gap-4">
              <span>FILE: <strong className="text-cyan-400 font-mono font-bold">{previewFile}</strong></span>
              <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-500 font-semibold font-mono animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                LIVE RELOAD ACTIVE
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewKey(prev => prev + 1)}
                className="px-2.5 py-1 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded transition-all cursor-pointer font-sans font-semibold flex items-center gap-1"
                title={lang === "ja" ? "ページ更新" : "Reload Sandbox"}
              >
                🔄 {lang === "ja" ? "更新" : "Reload"}
              </button>
              <button
                type="button"
                onClick={() => apiFuncs.closePreview()}
                className="ml-2 px-3 py-1 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800 rounded font-sans text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title={lang === "ja" ? "プレビューを閉じる" : "Close Preview"}
              >
                <span>✕</span> {lang === "ja" ? "閉じる" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showThemeEditor && (
        <ThemeEditorModal 
          isJa={langRef.current === 'ja'}
          onClose={() => setShowThemeEditor(false)}
          onSave={(key, data) => {
             apiFuncs.addCustomTheme(key, data);
             setShowThemeEditor(false);
             setOutput(prev => [...prev, {
                id: Math.random().toString(),
                content: <div className="text-emerald-400 font-bold mt-2 font-mono">
                  ✨ Custom theme '{key}' created and applied via 'theme {key}'.
                </div>
             }]);
          }}
        />
      )}

      {showAISettings && (
        <AISettingsModal 
          isJa={langRef.current === 'ja'}
          onClose={() => setShowAISettings(false)}
          apiFuncs={apiFuncs}
        />
      )}
    </div>
  );
}
