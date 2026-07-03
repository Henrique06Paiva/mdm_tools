import { Download, Play, Pause, Square, RotateCcw } from "lucide-react";
import { api } from "../../api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";

interface ProgressPanelProps {
  results: any[];
  exportExcel: () => void;
  startProcess: () => void;
  resumeProcess: () => void;
  pauseProcess: () => void;
  stopProcess: () => void;
  resetProcess: () => void;
  isProcessing: boolean;
  isPaused: boolean;
  corporationId: string;
  stats: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    processedItems: number;
  };
  tableRows: any[];
}

export function ProgressPanel({
  results,
  exportExcel,
  startProcess,
  resumeProcess,
  pauseProcess,
  stopProcess,
  resetProcess,
  isProcessing,
  isPaused,
  corporationId,
  stats,
  tableRows,
}: ProgressPanelProps) {
  const percentage =
    stats.totalItems > 0
      ? Math.min(100, Math.round((stats.processedItems / stats.totalItems) * 100))
      : 0;

  return (
    <Card className="mb-6 border-border/60 shadow-sm">
      <CardHeader className="bg-muted/10 pb-4 border-b border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="text-foreground flex items-center gap-2">
          Progresso da Busca
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
        <div className="flex flex-wrap gap-2 items-center">
          {results.length > 0 && (
            <Button variant="secondary" size="sm" onClick={exportExcel}>
              <Download size={14} className="mr-2" /> Baixar Relatório
            </Button>
          )}
          {!isProcessing ? (
            <>
              {(results.length > 0 || tableRows.length > 0) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetProcess}
                  className="border-border hover:bg-muted cursor-pointer"
                >
                  <RotateCcw size={14} className="mr-2" /> Limpar Histórico
                </Button>
              )}
              <Button
                size="sm"
                onClick={startProcess}
                disabled={!corporationId.trim() || !api.hasToken()}
                className="cursor-pointer"
              >
                <Play size={14} className="mr-2" /> Iniciar Busca
              </Button>
            </>
          ) : (
            <>
              {isPaused ? (
                <Button
                  size="sm"
                  onClick={resumeProcess}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play size={14} className="mr-2" /> Retomar
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={pauseProcess}
                >
                  <Pause size={14} className="mr-2" /> Pausar
                </Button>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={stopProcess}
              >
                <Square size={14} className="mr-2" /> Parar
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-muted/10 border-border/50 text-center py-5">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-foreground">
              {stats.totalItems}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
              Terminais Totais
            </div>
          </Card>
          
          <Card className="bg-muted/10 border-border/50 text-center py-5">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-foreground">
              {stats.currentPage} <span className="text-muted-foreground text-lg">/ {stats.totalPages}</span>
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
              Páginas Processadas
            </div>
          </Card>

          <Card className="bg-green-500/5 border-green-500/20 text-center py-5">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-green-600 dark:text-green-500">
              {stats.processedItems}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
              Terminais Obtidos
            </div>
          </Card>

          <Card className="bg-primary/5 border-primary/20 text-center py-5">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-primary">
              {percentage}%
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
              Concluído
            </div>
          </Card>
        </div>

        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="max-h-[400px] overflow-auto rounded-md border border-border/40">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="min-w-[150px]">Nome do Eqp.</TableHead>
                <TableHead className="min-w-[120px]">Número de Série</TableHead>
                <TableHead className="min-w-[130px]">Grupo</TableHead>
                <TableHead>Energia</TableHead>
                <TableHead>Conexão</TableHead>
                <TableHead>Atividade</TableHead>
                <TableHead>Bloqueio</TableHead>
                <TableHead className="min-w-[150px]">Última Atualização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row, idx) => {
                const powerVariant = row.powerText === "Ligado" ? "success" : "destructive";
                const onlineVariant = row.onlineText === "Online" ? "success" : "destructive";
                const statusVariant = row.statusText === "Ativo" ? "success" : "destructive";
                const blockedVariant = row.blockedText === "Bloqueado" ? "destructive" : "success";

                return (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs">{row.id}</TableCell>
                    <TableCell className="font-medium text-sm">{row.name}</TableCell>
                    <TableCell className="font-mono text-sm">{row.serial}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{row.eqGroup}</TableCell>
                    <TableCell>
                      <Badge variant={powerVariant}>{row.powerText}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={onlineVariant}>{row.onlineText}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant}>{row.statusText}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={blockedVariant}>{row.blockedText}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {row.lastUpdateText}
                    </TableCell>
                  </TableRow>
                );
              })}
              {tableRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum terminal carregado. Insira o ID da corporação e inicie a busca.
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
