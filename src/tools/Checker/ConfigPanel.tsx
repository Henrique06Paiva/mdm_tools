import { type RefObject, type ChangeEvent, memo } from "react";
import { Plus, X, Upload } from "lucide-react";
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
    <Card className="mb-6 border-border/60 shadow-sm">
      <CardHeader className="bg-muted/10 pb-4 border-b border-border/40">
        <CardTitle className="text-foreground">
          Configurações e Fonte de Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* APK Packages Setup */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col gap-4 p-4 bg-muted/20 border border-border/40 rounded-xl max-w-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  Trazer todos os aplicativos instalados no terminal
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  Consulta todos os pacotes presentes no terminal em vez de pacotes específicos.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={fetchAllApps}
                disabled={isProcessing}
                onClick={() => setFetchAllApps(!fetchAllApps)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  fetchAllApps ? "bg-primary" : "bg-muted/80"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-md ring-0 transition duration-200 ease-in-out ${
                    fetchAllApps ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {fetchAllApps && (
              <div className="flex items-center justify-between gap-4 pl-4 border-l-2 border-border/40 py-1 animate-in fade-in slide-in-from-left-2 duration-200">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    Incluir aplicativos de sistema (boSystem)
                  </span>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    Também trará pacotes nativos do sistema (pode tornar a consulta mais lenta).
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeSystemApps}
                  disabled={isProcessing}
                  onClick={() => setIncludeSystemApps(!includeSystemApps)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    includeSystemApps ? "bg-primary" : "bg-muted/80"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-md ring-0 transition duration-200 ease-in-out ${
                      includeSystemApps ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {!fetchAllApps ? (
            <div className="space-y-4">
              {/* Corporation App Selector (API Report) */}
              <div className="space-y-2 p-3.5 bg-muted/20 border border-border/40 rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    📱 Selecionar Aplicativo da Corporação (via API Report)
                  </Label>
                  {loadCorpApps && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={isLoadingCorpApps || isProcessing || !corporationId.trim()}
                      onClick={() => loadCorpApps(corporationId)}
                      className="text-xs text-primary h-7 px-2 cursor-pointer"
                    >
                      {isLoadingCorpApps ? "Carregando..." : "Atualizar Lista"}
                    </Button>
                  )}
                </div>

                <select
                  disabled={isProcessing || isLoadingCorpApps || availableCorpApps.length === 0}
                  className="w-full bg-background border border-border/60 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
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
                      ? `-- Selecione um aplicativo (${availableCorpApps.length} encontrados) --`
                      : "-- Digite a corporação para carregar aplicativos --"}
                  </option>
                  {availableCorpApps.map((app, i) => (
                    <option key={i} value={app.packageName}>
                      {app.appName} ({app.packageName})
                    </option>
                  ))}
                </select>

                {setOnlyWithApp && (
                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/20 mt-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-foreground">
                        Exibir apenas terminais que possuem o aplicativo instalado
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        Filtra a lista ocultando equipamentos onde o aplicativo não for encontrado.
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={onlyWithApp}
                      disabled={isProcessing}
                      onClick={() => setOnlyWithApp(!onlyWithApp)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        onlyWithApp ? "bg-primary" : "bg-muted/80"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-md ring-0 transition duration-200 ease-in-out ${
                          onlyWithApp ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="pkg-input-0" className="font-semibold text-foreground">
                  Package Names dos Apps a Verificar (Personalizados)
                </Label>
                <div className="space-y-3">
                  {packages.map((pkg, idx) => (
                    <div className="flex gap-2 items-center" key={idx}>
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
                        aria-label={`Package Name do Aplicativo ${idx + 1}`}
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
                        className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        aria-label={`Remover package name do aplicativo ${idx + 1}`}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPackages([...packages, ""])}
                  disabled={isProcessing}
                  className="mt-2 cursor-pointer"
                >
                  <Plus size={14} className="mr-2" /> Adicionar Pacote
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              * Nota: A consulta trará todos os pacotes instalados em cada terminal.
            </p>
          )}
        </div>

        <hr className="border-border/40 mb-6" />

        {/* Search Source Selector */}
        <div className="space-y-2 mb-4">
          <Label className="font-semibold text-foreground">Como deseja selecionar os terminais?</Label>
          <div className="grid grid-cols-2 gap-2 bg-muted/30 p-1 rounded-lg max-w-md">
            <button
              type="button"
              onClick={() => setSearchSource("filters")}
              disabled={isProcessing}
              className={`py-2 px-3 text-sm font-medium rounded-md transition-all cursor-pointer ${
                searchSource === "filters"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Filtros de Corporação
            </button>
            <button
              type="button"
              onClick={() => setSearchSource("file")}
              disabled={isProcessing}
              className={`py-2 px-3 text-sm font-medium rounded-md transition-all cursor-pointer ${
                searchSource === "file"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Importar Planilha (.xlsx, .csv)
            </button>
          </div>
        </div>

        {/* Conditional Search Source Fields */}
        {searchSource === "filters" ? (
          <div className="space-y-6 mt-4">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="corp-id">ID da Corporação *</Label>
                {restrictions.allowedCorps.length > 1 ? (
                  <select
                    id="corp-id"
                    value={corporationId}
                    onChange={(e) => setCorporationId(e.target.value)}
                    disabled={isProcessing || restrictions.corpDisabled}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {restrictions.allowedCorps.map((id) => (
                      <option key={id} value={id} className="bg-popover text-popover-foreground">
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
                    required
                  />
                )}
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Obrigatório. Determina a corporação principal dos equipamentos.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comp-id">ID da Empresa (Opcional)</Label>
                {restrictions.allowedCompanies.length > 1 ? (
                  <select
                    id="comp-id"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    disabled={isProcessing || restrictions.companyDisabled}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" className="bg-popover text-popover-foreground">Selecione uma empresa...</option>
                    {restrictions.allowedCompanies.map((id) => (
                      <option key={id} value={id} className="bg-popover text-popover-foreground">
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
                  />
                )}
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Opcional. Filtra os terminais vinculados a essa empresa.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sub-id">ID da Filial (Opcional)</Label>
                {restrictions.allowedSubsidiaries.length > 1 ? (
                  <select
                    id="sub-id"
                    value={subsidiaryId}
                    onChange={(e) => setSubsidiaryId(e.target.value)}
                    disabled={isProcessing || restrictions.subsidiaryDisabled}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" className="bg-popover text-popover-foreground">Selecione uma filial...</option>
                    {restrictions.allowedSubsidiaries.map((id) => (
                      <option key={id} value={id} className="bg-popover text-popover-foreground">
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
                />
              )}
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Opcional. Filtra os terminais vinculados a essa filial específica.
              </p>
            </div>
          </div>
        </div>
      ) : (
          <div className="space-y-4 mt-4">
            <div
              className={`border-2 border-dashed border-border/60 bg-muted/5 hover:bg-muted/10 focus-visible:bg-muted/10 transition-colors p-8 text-center rounded-xl cursor-pointer ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              tabIndex={isProcessing ? -1 : 0}
              role="button"
              aria-label="Selecionar planilha contendo números de série dos terminais"
              onKeyDown={(e) => {
                if (!isProcessing && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <Upload size={28} className="mx-auto text-muted-foreground mb-3" />
              <input
                type="file"
                ref={fileInputRef}
                hidden
                onChange={handleFile}
                accept=".xlsx,.xls,.csv"
                disabled={isProcessing}
                aria-hidden="true"
              />
              <p className="font-medium text-foreground text-sm">
                Selecione a planilha de seriais
              </p>
              <div className="text-xs text-muted-foreground mt-1">
                Formatos: .xlsx, .csv (Limite de 10.000 terminais)
              </div>
              {serials.length > 0 && (
                <div className="mt-4">
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 text-sm font-normal"
                  >
                    {serials.length} seriais carregados da planilha.
                  </Badge>
                </div>
              )}
            </div>

            {columns.length > 0 && (
              <div className="mt-6 space-y-2 max-w-sm">
                <Label htmlFor="serial-col-select">
                  Selecione a coluna dos Seriais:
                </Label>
                <select
                  id="serial-col-select"
                  value={selectedCol}
                  disabled={isProcessing}
                  onChange={(e) => applyColumn(rawData, parseInt(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors disabled:opacity-50"
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
      </CardContent>
    </Card>
  );
});
