import { Download, Play } from 'lucide-react';
import { api } from '../../api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

interface ProgressPanelProps {
  results: any[];
  exportExcel: () => void;
  startProcess: () => void;
  isProcessing: boolean;
  serials: string[];
  stats: { total: number; done: number; fail: number };
  tableRows: any[];
}

export function ProgressPanel({
  results,
  exportExcel,
  startProcess,
  isProcessing,
  serials,
  stats,
  tableRows
}: ProgressPanelProps) {
  const percentage = stats.total > 0 ? Math.round(((stats.done + stats.fail) / stats.total) * 100) : 0;

  return (
    <Card className="mb-6 border-border/60 shadow-sm">
      <CardHeader className="bg-muted/10 pb-4 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Progresso da Consulta</CardTitle>
        <div className="flex gap-3">
          {results.length > 0 && (
            <Button variant="secondary" size="sm" onClick={exportExcel}>
              <Download size={14} className="mr-2" /> Baixar Relatório
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={startProcess} 
            disabled={isProcessing || serials.length === 0 || !api.hasToken()}
          >
            <Play size={14} className="mr-2" /> Iniciar Consulta
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-muted/10 border-border/50 text-center py-6">
            <div className="text-3xl font-mono font-bold text-foreground">{stats.total}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">Total Seriais</div>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20 text-center py-6">
            <div className="text-3xl font-mono font-bold text-green-600 dark:text-green-500">{stats.done}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">Sucesso</div>
          </Card>
          <Card className="bg-destructive/5 border-destructive/20 text-center py-6">
            <div className="text-3xl font-mono font-bold text-destructive">{stats.fail}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">Erros / N.E.</div>
          </Card>
          <Card className="bg-primary/5 border-primary/20 text-center py-6">
            <div className="text-3xl font-mono font-bold text-primary">{percentage}%</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">Concluído</div>
          </Card>
        </div>

        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${percentage}%` }} 
          />
        </div>

        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead>Serial Number</TableHead>
                <TableHead>Nome do Eqp.</TableHead>
                <TableHead>Versões</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Conexão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row, idx) => {
                const isErr = row.statusBadge === 'badge-err';
                const isWarn = row.statusBadge === 'badge-warn';
                const isOnline = row.onlineBadge === 'badge-done';

                return (
                  <TableRow key={idx}>
                    <TableCell className="font-mono">{row.serial}</TableCell>
                    <TableCell className="font-medium">{row.eqName}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{row.versionStr}</TableCell>
                    <TableCell>
                      <Badge variant={isErr ? 'destructive' : isWarn ? 'warning' : 'success'}>
                        {row.statusText}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isOnline ? 'success' : 'secondary'}>
                        {row.onlineText}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
              {tableRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum dado processado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
