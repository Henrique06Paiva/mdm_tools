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
  isProcessing: boolean;
  isPaused: boolean;
  startSearch: () => void;
  resumeSearch: () => void;
  pauseSearch: () => void;
  stopSearch: () => void;
  resetSearch: () => void;
  results: any[];
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
  isProcessing,
  isPaused,
  startSearch,
  resumeSearch,
  pauseSearch,
  stopSearch,
  resetSearch,
  results,
}: SearchFormProps) {
  const [appFilter, setAppFilter] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

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
            <Input 
              id="corpId"
              type="number" 
              value={corpId} 
              onChange={e => setCorpId(e.target.value)} 
              placeholder="Ex: 10" 
              required 
            />
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
              className="w-full sm:w-auto mt-2"
            >
              <Plus size={14} className="mr-2" /> Adicionar Versão
            </Button>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-border/40">
          {results.length > 0 && (
            <Button
              variant="secondary"
              onClick={exportExcel}
              className="w-full sm:w-auto"
            >
              <Download size={16} className="mr-2" /> Baixar Planilha
            </Button>
          )}
          {!isProcessing ? (
            <>
              {results.length > 0 && (
                <Button
                  variant="outline"
                  onClick={resetSearch}
                  className="w-full sm:w-auto border-border hover:bg-muted cursor-pointer"
                >
                  <RotateCcw size={16} className="mr-2" /> Limpar Histórico
                </Button>
              )}
              <Button
                onClick={startSearch}
                disabled={!api.hasToken() || !corpId.trim()}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              >
                <Search size={16} className="mr-2" /> Buscar APK
              </Button>
            </>
          ) : (
            <>
              {isPaused ? (
                <Button
                  onClick={resumeSearch}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                >
                  <Search size={16} className="mr-2" /> Retomar
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={pauseSearch}
                  className="w-full sm:w-auto"
                >
                  <Pause size={16} className="mr-2" /> Pausar
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={stopSearch}
                className="w-full sm:w-auto"
              >
                <Square size={16} className="mr-2" /> Parar
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
