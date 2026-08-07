import React, { useState, useRef } from "react";
import type { CreateIncidentPayload } from "../../types/incidents";
import type { KnownBug } from "../../types/bugs";
import { Image as ImageIcon, Link as LinkIcon, Trash2 } from "lucide-react";

interface NewIncidentFormProps {
  knownBugs: KnownBug[];
  onSubmit: (payload: CreateIncidentPayload) => Promise<void>;
  isLoading?: boolean;
  onGoToBugsHub?: () => void;
}

export const NewIncidentForm: React.FC<NewIncidentFormProps> = ({
  knownBugs,
  onSubmit,
  isLoading = false,
  onGoToBugsHub,
}) => {
  const [title, setTitle] = useState("");
  const [environment, setEnvironment] = useState("");
  const [corporationId, setCorporationId] = useState("");
  const [corporationName, setCorporationName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [reportedAt, setReportedAt] = useState("");
  const [observedBehavior, setObservedBehavior] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [selectedBugId, setSelectedBugId] = useState<string>("");
  const [serialsText, setSerialsText] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAddEvidence = () => {
    if (evidenceUrl.trim()) {
      setEvidenceUrls((prev) => [...prev, evidenceUrl.trim()]);
      setEvidenceUrl("");
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setEvidenceUrls((prev) => [
              ...prev,
              event.target!.result as string,
            ]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = "";
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        e.preventDefault();
        e.stopPropagation();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setEvidenceUrls((prev) => [
                ...prev,
                event.target!.result as string,
              ]);
            }
          };
          reader.readAsDataURL(file);
        }
        break; // Garante que apenas 1 imagem por colar seja processada
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const titleErr = validateField(title);
    const environmentErr = validateField(environment);
    const reportedAtErr = validateField(reportedAt);
    const corporationIdErr = validateField(corporationId);
    const observedBehaviorErr = validateField(observedBehavior);
    const expectedBehaviorErr = validateField(expectedBehavior);

    if (
      titleErr ||
      environmentErr ||
      reportedAtErr ||
      corporationIdErr ||
      observedBehaviorErr ||
      expectedBehaviorErr
    ) {
      return;
    }

    const autoTicketNumber = `INC-${Math.floor(1000 + Math.random() * 9000)}`;

    const serials = serialsText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    let parsedDate = reportedAt;
    const dateObj = new Date(reportedAt);
    if (!isNaN(dateObj.getTime())) {
      parsedDate = dateObj.toISOString();
    }

    const payload: CreateIncidentPayload = {
      bug_id: selectedBugId || null,
      ticket_number: autoTicketNumber,
      title: title.trim(),
      environment: environment.trim(),
      corporation_id: corporationId.trim(),
      corporation_name: corporationName.trim() || corporationId.trim(),
      reporter_contact: reporterContact.trim() || "Não informado",
      reported_at: parsedDate,
      observed_behavior: observedBehavior.trim(),
      expected_behavior: expectedBehavior.trim(),
      evidence_urls: evidenceUrls,
      affected_devices_count: serials.length > 0 ? serials.length : 1,
      affected_serials: serials,
      created_by: "Analista de Suporte",
      updated_by: "Analista de Suporte",
    };

    await onSubmit(payload);
    // Reset form
    setTitle("");
    setEnvironment("");
    setCorporationId("");
    setCorporationName("");
    setReporterContact("");
    setReportedAt("");
    setObservedBehavior("");
    setExpectedBehavior("");
    setEvidenceUrls([]);
    setSerialsText("");
    setSelectedBugId("");
    setSubmitted(false);
    setTouched({});
  };

  return (
    <div className="bg-card text-card-foreground border border-border/40 rounded-2xl p-6 shadow-sm mb-6">
      <h3 className="text-xl font-bold mb-1 tracking-tight">
        Formulário de Chamados
      </h3>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Nome do Chamado */}
        <div>
          <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
            Nome / Título do Chamado *
          </label>
          <input
            type="text"
            placeholder="Ex: Usuários de empresas encontram erro ao tentar logar"
            className={`w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors font-medium ${getInputBorderClass(
              "title",
              title,
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

        {/* Linha 1: Ambiente e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Ambiente *
            </label>
            <input
              type="text"
              placeholder="Ex: Produção"
              className={`w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${getInputBorderClass(
                "environment",
                environment,
              )}`}
              value={environment}
              onChange={(e) => {
                setEnvironment(e.target.value);
                markTouched("environment");
              }}
              onBlur={() => markTouched("environment")}
            />
            {renderFieldError("environment", environment)}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Data *
            </label>
            <input
              type="text"
              placeholder="Ex: 05/08/2026 19:10"
              className={`w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${getInputBorderClass(
                "reportedAt",
                reportedAt,
              )}`}
              value={reportedAt}
              onChange={(e) => {
                setReportedAt(e.target.value);
                markTouched("reportedAt");
              }}
              onBlur={() => markTouched("reportedAt")}
            />
            {renderFieldError("reportedAt", reportedAt)}
          </div>
        </div>

        {/* Linha 2: Corporação ID, Nome, Usuário Reportante */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              ID da Corporação *
            </label>
            <input
              type="text"
              placeholder="Ex: 102"
              className={`w-full bg-background border rounded-lg px-3 py-2 text-sm focus:outline-none transition-colors ${getInputBorderClass(
                "corporationId",
                corporationId,
              )}`}
              value={corporationId}
              onChange={(e) => {
                setCorporationId(e.target.value);
                markTouched("corporationId");
              }}
              onBlur={() => markTouched("corporationId")}
            />
            {renderFieldError("corporationId", corporationId)}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Nome da Corporação / Cliente
            </label>
            <input
              type="text"
              placeholder="Ex: Logística Amazonas"
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={corporationName}
              onChange={(e) => setCorporationName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Usuário / Solicitante de Report
            </label>
            <input
              type="text"
              placeholder="Ex: joao.silva@empresa.com"
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={reporterContact}
              onChange={(e) => setReporterContact(e.target.value)}
            />
          </div>
        </div>

        {/* Linha 3: Deduplicação (Vínculo com Bug Conhecido) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold uppercase text-muted-foreground">
              Vincular ao Corpo Único do Bug
            </label>
            {onGoToBugsHub && (
              <button
                type="button"
                onClick={onGoToBugsHub}
                className="text-xs text-primary hover:underline font-semibold cursor-pointer"
              >
                + Cadastrar Novo Bug Conhecido
              </button>
            )}
          </div>
          <select
            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedBugId}
            onChange={(e) => setSelectedBugId(e.target.value)}
          >
            <option value="">Selecione um Bug Cadastrado (Opcional)</option>
            {knownBugs.map((bug) => (
              <option key={bug.id} value={bug.id}>
                [{bug.bug_code}] {bug.title} ({bug.severity}) - Status:{" "}
                {bug.status}
              </option>
            ))}
          </select>
        </div>

        {/* Linha 4: Comportamento Observado vs Esperado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Comportamento Observado (Erro/Falha Ocorrida) *
            </label>
            <textarea
              rows={3}
              placeholder="Descreva detalhadamente o erro observado..."
              className={`w-full bg-background border rounded-lg p-3 text-sm focus:outline-none transition-colors resize-none ${getInputBorderClass(
                "observedBehavior",
                observedBehavior,
              )}`}
              value={observedBehavior}
              onChange={(e) => {
                setObservedBehavior(e.target.value);
                markTouched("observedBehavior");
              }}
              onBlur={() => markTouched("observedBehavior")}
            />
            {renderFieldError("observedBehavior", observedBehavior)}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Comportamento Esperado *
            </label>
            <textarea
              rows={3}
              placeholder="Descreva o comportamento correto esperado do sistema..."
              className={`w-full bg-background border rounded-lg p-3 text-sm focus:outline-none transition-colors resize-none ${getInputBorderClass(
                "expectedBehavior",
                expectedBehavior,
              )}`}
              value={expectedBehavior}
              onChange={(e) => {
                setExpectedBehavior(e.target.value);
                markTouched("expectedBehavior");
              }}
              onBlur={() => markTouched("expectedBehavior")}
            />
            {renderFieldError("expectedBehavior", expectedBehavior)}
          </div>
        </div>

        {/* Linha 5: Evidências e Seriais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Evidências
            </label>

            <div
              onPaste={handlePaste}
              className="border border-dashed border-input rounded-xl p-3 bg-muted/10 hover:bg-muted/20 transition-colors space-y-3"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Cole imagem (Ctrl+V) ou digite URL (https://...)"
                  className="flex-1 bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                />
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleAddEvidence}
                    className="px-3 py-2 bg-secondary text-secondary-foreground font-semibold text-xs rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <LinkIcon size={14} />
                    Adicionar
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-primary/10 text-primary font-semibold text-xs rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1.5 cursor-pointer border border-primary/20"
                  >
                    <ImageIcon size={14} />
                    Anexar
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Lista e Previews de Evidências */}
              {evidenceUrls.length > 0 && (
                <div className="flex flex-wrap gap-2.5 pt-1 max-h-48 overflow-y-auto pr-1">
                  {evidenceUrls.map((url, i) => {
                    const isImage =
                      url.startsWith("data:image/") ||
                      /\.(png|jpe?g|gif|webp|svg)($|\?)/i.test(url);

                    return (
                      <div
                        key={i}
                        className="relative group border border-border/60 rounded-xl overflow-hidden bg-background shadow-xs transition-all hover:border-primary/50"
                      >
                        {isImage ? (
                          <div className="relative w-20 h-20">
                            <img
                              src={url}
                              alt={`Evidência ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveEvidence(i)}
                              className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
                              title="Remover Imagem"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2 text-xs max-w-[220px]">
                            <LinkIcon
                              size={14}
                              className="text-primary shrink-0"
                            />
                            <span className="truncate text-muted-foreground">
                              {url}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEvidence(i)}
                              className="text-rose-500 hover:text-rose-700 font-bold ml-1 cursor-pointer shrink-0"
                              title="Remover Link"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
              Seriais dos Aparelhos Afetados (1 por linha)
            </label>
            <textarea
              rows={4}
              placeholder="Insira os números de série..."
              className="w-full bg-background border border-input rounded-lg p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              value={serialsText}
              onChange={(e) => setSerialsText(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
          >
            {isLoading ? "Cadastrando..." : "Registrar Chamado Padronizado"}
          </button>
        </div>
      </form>
    </div>
  );
};
