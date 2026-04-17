import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            <Shield className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-foreground">Gestor de Vida</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground">Última atualização: 17 de abril de 2026</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">1. Identificação do Controlador</h2>
            <p className="text-muted-foreground leading-relaxed">
              O <strong className="text-foreground">Gestor de Vida</strong> é uma plataforma digital de organização pessoal e financeira. Para fins desta Política, o Controlador é o titular da plataforma, com contato disponível pelo e-mail: <strong className="text-foreground">contato@gestordevida.com.br</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">2. Dados Pessoais Coletados</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">A plataforma coleta os seguintes dados pessoais, conforme a finalidade de uso:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-foreground">Categoria</th>
                    <th className="text-left p-3 font-medium text-foreground">Dados Coletados</th>
                    <th className="text-left p-3 font-medium text-foreground">Finalidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="p-3 text-muted-foreground">Identificação</td><td className="p-3 text-muted-foreground">Nome completo, e-mail</td><td className="p-3 text-muted-foreground">Criação e gestão de conta</td></tr>
                  <tr><td className="p-3 text-muted-foreground">Financeiros</td><td className="p-3 text-muted-foreground">Valores de receitas, despesas, contas</td><td className="p-3 text-muted-foreground">Funcionalidades do sistema</td></tr>
                  <tr><td className="p-3 text-muted-foreground">Comportamentais</td><td className="p-3 text-muted-foreground">Data/hora de acesso, ações no sistema</td><td className="p-3 text-muted-foreground">Segurança e melhoria do serviço</td></tr>
                  <tr><td className="p-3 text-muted-foreground">Pagamento</td><td className="p-3 text-muted-foreground">Dados de transação via Stripe</td><td className="p-3 text-muted-foreground">Processamento de compras</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4 p-3 bg-violet-50 dark:bg-violet-950/20 rounded-lg border border-violet-200 dark:border-violet-800 text-sm">
              <strong className="text-foreground">Importante:</strong> A plataforma <strong className="text-foreground">não armazena</strong> dados de cartão de crédito. Todas as transações financeiras são processadas pela Stripe, Inc., que possui sua própria política de privacidade e certificação PCI-DSS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">3. Base Legal para Tratamento (Art. 7º da LGPD)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">O tratamento dos dados pessoais é realizado com fundamento nas seguintes bases legais previstas na Lei nº 13.709/2018 (LGPD):</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span><strong className="text-foreground">Execução de contrato</strong> (Art. 7º, V): para prestação dos serviços contratados pelo usuário.</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span><strong className="text-foreground">Legítimo interesse</strong> (Art. 7º, IX): para melhoria contínua da plataforma, segurança e prevenção a fraudes.</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span><strong className="text-foreground">Consentimento</strong> (Art. 7º, I): para envio de comunicações de marketing, quando aplicável.</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span><strong className="text-foreground">Cumprimento de obrigação legal</strong> (Art. 7º, II): para atendimento a requisitos fiscais e regulatórios.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">4. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Os dados pessoais poderão ser compartilhados com os seguintes terceiros, estritamente para as finalidades indicadas:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-foreground">Terceiro</th>
                    <th className="text-left p-3 font-medium text-foreground">Finalidade</th>
                    <th className="text-left p-3 font-medium text-foreground">País</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="p-3 text-muted-foreground">Stripe, Inc.</td><td className="p-3 text-muted-foreground">Processamento de pagamentos</td><td className="p-3 text-muted-foreground">EUA</td></tr>
                  <tr><td className="p-3 text-muted-foreground">Manus (infraestrutura)</td><td className="p-3 text-muted-foreground">Hospedagem e autenticação OAuth</td><td className="p-3 text-muted-foreground">—</td></tr>
                  <tr><td className="p-3 text-muted-foreground">Autoridades públicas</td><td className="p-3 text-muted-foreground">Cumprimento de obrigação legal</td><td className="p-3 text-muted-foreground">Brasil</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-3">A plataforma <strong className="text-foreground">não vende, aluga ou cede</strong> dados pessoais a terceiros para fins comerciais.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">5. Retenção e Exclusão de Dados</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span><strong className="text-foreground">Dados de conta ativa:</strong> durante toda a vigência da conta.</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span><strong className="text-foreground">Dados financeiros:</strong> por até 5 (cinco) anos após o encerramento da conta, conforme legislação fiscal.</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span><strong className="text-foreground">Dados de acesso (logs):</strong> por até 6 (seis) meses.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">6. Direitos do Titular (Art. 18 da LGPD)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">O usuário possui os seguintes direitos sobre seus dados pessoais:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span>Confirmação e acesso aos dados tratados;</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span>Correção de dados incompletos ou desatualizados;</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span>Anonimização, bloqueio ou eliminação de dados desnecessários;</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span>Portabilidade dos dados em formato estruturado;</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span>Revogação do consentimento a qualquer momento;</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span>Oposição ao tratamento realizado com base em legítimo interesse.</span></li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">Para exercer seus direitos, entre em contato: <strong className="text-foreground">contato@gestordevida.com.br</strong></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">7. Segurança dos Dados</h2>
            <p className="text-muted-foreground leading-relaxed">A plataforma adota medidas técnicas e organizacionais para proteger os dados pessoais, incluindo criptografia de dados em trânsito (TLS/HTTPS), autenticação segura via OAuth, controle de acesso por perfil de usuário e monitoramento contínuo de segurança.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">8. Encarregado de Proteção de Dados (DPO)</h2>
            <p className="text-muted-foreground leading-relaxed">Conforme o Art. 41 da LGPD, o encarregado pelo tratamento de dados pessoais pode ser contactado pelo e-mail: <strong className="text-foreground">contato@gestordevida.com.br</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">9. Alterações nesta Política</h2>
            <p className="text-muted-foreground leading-relaxed">Esta Política poderá ser atualizada periodicamente. O usuário será notificado sobre alterações relevantes por e-mail ou mediante aviso na plataforma.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">10. Lei Aplicável e Foro</h2>
            <p className="text-muted-foreground leading-relaxed">Esta Política é regida pela legislação brasileira, em especial pela Lei nº 13.709/2018 (LGPD). Fica eleito o foro da comarca do domicílio do controlador para dirimir eventuais conflitos.</p>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/termos-de-uso"><span className="hover:text-foreground cursor-pointer transition-colors">Termos de Uso</span></Link>
          <Link href="/lgpd"><span className="hover:text-foreground cursor-pointer transition-colors">Seus Direitos — LGPD</span></Link>
          <Link href="/"><span className="hover:text-foreground cursor-pointer transition-colors">Página inicial</span></Link>
        </div>
      </div>
    </div>
  );
}
