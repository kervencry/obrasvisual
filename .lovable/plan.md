# Refatoração: experiência por perfil (RBAC + UX dedicada)

Objetivo: evoluir o ObraVisual mantendo todo o backend, integrações Supabase, sistema de token e componentes atuais — sem quebrar nada — e entregar uma experiência visual e funcional totalmente personalizada para cada role (cliente, engenheiro, arquiteto, mestre_obras, admin).

## Escopo desta entrega (fase 1)

Como o pedido é muito grande, vou dividir em fases para evitar regressões. Esta fase entrega a base RBAC + menus + dashboards por perfil + contas de teste. As funcionalidades novas pesadas (Gantt, gestão de equipe/materiais, painel admin com faturamento, auditoria, etc.) entram nas fases seguintes referenciadas no final.

### 1. Camada RBAC unificada
- Novo arquivo `src/lib/rbac.ts` com:
  - tipo `Role` ("cliente" | "engenheiro" | "arquiteto" | "mestre_obras" | "admin")
  - mapa `PERMISSIONS[role]` (criar_obra, editar_obra, excluir_obra, gerar_token, upload_foto, registrar_diario, aprovar_revisao, gerenciar_usuarios, ver_financeiro, etc.)
  - helper `can(role, perm)`
- Novo componente `src/components/auth/RoleRoute.tsx` — wrapper de rota: exige login, valida role permitida, redireciona para o dashboard correto do usuário se acessar URL alheia. Sem alterar `useAuth`.
- Vínculo com obra continua via `is_obra_member` / `is_obra_editor` no Supabase (sem mudar RLS).

### 2. Roteamento por perfil
Reaproveita o `AppShell` mas com menu dinâmico. Novas rotas (todas dentro do shell):

```
/app                       redireciona para dashboard do role logado
/app/cliente               Dashboard Cliente
/app/cliente/obra/:id      Detalhe da obra (visão cliente)
/app/engenheiro            Dashboard Engenheiro (renomeia o atual)
/app/arquiteto             Dashboard Arquiteto (novo)
/app/mestre                Dashboard Mestre de Obras (novo)
/app/admin                 Dashboard Admin (novo)
/app/admin/usuarios        Lista de usuários
/app/admin/obras           Todas as obras
```
Rotas existentes (`/app/obras`, `/app/obras/nova`, `/app/obras/:id`, `/app/portfolio`, `/app/planos`, `/app/notificacoes`, `/app/perfil`) são mantidas mas envolvidas em `RoleRoute` com as permissões corretas.

### 3. Menu lateral dinâmico
Refatorar `AppShell.tsx` para montar `links[]` a partir do `role`, conforme a especificação do pedido (cliente / engenheiro / arquiteto / mestre / admin). Mantém logo, tema escuro e contador de notificações.

### 4. Dashboards por perfil
- **Cliente** (`/app/cliente`): hero com foto da obra, status, % concluído, próxima etapa, prazo, última atualização. Timeline das 8 etapas (já existe `seed_etapas`), galeria estilo Instagram, documentos, chat com engenheiro. Visual clean/Airbnb. Reaproveita `AnimatedHouse`, `BeforeAfterPorEtapa`, hooks atuais.
- **Engenheiro** (`/app/engenheiro`): mantém o `DashboardEngenheiro` atual (já tem KPIs, charts, atenção, atividade). Pequeno polimento corporativo + atalho “Nova obra” e “Gerar token”.
- **Arquiteto** (`/app/arquiteto`): KPIs de projetos vinculados, lista de revisões pendentes (usa `aprovacoes`), upload de documentos (`documentos` bucket).
- **Mestre de Obras** (`/app/mestre`): obras do dia, atalho diário de obra (já existe `diario_obra`), atalho upload de foto, próximas etapas. Layout operacional denso.
- **Admin** (`/app/admin`): contagem global de usuários por role, total de obras, obras ativas, plano distribuído, lista de últimos cadastros. Listagens em `/app/admin/usuarios` e `/app/admin/obras`.

### 5. Contas de teste
Após a aprovação da migration, vou inserir via tool de insert 4 contas demo com senhas fixas e roles diferentes, e deixar as credenciais documentadas na resposta:
- `cliente@demo.com`, `engenheiro@demo.com`, `arquiteto@demo.com`, `mestre@demo.com` (admin já pode ser promovido a partir de qualquer um). Senha padrão: `Demo123!`.

### 6. Garantias de não-regressão
- Não toco em `useAuth`, `client.ts`, `types.ts`, migrations existentes.
- Não removo nenhuma rota; apenas adiciono e protejo.
- `Pricing`, `Planos`, `PlanGate`, token público, portfolio público continuam funcionando.
- Sem mudanças de schema nesta fase exceto a criação dos 4 usuários demo (via auth admin) e seus papéis em `user_roles`. Será uma única migration/insert.

## Fases seguintes (não nesta entrega)
- Gantt de cronograma editável.
- Chat em tempo real cliente↔engenheiro (Realtime no `mensagens`).
- Gestão de equipe e materiais (tabelas novas) para o Mestre.
- Painel admin com auditoria/logs e métricas de faturamento.
- Busca global e exportação PDF universal.

Confirma para eu seguir com esta fase 1?
