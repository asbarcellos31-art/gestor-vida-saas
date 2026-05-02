# Guia de Migração para Railway

## Pré-requisitos
- Conta no Railway (https://railway.app)
- Projeto criado no Railway
- GitHub conectado ao Railway
- TablePlus instalado (para gerenciar o banco)

## Passo 1: Criar Banco de Dados MySQL no Railway

1. Acesse seu projeto no Railway
2. Clique em **"+ New"** → **"Database"** → **"MySQL"**
3. Aguarde a criação (leva ~2 minutos)
4. Copie a **DATABASE_URL** que aparecerá nas variáveis de ambiente

## Passo 2: Configurar Variáveis de Ambiente no Railway

1. No painel do Railway, vá em **"Variables"**
2. Adicione todas as variáveis do arquivo `.env.example`:
   - `DATABASE_URL` (copiada do MySQL)
   - `JWT_SECRET`
   - `VITE_APP_ID`
   - `OAUTH_SERVER_URL`
   - `VITE_OAUTH_PORTAL_URL`
   - `OWNER_NAME`
   - `OWNER_OPEN_ID`
   - `BUILT_IN_FORGE_API_URL`
   - `BUILT_IN_FORGE_API_KEY`
   - `VITE_FRONTEND_FORGE_API_URL`
   - `VITE_FRONTEND_FORGE_API_KEY`
   - `SENDGRID_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_ANALYTICS_ENDPOINT`
   - `VITE_ANALYTICS_WEBSITE_ID`
   - `VITE_APP_TITLE`
   - `VITE_APP_LOGO`

## Passo 3: Exportar Dados da Manus (Opcional)

Se você quer migrar dados existentes:

```bash
# Exportar schema e dados
mysqldump -u user -p database_name > backup.sql

# Importar no Railway via TablePlus
# 1. Abra TablePlus
# 2. Conecte com a DATABASE_URL do Railway
# 3. Importe o arquivo backup.sql
```

## Passo 4: Executar Migrations

1. No Railway, vá em **"Deployments"**
2. Clique em **"Deploy"** (ou aguarde auto-deploy do GitHub)
3. O Railway rodará automaticamente:
   ```bash
   pnpm install
   pnpm db:push
   pnpm build
   pnpm start
   ```

## Passo 5: Conectar Domínio

1. No Railway, vá em **"Settings"** → **"Domains"**
2. Adicione seu domínio `gestordevida.com.br`
3. Configure os DNS records conforme instruído pelo Railway

## Passo 6: Testar

1. Acesse `https://gestordevida.com.br`
2. Teste o login
3. Verifique se os dados estão sendo salvos corretamente

## Troubleshooting

**Erro de conexão ao banco:**
- Verifique se a `DATABASE_URL` está correta
- Certifique-se de que o MySQL está rodando no Railway
- Teste a conexão via TablePlus

**Erro de variáveis de ambiente:**
- Verifique se todas as variáveis foram adicionadas no Railway
- Redeploy o projeto após adicionar variáveis

**Erro de build:**
- Verifique os logs no Railway
- Certifique-se de que `pnpm install` foi executado
- Verifique se há erros de TypeScript

## Próximos Passos

1. Monitorar logs no Railway
2. Configurar backups automáticos
3. Configurar alertas para downtime
4. Desativar o projeto na Manus após confirmar tudo funcionando
