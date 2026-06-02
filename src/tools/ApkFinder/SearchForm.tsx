import { memo } from "react";
import * as XLSX from "xlsx";
import { Download, Search, Plus, X, Pause, Square, RotateCcw } from "lucide-react";
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
  isProcessing,
  isPaused,
  startSearch,
  resumeSearch,
  pauseSearch,
  stopSearch,
  resetSearch,
  results,
}: SearchFormProps) {
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
    <Card className="mb-6 border-border/60 shadow-sm">
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
              className="w-full sm:w-auto mt-2"
            >
              <Plus size={14} className="mr-2" /> Adicionar Pacote
            </Button>
          </div>

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
