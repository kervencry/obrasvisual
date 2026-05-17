# ObraVisual — Implementação completa do mapa de funcionalidades

O mapa enviado contém **18 funcionalidades** divididas em 3 níveis. Vou implementar tudo em fases organizadas, com backend (Lovable Cloud), autenticação e UI completa.

## Fase 1 — Fundação (Auth + Banco de dados)

- **Autenticação**: login/cadastro com e-mail e senha, seleção de perfil (Cliente, Engenheiro, Arquiteto, Mestre de Obras)
- **Banco de dados**: tabelas `profiles`, `user_roles`, `obras`, `obra_members`, `etapas`, `fotos`, `mensagens`, `aprovacoes`, `diario_obra`, `financeiro`, `notificacoes`, `timeline_eventos`
- **Storage**: buckets `fotos-obras`, `documentos`, `avatars`
- **RLS** completo em todas as tabelas

## Fase 2 — Etapa 1 do mapa (já parcialmente feito)

- ✅ Casa animada (SVG) — já existe
- ✅ Dashboard básico — já existe
- **Fotos e registros**: upload por etapa com histórico real (Storage + DB)
- **Cadastro de obra** completo (form com nome, endereço, tipo, valor, prazo)
- **Listagem de obras** do usuário

## Fase 3 — Funcionalidades sugeridas (Etapa 2 do mapa)

1. **Chat integrado** — mensagens por obra/etapa, com realtime
2. **Aprovação digital** — cliente aprova etapa, registro com timestamp e assinatura
3. **Relatório PDF** — geração automática com fotos e progresso (jsPDF)
4. **Linha do tempo** — histórico auditável de eventos da obra
5. **Controle financeiro** — gastos por etapa, orçamento, alertas de desvio, upload NF
6. **Notificações** — sistema in-app com badge e lista
7. **Cronograma Gantt** — etapas com prazo e status visual
8. **Portal do cliente** — link público `/obra/:id/cliente` com token
9. **Diário de obra** — log diário do engenheiro

## Fase 4 — Diferenciais competitivos (Etapa 3 do mapa)

10. **Slider antes/depois** — comparação de fotos com arrastar
11. **Vista 3D básica** — modelo evolui com etapas (Three.js leve / CSS 3D)
12. **QR Code da obra** — geração para acesso mobile (qrcode lib)

## Fase 5 — Extras/futuro (Etapa 4 do mapa)

13. **Orçamento interativo** — mudanças com aprovação digital
14. **Galeria de portfólio** — página pública `/portfolio/:user` com obras concluídas
15. **Clima e alertas** — integração com API de previsão do tempo

## Páginas a criar

```text
/                          landing (existe)
/auth                      login/cadastro
/app                       dashboard geral (lista de obras)
/app/obras/nova            cadastro de obra
/app/obras/:id             detalhe da obra (tabs: visão geral, etapas, fotos, chat, timeline, financeiro, diário, gantt, 3D)
/app/obras/:id/relatorio   PDF
/app/perfil                perfil do usuário
/app/notificacoes          central de notificações
/app/portfolio             portfólio pessoal
/obra/:id/publico?t=token  portal do cliente público (com QR)
/portfolio/:userId         galeria pública
```

## Stack técnica adicional

- `jspdf` + `html2canvas` — relatórios PDF
- `qrcode.react` — QR codes
- `recharts` — gráficos (já instalado)
- Lovable AI (opcional) — sumário automático de obra
- API pública Open-Meteo (sem chave) — clima

## Componentes reutilizáveis

- `<ObraLayout>` com sidebar de tabs
- `<AppShell>` com sidebar principal
- `<BeforeAfterSlider>`, `<GanttChart>`, `<ChatPanel>`, `<TimelineFeed>`, `<FinanceiroPanel>`, `<DiarioEditor>`, `<AprovacaoCard>`, `<QrCodeObra>`, `<View3DObra>`, `<ClimaWidget>`

## Observações

- Trabalho extenso — vou implementar de forma sequencial, testando build a cada fase
- Vou pedir aprovação da migration do banco antes de prosseguir
- Stripe/pagamentos ficam fora deste escopo (não estão no mapa)
- Vou reaproveitar tudo que já existe (AnimatedHouse, Dashboard atual, landing)
