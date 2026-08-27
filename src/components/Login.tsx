import React, { useState } from "react";
import { api } from "../api";
import { Button } from "./ui/button";
import { Input, Label } from "./ui/input";
import { Lock, User, Loader2, ShieldAlert, Sun, Moon, Eye, EyeOff, Terminal } from "lucide-react";
import { useTheme } from "../ThemeContext";

interface LoginProps {
  onLoginSuccess: () => void;
  isOverlay?: boolean;
  onCancel?: () => void;
}

export default function Login({ onLoginSuccess, isOverlay = false, onCancel }: LoginProps) {
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState(() => (isOverlay ? (api.getUsername() || "") : ""));
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialUsername] = useState(() => !!(isOverlay && api.getUsername()));
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await api.login(username.trim(), password);
      if (success) {
        onLoginSuccess();
      } else {
        setError("Usuário ou senha incorretos.");
      }
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Overlay (sessão expirada) ─────────────────────────── */
  if (isOverlay) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md px-4">
        <div
          className="w-full max-w-[400px] rounded-xl border border-border/60 bg-card shadow-2xl overflow-hidden"
          style={{ animation: "slide-up-fade 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          {/* Header bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-muted/20">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center border border-destructive/20">
              <Lock size={15} className="text-destructive" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Sessão Expirada</p>
              <p className="text-[11px] text-muted-foreground">Confirme sua senha para continuar</p>
            </div>
          </div>

          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-destructive/20 bg-destructive/8 text-destructive text-xs font-semibold animate-shake">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="ov-username">Usuário</Label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    id="ov-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading || (isOverlay && hasInitialUsername)}
                    className="pl-9"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ov-password">Senha</Label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <Input
                    id="ov-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pl-9 pr-10"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="flex-1 cursor-pointer">
                    Desconectar
                  </Button>
                )}
                <Button type="submit" disabled={loading} className="flex-1 cursor-pointer gap-2">
                  {loading ? <><Loader2 size={14} className="animate-spin" /><span>Verificando...</span></> : "Confirmar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ── Login Principal — Layout Assimétrico ────────────────── */
  return (
    <div className="relative min-h-screen flex bg-background overflow-hidden">

      {/* ── Painel Esquerdo — Branding ───────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] min-h-screen bg-primary relative overflow-hidden p-10"
        aria-hidden="true"
      >
        {/* Grade de pontos decorativa */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Gradiente de profundidade */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-black/30 pointer-events-none" />

        {/* Brilho de canto */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />

        {/* Conteúdo do branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/15 border border-primary-foreground/25 flex items-center justify-center backdrop-blur-sm">
              <Terminal size={20} className="text-primary-foreground" />
            </div>
            <div>
              <span className="text-primary-foreground font-mono font-bold text-xl tracking-tight leading-none block">
                MDM Hub
              </span>
              <span className="text-primary-foreground/70 font-mono text-xs tracking-widest uppercase">
                Tools Platform
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-5">
          <h2 className="text-3xl font-black text-primary-foreground leading-tight tracking-tight">
            Gestao de dispositivos,<br />
            <span className="text-primary-foreground/75 font-extrabold">sem complexidade.</span>
          </h2>
          <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-xs">
            Automacoes em lote, inspecao de versoes, exportacao de dados e controle de chamados - tudo em um so lugar.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            {["MDM", "Automacao", "Diagnostico"].map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-semibold text-primary-foreground/55 uppercase tracking-widest"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Painel Direito — Formulário ───────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">

        {/* Theme toggle */}
        <div className="absolute top-5 right-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Alternar Tema"
            className="text-muted-foreground hover:text-foreground rounded-lg border border-border/40 bg-background/60 backdrop-blur-sm h-8 w-8 cursor-pointer"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </Button>
        </div>

        {/* Mobile logo (só aparece abaixo de lg) */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Terminal size={16} className="text-primary-foreground" />
          </div>
          <span className="font-mono font-bold text-lg text-foreground tracking-tight">MDM Hub</span>
        </div>

        {/* Card do formulário */}
        <div
          className="w-full max-w-[400px] space-y-7"
          style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          {/* Cabeçalho */}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Acessar plataforma
            </h1>
            <p className="text-base text-muted-foreground">
              Entre com suas credenciais para continuar
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm font-semibold animate-shake">
                <ShieldAlert size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Usuário ou E-mail</Label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  id="username"
                  type="text"
                  placeholder="exemplo@empresa.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="pl-10 font-sans"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pl-10 pr-11 font-sans"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  title={showPassword ? "Ocultar senha" : "Visualizar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full cursor-pointer gap-2 h-12 text-base mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Divider decorativo */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest">
              MDM Hub Tools
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>
        </div>
      </div>
    </div>
  );
}
