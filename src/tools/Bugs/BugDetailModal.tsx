import React, { useEffect } from "react";
import type { KnownBug, BugSeverity, BugStatus } from "../../types/bugs";
import { formatBugSeverity, formatBugStatus } from "../../types/bugs";
import {
  X,
  Calendar,
  User,
  AlertTriangle,
  LifeBuoy,
  Edit3,
  Lock,
} from "lucide-react";
import { Button } from "../../components/ui/button";

interface BugDetailModalProps {
  bug: KnownBug | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEdit: (bug: KnownBug) => void;
}

const getSeverityBadge = (sev: BugSeverity) => {
  switch (sev) {
    case "CRITICAL":
      return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    case "HIGH":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "MEDIUM":
      return "bg-primary/10 text-primary border-primary/20";
    case "LOW":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusBadge = (status: BugStatus) => {
  switch (status) {
    case "INVESTIGATING":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "WORKAROUND_READY":
      return "bg-primary/10 text-primary border-primary/20";
    case "IN_DEVELOPMENT":
      return "bg-violet-500/10 text-violet-500 border-violet-500/20";
    case "RESOLVED":
    case "CLOSED":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const BugDetailModal: React.FC<BugDetailModalProps> = ({
  bug,
  isOpen,
  onClose,
  onOpenEdit,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bug-detail-modal-title"
    >
      <div className="bg-card text-card-foreground border border-border/40 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/40 pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-md border border-primary/20">
                {bug.bug_code}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getSeverityBadge(
                  bug.severity,
                )}`}
              >
                Severidade: {formatBugSeverity(bug.severity)}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(
                  bug.status,
                )}`}
              >
                Status: {formatBugStatus(bug.status)}
              </span>
            </div>
            <h2
              id="bug-detail-modal-title"
              className="text-xl font-bold text-foreground leading-snug"
            >
              {bug.title || "Bug Sem Título"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Metadados Básicos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/20 p-4 rounded-xl border border-border/30 text-xs">
          <div className="flex items-center gap-2.5">
            <Lock size={16} className="text-primary shrink-0" />
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Código do Bug
              </span>
              <span className="font-mono font-bold text-foreground">
                {bug.bug_code}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Calendar size={16} className="text-primary shrink-0" />
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Data de Criação
              </span>
              <span className="font-medium text-foreground">
                {new Date(bug.created_at).toLocaleString("pt-BR")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <User size={16} className="text-primary shrink-0" />
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Cadastrado por
              </span>
              <span className="font-medium text-foreground">
                {bug.created_by || "Analista de Suporte"}
              </span>
            </div>
          </div>
        </div>

        {/* Descrição da Causa Raiz / Falha Completa */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-500">
            <AlertTriangle size={14} />
            <h4>Descrição do Bug</h4>
          </div>
          <div className="bg-muted/30 border border-border/40 rounded-xl p-4">
            <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed font-sans select-text">
              {bug.description || "Nenhuma descrição informada."}
            </p>
          </div>
        </div>

        {/* Solução / Instruções de Contorno (Workaround) Completa */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <LifeBuoy size={14} />
            <h4>Instruções de Contorno</h4>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
            {bug.workaround_instructions ? (
              <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed font-sans select-text">
                {bug.workaround_instructions}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Nenhuma instrução de contorno informada até o momento.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onOpenEdit(bug);
            }}
            className="h-9 text-xs px-4 gap-1.5 font-semibold text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
          >
            <Edit3 size={18} />
            Editar
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="h-9 text-xs px-5 font-semibold cursor-pointer"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};
