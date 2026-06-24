import { useState } from "react";
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
  serials: string[];
  searchSource: "filters" | "file";
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
  serials,
  searchSource,
  corporationId,
  stats,
  tableRows,
}: ProgressPanelProps) {
  // Local state for UI pagination (50 items per page)
  const [uiPage, setUiPage] = useState(1);
  const itemsPerPage = 50;

  const maxUiPage = Math.ceil(tableRows.length / itemsPerPage) || 1;
  const currentUiPage = Math.min(uiPage, maxUiPage);

  const startIndex = (currentUiPage - 1) * itemsPerPage;
  const slicedRows = tableRows.slice(startIndex, startIndex + itemsPerPage);

  const percentage =
    stats.totalItems > 0
      ? Math.min(100, Math.round((stats.processedItems / stats.totalItems) * 100))
      : 0;

  const isStartDisabled =
    !api.hasToken() ||
    (searchSource === "filters" ? !corporationId.trim() : serials.length === 0);

  const handleReset = () => {
    resetProcess();
    setUiPage(1);
  };

  return (
    <Card className="mb-6 border-border/60 shadow-sm">
      <CardHeader className="bg-muted/10 pb-4 border-b border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="text-foreground flex items-center gap-2">
          Progresso da Consulta
          {isProcessing && isPaused && (
            <Badge variant="warning" className="animate-pulse">
              Pausado
            </Badge>
          )}
          {isProcessing && !isPaused && (
            <Badge variant="success" className="animate-pulse font-medium">
              Consultando
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
                  onClick={handleReset}
                  className="border-border hover:bg-muted cursor-pointer"
                >
                  <RotateCcw size={14} className="mr-2" /> Limpar Histórico
                </Button>
              )}
              <Button
                size="sm"
                onClick={startProcess}
                disabled={isStartDisabled}
                className="cursor-pointer"
              >
                <Play size={14} className="mr-2" /> Iniciar Consulta
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-muted/10 border-border/50 text-center py-5">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-foreground">
              {stats.totalItems}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
              {searchSource === "file" ? "Seriais Totais" : "Terminais Totais"}
            </div>
          </Card>
          
          <Card className="bg-muted/10 border-border/50 text-center py-5">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-foreground">
              {stats.currentPage} <span className="text-muted-foreground text-lg">/ {stats.totalPages}</span>
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
              {searchSource === "file" ? "Lotes Processados" : "Páginas Processadas"}
            </div>
          </Card>

          <Card className="bg-green-500/5 border-green-500/20 text-center py-5">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-green-600 dark:text-green-500">
              {stats.processedItems}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-semibold">
              {searchSource === "file" ? "Seriais Processados" : "Terminais Obtidos"}
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

        {/* Progress Bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Table View */}
        <div className="max-h-[400px] overflow-auto rounded-md border border-border/40">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead className="min-w-[150px]">Nome do Eqp.</TableHead>
                <TableHead className="min-w-[120px]">Número de Série</TableHead>
                <TableHead className="min-w-[130px]">Grupo</TableHead>
                <TableHead>Energia</TableHead>
                <TableHead>Conexão</TableHead>
                <TableHead className="min-w-[150px]">Última Atualização</TableHead>
                <TableHead className="min-w-[180px]">Versões</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slicedRows.map((row, idx) => {
                const powerVariant = row.powerText === "Ligado" ? "success" : "destructive";
                const onlineVariant = row.onlineText === "Online" ? "success" : "destructive";

                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-sm">{row.eqName}</TableCell>
                    <TableCell className="font-mono text-sm">{row.serial}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{row.eqGroup}</TableCell>
                    <TableCell>
                      <Badge variant={powerVariant}>{row.powerText}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={onlineVariant}>{row.onlineText}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {row.lastUpdateText}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {row.versionStr.includes(" | ") ? (
                        <div className="max-h-24 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                          {row.versionStr.split(" | ").map((val: string, i: number) => (
                            <div key={i} className="whitespace-nowrap border-b border-border/20 last:border-0 pb-0.5">
                              {val}
                            </div>
                          ))}
                        </div>
                      ) : (
                        row.versionStr
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {slicedRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum terminal carregado. Configure as opções e inicie a consulta.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Local Pagination Bar (50 items per page limit) */}
        {tableRows.length > 0 && (
          <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-border/40 text-sm">
            <div className="text-muted-foreground text-xs">
              Exibindo registros {startIndex + 1} a {Math.min(startIndex + itemsPerPage, tableRows.length)} de {tableRows.length}
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUiPage((p) => Math.max(1, p - 1))}
                disabled={currentUiPage <= 1}
                className="cursor-pointer"
              >
                Anterior
              </Button>
              <span className="text-foreground font-medium text-xs px-2">
                Página {currentUiPage} de {maxUiPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUiPage((p) => Math.min(maxUiPage, p + 1))}
                disabled={currentUiPage >= maxUiPage}
                className="cursor-pointer"
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
