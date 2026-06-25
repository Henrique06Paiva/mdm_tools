import { type RefObject, type ChangeEvent, memo } from "react";
import { RefreshCw } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

interface ConfigPanelProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFile: (e: ChangeEvent<HTMLInputElement>) => void;
  serials: string[];
}

export const ConfigPanel = memo(function ConfigPanel({
  fileInputRef,
  handleFile,
  serials,
}: ConfigPanelProps) {
  return (
    <Card className="mb-6 border-border/60 shadow-sm">
      <CardHeader className="bg-muted/10 pb-4 border-b border-border/40">
        <CardTitle className="text-foreground">Fonte de Dados</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div
          className="border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 focus-visible:bg-primary/10 transition-colors p-8 text-center rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={() => fileInputRef.current?.click()}
          tabIndex={0}
          role="button"
          aria-label="Selecionar planilha com a lista de seriais dos terminais para envio de Force Data"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <RefreshCw
            size={36}
            className="mx-auto text-primary mb-3 animate-pulse"
            aria-hidden="true"
          />
          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={handleFile}
            accept=".xlsx,.xls,.csv"
            aria-hidden="true"
          />
          <p className="font-medium text-foreground text-sm">
            Clique para selecionar a planilha de seriais a receberem Force Data
          </p>
          <div className="text-xs text-muted-foreground mt-1">
            Formatos suportados: .xlsx, .csv (Limite de 10.000 terminais)
          </div>
          {serials.length > 0 && (
            <div className="mt-4">
              <Badge
                variant="default"
                className="px-3 py-1 text-sm font-normal bg-primary text-primary-foreground"
              >
                {serials.length} seriais carregados.
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
