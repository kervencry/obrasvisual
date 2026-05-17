# ObraVisual — Mapa de Funcionalidades

> Documento gerado em 17/05/2026 para apresentação ao engenheiro.

---

## 👥 Perfis de usuário

| Perfil | Papel |
|---|---|
| **Cliente** | Acompanha a obra, aprova etapas, acessa fotos |
| **Engenheiro** | Gerencia execução, atualiza progresso, posta fotos |
| **Arquiteto** | Valida projeto, envia documentos revisados |

---

## ✅ Etapa 1 — Já implementado / base

| Funcionalidade | Descrição |
|---|---|
| **Casa animada** | SVG interativo que evolui conforme as etapas (terreno → entregue) |
| **Dashboard** | Métricas de progresso, prazo, etapa atual |
| **Fotos e registros** | Upload por etapa com histórico |
| **Landing page** | Hero, Features, Pricing, Testimonials, CTA, Footer |

---

## 🔨 Etapa 2 — Implementar a seguir

| Funcionalidade | Prioridade | Descrição |
|---|---|---|
| **Portal do cliente** | 🔴 Alta | Link único `/obra/:id` para o cliente acessar sem login complexo |
| **Chat integrado** | 🔴 Alta | Mensagens por obra entre cliente, eng. e arquiteto |
| **Aprovação digital** | 🔴 Alta | Cliente assina/aprova etapas online com registro |
| **Diário de obra** | 🟡 Média | Log diário do engenheiro por obra |
| **Notificações** | 🟡 Média | Push e e-mail quando etapa muda ou foto é adicionada |
| **Relatório PDF** | 🟡 Média | Gerado automaticamente com fotos e progresso |

---

## 🚀 Etapa 3 — Diferenciais competitivos

| Funcionalidade | Descrição |
|---|---|
| **Slider antes/depois** | Comparação de fotos por etapa com arrastar |
| **QR Code da obra** | Cliente acessa no celular na frente da obra |
| **Cronograma Gantt** | Etapas com prazo, dependências e status visual |
| **Controle financeiro** | Gastos vs orçamento, alertas de desvio |
| **Linha do tempo** | Histórico auditável de todas as ações |
| **Vista 3D básica** | Modelo que evolui com as etapas |

---

## 🔮 Etapa 4 — Futuro / extras

| Funcionalidade | Descrição |
|---|---|
| **Galeria de portfólio** | Obras concluídas públicas para o profissional |
| **Clima e alertas** | Integração com previsão do tempo impactando cronograma |
| **Orçamento interativo** | Mudanças com aprovação digital do cliente |

---

## 🏗️ Stack técnica

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **Animações**: Framer Motion
- **Backend/DB**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Deploy**: Vercel
- **Charts**: Recharts

---

## 📁 Estrutura de pastas (src/)

```
src/
  components/
    landing/        ← Landing page sections
    obra/           ← Componentes da obra (AnimatedHouse, StageSelector, Chat...)
    ui/             ← shadcn components
  pages/
    Index.tsx       ← Landing page
    obra/
      Dashboard.tsx ← Painel do cliente
      (futuro: DiarioObra, Fotos, Chat, Financeiro...)
  hooks/
  lib/
  integrations/
    supabase/
```
