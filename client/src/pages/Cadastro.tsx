import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const ICON_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/icon-gv-navy-gold_6e5b968f.png";

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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg,#070E26 0%,#0B1437 50%,#0D1B4B 100%)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={ICON_URL}
            alt="Gestor de Vida"
            className="w-20 h-20 rounded-2xl shadow-lg mb-3"
            style={{ boxShadow: "0 0 40px rgba(201,168,76,0.3)" }}
          />
          <h1 className="text-2xl font-bold" style={{ color: "#C9A84C" }}>Gestor de Vida</h1>
          <p className="text-sm mt-1" style={{ color: "#8A9BB5" }}>Crie sua conta e comece grátis por 5 dias</p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}
        >
          <h2 className="text-xl font-bold mb-1" style={{ color: "#F0E6C8" }}>Criar conta</h2>
          <p className="text-sm mb-6" style={{ color: "#8A9BB5" }}>Preencha os dados abaixo para começar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" style={{ color: "#C9A84C" }}>Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(201,168,76,0.3)", color: "#F0E6C8" }}
                className="placeholder:text-[#3A4A60]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: "#C9A84C" }}>E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(201,168,76,0.3)", color: "#F0E6C8" }}
                className="placeholder:text-[#3A4A60]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: "#C9A84C" }}>Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(201,168,76,0.3)", color: "#F0E6C8" }}
                className="placeholder:text-[#3A4A60]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" style={{ color: "#C9A84C" }}>Confirmar senha</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Repita a senha"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                required
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(201,168,76,0.3)", color: "#F0E6C8" }}
                className="placeholder:text-[#3A4A60]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-2.5 mt-2"
              style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}
            >
              {loading ? "Criando conta..." : "Criar conta grátis"}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm" style={{ color: "#8A9BB5" }}>
              Já tem conta?{" "}
              <Link href="/login" className="font-semibold underline" style={{ color: "#C9A84C" }}>
                Entrar
              </Link>
            </p>
          </div>

          <p className="text-xs text-center mt-4" style={{ color: "#3A4A60" }}>
            Ao criar sua conta, você concorda com os termos de uso. Cartão de crédito necessário para o trial.
          </p>
        </div>
      </div>
    </div>
  );
}
