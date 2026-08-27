import { type RefObject, type ChangeEvent, memo } from "react";
import { Plus, X, Upload, RefreshCw } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Input, Label } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

interface ConfigPanelProps {
  packages: string[];
  setPackages: (packages: string[]) => void;
  fetchAllApps: boolean;
  setFetchAllApps: (fetchAll: boolean) => void;
  includeSystemApps: boolean;
  setIncludeSystemApps: (includeSys: boolean) => void;
  addLog: (msg: string, type: "info" | "warn" | "err" | "ok") => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFile: (e: ChangeEvent<HTMLInputElement>) => void;
  serials: string[];
  columns: string[];
  selectedCol: number;
  applyColumn: (data: any[], colIdx: number) => void;
  rawData: any[];
  searchSource: "filters" | "file";
  setSearchSource: (source: "filters" | "file") => void;
  corporationId: string;
  setCorporationId: (id: string) => void;
  companyId: string;
  setCompanyId: (id: string) => void;
  subsidiaryId: string;
  setSubsidiaryId: (id: string) => void;
  availableCorpApps?: Array<{ appName: string; packageName: string; version?: string }>;
  isLoadingCorpApps?: boolean;
  loadCorpApps?: (corpId: string) => void;
  onlyWithApp?: boolean;
  setOnlyWithApp?: (val: boolean) => void;
  isProcessing: boolean;
  restrictions: {
    corpDisabled: boolean;
    companyDisabled: boolean;
    subsidiaryDisabled: boolean;
    allowedCorps: number[];
    allowedCompanies: number[];
    allowedSubsidiaries: number[];
  };
}

