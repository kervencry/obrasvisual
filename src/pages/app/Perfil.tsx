import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Camera, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Prefs = {
  fotos?: boolean; etapa?: boolean; chat?: boolean; aprovacoes?: boolean; semanal?: boolean;
};

export default function Perfil() {
  const { user, role } = useAuth();
  const [p, setP] = useState({ nome: "", telefone: "", bio: "", empresa: "", avatar_url: "" });
  const [prefs, setPrefs] = useState<Prefs>({ fotos: true, etapa: true, chat: true, aprovacoes: true, semanal: false });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [senha, setSenha] = useState({ nova: "", conf: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setP({
          nome: data.nome ?? "", telefone: data.telefone ?? "", bio: data.bio ?? "",
          empresa: data.empresa ?? "", avatar_url: data.avatar_url ?? "",
        });
        const pref = (data as any).preferencias ?? {};
        setPrefs({ fotos: true, etapa: true, chat: true, aprovacoes: true, semanal: false, ...pref });
      }
    });
  }, [user]);

  async function save() {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({
      nome: p.nome, telefone: p.telefone, bio: p.bio, empresa: p.empresa,
    }).eq("id", user.id);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Perfil atualizado!");
  }

  async function uploadAvatar(file: File) {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/avatar-${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
    setP(prev => ({ ...prev, avatar_url: publicUrl }));
    setUploading(false);
    toast.success("Foto atualizada!");
  }

  async function alterarSenha() {
    if (!senha.nova || senha.nova.length < 6) return toast.error("A senha deve ter ao menos 6 caracteres");
    if (senha.nova !== senha.conf) return toast.error("As senhas não coincidem");
    const { error } = await supabase.auth.updateUser({ password: senha.nova });
    if (error) return toast.error(error.message);
    setSenha({ nova: "", conf: "" });
    toast.success("Senha alterada com sucesso");
  }

  async function salvarPrefs(novas: Prefs) {
    if (!user) return;
    setPrefs(novas);
    await supabase.from("profiles").update({ preferencias: novas as any }).eq("id", user.id);
  }

  const portfolioUrl = user ? `${window.location.origin}/portfolio/${user.id}` : "";

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6">Meu perfil</h1>

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="notif">Notificações</TabsTrigger>
          <TabsTrigger value="port">Meu portfólio</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="mt-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <button onClick={()=>fileRef.current?.click()} className="relative h-20 w-20 rounded-full bg-muted overflow-hidden flex items-center justify-center group">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt="" className="w-full h-full object-cover"/>
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">{(p.nome || user?.email || "?").charAt(0).toUpperCase()}</span>
                )}
                <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Camera className="h-5 w-5 text-white"/>
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>e.target.files?.[0] && uploadAvatar(e.target.files[0])}/>
              <div>
                <div className="flex items-center gap-2"><Badge>{role}</Badge><span className="text-sm text-muted-foreground">{user?.email}</span></div>
                {uploading && <p className="text-xs text-muted-foreground mt-1">Enviando...</p>}
              </div>
            </div>
            <div><Label>Nome</Label><Input value={p.nome} onChange={e=>setP({...p,nome:e.target.value})}/></div>
            <div><Label>Telefone</Label><Input value={p.telefone} onChange={e=>setP({...p,telefone:e.target.value})}/></div>
            <div><Label>Empresa</Label><Input value={p.empresa} onChange={e=>setP({...p,empresa:e.target.value})}/></div>
            <div><Label>Bio</Label><Textarea rows={3} value={p.bio} onChange={e=>setP({...p,bio:e.target.value})}/></div>
            <Button onClick={save} disabled={loading}>{loading?"...":"Salvar"}</Button>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="mt-4">
          <Card className="p-6 space-y-3">
            <h3 className="font-semibold">Alterar senha</h3>
            <div><Label>Nova senha</Label><Input type="password" value={senha.nova} onChange={e=>setSenha({...senha,nova:e.target.value})}/></div>
            <div><Label>Confirmar nova senha</Label><Input type="password" value={senha.conf} onChange={e=>setSenha({...senha,conf:e.target.value})}/></div>
            <Button onClick={alterarSenha}>Alterar senha</Button>
          </Card>
        </TabsContent>

        <TabsContent value="notif" className="mt-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Preferências de notificação</h3>
            {[
              { key: "fotos", label: "Novas fotos na obra" },
              { key: "etapa", label: "Mudança de etapa" },
              { key: "chat", label: "Novas mensagens no chat" },
              { key: "aprovacoes", label: "Aprovações" },
              { key: "semanal", label: "Relatório semanal por e-mail" },
            ].map(opt => (
              <div key={opt.key} className="flex items-center justify-between">
                <Label>{opt.label}</Label>
                <Switch checked={!!(prefs as any)[opt.key]} onCheckedChange={v => salvarPrefs({ ...prefs, [opt.key]: v })}/>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="port" className="mt-4">
          <Card className="p-6 space-y-3">
            <h3 className="font-semibold">Meu link público</h3>
            <p className="text-sm text-muted-foreground">Compartilhe este link com clientes para mostrar suas obras concluídas.</p>
            <div className="flex gap-2">
              <Input readOnly value={portfolioUrl}/>
              <Button variant="outline" onClick={()=>{ navigator.clipboard.writeText(portfolioUrl); toast.success("Link copiado!"); }}><Copy className="h-4 w-4"/></Button>
            </div>
            <a href={portfolioUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-1"><ExternalLink className="h-4 w-4"/>Ver meu portfólio</Button>
            </a>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
