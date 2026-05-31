import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(
  '                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}\n',
  ''
);

code = code.replace(
  '                  <div className="relative">\n                    <div className="flex gap-2">',
  '                  <div className="relative" ref={dropdownRef}>\n                    <div className="flex gap-2">'
);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed onBlur!');
