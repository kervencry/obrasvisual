import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mic, MicOff, Sparkles, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

type Estruturado = {
  titulo: string;
  conteudo: string;
  clima: string;
  trabalhadores: number;
};

export default function DiarioIALivre({
  obraId,
  userId,
  onSaved,
}: {
  obraId: string;
  userId: string;
  onSaved: () => void;
}) {
  const [texto, setTexto] = useState("");
  const [gravando, setGravando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [previa, setPrevia] = useState<Estruturado | null>(null);
  const recRef = useRef<any>(null);
  const suportaVoz =
    typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => () => { try { recRef.current?.stop(); } catch {} }, []);

  function toggleVoz() {
    if (!suportaVoz) {
      toast.error("Seu navegador não suporta ditado por voz. Use Chrome no desktop ou Android.");
      return;
    }
    if (gravando) {
      try { recRef.current?.stop(); } catch {}
      setGravando(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;
    let base = texto;
    rec.onresult = (ev: any) => {
      let finalTxt = "";
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) finalTxt += r[0].transcript;
        else interim += r[0].transcript;
      }
      if (finalTxt) {
        base = (base ? base + " " : "") + finalTxt.trim();
        setTexto(base);
      } else {
        setTexto(base + (base ? " " : "") + interim);
      }
    };
    rec.onerror = (e: any) => {
      setGravando(false);
      if (e.error !== "aborted") toast.error("Erro no ditado: " + e.error);
    };
    rec.onend = () => setGravando(false);
    recRef.current = rec;
    try { rec.start(); setGravando(true); } catch { setGravando(false); }
  }

  async function organizar() {
    if (texto.trim().length < 3) {
      toast.error("Escreva ou dite o relato antes de organizar.");
      return;
    }
    if (gravando) { try { recRef.current?.stop(); } catch {} setGravando(false); }
    setCarregando(true);
    try {
      const { data, error } = await supabase.functions.invoke("diario-organizar", {
        body: { texto },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setPrevia({
        titulo: (data as any).titulo ?? "",
        conteudo: (data as any).conteudo ?? texto,
        clima: (data as any).clima ?? "",
        trabalhadores: (data as any).trabalhadores ?? 0,
      });
    } catch (e: any) {
      toast.error(e.message || "Falha ao organizar com IA");
    } finally {
      setCarregando(false);
    }
  }

  async function salvar() {
    if (!previa) return;
    if (!previa.conteudo.trim()) return toast.error("Conteúdo vazio");
    setSalvando(true);
    const { error } = await supabase.from("diario_obra").insert({
      obra_id: obraId,
      user_id: userId,
      titulo: previa.titulo || null,
      conteudo: previa.conteudo,
      clima: previa.clima || null,
      trabalhadores: previa.trabalhadores || null,
    });
    setSalvando(false);
    if (error) return toast.error(error.message);
    toast.success("Registro adicionado");
    setTexto("");
    setPrevia(null);
    onSaved();
  }

  return (
    <Card className="p-4 space-y-3 border-primary/30 bg-primary/[0.03]">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h4 className="font-semibold">Preencher com IA (texto livre ou voz)</h4>
      </div>
      <p className="text-xs text-muted-foreground">
        Escreva ou fale de forma solta o que aconteceu no dia. A IA organiza nos campos do diário e você revisa antes de salvar.
      </p>

      <div className="relative">
        <Textarea
          rows={4}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder='Ex: "hoje choveu de manhã, terminamos o contrapiso da sala, faltou cimento, 4 pedreiros em campo"'
          disabled={carregando || !!previa}
        />
        <Button
          type="button"
          size="icon"
          variant={gravando ? "destructive" : "secondary"}
          onClick={toggleVoz}
          disabled={carregando || !!previa}
          className="absolute bottom-2 right-2 h-8 w-8"
          title={suportaVoz ? (gravando ? "Parar ditado" : "Ditar por voz") : "Voz não suportada neste navegador"}
        >
          {gravando ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
      </div>
      {gravando && (
        <p className="text-xs text-primary flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
          Ouvindo... fale normalmente. Toque no microfone para parar.
        </p>
      )}

      {!previa && (
        <Button onClick={organizar} disabled={carregando || texto.trim().length < 3}>
          {carregando ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
          Organizar com IA
        </Button>
      )}

      {previa && (
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-primary font-medium">
            <Sparkles className="h-3 w-3" /> Prévia organizada — revise e edite se necessário
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Título</Label>
            <Input value={previa.titulo} onChange={(e) => setPrevia({ ...previa, titulo: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Conteúdo</Label>
            <Textarea rows={5} value={previa.conteudo} onChange={(e) => setPrevia({ ...previa, conteudo: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Clima</Label>
              <Input value={previa.clima} onChange={(e) => setPrevia({ ...previa, clima: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nº trabalhadores</Label>
              <Input
                type="number"
                value={previa.trabalhadores || ""}
                onChange={(e) => setPrevia({ ...previa, trabalhadores: Number(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={salvar} disabled={salvando}>
              {salvando ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Salvar registro
            </Button>
            <Button variant="ghost" onClick={() => setPrevia(null)} disabled={salvando}>
              <X className="h-4 w-4 mr-1" /> Descartar prévia
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}