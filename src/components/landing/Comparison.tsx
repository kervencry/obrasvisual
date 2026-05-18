import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";

const rows = [
  ["Transparência em tempo real", true, false, false],
  ["Fotos organizadas por etapa", true, false, true],
  ["Chat integrado", true, false, false],
  ["Aprovação digital com assinatura", true, false, false],
  ["Relatório PDF automático", true, false, true],
  ["Acesso exclusivo do cliente", true, false, false],
  ["Preço acessível", true, true, false],
] as const;

export default function Comparison() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold">Por que ObraVisual?</h2>
          <p className="text-muted-foreground mt-3">Compare e veja a diferença.</p>
        </div>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold"> </th>
                <th className="p-4 font-bold text-primary bg-primary/5">ObraVisual</th>
                <th className="p-4 font-medium text-muted-foreground">Método tradicional</th>
                <th className="p-4 font-medium text-muted-foreground">Concorrentes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, a, b, c]) => (
                <tr key={label as string} className="border-b border-border last:border-0">
                  <td className="p-4 font-medium">{label}</td>
                  <td className="p-4 text-center bg-primary/5">{a ? <Check className="h-5 w-5 text-primary mx-auto"/> : <X className="h-5 w-5 text-destructive mx-auto"/>}</td>
                  <td className="p-4 text-center">{b ? <Check className="h-5 w-5 text-primary mx-auto"/> : <X className="h-5 w-5 text-destructive mx-auto"/>}</td>
                  <td className="p-4 text-center">{c ? <Check className="h-5 w-5 text-primary mx-auto"/> : <X className="h-5 w-5 text-destructive mx-auto"/>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </section>
  );
}
