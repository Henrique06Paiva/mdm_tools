import React, { useState } from "react";
import { api } from "../api";
import { Button } from "./ui/button";
import { Input, Label } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Lock, User, Loader2, ShieldAlert, Sun, Moon } from "lucide-react";
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

  return (
    <div className={isOverlay ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md px-4 overflow-y-auto" : "relative min-h-screen flex flex-col items-center justify-center bg-background px-4 overflow-hidden"}>
      {/* Dynamic Ambient Background Gradients */}
      {!isOverlay && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/15 blur-[120px] pointer-events-none"></div>
        </>
      )}

      {/* Theme Toggle Button */}
      {!isOverlay && (
        <div className="absolute top-6 right-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Alternar Tema"
            className="text-muted-foreground hover:text-foreground rounded-full border border-border/20 bg-background/40 backdrop-blur-sm"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>
      )}

      <div className="w-full max-w-[420px] z-10 animate-in fade-in zoom-in-95 duration-500">
        <Card className="border border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pt-8 pb-6 border-b border-border/20">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
              <Lock className="text-primary" size={24} />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground lowercase first-letter:uppercase">
              {isOverlay ? "Sessão expirada" : "MDM Hub Tools"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {isOverlay 
                ? "Confirme sua senha para continuar de onde parou"
                : "Faça login para gerenciar o inventário de forma segura"}
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold animate-in shake duration-300">
                  <ShieldAlert size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="username">Usuário ou E-mail</Label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="username"
                    type="text"
                    placeholder="exemplo@empresa.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading || isOverlay}
                    className="pl-10 font-sans"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="pl-10 font-sans"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                {isOverlay && onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                    className="w-full h-11 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Desconectar
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-sm font-semibold shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Conectando...</span>
                    </>
                  ) : (
                    <span>{isOverlay ? "Confirmar" : "Entrar"}</span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Corporate isolation notice */}
        <div className="text-center mt-6 text-xs text-muted-foreground/60 flex flex-col gap-1.5">
          <p>
            Corporação ativa:{" "}
            <span className="font-semibold text-muted-foreground uppercase">
              {api.getTenant()}
            </span>
          </p>
          <p className="opacity-75">
            Os acessos e visualizações serão restritos apenas a esta corporação.
          </p>
        </div>
      </div>
    </div>
  );
}
