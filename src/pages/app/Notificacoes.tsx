import { useNavigate } from "react-router-dom";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const ICON: Record<string, any> = {
  info: { Icon: Info, color: "text-blue-500" },
  sucesso: { Icon: CheckCircle2, color: "text-emerald-500" },
  alerta: { Icon: AlertTriangle, color: "text-amber-500" },
  erro: { Icon: XCircle, color: "text-destructive" },
};

export default function Notificacoes() {
  const { notificacoes, naoLidas, marcarLida, marcarTodasLidas } = useNotificacoes();
  const nav = useNavigate();

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold flex items-center gap-2"><Bell/>Notificações</h1>
        {naoLidas > 0 && <Button variant="outline" size="sm" onClick={marcarTodasLidas}>Marcar todas como lidas</Button>}
      </div>
      {notificacoes.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma notificação ainda.</p>
      ) : (
        <div className="space-y-2">
          {notificacoes.map(n => {
            const cfg = ICON[n.tipo] ?? ICON.info;
            const Icon = cfg.Icon;
            return (
              <Card
                key={n.id}
                onClick={async () => {
                  if (!n.lida) await marcarLida(n.id);
                  if (n.link) nav(n.link);
                }}
                className={cn("p-4 cursor-pointer hover:shadow-md transition", !n.lida && "bg-primary/5 border-primary/30")}
              >
                <div className="flex gap-3">
                  <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", cfg.color)}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-3">
                      <p className="font-medium">{n.titulo}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}</span>
                    </div>
                    {n.mensagem && <p className="text-sm text-muted-foreground">{n.mensagem}</p>}
                  </div>
                  {!n.lida && <span className="h-2 w-2 rounded-full bg-primary mt-2"/>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
