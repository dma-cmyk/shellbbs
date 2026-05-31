import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');
const startMatch = "    case 'help': {";
const endMatch = "    case 'watch':";
const startIndex = code.indexOf(startMatch);
const endIndex = code.indexOf(endMatch, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find boundaries.");
  process.exit(1);
}

const replacement = `    case 'help': {
      const isJa = apiFuncs.getLang() === 'ja';
      const cmdArg = args[0] ? args[0].trim().toLowerCase() : null;

      const commandHelpsJa: Record<string, { desc: string, usage: string }> = {
        threads: { desc: "全スレッドの一覧を表示します。", usage: "threads [-r]" },
        mkthread: { desc: "新しくスレッドを作成します。", usage: "mkthread <title>" },
        cd: { desc: "仮想ディレクトリ、または掲示板スレッドに入室します。", usage: "cd <path_or_thread_id>" },
        cat: { desc: "ファイル内容を表示、またはスレッドの全返信を閲覧します。", usage: "cat <path_or_id>" },
        read: { desc: "スレッドの全返信を閲覧します。", usage: "read <id>" },
        su: { desc: "ユーザー名を変更・設定します(パスワードは 名前#パスワード)。", usage: "su <username>" },
        whoami: { desc: "現在のユーザー名を表示します。", usage: "whoami" },
        post: { desc: "指定したスレッドに新規返信します。", usage: "post [id] <msg>" },
        pwd: { desc: "カレントディレクトリを表示します。", usage: "pwd" },
        ls: { desc: "ファイル/フォルダ一覧、またはスレッドの投稿一覧を表示します。", usage: "ls" },
        mkdir: { desc: "ディレクトリを作成します。", usage: "mkdir <folder>" },
        rm: { desc: "ファイル/フォルダを削除します。", usage: "rm [-r] <path>" },
        mv: { desc: "ファイル/フォルダを移動します。", usage: "mv <src> <dst>" },
        cp: { desc: "ファイルをコピーします。", usage: "cp <src> <dst>" },
        nano: { desc: "テキストエディタを起動します。", usage: "nano <file>" },
        edit: { desc: "テキストエディタを起動します。", usage: "edit <file>" },
        write: { desc: "ファイルにテキストを書き込みます。", usage: "write <file> <text>" },
        touch: { desc: "空のファイルを作成します。", usage: "touch <file>" },
        web: { desc: "HTMLを仮想モニターで実行します。", usage: "web <file> | web off" },
        preview: { desc: "HTMLを仮想モニターで実行します。", usage: "preview <file> | preview off" },
        sh: { desc: "シェルスクリプトを実行します。", usage: "sh <file.sh>" },
        ai: { desc: "AI自動操作、対話モード(chat)、または設定(config)を行います。", usage: "ai [chat|config|<prompt>]" },
        export: { desc: "環境変数を設定します。", usage: "export KEY=value" },
        watch: { desc: "コマンドを定期実行します。", usage: "watch <sec> <cmd>" },
        alias: { desc: "コマンドのエイリアスを定義します。", usage: "alias <name>=\\\\"<cmd>\\\\"" }
      };

      const commandHelpsEn: Record<string, { desc: string, usage: string }> = {
        threads: { desc: "Lists all threads.", usage: "threads [-r]" },
        mkthread: { desc: "Creates a new thread.", usage: "mkthread <title>" },
        cd: { desc: "Changes directory or enters a thread.", usage: "cd <path_or_thread_id>" },
        cat: { desc: "Prints file content or thread posts.", usage: "cat <path_or_id>" },
        read: { desc: "Prints thread posts.", usage: "read <id>" },
        su: { desc: "Changes user alias (tripcode is name#pass).", usage: "su <username>" },
        whoami: { desc: "Prints active user handle.", usage: "whoami" },
        post: { desc: "Posts a reply to a thread.", usage: "post [id] <msg>" },
        pwd: { desc: "Prints current working directory.", usage: "pwd" },
        ls: { desc: "Lists files/folders or thread posts.", usage: "ls" },
        mkdir: { desc: "Creates a directory.", usage: "mkdir <folder>" },
        rm: { desc: "Removes file/folder.", usage: "rm [-r] <path>" },
        mv: { desc: "Moves file/folder.", usage: "mv <src> <dst>" },
        cp: { desc: "Copies file.", usage: "cp <src> <dst>" },
        nano: { desc: "Opens text editor.", usage: "nano <file>" },
        edit: { desc: "Opens text editor.", usage: "edit <file>" },
        write: { desc: "Writes text to a file.", usage: "write <file> <text>" },
        touch: { desc: "Creates empty file.", usage: "touch <file>" },
        web: { desc: "Mounts HTML to virtual monitor.", usage: "web <file> | web off" },
        preview: { desc: "Mounts HTML to virtual monitor.", usage: "preview <file> | preview off" },
        sh: { desc: "Executes shell script.", usage: "sh <file.sh>" },
        ai: { desc: "AI automation, interactive chat, or config.", usage: "ai [chat|config|<prompt>]" },
        export: { desc: "Sets environment variable.", usage: "export KEY=value" },
        watch: { desc: "Executes command repeatedly.", usage: "watch <sec> <cmd>" },
        alias: { desc: "Defines a command alias.", usage: "alias <name>=\\\\"<cmd>\\\\"" }
      };

      const helpsObj = isJa ? commandHelpsJa : commandHelpsEn;

      if (cmdArg) {
        const cmdInfo = helpsObj[cmdArg];
        if (cmdInfo) {
          return [
            \`========== \${cmdArg.toUpperCase()} ==========\`,
            \`Desc: \${cmdInfo.desc}\`,
            \`Usage: \${cmdInfo.usage}\`,
            \`\`,
            isJa ? \`ヒント: help とだけ打つと全コマンドの一覧を表示します\` : \`Tip: Run bare 'help' to show all instructions\`
          ];
        } else {
          return [isJa ? \`⚠️ コマンド '\${cmdArg}' のヘルプは見つかりませんでした\` : \`⚠️ Reference for '\${cmdArg}' not found\`];
        }
      }

      const lines: string[] = [];
      lines.push(\`========== SHELL BBS AI WIKI MANUAL ==========\`);
      lines.push(isJa ? \`このターミナルはAIが自律的にタスクを遂行するための仕様を備えています。\`: \`This terminal allows AI to autonomously compose commands.\`);
      lines.push(\`Supported: pipes (|), redirects (> / >>), sequential executions (;), shell variables ($VAR), and aliases.\`);
      lines.push(\`\`);
      lines.push(isJa ? \`[コマンド一覧 / Command Index]\` : \`[Command Index]\`);
      
      for (const [key, info] of Object.entries(helpsObj)) {
        lines.push(\`* \${key}: \${info.usage}\`);
        lines.push(\`  - \${info.desc}\`);
      }
      lines.push(\`\`);
      lines.push(isJa ? \`💡 AIへ: これらのコマンドを適切に組み合わせてユーザーの要求を達成してください。\`: \`💡 To AI: Combine these commands to autonomously solve the user's tasks.\`);
      return lines;
    }

    case 'watch':`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex + "    case 'watch':".length);
fs.writeFileSync('src/App.tsx', code);
console.log("SUCCESS!");
