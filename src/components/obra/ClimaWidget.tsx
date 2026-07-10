import { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Wind, RefreshCw } from "lucide-react";

export default function ClimaWidget({ lat, lon }: { lat?: number | null; lon?: number | null }) {
  const [w, setW] = useState<any>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  useEffect(() => {
    const la = lat ?? -23.55, lo = lon ?? -46.63;
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&daily=precipitation_sum,weather_code&timezone=auto&forecast_days=3`);
        const j = await r.json();
        if (!cancelled) { setW(j); setUpdatedAt(new Date()); }
      } catch {}
    }
    load();
    // Atualiza a cada 30 minutos (evita hits desnecessários)
    const id = setInterval(load, 30 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, [lat, lon]);
  if (!w?.current) return <div className="text-sm text-muted-foreground">Carregando clima...</div>;
  const code = w.current.weather_code;
  const Icon = code >= 51 ? CloudRain : code >= 3 ? Cloud : Sun;
  const chuva = (w.daily?.precipitation_sum ?? []).some((p:number)=>p>5);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <Icon className="h-10 w-10 text-primary"/>
        <div>
          <p className="text-2xl font-bold">{Math.round(w.current.temperature_2m)}°C</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Wind className="h-3 w-3"/>{Math.round(w.current.wind_speed_10m)} km/h</p>
        </div>
      </div>
      {chuva && <p className="text-xs text-amber-600 font-medium">⚠️ Chuva prevista nos próximos dias — pode impactar a obra</p>}
      {updatedAt && (
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <RefreshCw className="h-2.5 w-2.5"/>Atualizado às {updatedAt.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})} — atualiza automaticamente
        </p>
      )}
    </div>
  );
}