import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  ["Preciso de conhecimento técnico para usar?", "Não. A plataforma foi desenhada para ser intuitiva. Em poucos minutos você cadastra sua primeira obra e convida sua equipe."],
  ["Como o cliente acessa a obra?", "Você gera um QR Code ou link exclusivo e envia para o cliente. Ele acompanha tudo sem precisar criar conta."],
  ["Quantas obras posso cadastrar?", "Depende do seu plano. O plano gratuito permite 1 obra, o Profissional permite múltiplas e o Construtora é ilimitado."],
  ["Os dados ficam seguros?", "Sim. Usamos criptografia, autenticação e backup automático. Apenas membros convidados acessam cada obra."],
  ["Posso usar no celular?", "Sim. O ObraVisual é totalmente responsivo e funciona em qualquer dispositivo."],
  ["Como funciona o QR Code?", "Cada obra tem um QR Code exclusivo. Imprima e cole na placa de obra — o cliente escaneia e vê o progresso."],
  ["Engenheiro e arquiteto têm acessos diferentes?", "Sim. Cada papel tem permissões específicas para garantir controle técnico e separação de responsabilidades."],
  ["Tem período de teste gratuito?", "Sim. Você pode usar o plano gratuito para sempre e fazer upgrade quando precisar de mais recursos."],
] as const;

export default function FAQ() {
  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold">Perguntas frequentes</h2>
          <p className="text-muted-foreground mt-3">Tudo o que você precisa saber para começar.</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map(([q, a], i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-semibold">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
