import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfUse() {
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
            <FileText className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-foreground">Gestor de Vida</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Termos de Uso</h1>
          <p className="text-sm text-muted-foreground">Última atualização: 17 de abril de 2026</p>
        </div>

        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar ou utilizar a plataforma <strong className="text-foreground">Gestor de Vida</strong> ("Plataforma"), o usuário declara ter lido, compreendido e concordado integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição, o usuário deverá cessar imediatamente o uso da Plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">O Gestor de Vida é uma plataforma digital de organização pessoal que oferece as seguintes funcionalidades:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-foreground">Módulo</th>
                    <th className="text-left p-3 font-medium text-foreground">Descrição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="p-3 text-muted-foreground font-medium">Gestão de Tempo</td><td className="p-3 text-muted-foreground">Planejamento de tarefas, timer Pomodoro e produtividade</td></tr>
                  <tr><td className="p-3 text-muted-foreground font-medium">Orçamento Doméstico</td><td className="p-3 text-muted-foreground">Controle de receitas, despesas, contas fixas e parcelamentos</td></tr>
                  <tr><td className="p-3 text-muted-foreground font-medium">Projeção de Aposentadoria</td><td className="p-3 text-muted-foreground">Simulação e planejamento financeiro de longo prazo</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">3. Cadastro e Conta do Usuário</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">3.1</strong> Para utilizar a Plataforma, o usuário deve criar uma conta fornecendo informações verdadeiras, precisas e atualizadas.</p>
              <p><strong className="text-foreground">3.2</strong> O usuário é responsável pela confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.</p>
              <p><strong className="text-foreground">3.3</strong> O usuário deve notificar imediatamente o suporte em caso de acesso não autorizado à sua conta.</p>
              <p><strong className="text-foreground">3.4</strong> É vedado o compartilhamento de credenciais entre múltiplos usuários. Cada conta é de uso pessoal e intransferível.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">4. Planos e Pagamento</h2>
            <p className="text-muted-foreground leading-relaxed mb-4"><strong className="text-foreground">4.1</strong> A Plataforma oferece os seguintes planos:</p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium text-foreground">Plano</th>
                    <th className="text-left p-3 font-medium text-foreground">Descrição</th>
                    <th className="text-left p-3 font-medium text-foreground">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="p-3 text-muted-foreground font-medium">E-book</td><td className="p-3 text-muted-foreground">Método dos 3 Pilares da Vida (PDF)</td><td className="p-3 text-muted-foreground">R$ 19,90</td></tr>
                  <tr><td className="p-3 text-muted-foreground font-medium">Sistema</td><td className="p-3 text-muted-foreground">Acesso completo à plataforma</td><td className="p-3 text-muted-foreground">R$ 250,00</td></tr>
                  <tr><td className="p-3 text-muted-foreground font-medium">Combo</td><td className="p-3 text-muted-foreground">E-book + Sistema</td><td className="p-3 text-muted-foreground">R$ 147,90</td></tr>
                </tbody>
              </table>
            </div>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">4.2</strong> Os pagamentos são processados pela <strong className="text-foreground">Stripe, Inc.</strong>, plataforma segura e certificada PCI-DSS. O Gestor de Vida não armazena dados de cartão de crédito.</p>
              <p><strong className="text-foreground">4.3</strong> O acesso ao plano contratado é liberado imediatamente após a confirmação do pagamento.</p>
              <p><strong className="text-foreground">4.4</strong> Os preços podem ser alterados a qualquer momento, sem prejuízo dos contratos já firmados.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">5. Política de Reembolso</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">5.1</strong> O usuário tem direito ao reembolso integral no prazo de <strong className="text-foreground">7 (sete) dias corridos</strong> a partir da data da compra, conforme o Art. 49 do Código de Defesa do Consumidor (CDC), para compras realizadas pela internet.</p>
              <p><strong className="text-foreground">5.2</strong> Para solicitar reembolso, o usuário deve entrar em contato pelo e-mail <strong className="text-foreground">contato@gestordevida.com.br</strong> dentro do prazo indicado.</p>
              <p><strong className="text-foreground">5.3</strong> Após o prazo de 7 dias, não serão concedidos reembolsos, exceto em casos de falha técnica comprovada da Plataforma.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">6. Obrigações do Usuário</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">O usuário compromete-se a:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span>Utilizar a Plataforma exclusivamente para fins lícitos e pessoais;</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span>Não tentar acessar áreas restritas ou contas de outros usuários;</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span>Não reproduzir, distribuir ou comercializar o conteúdo da Plataforma sem autorização;</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span>Não utilizar ferramentas automatizadas para extração de dados (scraping);</span></li>
              <li className="flex gap-2"><span className="text-violet-500 font-bold flex-shrink-0">•</span><span>Manter seus dados cadastrais atualizados.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">7. Propriedade Intelectual</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">7.1</strong> Todo o conteúdo da Plataforma — incluindo textos, metodologias, layout, código-fonte, marcas e e-books — é de propriedade exclusiva do Gestor de Vida e protegido pela Lei nº 9.610/1998 (Lei de Direitos Autorais).</p>
              <p><strong className="text-foreground">7.2</strong> O usuário recebe uma licença pessoal, não exclusiva e intransferível para uso do conteúdo adquirido, vedada qualquer reprodução comercial.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">8. Limitação de Responsabilidade</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">8.1</strong> A Plataforma é fornecida "no estado em que se encontra". O Gestor de Vida não garante que o serviço estará disponível de forma ininterrupta ou livre de erros.</p>
              <p><strong className="text-foreground">8.2</strong> O Gestor de Vida não se responsabiliza por decisões financeiras tomadas com base nas informações da Plataforma. As funcionalidades de orçamento e aposentadoria são ferramentas de organização pessoal e não constituem consultoria financeira.</p>
              <p><strong className="text-foreground">8.3</strong> Em nenhuma hipótese a responsabilidade do Gestor de Vida excederá o valor pago pelo usuário pelo plano contratado.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">9. Suspensão e Encerramento de Conta</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">9.1</strong> O Gestor de Vida reserva-se o direito de suspender ou encerrar contas que violem estes Termos, sem aviso prévio e sem direito a reembolso.</p>
              <p><strong className="text-foreground">9.2</strong> O usuário pode solicitar o encerramento de sua conta a qualquer momento pelo e-mail <strong className="text-foreground">contato@gestordevida.com.br</strong>.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">10. Disposições Gerais</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">10.1</strong> Estes Termos constituem o acordo integral entre o usuário e o Gestor de Vida, substituindo quaisquer acordos anteriores.</p>
              <p><strong className="text-foreground">10.2</strong> Caso qualquer disposição seja considerada inválida, as demais permanecerão em pleno vigor.</p>
              <p><strong className="text-foreground">10.3</strong> Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca do domicílio do controlador para dirimir eventuais litígios, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
            </div>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/politica-de-privacidade"><span className="hover:text-foreground cursor-pointer transition-colors">Política de Privacidade</span></Link>
          <Link href="/lgpd"><span className="hover:text-foreground cursor-pointer transition-colors">Seus Direitos — LGPD</span></Link>
          <Link href="/"><span className="hover:text-foreground cursor-pointer transition-colors">Página inicial</span></Link>
        </div>
      </div>
    </div>
  );
}
