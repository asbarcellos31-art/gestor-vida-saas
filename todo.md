# Gestor de Vida SaaS - TODO

## Banco de Dados e Schema
- [x] Tabela de assinaturas (subscriptions)
- [x] Tabela de tarefas (tasks) - Gestão de Tempo
- [x] Tabela de sessões de tempo (time_sessions)
- [x] Tabela de entradas financeiras (budget_entries)
- [x] Tabela de contas parceladas (installments)
- [x] Tabela de projeção de aposentadoria (retirement_projections)
- [x] Migrar schema com pnpm db:push

## Backend - Assinaturas e Stripe
- [ ] Integração Stripe (checkout, webhooks, portal) — pendente configuração de chaves
- [x] Procedimento de criar assinatura (simulado)
- [x] Procedimento de cancelar assinatura
- [x] Procedimento de upgrade/downgrade de plano
- [x] Middleware de verificação de acesso ao módulo
- [ ] Webhook Stripe para atualizar status da assinatura — pendente Stripe

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
- [ ] Fluxo de checkout Stripe — pendente configuração de chaves
- [ ] Página de sucesso pós-assinatura — pendente Stripe
- [ ] Portal de gerenciamento de assinatura — pendente Stripe

## Testes
- [x] Testes de autenticação
- [x] Testes de controle de acesso por plano
- [x] Testes de CRUD de tarefas (acesso bloqueado sem plano)
- [x] Testes de CRUD de entradas financeiras (acesso bloqueado sem plano)
- [x] Testes de cálculo 50/30/20
- [x] Testes de projeção de aposentadoria
