# Gestor de Vida SaaS - TODO

## Banco de Dados e Schema
- [x] Tabela de assinaturas (subscriptions)
- [x] Tabela de tarefas (tasks) - Gestão de Tempo
- [x] Tabela de sessões de tempo (time_sessions)
- [x] Tabela de entradas financeiras (budget_entries)
- [x] Tabela de contas parceladas (installments)
- [x] Tabela de projeção de aposentadoria (retirement_projections)
- [x] Migrar schema com pnpm db:push
- [x] BUG CRÍTICO: colunas Stripe e trialEndsAt ausentes no banco de produção — migração manual aplicada
- [x] Criar tabelas novas (income_entries, fixed_bills, expense_entries, installment_bills, retirement_config, bill_entries, categories, family_members, payment_methods, fixed_bill_labels, reminders)

## Backend - Assinaturas e Stripe
- [x] Integração Stripe (checkout, webhooks, portal)
- [x] Procedimento de criar assinatura (simulado)
- [x] Procedimento de cancelar assinatura
- [x] Procedimento de upgrade/downgrade de plano
- [x] Middleware de verificação de acesso ao módulo
- [x] Webhook Stripe para atualizar status da assinatura

## Backend - Gestão de Tempo
- [x] CRUD de tarefas
- [x] Iniciar/pausar/concluir tarefa (rastreamento de tempo)
- [x] Score de produtividade (30 dias)
- [x] Relatório de desempenho

## Backend - Orçamento Doméstico
- [x] CRUD de entradas (receitas, despesas fixas, despesas variáveis)
- [x] Cálculo automático da regra 50/30/20
- [x] CRUD de contas parceladas
- [x] Projeção de aposentadoria (3 cenários)
- [x] Dashboard anual (resumo por mês)

## Frontend - Landing Page
- [x] Hero section com CTA
- [x] Seção de funcionalidades
- [x] Tabela comparativa de planos
- [x] Cards de preços com botão de assinatura
- [x] Footer

## Frontend - Autenticação
- [x] Fluxo de login via Manus OAuth
- [x] Redirecionamento pós-login para dashboard
- [x] Proteção de rotas por módulo

## Frontend - Dashboard Principal
- [x] Layout com sidebar
- [x] Resumo do dia (Gestão de Tempo)
- [x] Saldo financeiro do mês (Orçamento Doméstico)
- [x] Bloqueio visual de módulos não contratados

## Frontend - Módulo Gestão de Tempo
- [x] Aba "Meu Dia" com lista de tarefas
- [x] Aba "Planejamento" (visão semanal)
- [x] Aba "Relatório" (score e desempenho)
- [x] Modal de criar/editar tarefa
- [x] Timer de execução de tarefa
- [x] Barra de score de produtividade

## Frontend - Módulo Orçamento Doméstico
- [x] Aba de orçamento mensal (receitas, fixas, variáveis)
- [x] Visualização da regra 50/30/20
- [x] Aba de contas parceladas
- [x] Aba de projeção de aposentadoria
- [x] Dashboard anual com gráficos (recharts)

## Frontend - Assinatura e Planos
- [x] Página de planos e upgrade
- [x] Fluxo de checkout Stripe
- [x] Página de sucesso pós-assinatura (/assinatura/sucesso)
- [x] Portal de gerenciamento de assinatura (Stripe Customer Portal)

## Ajustes Pós-Entrega
- [x] Responsividade mobile — sidebar, dashboard, landing page
- [x] Responsividade mobile — módulo Gestão de Tempo
- [x] Responsividade mobile — módulo Orçamento Doméstico
- [x] Replicar fielmente módulo Gestão de Tempo (Tríade do Tempo original)
- [x] Replicar fielmente módulo Orçamento Doméstico (original)
- [x] Acesso irrestrito para usuário admin (dono) sem necessidade de assinatura

