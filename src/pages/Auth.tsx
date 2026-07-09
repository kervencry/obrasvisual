import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { HardHat, Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [role, setRole] = useState("cliente");
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (user) nav("/app/home"); }, [user, nav]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo de volta!");
    nav("/app/home");
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/app/home`,
        data: { nome, role },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada! Verifique seu e-mail.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <HardHat className="h-7 w-7 text-primary" />
          <span className="text-2xl font-extrabold">ObraVisual</span>
        </Link>
        <Card className="p-6">
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-3">
                <div><Label>E-mail</Label><Input type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></div>
                <div>
                  <Label>Senha</Label>
                  <div className="relative">
                    <Input type={showPass?"text":"password"} required value={password} onChange={e=>setPassword(e.target.value)} className="pr-10" />
                    <button type="button" onClick={()=>setShowPass(v=>!v)} aria-label={showPass?"Ocultar senha":"Mostrar senha"} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading?"...":"Entrar"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-3">
                <div><Label>Nome</Label><Input required value={nome} onChange={e=>setNome(e.target.value)} /></div>
                <div><Label>E-mail</Label><Input type="email" required value={email} onChange={e=>setEmail(e.target.value)} /></div>
                <div>
                  <Label>Senha</Label>
                  <div className="relative">
                    <Input type={showPass?"text":"password"} required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} className="pr-10" />
                    <button type="button" onClick={()=>setShowPass(v=>!v)} aria-label={showPass?"Ocultar senha":"Mostrar senha"} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPass ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </button>
                  </div>
                </div>
                <div>
                  <Label>Você é</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="engenheiro">Engenheiro</SelectItem>
                      <SelectItem value="arquiteto">Arquiteto</SelectItem>
                      <SelectItem value="mestre_obras">Mestre de Obras</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading?"...":"Criar conta"}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}