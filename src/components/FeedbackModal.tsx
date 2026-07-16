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

  // Reset form states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Don't reset everything immediately to avoid flicker during fade-out
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
      _honey: "", // Honeypot anti-spam
      _captcha: "false", // Desativa captcha do FormSubmit.co
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
        },
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
      setErrorMessage(
        "Ocorreu um erro ao enviar o feedback. Por favor, tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botão Flutuante (FAB) */}
      <button
        onClick={() => setIsOpen(true)}
        title="Enviar Feedback"
        className="fixed bottom-6 right-6 z-40 flex items-center bg-primary text-primary-foreground h-12 w-12 hover:w-32 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 hover:shadow-primary/20 transition-all duration-300 border border-border cursor-pointer group px-3.5 overflow-hidden"
      >
        <div className="flex items-center gap-2">
          <MessageSquare
            size={18}
            className="transition-transform duration-300 group-hover:rotate-6 shrink-0"
          />
          <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[80px] transition-all duration-300 text-sm font-semibold whitespace-nowrap overflow-hidden">
            Feedback
          </span>
        </div>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isLoading && setIsOpen(false)}
        >
          {/* Modal Container */}
          <div
            className="bg-card text-card-foreground border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar */}
            <button
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-lg transition-colors cursor-pointer disabled:pointer-events-none"
            >
              <X size={16} />
            </button>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Enviar Feedback
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ajude-nos a melhorar o MDM Hub Tools.
                  </p>
                </div>

                {/* Seletor de Tipo (Bug vs Sugestão) */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setType("bug")}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      type === "bug"
                        ? "bg-destructive/10 text-destructive border-destructive/50"
                        : "bg-muted/20 hover:bg-muted/40 border-border/50 text-muted-foreground"
                    }`}
                  >
                    <Bug size={16} />
                    Reportar Bug
                  </button>

                  <button
                    type="button"
                    onClick={() => setType("suggestion")}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      type === "suggestion"
                        ? "bg-primary/10 text-primary border-primary/50"
                        : "bg-muted/20 hover:bg-muted/40 border-border/50 text-muted-foreground"
                    }`}
                  >
                    <Lightbulb size={16} />
                    Melhoria
                  </button>
                </div>

                {/* Campo de Identificação (Só exibe se deslogado) */}
                {!isAuthenticated ? (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">
                      Seu Nome ou E-mail
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: henrique@exemplo.com"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full h-10 rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/40">
                    <span className="text-xs text-muted-foreground">
                      Usuario de Reporte :
                    </span>
                    <span className="text-xs font-mono font-bold text-foreground">
                      {username || "Usuário"}
                    </span>
                  </div>
                )}

                {/* Campo de Descrição */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
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
                    className="w-full min-h-[120px] rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all resize-none"
                  />
                </div>

                {/* Mensagem de Erro se houver */}
                {errorMessage && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Botões do Formulário */}
                <div className="flex gap-2 justify-end mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                    className="cursor-pointer rounded-xl text-xs h-9 px-3"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !description.trim()}
                    className="cursor-pointer gap-1.5 rounded-xl text-xs h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              /* Tela de Sucesso */
              <div className="flex flex-col items-center text-center py-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4 border border-green-500/20">
                  <CheckCircle2 size={24} className="animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Feedback Enviado!
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
                  Muito obrigado pela contribuição. O time de desenvolvimento
                  foi notificado e irá analisar.
                </p>
                {/* Nota para ativação se for o primeiro envio */}
                <p className="text-[10px] text-muted-foreground/60 mt-4 max-w-xs italic">
                  Obs: Se for a primeira vez que você envia, verifique a caixa
                  de entrada de henriqueesteves06@gmail.com para ativar o
                  recebimento.
                </p>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="mt-6 rounded-xl text-xs h-9 px-6 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
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