## Testes
- [x] Testes de autenticação
- [x] Testes de controle de acesso por plano
- [x] Testes de CRUD de tarefas (acesso bloqueado sem plano)
- [x] Testes de CRUD de entradas financeiras (acesso bloqueado sem plano)
- [x] Testes de cálculo 50/30/20
- [x] Testes de projeção de aposentadoria
- [x] Aplicar paleta de cores violeta/sidebar escura
- [x] Reorganizar sidebar com grupos colapsáveis (Gestão de Tempo, Orçamento Doméstico)
- [x] Trial gratuito de 5 dias — lógica no backend (campo trialEndsAt na subscription)
- [x] Trial gratuito de 5 dias — banner com contador regressivo no dashboard
- [x] Trial gratuito de 5 dias — bloqueio suave ao expirar com CTA para assinar
- [x] Landing page — destacar trial gratuito no hero e nos planos
- [x] Módulo de tutoriais — página central com guias passo a passo
- [x] Tutorial Gestão de Tempo — 6 passos detalhados com imagens/ícones
- [x] Tutorial Orçamento Doméstico — 6 passos detalhados com imagens/ícones
- [ ] Tour interativo de onboarding no primeiro acesso (tooltip guiado)
- [ ] Botão "Ver Tutorial" em cada módulo
- [x] Módulo Aprender — página central com trilhas de aprendizado
- [x] Trilha Gestão de Tempo: o que é a Tríade, quando usar Importante/Urgente/Circunstancial, exemplos práticos
- [x] Trilha Gestão de Tempo: como planejar por mês, semana e dia
- [x] Trilha Gestão de Tempo: backlog sem data — capturar e distribuir tarefas
- [x] Trilha Orçamento: o que é a regra 50/30/20, como categorizar cada gasto
- [x] Trilha Orçamento: como funcionam os vínculos e parcelamentos
- [x] Trilha Orçamento: como usar a projeção de aposentadoria (3 cenários)
- [x] Botão "Aprender" na sidebar com ícone de livro
- [x] BUG: usuários em trial com módulos bloqueados — corrigido (subscription.get usa getActiveSubscription)
- [x] Adicionar "Aprender" na sidebar com ícone de livro

## Stripe - Sistema de Pagamento
- [x] Instalar dependência stripe no backend
- [x] Configurar secrets STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET
- [x] Criar produtos e preços no Stripe (3 planos: R$19,90 / R$19,90 / R$34,90)
- [x] Backend: rota createCheckoutSession (por plano)
- [x] Backend: rota createPortalSession (gerenciar assinatura)
- [x] Backend: webhook handler (/api/stripe/webhook) para eventos: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
- [x] Frontend: botões "Assinar" na página de planos chamam checkout Stripe
- [x] Frontend: página de sucesso pós-assinatura (/assinatura/sucesso)
- [x] Frontend: botão "Gerenciar assinatura" no dashboard/planos para portal Stripe
- [x] Sincronizar status da assinatura via webhook (active, cancelled, expired)

## Painel Administrativo
- [x] Rota backend admin: métricas (total assinantes, em trial, MRR, conversões)
- [x] Rota backend admin: lista de usuários com plano, status, data de criação
- [x] Rota backend admin: ativar/cancelar plano de um usuário manualmente
- [x] Página /admin com proteção por role=admin
- [x] Dashboard admin: cards de métricas (MRR, assinantes ativos, trials, conversão)
- [x] Dashboard admin: tabela de usuários com filtros por plano/status
- [x] Dashboard admin: ação de ativar/cancelar plano manualmente
- [x] Link "Admin" na sidebar (visível apenas para role=admin)

## Replicação Fiel - Módulo Gestão de Tempo (Original)
- [ ] Tela Meu Dia: cabeçalho com data navegável (< >) e dia da semana
- [ ] Tela Meu Dia: resumo "N atividades | Xh plan. | Xh exec. | Xmin rest." + score circular + barra %
- [ ] Tela Meu Dia: barra score 30 dias em fundo escuro com % por categoria (Imp/Urg/Circ)
- [ ] Tela Meu Dia: campo de criação rápida inline + botão "+ Nova"
- [ ] Tela Meu Dia: tarefas agrupadas por categoria com emoji, contador e tempo total
- [ ] Tela Meu Dia: colunas NOME | DURAÇÃO | TIMER (tempo executado em verde)
- [ ] Tela Meu Dia: seção "Concluídas (n)" colapsável com tarefas tachadas
- [ ] Modal Nova Tarefa: classificação Tríade com botões grandes (bolinhas coloridas)
- [ ] Modal Nova Tarefa: campo Categoria com dropdown + emoji
- [ ] Modal Nova Tarefa: campos Data e Hora lado a lado
- [ ] Modal Nova Tarefa: checkbox "Tarefa recorrente"
- [ ] Modal Nova Tarefa: botão "Criar Tarefa" azul

