import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "wouter";
import { Lock, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

export default function RedefinirSenha() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extrair token da URL: /redefinir-senha?token=xxx
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (!token) {
      toast.error("Token inválido. Solicite um novo link de recuperação.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao redefinir senha.");
        return;
      }
      setSuccess(true);
      toast.success("Senha redefinida com sucesso!");
      setTimeout(() => navigate("/login"), 3000);
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
          <p className="text-purple-300 text-sm mt-1">Redefinição de senha</p>
        </div>

        <Card className="border-purple-800/40 bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Nova senha</CardTitle>
            <CardDescription className="text-purple-300">
              {!token
                ? "Link inválido ou expirado"
                : success
                ? "Senha redefinida com sucesso"
                : "Escolha uma nova senha para sua conta"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!token ? (
              <div className="text-center space-y-4 py-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-amber-400" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Link inválido</p>
                  <p className="text-purple-300 text-sm">
                    Este link de recuperação é inválido ou expirou. Solicite um novo link.
                  </p>
                </div>
                <Link href="/esqueci-senha">
                  <Button className="bg-purple-600 hover:bg-purple-500 text-white">
                    Solicitar novo link
                  </Button>
                </Link>
              </div>
            ) : success ? (
              <div className="text-center space-y-4 py-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Senha redefinida!</p>
                  <p className="text-purple-300 text-sm">
                    Sua senha foi alterada com sucesso. Você será redirecionado para o login em instantes.
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="outline" className="border-purple-700/50 text-purple-200 hover:bg-purple-900/30 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Ir para o login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-purple-200">Nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                      className="bg-white/10 border-purple-700/50 text-white placeholder:text-purple-400 focus:border-purple-400 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-purple-200">Confirmar nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                    <Input
                      id="confirm"
                      type="password"
                      placeholder="Repita a nova senha"
                      value={form.confirm}
                      onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
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
                  {loading ? "Salvando..." : "Redefinir senha"}
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
