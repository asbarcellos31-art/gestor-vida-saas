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