## Correções Urgentes - Gestão de Tempo
- [ ] BUG: tarefa sem data (backlog) não aparece na tela — criar aba/seção Backlog
- [ ] Reescrever tela Meu Dia idêntica ao original: agrupamento por categoria com emoji (💼 Comercial, etc.)
- [ ] Reescrever tela Meu Dia: colunas NOME | DURAÇÃO | TIMER com tempo executado em verde (00:05:00)
- [ ] Reescrever tela Meu Dia: seção "Concluídas (n)" colapsável com tarefas tachadas
- [ ] Reescrever tela Meu Dia: barra score 30 dias em fundo escuro com % por categoria
- [ ] Reescrever modal Nova Tarefa: Tríade como botões grandes com bolinhas coloridas
- [ ] Reescrever modal Nova Tarefa: campo Categoria com dropdown + emoji
- [ ] Reescrever modal Nova Tarefa: campos Data e Hora lado a lado
- [ ] Reescrever modal Nova Tarefa: checkbox "Tarefa recorrente"
- [ ] Adicionar campos scheduledTime e isRecurring no schema da tabela tasks

## Configurações Genéricas do Orçamento (URGENTE)
- [ ] Tela de Configurações: categorias de receita configuráveis (nome + ativo/inativo)
- [ ] Tela de Configurações: formas de pagamento configuráveis (nome + se é cartão ou não)
- [ ] Tela de Configurações: contas fixas configuráveis (nome + categoria padrão)
- [ ] Tela de Configurações: categorias de despesa configuráveis (nome + bucket 50/30/20)
- [ ] Remover todos os nomes pessoais hardcoded (Itaú Azul Infinite, C6 Carbon, XP, Carteira Fer, etc.)
- [ ] MonthlyBudget: receitas dinâmicas baseadas nas configurações do usuário
- [ ] MonthlyBudget: contas fixas dinâmicas baseadas nas configurações do usuário
- [ ] MonthlyBudget: formas de pagamento dinâmicas baseadas nas configurações do usuário
- [ ] MonthlyBudget: categorias de despesa dinâmicas baseadas nas configurações do usuário
- [ ] Corrigir bug: erro ao salvar receitas
- [ ] Link "Configurações" na sidebar do módulo Orçamento

## Planos Anuais + Política de Cancelamento
- [ ] Criar preços anuais no Stripe (12x com ~17% desconto): Tempo R$199/ano, Orçamento R$199/ano, Combo R$349/ano
- [ ] Atualizar stripe_products.ts com price IDs anuais
- [ ] Atualizar página Planos.tsx com toggle Mensal/Anual e preços corretos
- [ ] Criar página /politica-cancelamento com regras conforme CDC
- [ ] Link para política de cancelamento na página de Planos e no rodapé
- [ ] Atualizar checkout Stripe para suportar billing_period anual

## Orçamento Genérico (campos configuráveis)
- [ ] Adicionar tabelas income_fields e income_values ao schema.ts
- [ ] Adicionar tabelas fixed_bill_fields e fixed_bill_values ao schema.ts
- [ ] Executar pnpm db:push para criar as novas tabelas
- [ ] Adicionar funções db.ts: getIncomeFields, upsertIncomeField, getIncomeValues, upsertIncomeValue
- [ ] Adicionar funções db.ts: getFixedBillFields, upsertFixedBillField, getFixedBillValues, upsertFixedBillValue
- [ ] Adicionar routers: incomeFields, fixedBillFields no routers.ts
- [ ] Atualizar OrcamentoSettings.tsx: seção de fontes de receita configuráveis
- [ ] Atualizar OrcamentoSettings.tsx: seção de contas fixas configuráveis
- [ ] Atualizar MonthlyBudget.tsx: receitas dinâmicas (income_fields + income_values)
- [ ] Atualizar MonthlyBudget.tsx: contas fixas dinâmicas (fixed_bill_fields + fixed_bill_values)
- [ ] Remover nomes pessoais hardcoded (Itaú, C6, XP, Carteira Fer, etc.)
- [ ] Adicionar rota /orcamento/configuracoes no App.tsx
- [ ] Adicionar link Configurações na sidebar do orçamento

