import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const ICON_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/icon-gv-navy-gold_6e5b968f.png";

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
          <p className="text-sm mt-1" style={{ color: "#8A9BB5" }}>Acesse sua conta</p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}
        >
          <h2 className="text-xl font-bold mb-1" style={{ color: "#F0E6C8" }}>Entrar</h2>
          <p className="text-sm mb-6" style={{ color: "#8A9BB5" }}>Use seu e-mail e senha para acessar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: "#C9A84C" }}>E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(201,168,76,0.3)",
                  color: "#F0E6C8",
                }}
                className="placeholder:text-[#3A4A60]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: "#C9A84C" }}>Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: "rgba(201,168,76,0.3)",
                  color: "#F0E6C8",
                }}
                className="placeholder:text-[#3A4A60]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-2.5 mt-2"
              style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-5 text-center space-y-2">
            <p className="text-sm">
              <Link href="/esqueci-senha" className="underline" style={{ color: "#8A9BB5" }}>
                Esqueci minha senha
              </Link>
            </p>
            <p className="text-sm" style={{ color: "#8A9BB5" }}>
              Não tem conta?{" "}
              <Link href="/cadastro" className="font-semibold underline" style={{ color: "#C9A84C" }}>
                Criar conta grátis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
