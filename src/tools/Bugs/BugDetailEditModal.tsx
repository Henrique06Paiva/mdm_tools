import React, { useState, useEffect } from "react";
import type { KnownBug, BugSeverity, BugStatus } from "../../types/bugs";
import { formatBugSeverity } from "../../types/bugs";
import { X, Calendar, Save, CheckCircle2, Lock } from "lucide-react";
import { Input, Label } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

interface BugDetailEditModalProps {
  bug: KnownBug | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, payload: Partial<KnownBug>) => Promise<void>;
  isLoading?: boolean;
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

const BugEditForm: React.FC<{
  bug: KnownBug;
  onClose: () => void;
  onSave: (id: string, payload: Partial<KnownBug>) => Promise<void>;
  isLoading?: boolean;
}> = ({ bug, onClose, onSave, isLoading }) => {
  const [title, setTitle] = useState(bug.title || "");
  const [description, setDescription] = useState(bug.description || "");
  const [workaroundInstructions, setWorkaroundInstructions] = useState(
    bug.workaround_instructions || "",
  );
  const [severity, setSeverity] = useState<BugSeverity>(
    bug.severity || "MEDIUM",
  );
  const [status, setStatus] = useState<BugStatus>(
    bug.status || "INVESTIGATING",
  );
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Título e Descrição são campos obrigatórios.");
      return;
    }

    try {
      await onSave(bug.id, {
        title: title.trim(),
        description: description.trim(),
        workaround_instructions: workaroundInstructions.trim(),
        severity,
        status,
        updated_by: "Analista de Suporte",
      });
      setIsSuccessFeedback(true);
      setTimeout(() => {
        setIsSuccessFeedback(false);
        onClose();
      }, 700);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-bug-severity" className="text-xs">
            Severidade *
          </Label>
          <select
            id="edit-bug-severity"
            className="flex h-9 w-full rounded-lg border border-border bg-input px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as BugSeverity)}
          >
            <option value="CRITICAL">Crítica (Paralisa Operação)</option>
            <option value="HIGH">Alta (Afeta Recursos Core)</option>
            <option value="MEDIUM">Média (Inconsistência Pontual)</option>
            <option value="LOW">Baixa (Secundário)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-bug-status" className="text-xs">
            Status de Correção *
          </Label>
          <select
            id="edit-bug-status"
            className="flex h-9 w-full rounded-lg border border-border bg-input px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={status}
            onChange={(e) => setStatus(e.target.value as BugStatus)}
          >
            <option value="INVESTIGATING">Em Análise </option>
            <option value="WORKAROUND_READY">
              Contorno / Workaround Pronto
            </option>
            <option value="IN_DEVELOPMENT">Em Desenvolvimento</option>
            <option value="AWAITING_RELEASE">Aguardando Deploy</option>
            <option value="RESOLVED">Resolvido em Produção</option>
            <option value="CLOSED">Encerrado e Validado</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-bug-title" className="text-xs">
          Título *
        </Label>
        <Input
          id="edit-bug-title"
          type="text"
          className="h-9 text-xs font-sans"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-bug-desc" className="text-xs">
          Descrição *
        </Label>
        <textarea
          id="edit-bug-desc"
          rows={3}
          className="w-full bg-input border border-border rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring resize-none font-sans"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-bug-workaround" className="text-xs">
          Instruções de Contorno
        </Label>
        <textarea
          id="edit-bug-workaround"
          rows={3}
          placeholder="Orientação temporária para o cliente ou equipe de suporte..."
          className="w-full bg-input border border-border rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring resize-none font-sans"
          value={workaroundInstructions}
          onChange={(e) => setWorkaroundInstructions(e.target.value)}
        />
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border/40">
        {isSuccessFeedback ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
            <CheckCircle2 size={15} /> Alterações salvas com sucesso!
          </span>
        ) : (
          <div />
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 text-xs px-4 cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isLoading}
            className="h-9 text-xs px-5 gap-1.5 font-semibold cursor-pointer"
          >
            <Save size={14} />
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export const BugDetailEditModal: React.FC<BugDetailEditModalProps> = ({
  bug,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !bug) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bug-edit-modal-title"
    >
      <div className="bg-card text-card-foreground border border-border/40 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/40 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-md border border-primary/20">
                {bug.bug_code}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getSeverityBadge(
                  bug.severity,
                )}`}
              >
                {formatBugSeverity(bug.severity)}
              </span>
            </div>
            <h2
              id="bug-edit-modal-title"
              className="text-lg font-bold text-foreground"
            >
              Visualizar & Editar Bug Conhecido
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Metadados Estáticos (Não Alteráveis) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/30 text-xs">
          <div className="flex items-center gap-2.5">
            <Lock size={15} className="text-muted-foreground shrink-0" />
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Código do Registro (Fixo)
              </span>
              <span className="font-mono font-bold text-foreground">
                {bug.bug_code}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Calendar size={15} className="text-muted-foreground shrink-0" />
            <div>
              <span className="text-muted-foreground block text-[11px]">
                Data de Criação (Fixa)
              </span>
              <span className="font-medium text-foreground">
                {new Date(bug.created_at).toLocaleString("pt-BR")}
              </span>
            </div>
          </div>
        </div>

        {/* Formulário de Edição */}
        <BugEditForm
          key={bug.id}
          bug={bug}
          onClose={onClose}
          onSave={onSave}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
