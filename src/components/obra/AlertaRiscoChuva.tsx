import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CloudRain, AlertTriangle } from "lucide-react";

const ETAPAS_SENSIVEIS_CHUVA = ["fundacao", "estrutura", "alvenaria", "cobertura"];

export default function AlertaRiscoChuva({
  lat, lon, etapas,
}: { lat?: number | null; lon?: number | null; etapas: any[] }) {
  const [previsao, setPrevisao] = useState<any>(null);

  useEffect(() => {
    const la = lat ?? -23.55, lo = lon ?? -46.63;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&daily=precipitation_sum&timezone=auto&forecast_days=7`)
      .then(r => r.json()).then(setPrevisao).catch(() => {});
  }, [lat, lon]);

  const chuvaProxima: { data: string; mm: number }[] = (previsao?.daily?.time ?? [])
    .map((d: string, i: number) => ({ data: d, mm: previsao.daily.precipitation_sum[i] ?? 0 }))
    .filter((x: any) => x.mm >= 5);

  if (chuvaProxima.length === 0) return null;

  const janelaInicio = chuvaProxima[0].data;
  const janelaFim = chuvaProxima[chuvaProxima.length - 1].data;

  // etapas sensíveis não-concluídas com data prevista dentro da janela de chuva
  const emRisco = etapas.filter((e: any) => {
    if (!ETAPAS_SENSIVEIS_CHUVA.includes(e.etapa)) return false;
    if (e.status === "concluido" || e.status === "aprovado") return false;
    if (!e.data_fim_prevista) return e.status === "em_andamento";
    return e.data_fim_prevista >= janelaInicio && e.data_fim_prevista <= janelaFim;
  });

  if (emRisco.length === 0) return null;

  const chuvaTotal = chuvaProxima.reduce((a, b) => a + b.mm, 0).toFixed(0);
  const etapasNome = emRisco.map((e: any) => e.etapa).join(", ");

  return (
    <Card className="p-4 border-amber-500/40 bg-amber-500/5">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
          <CloudRain className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h4 className="font-bold text-amber-900 dark:text-amber-200">Risco de atraso por chuva</h4>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-100/90">
            Previsão de <strong>{chuvaTotal} mm</strong> nos próximos dias ({chuvaProxima.length} dia{chuvaProxima.length > 1 ? "s" : ""} com chuva significativa)
            e as etapas <strong className="capitalize">{etapasNome}</strong> — sensíveis a chuva — estão em andamento ou previstas para essa janela.
            Considere replanejar concretagens, cobertura e atividades externas.
          </p>
        </div>
      </div>
    </Card>
  );
}