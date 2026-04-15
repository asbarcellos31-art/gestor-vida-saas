import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const utils = trpc.useUtils();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "E-mail ou senha incorretos.");
        return;
      }
      await utils.auth.me.invalidate();
      toast.success(`Bem-vindo, ${data.user?.name?.split(" ")[0] || ""}!`);
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
          <p className="text-purple-300 text-sm mt-1">Acesse sua conta</p>
        </div>

        <Card className="border-purple-800/40 bg-white/5 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Entrar</CardTitle>
            <CardDescription className="text-purple-300">
              Use seu e-mail e senha para acessar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Sua senha"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  className="bg-white/10 border-purple-700/50 text-white placeholder:text-purple-400 focus:border-purple-400"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 mt-2"
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <p className="text-purple-300 text-sm">
                <Link href="/esqueci-senha" className="text-purple-300 hover:text-white underline">
                  Esqueci minha senha
                </Link>
              </p>
              <p className="text-purple-300 text-sm">
                Não tem conta?{" "}
                <Link href="/cadastro" className="text-purple-200 font-semibold hover:text-white underline">
                  Criar conta grátis
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
