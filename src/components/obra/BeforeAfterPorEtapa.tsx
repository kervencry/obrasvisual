import { useMemo, useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import { STAGES, type ObraStage } from "@/components/obra/AnimatedHouse";
import BeforeAfter from "@/components/obra/BeforeAfter";

interface Foto { id: string; url: string; etapa: ObraStage | null; created_at: string; legenda?: string | null }

export default function BeforeAfterPorEtapa({ fotos }: { fotos: Foto[] }) {
  const etapasComFotos = useMemo(
    () => STAGES.filter(s => fotos.filter(f => f.etapa === s.id).length >= 2),
    [fotos]
  );
  const [etapa, setEtapa] = useState<ObraStage | "">("");

  useEffect(() => {
    if (!etapa && etapasComFotos[0]) setEtapa(etapasComFotos[0].id);
  }, [etapasComFotos, etapa]);

  const doEtapa = useMemo(
    () => fotos.filter(f => f.etapa === etapa).sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [fotos, etapa]
  );

  const [antesId, setAntesId] = useState<string>("");
  const [depoisId, setDepoisId] = useState<string>("");

  useEffect(() => {
    if (doEtapa.length >= 2) {
      setAntesId(doEtapa[0].id);
      setDepoisId(doEtapa[doEtapa.length - 1].id);
    } else {
      setAntesId(""); setDepoisId("");
    }
  }, [etapa, doEtapa.length]);

  if (etapasComFotos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>Adicione pelo menos 2 fotos em uma mesma etapa para comparar antes/depois.</p>
      </div>
    );
  }

  const antes = doEtapa.find(f => f.id === antesId);
  const depois = doEtapa.find(f => f.id === depoisId);

  return (
    <div className="space-y-4">
      <Card className="p-4 grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Etapa</label>
          <Select value={etapa} onValueChange={(v) => setEtapa(v as ObraStage)}>
            <SelectTrigger><SelectValue placeholder="Escolha a etapa" /></SelectTrigger>
            <SelectContent>
              {etapasComFotos.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Antes</label>
          <Select value={antesId} onValueChange={setAntesId}>
            <SelectTrigger><SelectValue placeholder="Foto inicial" /></SelectTrigger>
            <SelectContent>
              {doEtapa.map(f => (
                <SelectItem key={f.id} value={f.id}>
                  {new Date(f.created_at).toLocaleDateString("pt-BR")} {f.legenda ? `— ${f.legenda}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Depois</label>
          <Select value={depoisId} onValueChange={setDepoisId}>
            <SelectTrigger><SelectValue placeholder="Foto final" /></SelectTrigger>
            <SelectContent>
              {doEtapa.map(f => (
                <SelectItem key={f.id} value={f.id}>
                  {new Date(f.created_at).toLocaleDateString("pt-BR")} {f.legenda ? `— ${f.legenda}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>
      {antes && depois && antes.id !== depois.id ? (
        <BeforeAfter before={antes.url} after={depois.url} />
      ) : (
        <p className="text-center text-muted-foreground text-sm py-6">Selecione duas fotos diferentes.</p>
      )}
    </div>
  );
}