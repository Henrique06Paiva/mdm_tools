import { memo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Input, Label } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import type { ColumnConfig } from "./useFetcher";

interface ConfigPanelProps {
  corporationId: string;
  setCorporationId: (id: string) => void;
  companyId: string;
  setCompanyId: (id: string) => void;
  subsidiaryId: string;
  setSubsidiaryId: (id: string) => void;
  isProcessing: boolean;
  restrictions: {
    corpDisabled: boolean;
    companyDisabled: boolean;
    subsidiaryDisabled: boolean;
    allowedCorps: number[];
    allowedCompanies: number[];
    allowedSubsidiaries: number[];
  };
  columns: ColumnConfig[];
  toggleColumn: (id: string) => void;
  moveColumn: (index: number, direction: "up" | "down") => void;
}

export const ConfigPanel = memo(function ConfigPanel({
  corporationId,
  setCorporationId,
  companyId,
  setCompanyId,
  subsidiaryId,
  setSubsidiaryId,
  isProcessing,
  restrictions,
  columns,
  toggleColumn,
  moveColumn,
}: ConfigPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card className="lg:col-span-2 border-border/60 shadow-sm">
        <CardHeader className="bg-muted/10 pb-4 border-b border-border/40">
          <CardTitle className="text-foreground font-semibold">
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
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
                    <option
                      key={id}
                      value={id}
                      className="bg-popover text-popover-foreground"
                    >
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
                  onChange={(e) =>
                    setCorporationId(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Ex: 33"
                  disabled={isProcessing || restrictions.corpDisabled}
                  required
                />
              )}
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Obrigatório. Determina a corporação principal de origem dos
                equipamentos.
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
                  <option
                    value=""
                    className="bg-popover text-popover-foreground"
                  >
                    Selecione uma empresa...
                  </option>
                  {restrictions.allowedCompanies.map((id) => (
                    <option
                      key={id}
                      value={id}
                      className="bg-popover text-popover-foreground"
                    >
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
                  onChange={(e) =>
                    setCompanyId(e.target.value.replace(/\D/g, ""))
                  }
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
                  <option
                    value=""
                    className="bg-popover text-popover-foreground"
                  >
                    Selecione uma filial...
                  </option>
                  {restrictions.allowedSubsidiaries.map((id) => (
                    <option
                      key={id}
                      value={id}
                      className="bg-popover text-popover-foreground"
                    >
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
                  onChange={(e) =>
                    setSubsidiaryId(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Ex: 806"
                  disabled={isProcessing || restrictions.subsidiaryDisabled}
                />
              )}
              <p className="text-[11px] text-muted-foreground mt-1.5">
                Opcional. Filtra os terminais vinculados a essa filial
                específica.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm flex flex-col justify-between">
        <CardHeader className="bg-muted/10 pb-4 border-b border-border/40">
          <CardTitle className="text-foreground font-semibold text-sm tracking-wide uppercase">
            Colunas do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 flex-1 flex flex-col justify-between gap-4">
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Selecione e ordene as colunas na ordem desejada. A alteração afeta a
            tabela de visualização e a planilha final.
          </p>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 flex-1 scrollbar">
            {columns.map((col, index) => {
              const isFirst = index === 0;
              const isLast = index === columns.length - 1;

              return (
                <div
                  key={col.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200 ${
                    col.enabled
                      ? "border-primary/20 bg-primary/5 hover:border-primary/30"
                      : "border-border/40 bg-muted/5 opacity-60 hover:opacity-80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span
                      className="text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors cursor-grab active:cursor-grabbing flex items-center justify-center p-0.5 shrink-0"
                      aria-hidden="true"
                    >
                      <GripVertical size={14} />
                    </span>

                    <label className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-foreground select-none truncate flex-1 py-1">
                      <input
                        type="checkbox"
                        checked={col.enabled}
                        onChange={() => toggleColumn(col.id)}
                        disabled={isProcessing}
                        className="h-4 w-4 rounded border-input bg-background text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-shadow disabled:cursor-not-allowed shrink-0"
                      />
                      <span className="truncate">{col.label}</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveColumn(index, "up")}
                      disabled={isProcessing || isFirst}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 disabled:hover:bg-transparent rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-shadow cursor-pointer"
                      aria-label={`Mover coluna ${col.label} para cima`}
                      title={`Mover coluna ${col.label} para cima`}
                    >
                      <ChevronUp size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveColumn(index, "down")}
                      disabled={isProcessing || isLast}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-20 disabled:hover:bg-transparent rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-shadow cursor-pointer"
                      aria-label={`Mover coluna ${col.label} para baixo`}
                      title={`Mover coluna ${col.label} para baixo`}
                    >
                      <ChevronDown size={16} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
