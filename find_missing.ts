import fs from 'fs';
const code = fs.readFileSync('src/App.tsx', 'utf-8');
const helpsJaMatch = code.match(/const helpsJa: Record<string, HelpInfo> = \{([\s\S]*?)const helpsEn/);
if (helpsJaMatch) {
  const dictLines = helpsJaMatch[1];
  const entries = dictLines.split(/\n/);
  for (const line of entries) {
    if (line.includes('cat:') && !line.includes('examples:')) {
      console.log(line.trim());
    }
  }
}
