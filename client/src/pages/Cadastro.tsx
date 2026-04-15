import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Cadastro() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const utils = trpc.useUtils();

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
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao cadastrar.");
        return;
      }
      await utils.auth.me.invalidate();
      toast.success("Conta criada! Seu trial de 5 dias começou agora.");
      navigate("/dashboard");
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
            alt="Gestão da Vida"
            className="w-20 h-20 rounded-2xl shadow-lg mb-3"
          />
          <h1 className="text-2xl font-bold text-white">Gestão da Vida</h1>
          <p className="text-purple-300 text-sm mt-1">Crie sua conta e comece grátis por 5 dias</p>
        </div>

        <Card className="border-purple-800/40 bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Criar conta</CardTitle>
            <CardDescription className="text-purple-300">
              Preencha os dados abaixo para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-purple-200">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="bg-white/10 border-purple-700/50 text-white placeholder:text-purple-400 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-200">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  className="bg-white/10 border-purple-700/50 text-white placeholder:text-purple-400 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-200">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className="bg-white/10 border-purple-700/50 text-white placeholder:text-purple-400 focus:border-purple-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-purple-200">Confirmar senha</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Repita a senha"
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  required
                  className="bg-white/10 border-purple-700/50 text-white placeholder:text-purple-400 focus:border-purple-400"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 mt-2"
              >
                {loading ? "Criando conta..." : "Criar conta grátis"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-purple-300 text-sm">
                Já tem conta?{" "}
                <Link href="/login" className="text-purple-200 font-semibold hover:text-white underline">
                  Entrar
                </Link>
              </p>
            </div>

            <p className="text-purple-400 text-xs text-center mt-4">
              Ao criar sua conta, você concorda com os termos de uso. Cartão de crédito necessário para o trial.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
