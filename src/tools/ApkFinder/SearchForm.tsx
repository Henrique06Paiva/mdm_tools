import * as XLSX from "xlsx";
import { Download, Search, Plus, X } from "lucide-react";
import { api } from "../../api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Input, Label } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

interface SearchFormProps {
  corpId: string;
  setCorpId: (id: string) => void;
  packages: string[];
  setPackages: (pkgs: string[]) => void;
  versions: string[];
  setVersions: (vers: string[]) => void;
  isProcessing: boolean;
  startSearch: () => void;
  results: any[];
  addLog: (message: string, type?: "info" | "warn" | "err" | "ok") => void;
}

export function SearchForm({
  corpId,
  setCorpId,
  packages,
  setPackages,
  versions,
  setVersions,
  isProcessing,
  startSearch,
  results,
  addLog,
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
        <CardTitle className="text-foreground">Parâmetros de Busca</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2 md:col-span-2 lg:col-span-1 max-w-xs">
<<<<<<< HEAD
            <Label>ID da Corporação *</Label>
            <Input
              type="number"
              value={corpId}
              onChange={(e) => setCorpId(e.target.value)}
              placeholder="Ex: 10"
              required
=======
            <Label htmlFor="corpId">ID da Corporação *</Label>
            <Input 
              id="corpId"
              type="number" 
              value={corpId} 
              onChange={e => setCorpId(e.target.value)} 
              placeholder="Ex: 10" 
              required 
>>>>>>> 013aefa2043ffbd8ca9e37bb57f2903496088f08
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="space-y-4">
            <Label htmlFor="pkg-input-apk-0">Package Names dos Apps (Opcional)</Label>
            <div className="space-y-3">
              {packages.map((pkg, idx) => (
                <div className="flex gap-2 items-center" key={idx}>
<<<<<<< HEAD
                  <Input
                    type="text"
=======
                  <Input 
                    id={`pkg-input-apk-${idx}`}
                    type="text" 
>>>>>>> 013aefa2043ffbd8ca9e37bb57f2903496088f08
                    value={pkg}
                    onChange={(e) => {
                      const newPkgs = [...packages];
                      newPkgs[idx] = e.target.value;
                      setPackages(newPkgs);
                    }}
<<<<<<< HEAD
                    placeholder="Ex: com.br.octostore"
=======
                    placeholder="Ex: com.br.octostore" 
                    aria-label={`Package Name do aplicativo ${idx + 1}`}
>>>>>>> 013aefa2043ffbd8ca9e37bb57f2903496088f08
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
            <Label htmlFor="version-input-apk-0">Versões Procuradas *</Label>
            <div className="space-y-3">
              {versions.map((ver, idx) => (
                <div className="flex gap-2 items-center" key={idx}>
<<<<<<< HEAD
                  <Input
                    type="text"
=======
                  <Input 
                    id={`version-input-apk-${idx}`}
                    type="text" 
>>>>>>> 013aefa2043ffbd8ca9e37bb57f2903496088f08
                    value={ver}
                    onChange={(e) => {
                      const newVers = [...versions];
                      newVers[idx] = e.target.value;
                      setVersions(newVers);
                    }}
<<<<<<< HEAD
                    placeholder="Ex: 1.5.1"
=======
                    placeholder="Ex: 1.5.1" 
                    aria-label={`Versão Procurada ${idx + 1}`}
>>>>>>> 013aefa2043ffbd8ca9e37bb57f2903496088f08
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (versions.length > 1) {
                        setVersions(versions.filter((_, i) => i !== idx));
                      } else {
                        addLog(
                          "É necessário pelo menos uma versão procurada.",
                          "warn",
                        );
                      }
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
          <Button
            onClick={startSearch}
            disabled={isProcessing || !api.hasToken() || !corpId.trim()}
            className="w-full sm:w-auto"
          >
            <Search size={16} className="mr-2" /> Buscar APK
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