export const ConfigPanel = memo(function ConfigPanel({
  packages,
  setPackages,
  fetchAllApps,
  setFetchAllApps,
  includeSystemApps,
  setIncludeSystemApps,
  addLog,
  fileInputRef,
  handleFile,
  serials,
  columns,
  selectedCol,
  applyColumn,
  rawData,
  searchSource,
  setSearchSource,
  corporationId,
  setCorporationId,
  companyId,
  setCompanyId,
  subsidiaryId,
  setSubsidiaryId,
  availableCorpApps = [],
  isLoadingCorpApps = false,
  loadCorpApps,
  onlyWithApp = false,
  setOnlyWithApp,
  isProcessing,
  restrictions,
}: ConfigPanelProps) {
  return (
    <Card className="mb-6 border-border/50 shadow-sm">
      <CardHeader className="bg-muted/10 py-3.5 px-5 border-b border-border/40">
        <CardTitle className="text-foreground text-xs font-bold tracking-wider uppercase">
          Configuração da Consulta
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Top Controls: Options & Filters */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-6 p-3 bg-muted/20 border border-border/30 rounded-lg">
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={fetchAllApps}
                disabled={isProcessing}
                onClick={() => setFetchAllApps(!fetchAllApps)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                  fetchAllApps ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                    fetchAllApps ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-xs font-semibold text-foreground">
                Trazer todos os aplicativos instalados
              </span>
            </div>

            {fetchAllApps && (
              <div className="flex items-center gap-3 pl-4 border-l border-border/40 animate-in fade-in duration-150">
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeSystemApps}
                  disabled={isProcessing}
                  onClick={() => setIncludeSystemApps(!includeSystemApps)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                    includeSystemApps ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                      includeSystemApps ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-xs text-muted-foreground">
                  Incluir apps de sistema (boSystem)
                </span>
              </div>
            )}
          </div>

          {!fetchAllApps && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Corporation App Selector */}
              <div className="p-3.5 bg-muted/20 border border-border/30 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Aplicativo da Corporação
                  </Label>
                  {loadCorpApps && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isLoadingCorpApps || isProcessing || !corporationId.trim()}
                      onClick={() => loadCorpApps(corporationId)}
                      className="text-xs text-primary h-6 px-2 cursor-pointer gap-1"
                    >
                      <RefreshCw size={11} className={isLoadingCorpApps ? "animate-spin" : ""} />
                      {isLoadingCorpApps ? "Carregando..." : "Atualizar"}
                    </Button>
                  )}
                </div>

                <select
                  disabled={isProcessing || isLoadingCorpApps || availableCorpApps.length === 0}
                  className="w-full bg-background border border-border/60 rounded-md px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  onChange={(e) => {
                    const selectedPkg = e.target.value;
                    if (selectedPkg) {
                      setPackages([selectedPkg]);
                    }
                  }}
                  value={packages[0] || ""}
                >
                  <option value="">
                    {availableCorpApps.length > 0
                      ? `-- Selecione (${availableCorpApps.length} encontrados) --`
                      : "-- Informe a corporação para listar os apps --"}
                  </option>
                  {availableCorpApps.map((app, i) => (
                    <option key={i} value={app.packageName}>
                      {app.appName} ({app.packageName})
                    </option>
                  ))}
                </select>

                {setOnlyWithApp && (
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={onlyWithApp}
                      disabled={isProcessing}
                      onClick={() => setOnlyWithApp(!onlyWithApp)}
                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                        onlyWithApp ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                          onlyWithApp ? "translate-x-3" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-[11px] text-muted-foreground">
                      Filtrar apenas terminais com o app instalado
                    </span>
                  </div>
                )}
              </div>

              {/* Package names list */}
              <div className="p-3.5 bg-muted/20 border border-border/30 rounded-lg space-y-2.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Package Name Personalizado
                </Label>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {packages.map((pkg, idx) => (
                    <div className="flex gap-1.5 items-center" key={idx}>
                      <Input
                        id={`pkg-input-${idx}`}
                        type="text"
                        value={pkg}
                        onChange={(e) => {
                          const newPkgs = [...packages];
                          newPkgs[idx] = e.target.value;
                          setPackages(newPkgs);
                        }}
                        placeholder="Ex: com.mdmservice"
                        disabled={isProcessing}
                        className="h-8 text-xs font-mono"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (packages.length > 1) {
                            setPackages(packages.filter((_, i) => i !== idx));
                          } else {
                            addLog(
                              "É necessário pelo menos um package name.",
                              "warn",
                            );
                          }
                        }}
                        disabled={isProcessing}
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPackages([...packages, ""])}
                  disabled={isProcessing}
                  className="h-7 text-xs cursor-pointer gap-1"
                >
                  <Plus size={12} /> Adicionar Pacote
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Source Selection */}
        <div className="pt-2 border-t border-border/30 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Seleção de Terminais
            </Label>
            <div className="flex bg-muted/30 p-0.5 rounded-lg border border-border/30">
              <button
                type="button"
                onClick={() => setSearchSource("filters")}
                disabled={isProcessing}
                className={`py-1 px-3 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  searchSource === "filters"
                    ? "bg-card text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Filtros de Corporação
              </button>
              <button
                type="button"
                onClick={() => setSearchSource("file")}
                disabled={isProcessing}
                className={`py-1 px-3 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  searchSource === "file"
                    ? "bg-card text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Importar Planilha
              </button>
            </div>
          </div>

          {searchSource === "filters" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <Label htmlFor="corp-id" className="text-xs font-medium">
                  Corporação *
                </Label>
                {restrictions.allowedCorps.length > 1 ? (
                  <select
                    id="corp-id"
                    value={corporationId}
                    onChange={(e) => setCorporationId(e.target.value)}
                    disabled={isProcessing || restrictions.corpDisabled}
                    className="flex h-9 w-full rounded-lg border border-border bg-input px-3 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {restrictions.allowedCorps.map((id) => (
                      <option key={id} value={id}>
                        Corporação {id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="corp-id"
                    type="text"
                    pattern="[0-9]*"
                    value={corporationId}
                    onChange={(e) => setCorporationId(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ex: 33"
                    disabled={isProcessing || restrictions.corpDisabled}
                    className="h-9 text-xs"
                    required
                  />
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="comp-id" className="text-xs font-medium">
                  Empresa (Opcional)
                </Label>
                {restrictions.allowedCompanies.length > 1 ? (
                  <select
                    id="comp-id"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    disabled={isProcessing || restrictions.companyDisabled}
                    className="flex h-9 w-full rounded-lg border border-border bg-input px-3 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Todas as Empresas</option>
                    {restrictions.allowedCompanies.map((id) => (
                      <option key={id} value={id}>
                        Empresa {id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="comp-id"
                    type="text"
                    pattern="[0-9]*"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ex: 425"
                    disabled={isProcessing || restrictions.companyDisabled}
                    className="h-9 text-xs"
                  />
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="sub-id" className="text-xs font-medium">
                  Filial (Opcional)
                </Label>
                {restrictions.allowedSubsidiaries.length > 1 ? (
                  <select
                    id="sub-id"
                    value={subsidiaryId}
                    onChange={(e) => setSubsidiaryId(e.target.value)}
                    disabled={isProcessing || restrictions.subsidiaryDisabled}
                    className="flex h-9 w-full rounded-lg border border-border bg-input px-3 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Todas as Filiais</option>
                    {restrictions.allowedSubsidiaries.map((id) => (
                      <option key={id} value={id}>
                        Filial {id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="sub-id"
                    type="text"
                    pattern="[0-9]*"
                    value={subsidiaryId}
                    onChange={(e) => setSubsidiaryId(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ex: 806"
                    disabled={isProcessing || restrictions.subsidiaryDisabled}
                    className="h-9 text-xs"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="pt-1">
              <div
                className={`border-2 border-dashed border-border/60 bg-muted/5 hover:bg-muted/15 transition-colors p-6 text-center rounded-lg cursor-pointer ${
                  isProcessing ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                tabIndex={isProcessing ? -1 : 0}
                role="button"
                onKeyDown={(e) => {
                  if (!isProcessing && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <Upload size={22} className="mx-auto text-muted-foreground mb-2" />
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  onChange={handleFile}
                  accept=".xlsx,.xls,.csv"
                  disabled={isProcessing}
                />
                <p className="font-medium text-foreground text-xs">
                  Clique para selecionar planilha (.xlsx, .csv)
                </p>
                {serials.length > 0 && (
                  <div className="mt-3">
                    <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-normal">
                      {serials.length} seriais carregados
                    </Badge>
                  </div>
                )}
              </div>

              {columns.length > 0 && (
                <div className="mt-3 space-y-1.5 max-w-xs">
                  <Label htmlFor="serial-col-select" className="text-xs">
                    Coluna de Seriais:
                  </Label>
                  <select
                    id="serial-col-select"
                    value={selectedCol}
                    disabled={isProcessing}
                    onChange={(e) => applyColumn(rawData, parseInt(e.target.value))}
                    className="flex h-9 w-full rounded-lg border border-border bg-input px-3 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {columns.map((col, idx) => (
                      <option key={idx} value={idx}>
                        {col || `Coluna ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
