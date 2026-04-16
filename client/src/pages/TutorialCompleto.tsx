import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, BookOpen, Clock, DollarSign, BarChart2, CreditCard, TrendingUp, Settings, Home } from "lucide-react";
import { useLocation } from "wouter";

interface Step {
  title: string;
  content: React.ReactNode;
}

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  steps: Step[];
}

const SECTIONS: Section[] = [
  {
    id: "primeiros-passos",
    icon: <Home size={20} />,
    title: "Primeiros Passos",
    description: "Como criar sua conta, fazer login e entender o dashboard principal.",
    color: "violet",
    steps: [
      {
        title: "Criar sua conta",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Acesse a página inicial do sistema e clique em <strong>"Começar grátis"</strong> ou <strong>"Criar conta"</strong>.</p>
            <p>Preencha os campos obrigatórios:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Nome completo</strong> — como você quer ser chamado no sistema</li>
              <li><strong>E-mail</strong> — será usado para login e recuperação de senha</li>
              <li><strong>Senha</strong> — mínimo de 8 caracteres</li>
              <li><strong>Confirmar senha</strong> — repita a senha para confirmar</li>
            </ul>
            <p>Clique em <strong>"Criar conta"</strong>. Você será redirecionado automaticamente para o dashboard. Acesse <strong>Planos</strong> na sidebar para liberar os módulos.</p>
          </div>
        ),
      },
      {
        title: "Fazer login",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Na página de login, informe seu <strong>e-mail</strong> e <strong>senha</strong> cadastrados e clique em <strong>"Entrar"</strong>.</p>
            <p>Caso tenha esquecido a senha, clique em <strong>"Esqueci minha senha"</strong> e siga as instruções enviadas ao seu e-mail.</p>
            <p>Após o login, você será direcionado ao <strong>Dashboard Principal</strong>.</p>
          </div>
        ),
      },
      {
        title: "Entender o Dashboard Principal",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>O dashboard exibe um resumo do seu dia e do seu mês em quatro cards:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Score de Produtividade</strong> — percentual calculado com base nas tarefas concluídas nos últimos 30 dias</li>
              <li><strong>Tarefas concluídas hoje</strong> — quantas tarefas você finalizou no dia atual</li>
              <li><strong>Saldo do mês</strong> — diferença entre receitas e despesas do mês corrente</li>
              <li><strong>Receita do mês</strong> — total de entradas lançadas no mês</li>
            </ul>
            <p>Abaixo dos cards há dois painéis de acesso rápido: <strong>Gestão do Tempo</strong> e <strong>Orçamento Doméstico</strong>. Clique em <strong>"Abrir"</strong> em qualquer um deles para ir direto ao módulo.</p>

            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/01_dashboard_5214eb46.webp" alt="Dashboard Principal" className="w-full object-contain" />
              <p className="text-xs text-muted-foreground/70 text-center py-1 bg-muted/30">Dashboard Principal do sistema</p>
            </div>
          </div>
        ),
      },
      {
        title: "Navegar pelo sistema",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>A <strong>barra lateral esquerda</strong> (sidebar) é o menu principal do sistema. Ela está organizada em grupos:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Dashboard</strong> — página inicial com resumo geral</li>
              <li><strong>Gestão do Tempo</strong> — módulo de tarefas e produtividade</li>
              <li><strong>Orçamento</strong> — submenu com Mês Atual, Dashboard Anual, Parcelados, Aposentadoria e Configurações</li>
              <li><strong>Meu Plano</strong> — visualizar e gerenciar sua assinatura</li>
              <li><strong>Ferramentas</strong> — tutoriais, calculadoras e conteúdo educativo</li>
            </ul>
            <p>No canto superior direito da sidebar você encontra seu <strong>nome e avatar</strong>. Clique nele para acessar opções de perfil e sair do sistema.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: "gestao-tempo",
    icon: <Clock size={20} />,
    title: "Gestão do Tempo",
    description: "Como classificar, criar e acompanhar suas tarefas diárias.",
    color: "blue",
    steps: [
      {
        title: "Entender as 3 categorias de tarefas",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Antes de criar qualquer tarefa, entenda as três categorias do método de Gestão do Tempo:</p>
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-800">🎯 Importante</p>
                <p className="text-blue-700 mt-1">Tarefas que constroem seu futuro. Não têm prazo imediato, mas são estratégicas. Exemplo: elaborar proposta comercial, desenvolver novo produto, planejar expansão.</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold text-red-800">🔥 Urgente</p>
                <p className="text-red-700 mt-1">Tarefas com prazo imediato que não podem esperar. Geralmente surgem de crises ou atrasos. Exemplo: cliente aguardando resposta hoje, fornecedor com prazo vencendo, documento para envio imediato.</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="font-semibold text-yellow-800">⚡ Circunstancial</p>
                <p className="text-yellow-700 mt-1">Tarefas que aparecem no caminho mas não são prioritárias. Podem ser delegadas ou adiadas. Exemplo: reunião sem pauta definida, e-mail de rotina, aprovação burocrática.</p>
              </div>
            </div>
            <p className="font-medium text-foreground">A chave do método: antecipe o que é Importante e Circunstancial antes que se torne Urgente. Quem planeja com antecedência passa menos tempo apagando incêndios.</p>
          </div>
        ),
      },
      {
        title: "Criar uma nova tarefa",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Acesse <strong>Gestão do Tempo</strong> na sidebar. Você estará na aba <strong>"Meu Dia"</strong>.</p>
            <p>Clique no botão <strong>"+ Nova Tarefa"</strong> (canto superior direito). Um formulário será exibido com os seguintes campos:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Título</strong> — descreva a tarefa de forma clara e objetiva (ex: "Enviar proposta para cliente XYZ")</li>
              <li><strong>Categoria</strong> — selecione entre Importante, Urgente ou Circunstancial</li>
              <li><strong>Duração estimada</strong> — quanto tempo você prevê para concluir a tarefa (em minutos)</li>
              <li><strong>Data</strong> — quando a tarefa deve ser realizada. Deixe em branco para adicionar ao backlog</li>
              <li><strong>Descrição</strong> — campo opcional para detalhes adicionais</li>
            </ul>
            <p>Clique em <strong>"Criar Tarefa"</strong> para salvar. A tarefa aparecerá na lista do dia correspondente.</p>
            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/02_gestao_tempo_5f707ede.webp" alt="Gestão do Tempo" className="w-full object-contain" />
              <p className="text-xs text-muted-foreground/70 text-center py-1 bg-muted/30">Módulo de Gestão do Tempo com tarefas criadas</p>
            </div>
          </div>
        ),
      },
      {
        title: "Executar e controlar o tempo de uma tarefa",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Na lista de tarefas do dia, cada item exibe:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Nome da tarefa</strong> e sua categoria (cor da bolinha)</li>
              <li><strong>Duração estimada</strong> em minutos</li>
              <li><strong>Timer</strong> — mostra o tempo executado em tempo real</li>
            </ul>
            <p>Para iniciar o timer de uma tarefa, clique no botão <strong>▶ (Play)</strong> ao lado dela. O tempo começa a contar. Clique em <strong>⏸ (Pause)</strong> para pausar e retomar depois.</p>
            <p>Quando finalizar a tarefa, clique em <strong>✓ (Concluir)</strong>. A tarefa será movida para a seção <strong>"Concluídas"</strong> no final da lista, com o tempo total executado registrado.</p>
            <p><strong>Dica:</strong> você pode editar ou excluir qualquer tarefa clicando no ícone de lápis ou lixeira ao passar o mouse sobre ela.</p>
          </div>
        ),
      },
      {
        title: "Usar o Planejamento Semanal",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Clique na aba <strong>"Planejamento"</strong> dentro de Gestão do Tempo. Você verá uma visão dos 7 dias da semana atual.</p>
            <p>O planejamento semanal serve para <strong>distribuir suas tarefas com antecedência</strong>. Ao criar uma tarefa com data futura, ela aparecerá automaticamente no dia correspondente.</p>
            <p>Use esta tela para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Verificar se algum dia está sobrecarregado e redistribuir tarefas</li>
              <li>Garantir que tarefas Importantes tenham espaço na semana antes de virarem Urgentes</li>
              <li>Visualizar o total de horas planejadas por dia</li>
            </ul>
            <p>Navegue entre semanas usando as setas <strong>{"<"} {">"}</strong> no cabeçalho da tela.</p>
          </div>
        ),
      },
      {
        title: "Acompanhar o Relatório de Produtividade",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Clique na aba <strong>"Relatório"</strong> dentro de Gestão do Tempo.</p>
            <p>O relatório exibe:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Score de Produtividade (30 dias)</strong> — percentual calculado com base na proporção de tarefas Importantes e Urgentes concluídas vs. Circunstanciais</li>
              <li><strong>Distribuição por categoria</strong> — gráfico mostrando quanto do seu tempo foi dedicado a cada tipo de tarefa</li>
              <li><strong>Horas planejadas vs. executadas</strong> — comparativo entre o que você estimou e o que realmente levou</li>
              <li><strong>Histórico diário</strong> — linha do tempo dos últimos 30 dias com tarefas concluídas por dia</li>
            </ul>
            <p><strong>Meta ideal:</strong> manter o score acima de 70%, com a maior parte do tempo dedicado a tarefas Importantes.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: "orcamento",
    icon: <DollarSign size={20} />,
    title: "Orçamento Doméstico",
    description: "Como lançar receitas, despesas, contas fixas e controlar seu orçamento mensal.",
    color: "green",
    steps: [
      {
        title: "Entender a Regra 50/30/20",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>O módulo de Orçamento é baseado na <strong>Regra 50/30/20</strong>, um método simples para distribuir sua renda:</p>
            <div className="space-y-2">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-800">50% — Essenciais</p>
                <p className="text-green-700 mt-1">Gastos necessários para viver: moradia, alimentação, transporte, saúde, contas fixas.</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-800">30% — Estilo de Vida</p>
                <p className="text-blue-700 mt-1">Gastos de conforto e prazer: lazer, restaurantes, assinaturas, roupas, viagens.</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-semibold text-purple-800">20% — Futuro</p>
                <p className="text-purple-700 mt-1">Investimentos, poupança, reserva de emergência e aposentadoria.</p>
              </div>
            </div>
            <p>O sistema calcula automaticamente em qual bucket cada despesa se encaixa com base na categoria selecionada ao lançar.</p>
          </div>
        ),
      },
      {
        title: "Lançar receitas (entradas)",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Acesse <strong>Orçamento → Mês Atual</strong> na sidebar. Você verá a tela do mês corrente dividida em seções.</p>
            <p>Na seção <strong>"Receitas"</strong>, clique em <strong>"+ Adicionar"</strong>. Preencha:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Descrição</strong> — nome da fonte de renda (ex: "Salário", "Freelance", "Aluguel recebido")</li>
              <li><strong>Valor</strong> — valor bruto recebido em reais</li>
              <li><strong>Data</strong> — data de recebimento</li>
              <li><strong>Membro familiar</strong> — a quem pertence essa receita (útil para famílias com mais de um provedor)</li>
            </ul>
            <p>Clique em <strong>"Salvar"</strong>. A receita aparecerá na lista e o total de entradas do mês será atualizado automaticamente.</p>
            <p><strong>Dica:</strong> lance todas as fontes de renda do mês antes de lançar despesas, para que o sistema calcule corretamente os percentuais da Regra 50/30/20.</p>
            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/03_orcamento_302f95e5.webp" alt="Orçamento Mensal" className="w-full object-contain" />
              <p className="text-xs text-muted-foreground/70 text-center py-1 bg-muted/30">Tela de Orçamento Mensal com receitas e despesas lançadas</p>
            </div>
          </div>
        ),
      },
      {
        title: "Lançar despesas variáveis",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Na tela do mês, role até a seção <strong>"Despesas"</strong> e clique em <strong>"+ Adicionar despesa"</strong>. Preencha:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Descrição</strong> — o que foi gasto (ex: "Supermercado", "Farmácia", "Uber")</li>
              <li><strong>Valor</strong> — quanto foi gasto</li>
              <li><strong>Categoria</strong> — selecione a categoria que melhor descreve o gasto. A categoria determina em qual bucket (50/30/20) a despesa será contabilizada</li>
              <li><strong>Forma de pagamento</strong> — dinheiro, Pix, cartão de débito, cartão de crédito, etc.</li>
              <li><strong>Data</strong> — quando o gasto ocorreu</li>
              <li><strong>Membro familiar</strong> — a quem pertence o gasto</li>
            </ul>
            <p>Clique em <strong>"Salvar"</strong>. A despesa será adicionada à lista e o saldo do mês será recalculado.</p>
          </div>
        ),
      },
      {
        title: "Lançar contas fixas",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Contas fixas são despesas que se repetem todo mês com valor igual ou similar (aluguel, plano de saúde, internet, etc.).</p>
            <p>Na tela do mês, localize a seção <strong>"Contas Fixas"</strong>. As contas fixas cadastradas nas configurações aparecem aqui automaticamente. Para confirmar o pagamento de uma conta fixa:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Clique no ícone de <strong>✓ (pago)</strong> ao lado da conta para marcá-la como paga no mês</li>
              <li>Se o valor mudou, clique no lápis para editar o valor daquele mês específico</li>
            </ul>
            <p>Para adicionar uma nova conta fixa que não está na lista, acesse <strong>Orçamento → Configurações</strong> e cadastre-a lá. Ela passará a aparecer em todos os meses futuros automaticamente.</p>
          </div>
        ),
      },
      {
        title: "Lançar despesas parceladas",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Para compras parceladas (cartão de crédito, financiamentos, etc.), acesse <strong>Orçamento → Parcelados</strong> na sidebar ou clique em <strong>"+ Adicionar parcelado"</strong> dentro da tela do mês.</p>
            <p>Preencha o formulário de parcelado:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Descrição</strong> — o que foi comprado (ex: "Notebook Dell", "Geladeira", "Curso online")</li>
              <li><strong>Valor total</strong> — valor total da compra</li>
              <li><strong>Número de parcelas</strong> — em quantas vezes foi parcelado (ex: 12)</li>
              <li><strong>Valor da parcela</strong> — calculado automaticamente ou preenchido manualmente</li>
              <li><strong>Data da primeira parcela</strong> — mês em que a primeira parcela será cobrada</li>
              <li><strong>Forma de pagamento</strong> — qual cartão ou método</li>
              <li><strong>Categoria</strong> — para classificação no 50/30/20</li>
            </ul>
            <p>Clique em <strong>"Salvar"</strong>. O sistema distribuirá automaticamente o valor da parcela em cada mês correspondente. Você verá o parcelado aparecer no orçamento de cada mês até a quitação.</p>
            <p><strong>Dica:</strong> na tela de Parcelados você tem uma visão de todos os parcelados ativos, com o valor mensal comprometido e a data de quitação de cada um.</p>
            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/04_parcelados_c38a7d80.webp" alt="Contas Parceladas" className="w-full object-contain" />
              <p className="text-xs text-muted-foreground/70 text-center py-1 bg-muted/30">Tela de Contas Parceladas com parcelados ativos</p>
            </div>
          </div>
        ),
      },
      {
        title: "Visualizar o resumo 50/30/20",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Na tela do mês, role até o final para ver o <strong>Resumo 50/30/20</strong>. Ele mostra:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Quanto você gastou</strong> em cada bucket (Essenciais, Estilo de Vida, Futuro)</li>
              <li><strong>Quanto deveria gastar</strong> com base na sua renda do mês</li>
              <li><strong>Diferença</strong> — se está acima ou abaixo do ideal em cada categoria</li>
            </ul>
            <p>Use este resumo para identificar onde você está gastando mais do que deveria e ajustar o comportamento nos próximos meses.</p>
            <p>O <strong>saldo final</strong> (receitas menos todas as despesas) aparece em destaque. Verde indica saldo positivo; vermelho indica que você gastou mais do que ganhou no mês.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: "parcelados",
    icon: <CreditCard size={20} />,
    title: "Contas Parceladas",
    description: "Como gerenciar e acompanhar todas as suas compras parceladas.",
    color: "orange",
    steps: [
      {
        title: "Acessar a tela de Parcelados",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Acesse <strong>Orçamento → Parcelados</strong> na sidebar. Esta tela exibe todos os parcelamentos ativos em uma única visão.</p>
            <p>Para cada parcelado você verá:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Nome</strong> da compra parcelada</li>
              <li><strong>Valor da parcela</strong> mensal</li>
              <li><strong>Parcelas pagas / total</strong> (ex: 3/12)</li>
              <li><strong>Valor restante</strong> a pagar</li>
              <li><strong>Data de quitação</strong> prevista</li>
              <li><strong>Forma de pagamento</strong> associada</li>
            </ul>
          </div>
        ),
      },
      {
        title: "Editar ou encerrar um parcelado",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Para <strong>editar</strong> um parcelado (ex: o valor da parcela mudou), clique no ícone de lápis ao lado do item. Você poderá alterar a descrição, valor da parcela e categoria.</p>
            <p>Para <strong>encerrar antecipadamente</strong> um parcelado (quitação à vista), clique no ícone de lixeira. O sistema removerá as parcelas futuras do orçamento dos meses seguintes.</p>
            <p><strong>Atenção:</strong> ao excluir um parcelado, as parcelas já registradas em meses anteriores são mantidas no histórico. Apenas as parcelas futuras são removidas.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: "aposentadoria",
    icon: <TrendingUp size={20} />,
    title: "Simulador de Aposentadoria",
    description: "Como projetar sua aposentadoria com base no seu orçamento real.",
    color: "teal",
    steps: [
      {
        title: "Acessar e configurar o simulador",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Acesse <strong>Orçamento → Aposentadoria</strong> na sidebar.</p>
            <p>Na primeira vez, preencha os dados de configuração:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Idade atual</strong> — sua idade hoje</li>
              <li><strong>Idade de aposentadoria desejada</strong> — quando você quer parar de trabalhar</li>
              <li><strong>Valor atual investido</strong> — quanto você já tem guardado/investido hoje</li>
              <li><strong>Aporte mensal atual</strong> — quanto você investe por mês atualmente (o sistema sugere com base nos seus lançamentos de "Futuro" no orçamento)</li>
              <li><strong>Renda desejada na aposentadoria</strong> — quanto você quer receber por mês quando se aposentar</li>
            </ul>
            <p>Clique em <strong>"Calcular"</strong> para gerar as projeções.</p>
            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/05_aposentadoria_b016b442.webp" alt="Simulador de Aposentadoria" className="w-full object-contain" />
              <p className="text-xs text-muted-foreground/70 text-center py-1 bg-muted/30">Simulador de Aposentadoria com os 3 cenários de projeção</p>
            </div>
          </div>
        ),
      },
      {
        title: "Interpretar os 3 cenários",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>O simulador gera três projeções com diferentes taxas de retorno:</p>
            <div className="space-y-2">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold text-red-800">Cenário Pessimista</p>
                <p className="text-red-700 mt-1">Taxa de retorno conservadora (próxima à poupança). Mostra o mínimo que você pode esperar se os investimentos tiverem baixo rendimento.</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="font-semibold text-yellow-800">Cenário Regular</p>
                <p className="text-yellow-700 mt-1">Taxa de retorno moderada (renda fixa / Tesouro Direto). O cenário mais provável para investidores conservadores.</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-800">Cenário Otimista</p>
                <p className="text-green-700 mt-1">Taxa de retorno mais alta (carteira diversificada com renda variável). Requer maior tolerância ao risco.</p>
              </div>
            </div>
            <p>Use os cenários para entender <strong>o quanto você precisa guardar por mês</strong> para atingir sua meta de aposentadoria em cada situação.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: "dashboard-anual",
    icon: <BarChart2 size={20} />,
    title: "Dashboard Anual",
    description: "Como visualizar a evolução financeira do ano completo.",
    color: "indigo",
    steps: [
      {
        title: "Acessar o Dashboard Anual",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Acesse <strong>Orçamento → Dashboard Anual</strong> na sidebar.</p>
            <p>Esta tela exibe um resumo financeiro de todos os meses do ano em uma única visão, com:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Gráfico de barras mensal</strong> — receitas vs. despesas mês a mês</li>
              <li><strong>Saldo acumulado</strong> — evolução do saldo ao longo do ano</li>
              <li><strong>Distribuição 50/30/20 anual</strong> — média anual de cada bucket</li>
              <li><strong>Meses com saldo negativo</strong> — destacados em vermelho para fácil identificação</li>
            </ul>
            <p>Use o seletor de ano no topo da tela para navegar entre anos anteriores e o ano atual.</p>
            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/06_dashboard_anual_09f2fb4f.webp" alt="Dashboard Anual" className="w-full object-contain" />
              <p className="text-xs text-muted-foreground/70 text-center py-1 bg-muted/30">Dashboard Anual com gráficos de receita vs. despesas</p>
            </div>
          </div>
        ),
      },
      {
        title: "Navegar entre meses pelo Dashboard",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>No Dashboard Anual, clique em qualquer <strong>card de mês</strong> para ir diretamente ao orçamento detalhado daquele mês.</p>
            <p>Isso facilita a navegação entre meses sem precisar usar o menu lateral. Você pode comparar dois meses clicando em um, voltando ao dashboard e clicando em outro.</p>
            <p>Os meses futuros (que ainda não chegaram) aparecem com dados em branco — você pode lançar despesas futuras neles para planejamento antecipado.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: "planos",
    icon: <Settings size={20} />,
    title: "Planos e Assinatura",
    description: "Como escolher um plano e liberar o acesso vitalício ao sistema.",
    color: "rose",
    steps: [
      {
        title: "Escolher um plano",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Acesse <strong>Planos</strong> na sidebar. O sistema oferece três opções de pagamento único — sem mensalidade, sem recorrência:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>E-book</strong> — R$ 19,90 (pagamento único) — Guia PDF Método 3 Pilares da Vida</li>
              <li><strong>Sistema Vitalício</strong> — R$ 250,00 (acesso vitalício) — todos os módulos do sistema</li>
              <li><strong>Combo Promocional</strong> — R$ 147,90 (acesso vitalício) — E-book + Sistema com desconto</li>
            </ul>
            <p>Clique em <strong>"Comprar agora"</strong> no plano desejado. Você será redirecionado para a página de pagamento segura. Pague uma vez e use para sempre.</p>
          </div>
        ),
      },
      {
        title: "Realizar o pagamento",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Na página de pagamento do Stripe, preencha:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Número do cartão</strong> — cartão de crédito ou débito</li>
              <li><strong>Data de validade</strong> — no formato MM/AA</li>
              <li><strong>CVV</strong> — código de segurança de 3 dígitos</li>
              <li><strong>Nome no cartão</strong> — exatamente como está impresso</li>
            </ul>
            <p>Clique em <strong>"Pagar"</strong>. Após a confirmação, você será redirecionado de volta ao sistema com o plano ativado imediatamente.</p>
            <p><strong>Segurança:</strong> todos os dados de pagamento são processados diretamente pelo Stripe, uma das plataformas de pagamento mais seguras do mundo. O sistema nunca armazena dados do seu cartão.</p>
          </div>
        ),
      },
      {
        title: "Gerenciar sua assinatura",
        content: (
          <div className="space-y-3 text-sm text-foreground/90">
            <p>Acesse <strong>Meu Plano</strong> na sidebar para ver os detalhes da sua assinatura atual: plano contratado, data de renovação e valor.</p>
            <p>Clique em <strong>"Gerenciar assinatura"</strong> para acessar o portal do Stripe, onde você pode:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Atualizar o cartão de pagamento</li>
              <li>Fazer upgrade ou downgrade de plano</li>
              <li>Visualizar o histórico de cobranças e notas fiscais</li>
              <li>Cancelar a assinatura</li>
            </ul>
            <p><strong>Cancelamento:</strong> ao cancelar, você mantém acesso até o final do período já pago. Após o vencimento, os módulos contratados serão bloqueados, mas seus dados permanecem salvos.</p>
          </div>
        ),
      },
    ],
  },
];

