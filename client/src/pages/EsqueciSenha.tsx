import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "wouter";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const ICON_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663348080686/ZqfDFXLHUoy8CunGRmv7wd/icon-gv-navy-gold_6e5b968f.png";

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
          <p className="text-sm mt-1" style={{ color: "#8A9BB5" }}>Recuperação de senha</p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,168,76,0.2)" }}
        >
          <h2 className="text-xl font-bold mb-1" style={{ color: "#F0E6C8" }}>Esqueci minha senha</h2>
          <p className="text-sm mb-6" style={{ color: "#8A9BB5" }}>
            {sent ? "Verifique sua caixa de entrada" : "Informe seu e-mail para receber o link de redefinição"}
          </p>

          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(201,168,76,0.15)" }}>
                  <CheckCircle2 className="w-8 h-8" style={{ color: "#C9A84C" }} />
                </div>
              </div>
              <div>
                <p className="font-semibold mb-1" style={{ color: "#F0E6C8" }}>E-mail enviado!</p>
                <p className="text-sm" style={{ color: "#8A9BB5" }}>
                  Se o e-mail <strong style={{ color: "#C9A84C" }}>{email}</strong> estiver cadastrado,
                  você receberá um link para redefinir sua senha em instantes.
                </p>
                <p className="text-xs mt-2" style={{ color: "#3A4A60" }}>
                  O link expira em 1 hora. Verifique também a pasta de spam.
                </p>
              </div>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="mt-2"
                  style={{ borderColor: "rgba(201,168,76,0.4)", color: "#C9A84C", background: "transparent" }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para o login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: "#C9A84C" }}>E-mail cadastrado</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#C9A84C" }} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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
                {loading ? "Enviando..." : "Enviar link de recuperação"}
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
