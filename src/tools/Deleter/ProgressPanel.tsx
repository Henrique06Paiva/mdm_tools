import { Play, Pause, Square, RotateCcw } from "lucide-react";
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
  startProcess: () => void;
  resumeProcess: () => void;
  pauseProcess: () => void;
  stopProcess: () => void;
  resetProcess: () => void;
  isProcessing: boolean;
  isPaused: boolean;
  serials: string[];
  stats: {
    total: number;
    done: number;
    fail: number;
    skip: number;
    group: number;
  };
  tableRows: any[];
}

export function ProgressPanel({
  startProcess,
  resumeProcess,
  pauseProcess,
  stopProcess,
  resetProcess,
  isProcessing,
  isPaused,
  serials,
  stats,
  tableRows,
}: ProgressPanelProps) {
  const percentage =
    stats.total > 0
      ? Math.round(
          ((stats.done + stats.fail + stats.skip + stats.group) / stats.total) *
            100
        )
      : 0;

  return (
    <Card className="mb-6 border-border/60 shadow-sm">
      <CardHeader className="bg-muted/10 pb-4 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-foreground flex items-center gap-2">
          Progresso da Deleção
          {isProcessing && isPaused && (
            <Badge variant="warning" className="animate-pulse">
              Pausado
            </Badge>
          )}
          {isProcessing && !isPaused && (
            <Badge variant="success" className="animate-pulse font-medium">
              Processando
            </Badge>
          )}
        </CardTitle>
        <div className="flex gap-3 items-center">
          {!isProcessing ? (
            <>
              {tableRows.length > 0 && (
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
                variant="destructive"
                size="sm"
                onClick={startProcess}
                disabled={serials.length === 0 || !api.hasToken()}
                className="cursor-pointer"
              >
                <Play size={14} className="mr-2" /> Iniciar Processo
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-muted/10 border-border/50 text-center py-6">
            <div className="text-2xl font-mono font-bold text-foreground">
              {stats.total}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
              Total
            </div>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20 text-center py-6">
            <div className="text-2xl font-mono font-bold text-green-600 dark:text-green-500">
              {stats.done}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
              Sucesso
            </div>
          </Card>
          <Card className="bg-muted/20 border-border/60 text-center py-6">
            <div className="text-2xl font-mono font-bold text-muted-foreground">
              {stats.skip}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
              Não Encontrado
            </div>
          </Card>
          <Card className="bg-amber-500/5 border-amber-500/20 text-center py-6">
            <div className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-500">
              {stats.group}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
              Com Grupo
            </div>
          </Card>
          <Card className="bg-destructive/5 border-destructive/20 text-center py-6">
            <div className="text-2xl font-mono font-bold text-destructive">
              {stats.fail}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
              Falhas
            </div>
          </Card>
        </div>

        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-destructive transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead>Serial</TableHead>
                <TableHead>ID do Eqp.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Detalhe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row, idx) => {
                const isErr = row.statusBadge === "badge-err";
                const isWarn = row.statusBadge === "badge-warn";
                const isSuccess = row.statusBadge === "badge-done";
                const isGroup = row.statusBadge === "badge-group";

                const badgeVariant = isErr
                  ? "destructive"
                  : isGroup
                    ? "warning"
                    : isWarn
                      ? "secondary"
                      : "success";
                const statusLabel = isSuccess
                  ? "Deletado"
                  : isGroup
                    ? "Com Grupo"
                    : isWarn
                      ? "Não Encontrado"
                      : "Erro";

                return (
                  <TableRow key={idx}>
                    <TableCell className="font-mono">{row.serial}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {row.eqId}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant}>{statusLabel}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.detailText}
                    </TableCell>
                  </TableRow>
                );
              })}
              {tableRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
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
