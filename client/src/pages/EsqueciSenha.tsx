import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "wouter";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Informe seu e-mail.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), origin: window.location.origin }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao enviar e-mail.");
        return;
      }
      setSent(true);
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/icon-gv-v3_237347c1.png"
            alt="Gestor de Vida"
            className="w-20 h-20 rounded-2xl shadow-lg mb-3"
          />
          <h1 className="text-2xl font-bold text-white">Gestor de Vida</h1>
          <p className="text-purple-300 text-sm mt-1">Recuperação de senha</p>
        </div>

        <Card className="border-purple-800/40 bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Esqueci minha senha</CardTitle>
            <CardDescription className="text-purple-300">
              {sent
                ? "Verifique sua caixa de entrada"
                : "Informe seu e-mail para receber o link de redefinição"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">E-mail enviado!</p>
                  <p className="text-purple-300 text-sm">
                    Se o e-mail <strong className="text-purple-200">{email}</strong> estiver cadastrado,
                    você receberá um link para redefinir sua senha em instantes.
                  </p>
                  <p className="text-purple-400 text-xs mt-2">
                    O link expira em 1 hora. Verifique também a pasta de spam.
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="outline" className="mt-2 border-purple-700/50 text-purple-200 hover:bg-purple-900/30 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-purple-200">E-mail cadastrado</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="bg-white/10 border-purple-700/50 text-white placeholder:text-purple-400 focus:border-purple-400 pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 mt-2"
                >
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </Button>

                <div className="text-center">
                  <Link href="/login" className="text-purple-300 text-sm hover:text-white underline inline-flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" />
                    Voltar para o login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
