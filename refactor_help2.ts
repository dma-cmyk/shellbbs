import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const helpRegex = /([ \t]*type HelpInfo = [\s\S]*?const helpsEn: Record<string, HelpInfo> = \{[\s\S]*?\};\n)/;

const match = code.match(helpRegex);
if (!match) {
  console.log("Could not match help block");
  process.exit(1);
}

const originalHelpBlock = match[1];

let definitions = originalHelpBlock
  .replace('const helpsJa: Record', 'export const defaultHelpsJa: Record')
  .replace('const helpsEn: Record', 'export const defaultHelpsEn: Record')
  .replace(/^[ \t]*/gm, ''); 

// Export type
definitions = definitions.replace('type HelpInfo =', 'export type HelpInfo =');

// Remove from case 'help'
code = code.replace(originalHelpBlock, '');

// Insert at top level before `executeCommand`
const injectIndex = code.indexOf('async function executeCommand');
code = code.substring(0, injectIndex) + definitions + '\n\n' + code.substring(injectIndex);

fs.writeFileSync('src/App.tsx', code);
console.log("Moved helps to top level.");
