import React, { useEffect } from "react";
import type { KnownBug } from "../../types/bugs";
import { formatBugSeverity } from "../../types/bugs";
import { CheckCircle2, ListFilter, PlusCircle, X } from "lucide-react";
import { Button } from "../../components/ui/button";

interface BugCreatedSuccessModalProps {
  bug: KnownBug | null;
  isOpen: boolean;
  onClose: () => void;
  onViewInList: (bug: KnownBug) => void;
}

export const BugCreatedSuccessModal: React.FC<BugCreatedSuccessModalProps> = ({
  bug,
  isOpen,
  onClose,
  onViewInList,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !bug) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bug-success-modal-title"
    >
      <div className="bg-card text-card-foreground border border-border/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden scale-in duration-200">
        {/* Top Header */}
        <div className="p-5 border-b border-border/40 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3
                id="bug-success-modal-title"
                className="text-sm font-bold text-foreground"
              >
                Bug Conhecido Cadastrado!
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Registro incluído com sucesso na base de conhecimento.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Bug Summary Card */}
        <div className="p-5 space-y-4">
          <div className="bg-muted/30 border border-border/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-md border border-primary/20">
                {bug.bug_code}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/40">
                {formatBugSeverity(bug.severity)}
              </span>
            </div>
            <h4 className="text-xs font-semibold text-foreground line-clamp-2">
              {bug.title}
            </h4>
            {bug.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-2">
                {bug.description}
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            O que deseja fazer agora?
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-9 text-xs gap-1.5 cursor-pointer font-medium"
            >
              <PlusCircle size={14} />
              Cadastrar Outro
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => {
                onClose();
                onViewInList(bug);
              }}
              className="flex-1 h-9 text-xs gap-1.5 cursor-pointer font-semibold"
            >
              <ListFilter size={14} />
              Visualizar na Lista
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
