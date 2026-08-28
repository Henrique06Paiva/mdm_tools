import { useState, useEffect } from "react";
import { Sparkles, X, Check } from "lucide-react";
import { releaseNotesData, type ChangeType } from "../data/releaseNotes";
import { Button } from "./ui/button";

const TYPE_CONFIG: Record<
  ChangeType,
  { label: string; textColor: string; bg: string }
> = {
  feat: {
    label: "Novo",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  fix: {
    label: "Correção",
    textColor: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  improvement: {
    label: "Melhoria",
    textColor: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
};

export default function ReleaseNotesButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Busca a versão mais recente
  const latestRelease =
    releaseNotesData.find((item) => item.isLatest) || releaseNotesData[0];

  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Botão Flutuante (posicionado alinhado ao botão de feedback) */}
      <button
        onClick={() => setIsOpen(true)}
        title={`Novidades da versão ${latestRelease.version}`}
        aria-label="Notas de Versão"
        className="fixed bottom-6 right-20 max-md:bottom-[88px] max-md:right-18 z-40 flex items-center justify-center w-10 h-10 rounded-xl bg-card text-foreground border border-border/70 shadow-md hover:border-primary/50 hover:text-primary hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
      >
        <Sparkles size={16} className="text-primary" />
      </button>

      {/* Modal / Dialog Minimalista */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-card text-card-foreground border border-border/80 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-border/40 bg-muted/20">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/25">
                    {latestRelease.version}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground font-mono">
                    {latestRelease.date}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground leading-snug pt-1">
                  {latestRelease.title}
                </h3>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/60 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 -mr-1 -mt-1"
                aria-label="Fechar modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Corpo / Lista de Mudanças */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {latestRelease.summary && (
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/30">
                  {latestRelease.summary}
                </p>
              )}

              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  O que mudou nesta versão:
                </p>
                <ul className="space-y-2.5">
                  {latestRelease.changes.map((change, idx) => {
                    const cfg =
                      TYPE_CONFIG[change.type] || TYPE_CONFIG.improvement;
                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-foreground/90 leading-relaxed"
                      >
                        <span
                          className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 border ${cfg.bg} ${cfg.textColor}`}
                        >
                          {cfg.label}
                        </span>
                        <span className="flex-1">{change.description}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Rodapé com Ação */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/40 bg-muted/10">
              <span className="text-[11px] text-muted-foreground">
                MDM Hub Tools v{latestRelease.version.replace(/^v/, "")}
              </span>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 text-xs font-semibold px-4 cursor-pointer"
              >
                <Check size={14} className="mr-1.5" />
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
