import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { usePlano } from "@/hooks/usePlano";
import type { PlanoConfig } from "@/lib/planos";

export default function PlanGate({
  feature, children, titulo
}: { feature: keyof PlanoConfig["features"]; children: ReactNode; titulo?: string }) {
  const { can, loading, config } = usePlano();
  if (loading) return null;
  if (can(feature)) return <>{children}</>;
  return (
    <Card className="p-8 text-center bg-gradient-to-b from-primary/5 to-transparent">
      <Crown className="h-10 w-10 mx-auto text-primary mb-3" />
      <h3 className="font-bold text-lg mb-1">{titulo ?? "Recurso premium"}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Disponível nos planos Profissional e Construtora. Seu plano atual: <strong>{config.nome}</strong>.
      </p>
      <Link to="/app/planos"><Button>Ver planos</Button></Link>
    </Card>
  );
}