import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "wouter";
import { Lock, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

const ICON_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/icon-gv-navy-gold_6e5b968f.png";

export default function RedefinirSenha() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg,#070E26 0%,#0B1437 50%,#0D1B4B 100%)" }}
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img
            src={ICON_URL}
            alt="Gestor de Vida"
            className="w-20 h-20 rounded-2xl shadow-lg mb-3"
            style={{ boxShadow: "0 0 40px rgba(201,168,76,0.3)" }}
          />
          <h1 className="text-2xl font-bold" style={{ color: "#C9A84C" }}>Gestor de Vida</h1>
          <p className="text-sm mt-1" style={{ color: "#8A9BB5" }}>Redefinição de senha</p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}
        >
          <h2 className="text-xl font-bold mb-1" style={{ color: "#F0E6C8" }}>Nova senha</h2>
          <p className="text-sm mb-6" style={{ color: "#8A9BB5" }}>
            {!token ? "Link inválido ou expirado" : success ? "Senha redefinida com sucesso" : "Escolha uma nova senha para sua conta"}
          </p>

          {!token ? (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(201,168,76,0.1)" }}>
                  <AlertTriangle className="w-8 h-8" style={{ color: "#C9A84C" }} />
                </div>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: "#F0E6C8" }}>Link inválido</p>
                <p className="text-sm" style={{ color: "#8A9BB5" }}>
                  Este link de recuperação é inválido ou expirou. Solicite um novo link.
                </p>
              </div>
              <Link href="/esqueci-senha">
                <Button style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }} className="font-semibold">
                  Solicitar novo link
                </Button>
              </Link>
            </div>
          ) : success ? (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(201,168,76,0.15)" }}>
                  <CheckCircle2 className="w-8 h-8" style={{ color: "#C9A84C" }} />
                </div>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: "#F0E6C8" }}>Senha redefinida!</p>
                <p className="text-sm" style={{ color: "#8A9BB5" }}>
                  Sua senha foi alterada com sucesso. Você será redirecionado para o login em instantes.
                </p>
              </div>
              <Link href="/login">
                <Button
                  variant="outline"
                  style={{ borderColor: "rgba(201,168,76,0.4)", color: "#C9A84C", background: "transparent" }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ir para o login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: "#C9A84C" }}>Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#C9A84C" }} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(201,168,76,0.3)", color: "#F0E6C8", paddingLeft: "2.5rem" }}
                    className="placeholder:text-[#3A4A60]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" style={{ color: "#C9A84C" }}>Confirmar nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#C9A84C" }} />
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Repita a nova senha"
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    required
                    style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(201,168,76,0.3)", color: "#F0E6C8", paddingLeft: "2.5rem" }}
                    className="placeholder:text-[#3A4A60]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full font-semibold py-2.5 mt-2"
                style={{ background: "linear-gradient(135deg,#C9A84C,#E2C97E)", color: "#0B1437" }}
              >
                {loading ? "Salvando..." : "Redefinir senha"}
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-sm underline inline-flex items-center gap-1" style={{ color: "#8A9BB5" }}>
                  <ArrowLeft className="w-3 h-3" />
                  Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
