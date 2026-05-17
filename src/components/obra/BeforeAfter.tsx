import { useState } from "react";

export default function BeforeAfter({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border select-none">
      <img src={after} className="absolute inset-0 w-full h-full object-cover" alt="depois" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={before} className="absolute inset-0 w-full h-full object-cover" style={{ width: `${100/(pos/100)}%`, maxWidth: 'none' }} alt="antes" />
      </div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-xs font-bold">⇆</div>
      </div>
      <input type="range" min={0} max={100} value={pos} onChange={e=>setPos(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"/>
      <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">Antes</span>
      <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">Depois</span>
    </div>
  );
}