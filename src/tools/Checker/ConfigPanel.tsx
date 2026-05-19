import { type RefObject, type ChangeEvent } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Input, Label } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

interface ConfigPanelProps {
  packages: string[];
  setPackages: (packages: string[]) => void;
  addLog: (msg: string, type: 'info'|'warn'|'err'|'ok') => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFile: (e: ChangeEvent<HTMLInputElement>) => void;
  serials: string[];
  columns: string[];
  selectedCol: number;
  applyColumn: (data: any[], colIdx: number) => void;
  rawData: any[];
}

export function ConfigPanel({
  packages,
  setPackages,
  addLog,
  fileInputRef,
  handleFile,
  serials,
  columns,
  selectedCol,
  applyColumn,
  rawData
}: ConfigPanelProps) {
  return (
    <Card className="mb-6 border-border/60 shadow-sm">
      <CardHeader className="bg-muted/10 pb-4 border-b border-border/40">
        <CardTitle className="text-foreground">Configurações e Fonte de Dados</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4 mb-8">
          <Label>Package Names dos Apps</Label>
          <div className="space-y-3">
            {packages.map((pkg, idx) => (
              <div className="flex gap-2 items-center" key={idx}>
                <Input 
                  type="text" 
                  value={pkg}
                  onChange={(e) => {
                    const newPkgs = [...packages];
                    newPkgs[idx] = e.target.value;
                    setPackages(newPkgs);
                  }}
                  placeholder="Ex: com.mdmservice" 
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    if (packages.length > 1) {
                      setPackages(packages.filter((_, i) => i !== idx));
                    } else {
                      addLog('É necessário pelo menos um package name.', 'warn');
                    }
                  }}
                  className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setPackages([...packages, ''])} className="mt-2">
            <Plus size={14} className="mr-2" /> Adicionar Pacote
          </Button>
        </div>
        
        <div 
          className="border-2 border-dashed border-border/60 bg-muted/5 hover:bg-muted/10 transition-colors p-8 text-center rounded-xl cursor-pointer mt-4" 
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={28} className="mx-auto text-muted-foreground mb-3" />
          <input type="file" ref={fileInputRef} hidden onChange={handleFile} accept=".xlsx,.xls,.csv" />
          <p className="font-medium text-foreground text-sm">Selecione a planilha de seriais</p>
          <div className="text-xs text-muted-foreground mt-1">Formatos: .xlsx, .csv</div>
          {serials.length > 0 && (
            <div className="mt-4">
              <Badge variant="secondary" className="px-3 py-1 text-sm font-normal">
                {serials.length} seriais prontos.
              </Badge>
            </div>
          )}
        </div>

        {columns.length > 0 && (
          <div className="mt-6 space-y-2 max-w-sm">
            <Label>Selecione a coluna dos Seriais:</Label>
            <select 
              value={selectedCol} 
              onChange={(e) => applyColumn(rawData, parseInt(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
            >
              {columns.map((col, idx) => (
                <option key={idx} value={idx}>{col || `Coluna ${idx + 1}`}</option>
              ))}
            </select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
