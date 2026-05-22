import { memo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Input, Label } from "../../components/ui/input";

interface ConfigPanelProps {
  corporationId: string;
  setCorporationId: (id: string) => void;
  companyId: string;
  setCompanyId: (id: string) => void;
  subsidiaryId: string;
  setSubsidiaryId: (id: string) => void;
  isProcessing: boolean;
}

export const ConfigPanel = memo(function ConfigPanel({
  corporationId,
  setCorporationId,
  companyId,
  setCompanyId,
  subsidiaryId,
  setSubsidiaryId,
  isProcessing,
}: ConfigPanelProps) {
  return (
    <Card className="mb-6 border-border/60 shadow-sm">
      <CardHeader className="bg-muted/10 pb-4 border-b border-border/40">
        <CardTitle className="text-foreground font-semibold">
          Filtros de Busca
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="corp-id">ID da Corporação *</Label>
            <Input
              id="corp-id"
              type="text"
              pattern="[0-9]*"
              value={corporationId}
              onChange={(e) => setCorporationId(e.target.value.replace(/\D/g, ""))}
              placeholder="Ex: 33"
              disabled={isProcessing}
              required
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Obrigatório. Determina a corporação principal de origem dos equipamentos.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comp-id">ID da Empresa (Opcional)</Label>
            <Input
              id="comp-id"
              type="text"
              pattern="[0-9]*"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value.replace(/\D/g, ""))}
              placeholder="Ex: 425"
              disabled={isProcessing}
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Opcional. Filtra os terminais vinculados a essa empresa.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub-id">ID da Filial (Opcional)</Label>
            <Input
              id="sub-id"
              type="text"
              pattern="[0-9]*"
              value={subsidiaryId}
              onChange={(e) => setSubsidiaryId(e.target.value.replace(/\D/g, ""))}
              placeholder="Ex: 806"
              disabled={isProcessing}
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Opcional. Filtra os terminais vinculados a essa filial específica.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
