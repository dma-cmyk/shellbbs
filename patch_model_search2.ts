import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const newDropdown = `<div className="relative">
                   <div className="flex gap-2">
                     <input 
                       type="text" 
                       value={formData.OPENAI_MODEL} 
                       onChange={e => handleChange('OPENAI_MODEL', e.target.value)} 
                       onFocus={() => { setShowDropdown(true); setSearchModel(''); }}
                       onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
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
                 </div>`;

const datalistRegex = /<div className="relative">\s*<input[^>]+list="models-list"[\s\S]*?<\/datalist>\s*<\/div>/;

if(datalistRegex.test(code)) {
    code = code.replace(datalistRegex, newDropdown);
    console.log('Patched datalist!');
} else {
    console.log('Regex did not match! Something is wrong.');
}

// Ensure overflows in the form container don't clip the dropdown
code = code.replace(
  'overflow-hidden',
  'overflow-visible'
);

// We need to check if overflow-hidden is inside AISettingsModal.
// actually it's easier to just find the AISettingsModal and replace its "overflow-hidden" with "overflow-visible"
// wait, the regex above will replace the first 'overflow-hidden'. That's risky.

fs.writeFileSync('src/App.tsx', code);
