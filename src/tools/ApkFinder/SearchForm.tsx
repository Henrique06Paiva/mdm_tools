import { memo, useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { Download, Search, Plus, X, Pause, Square, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "../../api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Input, Label } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

interface SearchFormProps {
  corpId: string;
  setCorpId: (id: string) => void;
  packages: string[];
  setPackages: (pkgs: string[]) => void;
  versions: string[];
  setVersions: (vers: string[]) => void;
  availableApps: any[];
  isLoadingApps: boolean;
  availableVersions: { version: string; appName: string }[];
  isLoadingVersions: boolean;
  isProcessing: boolean;
  isPaused: boolean;
  startSearch: () => void;
  resumeSearch: () => void;
  pauseSearch: () => void;
  stopSearch: () => void;
  resetSearch: () => void;
  results: any[];
  clearFilters: () => void;
  restrictions: {
    corpDisabled: boolean;
    companyDisabled: boolean;
    subsidiaryDisabled: boolean;
    allowedCorps: number[];
    allowedCompanies: number[];
    allowedSubsidiaries: number[];
  };
}

export const SearchForm = memo(function SearchForm({
  corpId,
  setCorpId,
  packages,
  setPackages,
  versions,
  setVersions,
  availableApps,
  isLoadingApps,
  availableVersions,
  isLoadingVersions,
  isProcessing,
  isPaused,
  startSearch,
  resumeSearch,
  pauseSearch,
  stopSearch,
  resetSearch,
  results,
  clearFilters,
  restrictions,
}: SearchFormProps) {
  const [appFilter, setAppFilter] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVersionsDropdownOpen, setIsVersionsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const versionsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (versionsDropdownRef.current && !versionsDropdownRef.current.contains(event.target as Node)) {
        setIsVersionsDropdownOpen(false);
      }
    };
    if (isDropdownOpen || isVersionsDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isVersionsDropdownOpen]);

  const exportExcel = () => {
    if (results.length === 0) return;
    const exportData = results.map((r) => ({
      "ID do App": r.id,
      "Nome do App": r.name,
      "Package Name": r.packageName,
      Versão: r.version,
      "Tamanho (Bytes)": r.fileSize,
      "Link de Download": r.link,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "APKs Encontrados");
    XLSX.writeFile(wb, `MDM_APKs_${new Date().getTime()}.xlsx`);
  };

  return (
    <Card className="mb-6 border-border/60 shadow-sm overflow-visible">
      <CardHeader className="bg-muted/10 pb-4">
        <CardTitle className="text-foreground flex items-center gap-2">
          Parâmetros de Busca
          {isProcessing && isPaused && (
            <Badge variant="warning" className="animate-pulse">
              Pausado
            </Badge>
          )}
          {isProcessing && !isPaused && (
            <Badge variant="success" className="animate-pulse font-medium">
              Buscando
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2 md:col-span-2 lg:col-span-1 max-w-xs">
            <Label htmlFor="corpId">ID da Corporação *</Label>
            {restrictions.allowedCorps.length > 1 ? (
              <select
                id="corpId"
                value={corpId}
                onChange={(e) => setCorpId(e.target.value)}
                disabled={isProcessing || restrictions.corpDisabled}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {restrictions.allowedCorps.map((id) => (
                  <option key={id} value={id} className="bg-popover text-popover-foreground">
                    Corporação {id}
                  </option>
                ))}
              </select>
            ) : (
              <Input 
                id="corpId"
                type="number" 
                value={corpId} 
                onChange={e => setCorpId(e.target.value)} 
                placeholder="Ex: 10" 
                disabled={isProcessing || restrictions.corpDisabled}
                required 
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          {isLoadingApps ? (
            <div className="space-y-4">
              <Label>Selecione os Apps da Corporação</Label>
              <div className="flex items-center gap-3 text-muted-foreground py-6 px-4 bg-muted/5 border border-border/40 rounded-md">
                <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-sm font-medium">Carregando aplicativos da corporação...</span>
              </div>
            </div>
          ) : availableApps.length > 0 ? (
            <div className="space-y-2 relative" ref={dropdownRef}>
              <Label>Selecione os Apps da Corporação</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-between font-normal text-left h-10 border-border/60 hover:bg-muted/30 bg-background cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="truncate">
                  {packages.length === 0
                    ? "Todos os apps da corporação (sem filtro)"
                    : `${packages.length} app(s) selecionado(s)`}
                </span>
                {isDropdownOpen ? <ChevronUp size={16} className="text-muted-foreground shrink-0 ml-2" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0 ml-2" />}
              </Button>

              {isDropdownOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1 p-3 bg-card border border-border shadow-lg rounded-md space-y-3 bg-background animate-in fade-in-0 zoom-in-95">
                  <Input
                    type="text"
                    placeholder="Filtrar por nome ou pacote..."
                    value={appFilter}
                    onChange={(e) => setAppFilter(e.target.value)}
                    className="mb-2 h-9"
                  />
                  <div className="max-h-80 overflow-y-auto border border-border/60 rounded-md p-1.5 space-y-1 bg-muted/5">
                    {availableApps.filter(
                      (app) =>
                        app.name?.toLowerCase().includes(appFilter.toLowerCase()) ||
                        app.packageName?.toLowerCase().includes(appFilter.toLowerCase())
                    ).length === 0 ? (
                      <div className="text-sm text-muted-foreground py-6 text-center">
                        Nenhum aplicativo correspondente.
                      </div>
                    ) : (
                      availableApps
                        .filter(
                          (app) =>
                            app.name?.toLowerCase().includes(appFilter.toLowerCase()) ||
                            app.packageName?.toLowerCase().includes(appFilter.toLowerCase())
                        )
                        .map((app) => {
                          const isChecked = packages.includes(app.packageName);
                          return (
                            <label
                              key={app.id}
                              className={`flex items-start gap-3 p-2 rounded hover:bg-muted/40 cursor-pointer transition-colors border ${isChecked ? "bg-primary/5 border-primary/20" : "border-transparent"}`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setPackages(packages.filter((p) => p !== app.packageName));
                                  } else {
                                    setPackages([...packages, app.packageName]);
                                  }
                                }}
                                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                              />
                              <div className="space-y-0.5 min-w-0">
                                <div className="text-sm font-semibold text-foreground truncate">
                                  {app.name || "Aplicativo sem nome"}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono truncate">
                                  {app.packageName}
                                </div>
                              </div>
                            </label>
                          );
                        })
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPackages(availableApps.map((a) => a.packageName).filter(Boolean))}
                      className="w-full text-xs h-8 cursor-pointer"
                    >
                      Selecionar Todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPackages([])}
                      className="w-full text-xs h-8 cursor-pointer"
                    >
                      Limpar Seleção
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Label htmlFor="pkg-input-apk-0">Package Names dos Apps (Opcional)</Label>
              <div className="space-y-3">
                {packages.map((pkg, idx) => (
                  <div className="flex gap-2 items-center" key={idx}>
                    <Input 
                      id={`pkg-input-apk-${idx}`}
                      type="text" 
                      value={pkg}
                      onChange={(e) => {
                        const newPkgs = [...packages];
                        newPkgs[idx] = e.target.value;
                        setPackages(newPkgs);
                      }}
                      placeholder="Ex: com.br.octostore" 
                      aria-label={`Package Name do aplicativo ${idx + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setPackages(packages.filter((_, i) => i !== idx))
                      }
                      className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
                className="w-full sm:w-auto mt-2 cursor-pointer"
              >
                <Plus size={14} className="mr-2" /> Adicionar Pacote
              </Button>
            </div>
          )}

          {isLoadingVersions ? (
            <div className="space-y-4">
              <Label>Versões Procuradas (Opcional)</Label>
              <div className="flex items-center gap-3 text-muted-foreground py-6 px-4 bg-muted/5 border border-border/40 rounded-md">
                <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-sm font-medium">Carregando versões disponíveis...</span>
              </div>
            </div>
          ) : availableVersions.length > 0 ? (
            <div className="space-y-2 relative" ref={versionsDropdownRef}>
              <Label>Versões Procuradas (Opcional)</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-between font-normal text-left h-10 border-border/60 hover:bg-muted/30 bg-background cursor-pointer"
                onClick={() => setIsVersionsDropdownOpen(!isVersionsDropdownOpen)}
              >
                <span className="truncate">
                  {versions.length === 0
                    ? "Todas as versões (sem filtro)"
                    : `${versions.length} versão(ões) selecionada(s)`}
                </span>
                {isVersionsDropdownOpen ? (
                  <ChevronUp size={16} className="text-muted-foreground shrink-0 ml-2" />
                ) : (
                  <ChevronDown size={16} className="text-muted-foreground shrink-0 ml-2" />
                )}
              </Button>

              {isVersionsDropdownOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1 p-3 bg-card border border-border shadow-lg rounded-md space-y-3 bg-background animate-in fade-in-0 zoom-in-95">
                  <div className="max-h-80 overflow-y-auto border border-border/60 rounded-md p-1.5 space-y-1 bg-muted/5">
                    {availableVersions.map((verObj) => {
                      const isChecked = versions.includes(verObj.version);
                      return (
                        <label
                          key={`${verObj.appName}-${verObj.version}`}
                          className={`flex items-center gap-3 p-2 rounded hover:bg-muted/40 cursor-pointer transition-colors border ${isChecked ? "bg-primary/5 border-primary/20" : "border-transparent"}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setVersions(versions.filter((v) => v !== verObj.version));
                              } else {
                                setVersions([...versions, verObj.version]);
                              }
                            }}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-foreground truncate">{verObj.version}</span>
                            <span className="text-xs text-muted-foreground truncate font-mono">{verObj.appName}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVersions(availableVersions.map((v) => v.version))}
                      className="w-full text-xs h-8 cursor-pointer"
                    >
                      Selecionar Todas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setVersions([])}
                      className="w-full text-xs h-8 cursor-pointer"
                    >
                      Limpar Seleção
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Label htmlFor="version-input-apk-0">Versões Procuradas (Opcional)</Label>
              <div className="space-y-3">
                {versions.map((ver, idx) => (
                  <div className="flex gap-2 items-center" key={idx}>
                    <Input 
                      id={`version-input-apk-${idx}`}
                      type="text" 
                      value={ver}
                      onChange={(e) => {
                        const newVers = [...versions];
                        newVers[idx] = e.target.value;
                        setVersions(newVers);
                      }}
                      placeholder="Ex: 1.5.1" 
                      aria-label={`Versão Procurada ${idx + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setVersions(versions.filter((_, i) => i !== idx));
                      }}
                      className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Remover versão procurada ${idx + 1}`}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVersions([...versions, ""])}
                className="w-full sm:w-auto mt-2 cursor-pointer"
              >
                <Plus size={14} className="mr-2" /> Adicionar Versão
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-row justify-end flex-wrap gap-3 mt-8 pt-6 border-t border-border/40">
          {results.length > 0 && (
            <Button
              variant="secondary"
              onClick={exportExcel}
              className="cursor-pointer"
              aria-label="Baixar Planilha"
            >
              <Download size={16} className="sm:mr-2" />
              <span className="hidden sm:inline">Baixar Planilha</span>
            </Button>
          )}
          {!isProcessing ? (
            <>
              {results.length > 0 && (
                <Button
                  variant="outline"
                  onClick={resetSearch}
                  className="border-border hover:bg-muted cursor-pointer"
                  aria-label="Limpar Histórico"
                >
                  <RotateCcw size={16} className="sm:mr-2" />
                  <span className="hidden sm:inline">Limpar Histórico</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-border hover:bg-muted cursor-pointer"
                aria-label="Limpar Filtros"
              >
                <X size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Limpar Filtros</span>
              </Button>
              <Button
                onClick={startSearch}
                disabled={!api.hasToken() || !corpId.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                aria-label="Buscar APK"
              >
                <Search size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Buscar APK</span>
              </Button>
            </>
          ) : (
            <>
              {isPaused ? (
                <Button
                  onClick={resumeSearch}
                  className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                  aria-label="Retomar Busca"
                >
                  <Search size={16} className="sm:mr-2" />
                  <span className="hidden sm:inline">Retomar</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={pauseSearch}
                  className="cursor-pointer"
                  aria-label="Pausar Busca"
                >
                  <Pause size={16} className="sm:mr-2" />
                  <span className="hidden sm:inline">Pausar</span>
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={stopSearch}
                className="cursor-pointer"
                aria-label="Parar Busca"
              >
                <Square size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Parar</span>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
