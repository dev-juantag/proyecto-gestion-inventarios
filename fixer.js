const fs = require("fs");
let c = fs.readFileSync("src/app/dashboard/page.tsx", "utf8");

c = c.replace("onClick={() => setSelectedCanal(canal)}", "onClick={() => { setSelectedCanal(canal); setSelectedUbiId(ubi.id); }}");

c = c.replace(
  "${isSelected ? 'border-primary ring-2 ring-primary/30 z-10' : ''}", 
  "${selectedUbiId === ubi.id ? '!ring-4 !ring-sky-400 !border-sky-400 scale-[1.12] z-30 shadow-[0_0_20px_rgba(56,189,248,0.4)]' : isSelected ? 'border-primary ring-2 ring-primary/30 z-10' : ''}"
);

c = c.replace(
  "${ubi.vacio ? 'border-slate-200 bg-slate-50 opacity-60 hover:border-slate-300 hover:opacity-100' : 'border-slate-800 bg-slate-800 text-white shadow-sm hover:bg-slate-700 scale-[1.02]'}", 
  "${ubi.vacio ? (selectedUbiId === ubi.id ? '!bg-sky-50 opacity-100 !border-sky-400 text-sky-800' : 'border-slate-200 bg-slate-50 opacity-60 hover:border-slate-300 hover:opacity-100') : (selectedUbiId === ubi.id ? '!bg-sky-500 !border-sky-400 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]' : 'border-slate-800 bg-slate-800 text-white shadow-sm hover:bg-slate-700 scale-[1.02]')}"
);

c = c.replace(
  "${ubi.vacio ? 'text-slate-400' : 'text-white'}", 
  "${ubi.vacio ? (selectedUbiId === ubi.id ? 'text-sky-600' : 'text-slate-400') : 'text-white'}"
);

c = c.replace(
  "span className=\"text-[8px] md:text-[9px] font-bold text-white/80 uppercase text-center truncate w-full px-1\"", 
  "span className={`text-[8px] md:text-[9px] font-bold uppercase text-center truncate w-full px-1 ${selectedUbiId === ubi.id ? 'text-sky-100' : 'text-white/80'}`}"
);

fs.writeFileSync("src/app/dashboard/page.tsx", c);
console.log("Done");