function StepItem({ step, index, isOpen, onToggle, isCompleted, onComplete }: {
  step: Step;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  isCompleted: boolean;
  onComplete: () => void;
}) {
  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${isCompleted ? "border-green-200 bg-green-50/30" : "border-border bg-card"}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <button
          onClick={(e) => { e.stopPropagation(); onComplete(); }}
          className="flex-shrink-0 text-muted-foreground/70 hover:text-green-500 transition-colors"
        >
          {isCompleted ? <CheckCircle2 size={20} className="text-green-500" /> : <Circle size={20} />}
        </button>
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted/50 text-muted-foreground text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <span className={`flex-1 font-medium text-sm ${isCompleted ? "text-green-700 line-through" : "text-foreground"}`}>
          {step.title}
        </span>
        {isOpen ? <ChevronDown size={16} className="text-muted-foreground/70 flex-shrink-0" /> : <ChevronRight size={16} className="text-muted-foreground/70 flex-shrink-0" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 ml-12 border-t border-border/50">
          <div className="pt-3">
            {step.content}
          </div>
          {!isCompleted && (
            <button
              onClick={onComplete}
              className="mt-4 text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
            >
              <CheckCircle2 size={14} /> Marcar como lido
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SectionCard({ section, isOpen, onToggle, completedSteps, onStepComplete }: {
  section: Section;
  isOpen: boolean;
  onToggle: () => void;
  completedSteps: Set<string>;
  onStepComplete: (stepKey: string) => void;
}) {
  const [openStep, setOpenStep] = useState<number | null>(null);
  const completedCount = section.steps.filter((_, i) => completedSteps.has(`${section.id}-${i}`)).length;
  const allDone = completedCount === section.steps.length;

  const colorMap: Record<string, string> = {
    violet: "bg-violet-100 text-violet-700 border-violet-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    teal: "bg-teal-100 text-teal-700 border-teal-200",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200",
  };

  const iconColor = colorMap[section.color] || colorMap.violet;

  return (
    <div className={`rounded-xl border-2 overflow-hidden transition-all ${allDone ? "border-green-300" : "border-border"}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left bg-card hover:bg-muted/30 transition-colors"
      >
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${iconColor}`}>
          {section.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{section.title}</h3>
            {allDone && <CheckCircle2 size={16} className="text-green-500" />}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{section.description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-muted-foreground font-medium">{completedCount}/{section.steps.length}</span>
          {isOpen ? <ChevronDown size={18} className="text-muted-foreground/70" /> : <ChevronRight size={18} className="text-muted-foreground/70" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border/50 bg-muted/30/50 p-4 space-y-2">
          {section.steps.map((step, i) => (
            <StepItem
              key={i}
              step={step}
              index={i}
              isOpen={openStep === i}
              onToggle={() => setOpenStep(openStep === i ? null : i)}
              isCompleted={completedSteps.has(`${section.id}-${i}`)}
              onComplete={() => onStepComplete(`${section.id}-${i}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TutorialCompleto() {
  const [, navigate] = useLocation();
  const [openSection, setOpenSection] = useState<string | null>("primeiros-passos");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const totalSteps = SECTIONS.reduce((acc, s) => acc + s.steps.length, 0);
  const completedCount = completedSteps.size;
  const progressPct = Math.round((completedCount / totalSteps) * 100);

  const handleStepComplete = (key: string) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/ferramentas")}
            className="text-muted-foreground hover:text-foreground/90 transition-colors"
          >
            ← Voltar
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-violet-600" />
              <h1 className="font-bold text-foreground">Tutorial Completo do Sistema</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">{completedCount}/{totalSteps} passos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
          <p className="text-sm text-violet-800">
            <strong>Como usar este tutorial:</strong> clique em cada seção para expandi-la, depois clique em cada passo para ver as instruções detalhadas. Marque os passos como lidos conforme avança — o progresso fica salvo na sessão.
          </p>
        </div>

        {SECTIONS.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            isOpen={openSection === section.id}
            onToggle={() => setOpenSection(openSection === section.id ? null : section.id)}
            completedSteps={completedSteps}
            onStepComplete={handleStepComplete}
          />
        ))}

        <div className="text-center py-6 text-sm text-muted-foreground">
          {completedCount === totalSteps ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold text-base">🎉 Parabéns! Você concluiu o tutorial completo.</p>
              <p>Agora você conhece todos os recursos do sistema. Bom uso!</p>
            </div>
          ) : (
            <p>Continue explorando os módulos para dominar o sistema.</p>
          )}
        </div>
      </div>
    </div>
  );
}
