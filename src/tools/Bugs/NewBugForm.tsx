import React, { useState } from "react";
import type { CreateBugPayload, BugSeverity, BugStatus } from "../../types/bugs";

interface NewBugFormProps {
  onSubmit: (payload: CreateBugPayload) => Promise<void>;
  isLoading?: boolean;
}

export const NewBugForm: React.FC<NewBugFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [bugCode, setBugCode] = useState(
    `BUG-2026-${Math.floor(100 + Math.random() * 900)}`
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<BugSeverity>("MEDIUM");
  const [status, setStatus] = useState<BugStatus>("INVESTIGATING");
  const [workaroundInstructions, setWorkaroundInstructions] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (val: string): string | null => {
    if (!val || val.trim().length === 0) {
      return "Informação obrigatória";
    }
    if (/^\s|\s$/.test(val)) {
      return "Não é permitido espaços no início ou no fim";
    }
    return null;
  };

  const markTouched = (key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const renderFieldError = (fieldKey: string, value: string) => {
    if (!submitted && !touched[fieldKey]) return null;
    const err = validateField(value);
    if (!err) return null;
    return (
      <span className="text-xs text-rose-500 font-medium mt-1 block">
        {err}
      </span>
    );
  };

  const getInputBorderClass = (fieldKey: string, value: string) => {
    if ((submitted || touched[fieldKey]) && validateField(value)) {
      return "border-rose-500 focus:ring-2 focus:ring-rose-500 bg-rose-500/5";
    }
    return "border-input focus:ring-2 focus:ring-primary";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const titleErr = validateField(title);
    const descriptionErr = validateField(description);

    if (titleErr || descriptionErr) {
      return;
    }

    const payload: CreateBugPayload = {
      bug_code: bugCode,
      title: title.trim(),
      description: description.trim(),
      symptoms: [],
      workaround_instructions: workaroundInstructions.trim(),
      affected_components: [],
      severity: severity,
      status: status,
      created_by: "Analista de Suporte",
      updated_by: "Analista de Suporte",
    };

    await onSubmit(payload);
    // Reset form
    setBugCode(`BUG-2026-${Math.floor(100 + Math.random() * 900)}`);
    setTitle("");
    setDescription("");
    setSeverity("MEDIUM");
    setStatus("INVESTIGATING");
    setWorkaroundInstructions("");
    setSubmitted(false);
    setTouched({});
  };

  return (
    <div className="bg-card text-card-foreground border border-border/40 rounded-2xl p-6 shadow-sm mb-6">
      <h3 className="text-xl font-bold mb-1 tracking-tight">
        Cadastro de Bug Conhecido (Corpo Único)
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Cadastre a falha sistêmica mapeada para que múltiplos chamados possam ser vinculados a esta mesma causa raiz.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Código do Bug
            </label>
            <input
              type="text"
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              value={bugCode}
              onChange={(e) => setBugCode(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Severidade
            </label>
            <select
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as BugSeverity)}
            >
              <option value="CRITICAL">CRÍTICA (Paralisa Operação)</option>
              <option value="HIGH">ALTA (Afeta Recursos Core)</option>
              <option value="MEDIUM">MÉDIA (Inconsistência Pontual)</option>
              <option value="LOW">BAIXA (Cosmético/Secundário)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Status de Correção
            </label>
            <select
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={status}
              onChange={(e) => setStatus(e.target.value as BugStatus)}
            >
              <option value="INVESTIGATING">Em Análise (N3/Dev)</option>
              <option value="WORKAROUND_READY">Contorno/Workaround Pronto</option>
              <option value="IN_DEVELOPMENT">Em Correção na Engenharia</option>
              <option value="AWAITING_RELEASE">Aguardando Deploy (Staging)</option>
              <option value="RESOLVED">Resolvido em Produção</option>
              <option value="CLOSED">Encerrado e Validado</option>
            </select>
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
            Título do Bug / Erro Raiz *
          </label>
          <input
            type="text"
            placeholder="Ex: Falha na autenticação JWT de usuários corporativos com token expirado"
            className={`w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors font-medium ${getInputBorderClass(
              "title",
              title
            )}`}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              markTouched("title");
            }}
            onBlur={() => markTouched("title")}
          />
          {renderFieldError("title", title)}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
            Descrição Técnica da Falha *
          </label>
          <textarea
            rows={3}
            placeholder="Descreva a causa raiz do problema e o comportamento dos servidores..."
            className={`w-full bg-background border rounded-lg p-3 text-sm focus:outline-none transition-colors resize-none ${getInputBorderClass(
              "description",
              description
            )}`}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              markTouched("description");
            }}
            onBlur={() => markTouched("description")}
          />
          {renderFieldError("description", description)}
        </div>

        {/* Instruções de Contorno (Workaround) */}
        <div>
          <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
            Instruções de Contorno / Workaround (Para Atendimento N1/N2)
          </label>
          <textarea
            rows={3}
            placeholder="Passo a passo para contornar o problema enquanto a solução definitiva não é lançada..."
            className="w-full bg-background border border-input rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            value={workaroundInstructions}
            onChange={(e) => setWorkaroundInstructions(e.target.value)}
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md cursor-pointer"
          >
            {isLoading ? "Cadastrando..." : "Cadastrar Bug Conhecido"}
          </button>
        </div>
      </form>
    </div>
  );
};
