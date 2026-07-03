import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, X, Crown } from "lucide-react";
import { toast } from "sonner";
import { notificar } from "@/lib/notificar";

const PAPEL_COLOR: Record<string, string> = {
  engenheiro: "bg-primary/15 text-primary border-primary/30",
  arquiteto: "bg-secondary text-secondary-foreground border-border",
  mestre_obras: "bg-accent/20 text-foreground border-accent/40",
  cliente: "bg-muted text-muted-foreground border-border",
};

export default function MembrosObra({ obraId, ownerId }: { obraId: string; ownerId: string }) {
  const { user } = useAuth();
  const isOwner = user?.id === ownerId;
  const [membros, setMembros] = useState<any[]>([]);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [papel, setPapel] = useState("engenheiro");
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data: m } = await supabase
      .from("obra_members")
      .select("id, user_id, papel")
      .eq("obra_id", obraId);
    const list = m ?? [];
    if (list.length) {
      const ids = list.map((x: any) => x.user_id);
      const { data: profs } = await supabase.from("profiles").select("id, nome, empresa").in("id", ids);
      const byId = new Map((profs ?? []).map((p: any) => [p.id, p]));
      setMembros(list.map((x: any) => ({ ...x, profile: byId.get(x.user_id) })));
    } else {
      setMembros([]);
    }
    const { data: o } = await supabase.from("profiles").select("nome, empresa").eq("id", ownerId).maybeSingle();
    setOwnerProfile(o);
  }
  useEffect(() => { load(); }, [obraId, ownerId]);

  async function convidar() {
    if (!email) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("buscar_usuario_por_email", { _email: email.trim() });
    if (error) { setLoading(false); return toast.error(error.message); }
    const found = (data as any[])?.[0];
    if (!found) {
      setLoading(false);
      return toast.error("Usuário não encontrado. Peça para ele criar uma conta primeiro.");
    }
    if (found.id === ownerId) { setLoading(false); return toast.error("O dono da obra já tem acesso total."); }
    const { error: insErr } = await supabase.from("obra_members").insert({
      obra_id: obraId, user_id: found.id, papel: papel as any,
    });
    if (insErr) { setLoading(false); return toast.error(insErr.message); }
    await supabase.from("timeline_eventos").insert({
      obra_id: obraId, user_id: user?.id, tipo: "membro",
      descricao: `${found.nome ?? email} foi adicionado como ${papel}`,
    });
    await notificar(found.id, obraId, "Você foi adicionado a uma obra", `Como ${papel}`, "info", `/app/obras/${obraId}`);
    setLoading(false);
    setEmail(""); setOpen(false);
    toast.success("Membro adicionado!");
    load();
  }

  async function remover(memberId: string, userId: string, nome: string) {
    await supabase.from("obra_members").delete().eq("id", memberId);
    await supabase.from("timeline_eventos").insert({
      obra_id: obraId, user_id: user?.id, tipo: "membro",
      descricao: `${nome ?? "Membro"} foi removido`,
    });
    toast.success("Membro removido");
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Equipe da obra</h3>
        {isOwner && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><UserPlus className="h-4 w-4 mr-1"/>Convidar membro</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Convidar membro</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>E-mail do usuário</Label><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="usuario@email.com"/></div>
                <div>
                  <Label>Papel na obra</Label>
                  <Select value={papel} onValueChange={setPapel}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engenheiro">Engenheiro</SelectItem>
                      <SelectItem value="arquiteto">Arquiteto</SelectItem>
                      <SelectItem value="mestre_obras">Mestre de obras</SelectItem>
                      <SelectItem value="cliente">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button>
                <Button onClick={convidar} disabled={loading}>{loading?"...":"Convidar"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Crown className="h-5 w-5 text-primary"/></div>
          <div>
            <p className="font-medium">{ownerProfile?.nome ?? "Dono"}</p>
            <p className="text-xs text-muted-foreground">{ownerProfile?.empresa ?? "Proprietário da obra"}</p>
          </div>
        </div>
        <Badge variant="outline">Owner</Badge>
      </Card>

      {membros.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum membro convidado ainda.</p>
      ) : (
        <div className="space-y-2">
          {membros.map((m:any) => (
            <Card key={m.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-semibold">{(m.profile?.nome ?? "?").charAt(0).toUpperCase()}</div>
                <div>
                  <p className="font-medium">{m.profile?.nome ?? "Sem nome"}</p>
                  <p className="text-xs text-muted-foreground">{m.profile?.empresa ?? ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={PAPEL_COLOR[m.papel] ?? ""} variant="outline">{m.papel}</Badge>
                {isOwner && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost"><X className="h-4 w-4"/></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover membro?</AlertDialogTitle>
                        <AlertDialogDescription>O membro perderá acesso à obra. Esta ação pode ser desfeita reconvidando.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={()=>remover(m.id, m.user_id, m.profile?.nome)}>Remover</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
