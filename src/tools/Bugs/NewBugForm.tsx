import React, { useState } from "react";
import type { CreateBugPayload, BugSeverity, BugStatus } from "../../types/bugs";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input, Label } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { PlusCircle } from "lucide-react";

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
      return "Campo obrigatório";
    }
    if (/^\s|\s$/.test(val)) {
      return "Não é permitido espaços no início ou fim";
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
      <span className="text-[11px] text-destructive font-medium mt-1 block">
        {err}
      </span>
    );
  };

  const getInputBorderClass = (fieldKey: string, value: string) => {
    if ((submitted || touched[fieldKey]) && validateField(value)) {
      return "border-destructive focus-visible:ring-destructive/40";
    }
    return "";
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
    <Card className="border-border/50 shadow-sm mb-6">
      <CardHeader className="bg-muted/10 py-3.5 px-5 border-b border-border/40">
        <CardTitle className="text-foreground text-xs font-bold tracking-wider uppercase">
          Cadastro de Bug Conhecido (Corpo Único)
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bug-code" className="text-xs">
                Código do Bug
              </Label>
              <Input
                id="bug-code"
                type="text"
                className="h-9 text-xs font-mono"
                value={bugCode}
                onChange={(e) => setBugCode(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bug-severity" className="text-xs">
                Severidade
              </Label>
              <select
                id="bug-severity"
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
              <Label htmlFor="bug-status" className="text-xs">
                Status de Correção
              </Label>
              <select
                id="bug-status"
                className="flex h-9 w-full rounded-lg border border-border bg-input px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={status}
                onChange={(e) => setStatus(e.target.value as BugStatus)}
              >
                <option value="INVESTIGATING">Em Análise (N3/Dev)</option>
                <option value="WORKAROUND_READY">Contorno / Workaround Pronto</option>
                <option value="IN_DEVELOPMENT">Em Correção na Engenharia</option>
                <option value="AWAITING_RELEASE">Aguardando Deploy (Staging)</option>
                <option value="RESOLVED">Resolvido em Produção</option>
                <option value="CLOSED">Encerrado e Validado</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bug-title" className="text-xs">
              Título do Bug / Falha Sistêmica *
            </Label>
            <Input
              id="bug-title"
              type="text"
              placeholder="Ex: Erro 500 ao consultar terminais da versão 1.4"
              className={`h-9 text-xs font-sans ${getInputBorderClass("title", title)}`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markTouched("title");
              }}
              onBlur={() => markTouched("title")}
            />
            {renderFieldError("title", title)}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bug-desc" className="text-xs">
              Descrição da Causa Raiz / Falha *
            </Label>
            <textarea
              id="bug-desc"
              rows={3}
              placeholder="Descreva detalhadamente a falha técnica ou causa raiz..."
              className={`w-full bg-input border border-border rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring resize-none ${getInputBorderClass(
                "description",
                description,
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

          <div className="space-y-1.5">
            <Label htmlFor="bug-workaround" className="text-xs">
              Instruções de Contorno (Workaround)
            </Label>
            <textarea
              id="bug-workaround"
              rows={2}
              placeholder="Orientação temporária para o cliente ou suporte..."
              className="w-full bg-input border border-border rounded-lg p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              value={workaroundInstructions}
              onChange={(e) => setWorkaroundInstructions(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer gap-2 h-9 px-5 font-semibold text-xs"
            >
              <PlusCircle size={14} />
              {isLoading ? "Cadastrando..." : "Cadastrar Bug Conhecido"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
