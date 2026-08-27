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
import { Input, Label } from "./ui/input";

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
      _subject: `[MDM Hub Feedback] - ${type === "bug" ? "Report de Falha" : "Sugestão"}`,
      "Tipo de Feedback": type === "bug" ? "Falha / Bug" : "Sugestão de Melhoria",
      "Usuário / Identificação": isAuthenticated
        ? username || "Autenticado (sem nome)"
        : senderName,
      "Descrição": description,
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
      setErrorMessage("Não foi possível enviar o feedback no momento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botão Flutuante de Feedback (posicionamento responsivo conforme AGENTS.md) */}
      <button
        onClick={() => setIsOpen(true)}
        title="Enviar Feedback"
        data-tour="feedback-button"
        className="fixed bottom-6 right-6 max-md:bottom-[88px] max-md:right-4 z-40 flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-150 border border-primary/30 cursor-pointer"
      >
        <MessageSquare size={16} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => !isLoading && setIsOpen(false)}
        >
          <div
            className="bg-card text-card-foreground border border-border/60 w-full max-w-[420px] rounded-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/10">
              <div>
                <h2 className="text-sm font-bold text-foreground">Enviar Feedback</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Reporte problemas técnicos ou sugira melhorias para o sistema
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-lg transition-colors cursor-pointer disabled:pointer-events-none"
              >
                <X size={15} />
              </button>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
                {/* Seletor de tipo */}
                <div className="grid grid-cols-2 bg-muted/40 p-1 rounded-lg border border-border/40 gap-1">
                  <button
                    type="button"
                    onClick={() => setType("bug")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      type === "bug"
                        ? "bg-card text-foreground shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Bug size={13} className={type === "bug" ? "text-destructive" : ""} />
                    Reportar Falha
                  </button>

                  <button
                    type="button"
                    onClick={() => setType("suggestion")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      type === "suggestion"
                        ? "bg-card text-foreground shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Lightbulb size={13} className={type === "suggestion" ? "text-primary" : ""} />
                    Sugestão
                  </button>
                </div>

                {/* Identificação */}
                {!isAuthenticated ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="fb-name" className="text-xs">
                      Seu Nome ou E-mail *
                    </Label>
                    <Input
                      id="fb-name"
                      type="text"
                      required
                      placeholder="Ex: henrique@empresa.com"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="h-9 text-xs font-sans"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-border/40 text-xs">
                    <span className="text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                      Usuário Conectado
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {username || "Usuário"}
                    </span>
                  </div>
                )}

                {/* Descrição */}
                <div className="space-y-1.5">
                  <Label htmlFor="fb-desc" className="text-xs">
                    Descrição Detalhada *
                  </Label>
                  <textarea
                    id="fb-desc"
                    required
                    rows={4}
                    placeholder={
                      type === "bug"
                        ? "Descreva o comportamento inesperado e o passo a passo para reproduzi-lo..."
                        : "Compartilhe sua sugestão técnica ou funcional..."
                    }
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-input border border-border rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                {errorMessage && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                    className="h-8 text-xs cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading || !description.trim()}
                    className="h-8 text-xs cursor-pointer gap-1.5 px-4 font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={12} />
                        Enviar Feedback
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              /* Confirmação de Sucesso */
              <div className="flex flex-col items-center text-center py-8 px-6 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3 border border-emerald-500/20">
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="text-sm font-bold text-foreground">Feedback Registrado!</h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
                  Agradecemos a sua contribuição. A equipe técnica recebeu a notificação com sucesso.
                </p>
                <Button
                  onClick={() => setIsOpen(false)}
                  size="sm"
                  className="mt-5 h-8 text-xs cursor-pointer px-6"
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
