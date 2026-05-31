import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const fixHelpCommand = `      const vfs = apiFuncs.getVFS ? apiFuncs.getVFS() : {};
      
      const loadWiki = (lang: string, defaults: Record<string, HelpInfo>) => {
        const result: Record<string, HelpInfo> = { ...defaults };
        const prefix = "/sys/wiki/" + lang + "/";
        for (const [path, entry] of Object.entries(vfs)) {
          if (path.startsWith(prefix) && entry.type === 'file') {
            const cmdName = path.substring(prefix.length).replace('.json', '');
            try {
              const customInfo = JSON.parse(entry.content);
              result[cmdName] = { ...result[cmdName], ...customInfo };
            } catch (e) {}
          }
        }
        return result;
      };

      const helpsJa = loadWiki('ja', defaultHelpsJa);
      const helpsEn = loadWiki('en', defaultHelpsEn);
      
      const helpsObj = isJa ? helpsJa : helpsEn;`;

code = code.replace("const helpsObj = isJa ? helpsJa : helpsEn;", fixHelpCommand);

// Also need to fix the `unknown` type issue by adding type annotation to `Object.entries(helpsObj)`
// In src/App.tsx: Object.entries(helpsObj).filter(([k,v]) => v.cat === category.id)
code = code.replace(
  "Object.entries(helpsObj).filter(([k,v]) => v.cat === category.id)",
  "Object.entries(helpsObj).filter(([k,v]) => (v as HelpInfo).cat === category.id)"
);
code = code.replace(
  "const catCmds = Object.entries(helpsObj).filter(([k,v]) => v.cat === category.id);",
  "const catCmds = Object.entries(helpsObj).filter(([k,v]) => (v as HelpInfo).cat === category.id);"
);

// We also need to add `wiki` command case.
const wikiCommandCode = `
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
          newVfs[\`/sys/wiki/ja/\${key}.json\`] = { type: 'file', content: JSON.stringify(val, null, 2) };
        }
        for (const [key, val] of Object.entries(defaultHelpsEn)) {
          newVfs[\`/sys/wiki/en/\${key}.json\`] = { type: 'file', content: JSON.stringify(val, null, 2) };
        }
        apiFuncs.setVFS(newVfs);
        return [isJa ? "✅ Wikiデータを初期化しました。（/sys/wiki/ 以下に保存しました）" : "✅ Wiki data initialized in /sys/wiki/"];
      }
      
      if (sub === 'edit') {
        const cmdName = args[1];
        if (!cmdName) return [isJa ? "❌ コマンド名を指定してください: wiki edit <cmd>" : "❌ Specify command: wiki edit <cmd>"];
        
        const lang = apiFuncs.getLang() === 'ja' ? 'ja' : 'en';
        const fp = \`/sys/wiki/\${lang}/\${cmdName}.json\`;
        
        // Ensure directories exist
        const newVfs = { ...vfs };
        if (!newVfs['/sys/wiki']) newVfs['/sys/wiki'] = { type: 'dir' };
        if (!newVfs[\`/sys/wiki/\${lang}\`]) newVfs[\`/sys/wiki/\${lang}\`] = { type: 'dir' };
        
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
        const fp = \`/sys/wiki/\${lang}/\${cmdName}.json\`;
        if (vfs[fp]) {
           const newVfs = { ...vfs };
           delete newVfs[fp];
           apiFuncs.setVFS(newVfs);
           return [isJa ? \`✅ /sys/wiki/\${lang}/\${cmdName}.json を削除しました\` : \`✅ Deleted \${cmdName}.json\`];
        }
        return [isJa ? \`⚠️ \${cmdName} の設定ファイルは見つかりませんでした\` : \`⚠️ Not found: \${cmdName}\`];
      }
      
      return [isJa ? \`⚠️ 不明なサブコマンド: \${sub}\` : \`⚠️ Unknown sub command: \${sub}\`];
    }
  `;

// Add wiki to the switch cases
code = code.replace("case 'help': {", wikiCommandCode + "\n    case 'help': {");

fs.writeFileSync('src/App.tsx', code);
console.log("Done patching App.tsx");