## Gestão de Tempo - Correções
- [ ] Corrigir bug: tarefa sem data não aparece no backlog
- [ ] Adicionar campo scheduledDate opcional (null = backlog) no schema tasks
- [ ] Reescrever GestaoTempo.tsx idêntico ao original: agrupamento por categoria+emoji
- [ ] Seção Concluídas colapsável com tarefas tachadas
- [ ] Coluna TIMER com tempo executado em verde
- [ ] Modal Nova Tarefa: Tríade como botões grandes, campo Hora, checkbox Recorrente
- [ ] Barra de score em fundo escuro com % por categoria

## 3 Sugestões Pendentes (prometidas após Stripe)
- [ ] E-mail automático de boas-vindas ao receber checkout.session.completed no webhook
- [ ] Configurar webhook Stripe no Dashboard (instruções claras para o usuário)
- [ ] Promover conta do owner para admin automaticamente no primeiro login

## Replicação Fiel - categoryId nas Tasks
- [ ] Adicionar campo categoryId (nullable FK para categories) na tabela tasks
- [ ] Adicionar campo scheduledTime varchar(5) na tabela tasks
- [ ] Adicionar campo isRecurring boolean na tabela tasks
- [ ] Migrar banco com pnpm db:push
- [ ] Atualizar tasks.create/update no routers.ts para incluir categoryId, scheduledTime, isRecurring
- [ ] Reescrever GestaoTempo.tsx: agrupamento por categoria do usuário (emoji + nome)
- [ ] Seção Concluídas colapsável dentro de cada grupo de categoria
- [ ] Modal Nova Tarefa: botões grandes Tríade + dropdown categoria com emoji + campo Hora + checkbox Recorrente

## Bugs Críticos Reportados (10/04/2026)
- [x] BUG: updateBillEntry no db.ts não aceita campo description (billKey) — corrigir para atualizar o nome do lançamento
- [x] BUG: OrcamentoSettings não tem rota registrada no App.tsx — adicionar rota e link na sidebar
- [x] BUG: cartões com nomes genéricos (Cartão 1, 2, 3) pois payment_methods está vazio — redirecionar usuário para configurações
- [x] BUG: timer de tarefa reseta ao trocar de aba — persistir estado no localStorage
- [x] BUG: erro ao salvar contas a pagar — investigar e corrigir (banco funciona, problema era nomes hardcoded antigos)

## Bugs Corrigidos (10/04/2026 - Sessão 2)
- [x] BUG CRÍTICO: erro ao lançar despesas — colunas installmentGroupId, installmentNumber, installmentTotal ausentes no banco (migração aplicada)
- [x] BUG: timer do GestaoTempo não roda — corrigido closure stale no useEffect (usar startedAtMs local)
- [x] BUG: indicador de tarefa ativa ausente na sidebar — adicionado ponto pulsante verde + cronômetro ao lado de "Tríade do Tempo"

## Bugs GestaoTempo (10/04/2026 - Sessão 3)
- [x] BUG: timer não cronometra na tela ao dar play (separado updateTaskStatus de updateTask para não resetar form/fechar diálogo)
- [x] BUG: não consegue criar tarefa sem data (backlog) — scheduledDate era NOT NULL no banco, migração aplicada
- [x] BUG: não consegue apagar tarefas pendentes na aba planejamento — adicionado botão Trash2 no hover das tarefas do backlog e dos dias da semana

## PWA / Ícone (13/04/2026)
- [x] Gerar ícone personalizado (raio azul/índigo) para tela inicial do celular
- [x] Configurar manifest.json com ícones 192x192 e 512x512
- [x] Adicionar meta tags apple-touch-icon e theme-color no index.html

## Ferramentas / Aprender (13/04/2026)
- [x] Criar página Ferramentas com sub-aba Aprender
- [x] Exibir guias de instalação iPhone e Android na sub-aba Aprender (sub-aba Instalar App)
- [x] Adicionar rota /ferramentas na sidebar (substituiu link Aprender)

## Logo / Ícone Sidebar (13/04/2026)
- [x] Substituir ícone do raio (Zap) pelo novo logo com cifrão na sidebar e no sistema
