

## ObraViva - Plataforma SaaS de Acompanhamento de Obras

### Fase 1: Landing Page e Autenticação
- **Landing page** profissional com hero, funcionalidades, planos/preços, depoimentos e CTA
- Design clean com paleta azul/cinza/branco, mobile-first
- **Autenticação** com login/cadastro (email + senha)
- Seleção de perfil no cadastro (Engenheiro, Arquiteto, Mestre de Obras, Cliente)
- Tabela de perfis e tabela de roles no banco de dados

### Fase 2: Cadastro e Gestão de Obras
- **Cadastro de obra** com nome, endereço, tipo (casa/prédio/reforma), valor, prazo estimado
- Upload de planta (PDF/imagens) via Supabase Storage
- **Listagem de obras** com filtros por status (multiobras para profissionais)
- Vinculação de membros à obra (engenheiro, cliente, mestre de obras)

### Fase 3: Etapas e Progresso
- **7 etapas padrão** (Fundação → Finalização) com percentual configurável
- Status por etapa: não iniciado, em andamento, concluído
- **Atualização de progresso**: upload de fotos, comentários técnicos, data e responsável
- Histórico imutável de todas as alterações
- **Visualização em camadas**: ilustração SVG da obra que se "constrói" visualmente conforme progresso

### Fase 4: Dashboard
- Progresso geral (%) com gráfico visual
- Etapas concluídas vs pendentes
- Prazo estimado vs prazo real
- Alertas de atraso
- Resumo financeiro (custo previsto vs realizado)

### Fase 5: Funcionalidades Avançadas
- **Linha do tempo** completa da obra (quem, quando, o quê)
- **Aprovação de etapas** pelo cliente com registro digital
- **Checklist técnico** por etapa (itens obrigatórios, conformidade)
- **Controle financeiro**: gastos por etapa, upload de notas fiscais
- **Notificações** via toast/in-app para atrasos, aprovações pendentes, atualizações

### Fase 6: Relatórios e Planos SaaS
- **Geração de relatório PDF** com fotos, progresso e comentários
- Página de **planos e preços** com 3 tiers (Gratuito, Profissional, Construtora)
- Integração com Stripe para assinaturas
- Controle de limites por plano (número de obras, usuários)

### Páginas
1. Landing page (pública)
2. Login / Cadastro
3. Dashboard (visão geral de todas as obras)
4. Detalhe da obra (etapas, progresso, visualização)
5. Atualização de progresso (formulário com upload)
6. Linha do tempo da obra
7. Controle financeiro
8. Relatórios
9. Perfil do usuário
10. Planos e preços

