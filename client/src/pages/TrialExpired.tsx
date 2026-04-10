import { useLocation } from "wouter";
import { Zap, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrialExpired() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-violet-600" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Seu período de avaliação encerrou
          </h1>
          <p className="text-muted-foreground">
            Esperamos que tenha gostado da experiência! Para continuar usando o Gestor de Vida, escolha um dos planos abaixo.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 text-left space-y-3">
          <p className="font-semibold text-sm text-foreground">O que você vai manter:</p>
          {[
            "Todos os dados que você cadastrou",
            "Acesso ao módulo que você escolher",
            "Suporte por e-mail",
            "Cancele quando quiser",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-violet-600 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/planos")}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3"
            size="lg"
          >
            <Zap className="w-4 h-4 mr-2" />
            Ver planos e assinar
          </Button>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voltar para a página inicial
          </button>
        </div>
      </div>
    </div>
  );
}
