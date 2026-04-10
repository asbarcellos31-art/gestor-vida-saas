import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Zap } from "lucide-react";

export default function AssinaturaSucesso() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  useEffect(() => {
    // Invalidar o cache da subscription para buscar o status atualizado
    const timer = setTimeout(() => {
      utils.subscription.get.invalidate();
    }, 2000);
    return () => clearTimeout(timer);
  }, [utils]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Ícone de sucesso animado */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          Assinatura confirmada! 🎉
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Bem-vindo ao Gestor de Vida. Seu plano já está ativo e você tem acesso completo a todos os módulos contratados.
        </p>

        {/* Card de boas-vindas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Próximos passos</p>
              <p className="text-sm text-gray-500">Comece a usar agora mesmo</p>
            </div>
          </div>
          <ul className="space-y-3">
            {[
              "Acesse o Dashboard para uma visão geral do seu dia",
              "Configure suas tarefas na Gestão de Tempo",
              "Lance suas receitas e despesas no Orçamento Doméstico",
              "Explore o módulo Aprender para dominar as metodologias",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl px-8"
          >
            Ir para o Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/planos")}
            className="rounded-xl"
          >
            Ver meu plano
          </Button>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Um recibo foi enviado para o seu email. Você pode gerenciar sua assinatura a qualquer momento em Planos e Assinatura.
        </p>
      </div>
    </div>
  );
}
