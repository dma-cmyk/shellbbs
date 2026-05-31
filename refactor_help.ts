import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const helpRegex = /(type HelpInfo = \{[\s\S]*?\n      \};\n\n\s*const helpsJa: Record<string, HelpInfo> = \{[\s\S]*?\};\n\n\s*const helpsEn: Record<string, HelpInfo> = \{[\s\S]*?\};\n)/;

const match = code.match(helpRegex);
if (!match) {
  console.log("Could not match help block");
  process.exit(1);
}

const originalHelpBlock = match[1];

let definitions = originalHelpBlock
  .replace('const helpsJa', 'export const defaultHelpsJa')
  .replace('const helpsEn', 'export const defaultHelpsEn');
// make type exported too
definitions = definitions.replace('type HelpInfo', 'export type HelpInfo');

// Remove from case 'help'
code = code.replace(originalHelpBlock, '');

// Insert at top level before `executeCommand`
const injectIndex = code.indexOf('async function executeCommand');
code = code.substring(0, injectIndex) + definitions + '\n\n' + code.substring(injectIndex);

fs.writeFileSync('src/App.tsx', code);
console.log("Moved helps to top level.");
