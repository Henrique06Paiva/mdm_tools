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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      <Card className="lg:col-span-2 border-border/50 shadow-sm">
        <CardHeader className="bg-muted/10 py-3.5 px-5 border-b border-border/40">
          <CardTitle className="text-foreground text-xs font-bold tracking-wider uppercase">
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
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

            <div className="space-y-1.5">
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
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm flex flex-col justify-between">
        <CardHeader className="bg-muted/10 py-3.5 px-5 border-b border-border/40">
          <CardTitle className="text-foreground text-xs font-bold tracking-wider uppercase">
            Colunas do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3">
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 flex-1">
            {columns.map((col, index) => {
              const isFirst = index === 0;
              const isLast = index === columns.length - 1;

              return (
                <div
                  key={col.id}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-150 ${
                    col.enabled
                      ? "border-primary/20 bg-primary/5"
                      : "border-border/30 bg-muted/10 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-muted-foreground/40 shrink-0">
                      <GripVertical size={13} />
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground select-none truncate flex-1">
                      <input
                        type="checkbox"
                        checked={col.enabled}
                        onChange={() => toggleColumn(col.id)}
                        disabled={isProcessing}
                        className="h-3.5 w-3.5 rounded border-input text-primary focus-visible:ring-1 focus-visible:ring-primary shrink-0"
                      />
                      <span className="truncate">{col.label}</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveColumn(index, "up")}
                      disabled={isProcessing || isFirst}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground disabled:opacity-20 rounded"
                    >
                      <ChevronUp size={13} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveColumn(index, "down")}
                      disabled={isProcessing || isLast}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground disabled:opacity-20 rounded"
                    >
                      <ChevronDown size={13} />
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
