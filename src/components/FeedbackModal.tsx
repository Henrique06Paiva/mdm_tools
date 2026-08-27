import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  X,
  Bug,
  Lightbulb,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";

interface FeedbackModalProps {
  isAuthenticated: boolean;
  username: string | null;
}

export default function FeedbackModal({
  isAuthenticated,
  username,
}: FeedbackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"bug" | "suggestion">("bug");
  const [description, setDescription] = useState("");
  const [senderName, setSenderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setType("bug");
        setDescription("");
        setSenderName("");
        setIsSubmitted(false);
        setErrorMessage(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    if (!isAuthenticated && !senderName.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    const payload = {
      _subject: `[MDM Hub Feedback] - ${type === "bug" ? "Bug 🐛" : "Sugestão 💡"}`,
      "Tipo de Feedback": type === "bug" ? "Bug 🐛" : "Sugestão de Melhoria 💡",
      "Usuário / Identificação": isAuthenticated
        ? username || "Autenticado (sem nome)"
        : senderName,
      Descrição: description,
      "Data e Hora": new Date().toLocaleString("pt-BR"),
      "Página Atual": window.location.href,
      "Resolução da Tela": `${window.innerWidth}x${window.innerHeight}`,
      "User Agent": navigator.userAgent,
      _honey: "",
      _captcha: "false",
    };

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/henriqueesteves06@gmail.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success === "true" || data.success) {
          setIsSubmitted(true);
        } else {
          throw new Error(data.message || "Erro desconhecido");
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error("Erro ao enviar feedback:", error);
      setErrorMessage("Ocorreu um erro ao enviar o feedback. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Botão Flutuante de Feedback ────────────────────── */}
      <button
        onClick={() => setIsOpen(true)}
        title="Enviar Feedback"
        data-tour="feedback-button"
        className="fixed bottom-6 right-6 max-md:bottom-[88px] max-md:right-4 z-40 flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-primary/20 cursor-pointer"
      >
        <MessageSquare size={16} />
      </button>

      {/* ── Modal ──────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isLoading && setIsOpen(false)}
        >
          <div
            className="bg-card text-card-foreground border border-border/60 w-full max-w-[420px] rounded-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div>
                <h2 className="text-sm font-bold text-foreground">Enviar Feedback</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Ajude-nos a melhorar o MDM Hub Tools
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground hover:bg-accent p-1.5 rounded-lg transition-colors cursor-pointer disabled:pointer-events-none"
              >
                <X size={15} />
              </button>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">

                {/* Seletor de tipo — pill switcher */}
                <div className="flex bg-muted/40 rounded-lg p-1 gap-1">
                  {[
                    { value: "bug" as const, icon: Bug, label: "Reportar Bug" },
                    { value: "suggestion" as const, icon: Lightbulb, label: "Sugestão" },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setType(value)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        type === value
                          ? "bg-card text-foreground shadow-sm border border-border/40"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Identificação */}
                {!isAuthenticated ? (
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                      Seu Nome ou E-mail
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: henrique@exemplo.com"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full h-9 rounded-lg border border-input bg-muted/30 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 transition-all"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Usuário:</span>
                    <span className="text-xs font-mono font-bold text-foreground">
                      {username || "Usuário"}
                    </span>
                  </div>
                )}

                {/* Descrição */}
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">
                    Descrição
                  </label>
                  <textarea
                    required
                    placeholder={
                      type === "bug"
                        ? "Descreva o problema e como reproduzi-lo..."
                        : "Compartilhe sua ideia ou sugestão de melhoria..."
                    }
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[110px] rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 transition-all resize-none"
                  />
                </div>

                {errorMessage && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/8 border border-destructive/20 text-destructive text-xs">
                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                    className="cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading || !description.trim()}
                    className="cursor-pointer gap-1.5"
                  >
                    {isLoading ? (
                      <><Loader2 size={13} className="animate-spin" />Enviando...</>
                    ) : (
                      <><Send size={13} />Enviar</>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              /* Sucesso */
              <div className="flex flex-col items-center text-center py-10 px-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 border border-emerald-500/20">
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="text-sm font-bold text-foreground">Feedback Enviado!</h3>
                <p className="text-xs text-muted-foreground mt-2 max-w-xs leading-relaxed">
                  Obrigado pela contribuição. O time de desenvolvimento foi notificado.
                </p>
                <Button
                  onClick={() => setIsOpen(false)}
                  size="sm"
                  className="mt-6 cursor-pointer"
                >
                  Fechar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
