import React, { useState, useRef } from "react";
import type { CreateIncidentPayload } from "../../types/incidents";
import type { KnownBug } from "../../types/bugs";
import { formatBugSeverity, formatBugStatus } from "../../types/bugs";
import {
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Input, Label } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

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
        break;
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
    <Card className="border-border/50 shadow-sm mb-6">
      <CardHeader className="bg-muted/10 py-3.5 px-5 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-foreground text-xs font-bold tracking-wider uppercase">
          Abertura de Chamado Padronizado
        </CardTitle>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          * Campos Obrigatórios
        </span>
      </CardHeader>

      <CardContent className="p-5">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Título do Chamado */}
          <div className="space-y-1.5">
            <Label htmlFor="inc-title" className="text-xs">
              Título do Chamado *
            </Label>
            <Input
              id="inc-title"
              type="text"
              placeholder="Ex: Falha de sincronização de pacotes nos terminais"
              className={`h-10 text-sm font-sans ${getInputBorderClass("title", title)}`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markTouched("title");
              }}
              onBlur={() => markTouched("title")}
            />
            {renderFieldError("title", title)}
          </div>

          {/* Linha 1: Ambiente, Data, Corporação */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="inc-env" className="text-xs">
                Ambiente *
              </Label>
              <Input
                id="inc-env"
                type="text"
                placeholder="Ex: Produção"
                className={`h-9 text-xs font-sans ${getInputBorderClass("environment", environment)}`}
                value={environment}
                onChange={(e) => {
                  setEnvironment(e.target.value);
                  markTouched("environment");
                }}
                onBlur={() => markTouched("environment")}
              />
              {renderFieldError("environment", environment)}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inc-date" className="text-xs">
                Data do Report *
              </Label>
              <Input
                id="inc-date"
                type="text"
                placeholder="Ex: 27/08/2026 14:30"
                className={`h-9 text-xs font-sans ${getInputBorderClass("reportedAt", reportedAt)}`}
                value={reportedAt}
                onChange={(e) => {
                  setReportedAt(e.target.value);
                  markTouched("reportedAt");
                }}
                onBlur={() => markTouched("reportedAt")}
              />
              {renderFieldError("reportedAt", reportedAt)}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inc-corpid" className="text-xs">
                ID da Corporação *
              </Label>
              <Input
                id="inc-corpid"
                type="text"
                placeholder="Ex: 102"
                className={`h-9 text-xs font-sans ${getInputBorderClass("corporationId", corporationId)}`}
                value={corporationId}
                onChange={(e) => {
                  setCorporationId(e.target.value);
                  markTouched("corporationId");
                }}
                onBlur={() => markTouched("corporationId")}
              />
              {renderFieldError("corporationId", corporationId)}
            </div>
          </div>

          {/* Linha 2: Nome Corporação e Solicitante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="inc-corpname" className="text-xs">
                Nome do Cliente / Corporação
              </Label>
              <Input
                id="inc-corpname"
                type="text"
                placeholder="Ex: Logística Amazonas"
                className="h-9 text-xs font-sans"
                value={corporationName}
                onChange={(e) => setCorporationName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inc-reporter" className="text-xs">
                Solicitante / E-mail de Contato
              </Label>
              <Input
                id="inc-reporter"
                type="text"
                placeholder="Ex: contato@cliente.com"
                className="h-9 text-xs font-sans"
                value={reporterContact}
                onChange={(e) => setReporterContact(e.target.value)}
              />
            </div>
          </div>

          {/* Vínculo de Bug Conhecido (Deduplicação) */}
          <div className="space-y-1.5 p-3.5 bg-muted/20 border border-border/30 rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Vincular ao Corpo Único do Bug
              </Label>
              {onGoToBugsHub && (
                <button
                  type="button"
                  onClick={onGoToBugsHub}
                  className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                >
                  + Novo Bug Conhecido
                </button>
              )}
            </div>
            <select
              className="w-full bg-background border border-border/60 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              value={selectedBugId}
              onChange={(e) => setSelectedBugId(e.target.value)}
            >
              <option value="">Nenhum bug vinculado (Opcional)</option>
              {knownBugs.map((bug) => (
                <option key={bug.id} value={bug.id}>
                  [{bug.bug_code}] {bug.title} (
                  {formatBugSeverity(bug.severity)}) -{" "}
                  {formatBugStatus(bug.status)}
                </option>
              ))}
            </select>
          </div>

          {/* Comportamento Observado vs Esperado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-rose-500">
                Comportamento Observado (Erro/Falha) *
              </Label>
              <textarea
                rows={3}
                placeholder="Descreva detalhadamente o erro observado..."
                className={`w-full bg-input border border-border rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring resize-none ${getInputBorderClass(
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

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-emerald-500">
                Comportamento Esperado *
              </Label>
              <textarea
                rows={3}
                placeholder="Descreva o comportamento correto esperado..."
                className={`w-full bg-input border border-border rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring resize-none ${getInputBorderClass(
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

          {/* Evidências e Seriais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">
                Evidências (Print / Imagem / Link)
              </Label>

              <div
                onPaste={handlePaste}
                className="border border-dashed border-border/60 rounded-lg p-3 bg-muted/10 space-y-2.5"
              >
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="URL ou cole print (Ctrl+V)"
                    className="h-8 text-xs flex-1 font-sans"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddEvidence}
                    className="h-8 text-xs cursor-pointer gap-1 px-2.5"
                  >
                    <LinkIcon size={12} />
                    Adicionar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 text-xs cursor-pointer gap-1 px-2.5"
                  >
                    <ImageIcon size={12} />
                    Anexar
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {evidenceUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto">
                    {evidenceUrls.map((url, i) => {
                      const isImage =
                        url.startsWith("data:image/") ||
                        /\.(png|jpe?g|gif|webp|svg)($|\?)/i.test(url);

                      return (
                        <div
                          key={i}
                          className="relative group border border-border/60 rounded-lg overflow-hidden bg-background shadow-xs"
                        >
                          {isImage ? (
                            <div className="relative w-16 h-16">
                              <img
                                src={url}
                                alt={`Evidência ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveEvidence(i)}
                                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-md hover:opacity-90 cursor-pointer"
                                title="Remover Imagem"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs max-w-[180px]">
                              <LinkIcon
                                size={12}
                                className="text-primary shrink-0"
                              />
                              <span className="truncate text-muted-foreground">
                                {url}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveEvidence(i)}
                                className="text-destructive font-bold ml-1 cursor-pointer shrink-0"
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

            <div className="space-y-1.5">
              <Label htmlFor="inc-serials" className="text-xs">
                Seriais Afetados (1 por linha)
              </Label>
              <textarea
                id="inc-serials"
                rows={3}
                placeholder="Insira os números de série..."
                className="w-full bg-input border border-border rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                value={serialsText}
                onChange={(e) => setSerialsText(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer gap-2 h-10 px-6 font-semibold"
            >
              <CheckCircle2 size={16} />
              {isLoading ? "Registrando..." : "Registrar Chamado Padronizado"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
