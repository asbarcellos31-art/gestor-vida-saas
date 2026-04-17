import { Link } from "wouter";
import { ArrowLeft, Lock } from "lucide-react";

export default function LGPDPage() {
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
            <Lock className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-foreground">Gestor de Vida</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Seus Direitos — LGPD</h1>
          <p className="text-sm text-muted-foreground">Lei Geral de Proteção de Dados (Lei nº 13.709/2018) — Última atualização: 17 de abril de 2026</p>
        </div>

        <div className="p-4 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-200 dark:border-violet-800 mb-8">
          <p className="text-sm text-muted-foreground leading-relaxed">
            A <strong className="text-foreground">Lei Geral de Proteção de Dados Pessoais (LGPD)</strong> garante a você, titular dos dados, um conjunto de direitos sobre como suas informações pessoais são coletadas, tratadas e armazenadas. O <strong className="text-foreground">Gestor de Vida</strong> está comprometido com o cumprimento integral desta lei.
          </p>
        </div>

        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground">Seus Direitos como Titular (Art. 18 da LGPD)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-foreground">Direito</th>
                    <th className="text-left p-3 font-medium text-foreground">O que significa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="p-3 font-medium text-foreground">Confirmação e Acesso</td><td className="p-3 text-muted-foreground">Saber se tratamos seus dados e receber uma cópia deles</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Correção</td><td className="p-3 text-muted-foreground">Corrigir dados incompletos, inexatos ou desatualizados</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Anonimização ou Eliminação</td><td className="p-3 text-muted-foreground">Solicitar a anonimização ou exclusão de dados desnecessários</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Portabilidade</td><td className="p-3 text-muted-foreground">Receber seus dados em formato estruturado para uso em outro serviço</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Informação sobre compartilhamento</td><td className="p-3 text-muted-foreground">Saber com quais terceiros seus dados são compartilhados</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Revogação do consentimento</td><td className="p-3 text-muted-foreground">Retirar seu consentimento a qualquer momento</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Oposição</td><td className="p-3 text-muted-foreground">Opor-se a tratamentos realizados sem seu consentimento</td></tr>
                  <tr><td className="p-3 font-medium text-foreground">Revisão de decisões automatizadas</td><td className="p-3 text-muted-foreground">Solicitar revisão de decisões tomadas exclusivamente por algoritmos</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Como Exercer Seus Direitos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Para exercer qualquer um dos direitos acima, entre em contato conosco:</p>
            <div className="p-4 bg-card border border-border rounded-xl space-y-2">
              <p className="text-sm"><span className="text-muted-foreground">E-mail:</span> <strong className="text-foreground">contato@gestordevida.com.br</strong></p>
              <p className="text-sm"><span className="text-muted-foreground">Prazo de resposta:</span> <strong className="text-foreground">até 15 dias úteis</strong></p>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4 text-sm">Informe no e-mail: (1) seu nome completo e e-mail cadastrado; (2) o direito que deseja exercer; (3) qualquer informação adicional que facilite o atendimento.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Dados que Coletamos e Por Quê</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-foreground">Dado</th>
                    <th className="text-left p-3 font-medium text-foreground">Base Legal</th>
                    <th className="text-left p-3 font-medium text-foreground">Finalidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="p-3 text-muted-foreground">Nome e e-mail</td><td className="p-3 text-muted-foreground">Execução de contrato (Art. 7º, V)</td><td className="p-3 text-muted-foreground">Identificação e acesso à conta</td></tr>
                  <tr><td className="p-3 text-muted-foreground">Dados financeiros inseridos</td><td className="p-3 text-muted-foreground">Execução de contrato (Art. 7º, V)</td><td className="p-3 text-muted-foreground">Funcionamento das ferramentas</td></tr>
                  <tr><td className="p-3 text-muted-foreground">Logs de acesso</td><td className="p-3 text-muted-foreground">Legítimo interesse (Art. 7º, IX)</td><td className="p-3 text-muted-foreground">Segurança e prevenção a fraudes</td></tr>
                  <tr><td className="p-3 text-muted-foreground">Dados de pagamento</td><td className="p-3 text-muted-foreground">Execução de contrato (Art. 7º, V)</td><td className="p-3 text-muted-foreground">Processamento via Stripe</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Retenção dos Dados</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span><strong className="text-foreground">Conta ativa:</strong> durante toda a vigência;</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span><strong className="text-foreground">Após encerramento:</strong> dados financeiros por até 5 anos (obrigação fiscal);</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span><strong className="text-foreground">Logs de acesso:</strong> até 6 meses.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Encarregado de Dados (DPO)</h2>
            <p className="text-muted-foreground leading-relaxed">Nosso Encarregado de Proteção de Dados está disponível para esclarecer dúvidas sobre o tratamento de dados pessoais: <strong className="text-foreground">contato@gestordevida.com.br</strong></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Reclamação à ANPD</h2>
            <p className="text-muted-foreground leading-relaxed">Caso considere que seus direitos não foram atendidos adequadamente, você pode apresentar reclamação à <strong className="text-foreground">Autoridade Nacional de Proteção de Dados (ANPD)</strong>:</p>
            <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-violet-500 hover:text-violet-400 text-sm font-medium">www.gov.br/anpd →</a>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/politica-de-privacidade"><span className="hover:text-foreground cursor-pointer transition-colors">Política de Privacidade</span></Link>
          <Link href="/termos-de-uso"><span className="hover:text-foreground cursor-pointer transition-colors">Termos de Uso</span></Link>
          <Link href="/"><span className="hover:text-foreground cursor-pointer transition-colors">Página inicial</span></Link>
        </div>
      </div>
    </div>
  );
}
