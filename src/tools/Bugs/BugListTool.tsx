import { useState, useMemo } from "react";
import { useBugs } from "./useBugs";
import { BugListTable } from "./BugListTable";
import { BugDetailModal } from "./BugDetailModal";
import { BugDetailEditModal } from "./BugDetailEditModal";
import type { KnownBug } from "../../types/bugs";
import { formatBugSeverity, formatBugStatus } from "../../types/bugs";
import {
  Download,
  Search,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ManualViewer } from "../../components/ManualViewer";
import * as XLSX from "xlsx";

interface BugListToolProps {
  onGoToNewBug?: () => void;
  selectedBugCode?: string | null;
}

const PAGE_SIZE = 10;

export function BugListTool({
  onGoToNewBug,
  selectedBugCode,
}: BugListToolProps) {
  const { bugs, isLoading, updateBug } = useBugs();
  const [viewingBug, setViewingBug] = useState<KnownBug | null>(null);
  const [editingBug, setEditingBug] = useState<KnownBug | null>(null);
  const [searchFilter, setSearchFilter] = useState(selectedBugCode || "");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (val: string) => {
    setSearchFilter(val);
    setCurrentPage(1);
  };

  const handleSeverityChange = (val: string) => {
    setSeverityFilter(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchFilter("");
    setSeverityFilter("ALL");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      const term = searchFilter.toLowerCase().trim();
      const matchesSearch =
        !term ||
        bug.bug_code?.toLowerCase().includes(term) ||
        bug.title?.toLowerCase().includes(term) ||
        bug.description?.toLowerCase().includes(term) ||
        (bug.workaround_instructions &&
          bug.workaround_instructions.toLowerCase().includes(term));

      const matchesSeverity =
        severityFilter === "ALL" || bug.severity === severityFilter;

      const matchesStatus =
        statusFilter === "ALL" || bug.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [bugs, searchFilter, severityFilter, statusFilter]);

  // Pagination calculation
  const totalResults = filteredBugs.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalResults);
  const paginatedBugs = useMemo(() => {
    return filteredBugs.slice(startIndex, endIndex);
  }, [filteredBugs, startIndex, endIndex]);

  const handleExportExcel = () => {
    if (filteredBugs.length === 0) return;

    const dataToExport = filteredBugs.map((b) => ({
      "Código do Bug": b.bug_code,
      "Título do Bug": b.title,
      Severidade: formatBugSeverity(b.severity),
      Status: formatBugStatus(b.status),
      "Descrição da Falha": b.description,
      "Instruções de Contorno / Solução": b.workaround_instructions || "",
      "Data de Cadastro": new Date(b.created_at).toLocaleString("pt-BR"),
      "Criado Por": b.created_by,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(wb, ws, "Bugs Conhecidos");

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `relatorio_bugs_conhecidos_mdm_${dateStr}.xlsx`);
  };

  const handleSaveBug = async (id: string, payload: Partial<KnownBug>) => {
    const updated = await updateBug(id, payload);
    if (viewingBug && viewingBug.id === id) {
      setViewingBug(updated);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-muted/10 py-3.5 px-5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-foreground text-xs font-bold tracking-wider uppercase">
              Catálogo de Bugs Conhecidos
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Consulte detalhes completos, edite causas-raiz, soluções de
              contorno e exporte relatórios para validações operacionais.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onGoToNewBug && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onGoToNewBug}
                className="h-8 text-xs gap-1.5 cursor-pointer font-medium"
              >
                <PlusCircle size={13} />
                Novo Bug
              </Button>
            )}

            {filteredBugs.length > 0 && (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleExportExcel}
                className="h-8 text-xs gap-1.5 cursor-pointer font-semibold"
              >
                <Download size={13} />
                Exportar Excel (.xlsx)
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Filtros e Busca */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Buscar por código, título ou falha..."
                className="h-9 pl-9 text-xs font-sans"
                value={searchFilter}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <div className="flex-1 space-y-0.5">
                <select
                  className="flex h-9 w-full rounded-lg border border-border bg-input px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={severityFilter}
                  onChange={(e) => handleSeverityChange(e.target.value)}
                >
                  <option value="ALL">Todas as Severidades</option>
                  <option value="CRITICAL">Crítica</option>
                  <option value="HIGH">Alta</option>
                  <option value="MEDIUM">Média</option>
                  <option value="LOW">Baixa</option>
                </select>
              </div>

              <div className="flex-1 space-y-0.5">
                <select
                  className="flex h-9 w-full rounded-lg border border-border bg-input px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="INVESTIGATING">Em Análise (N3/Dev)</option>
                  <option value="WORKAROUND_READY">
                    Contorno / Workaround Pronto
                  </option>
                  <option value="IN_DEVELOPMENT">
                    Em Correção na Engenharia
                  </option>
                  <option value="AWAITING_RELEASE">
                    Aguardando Deploy (Staging)
                  </option>
                  <option value="RESOLVED">Resolvido em Produção</option>
                  <option value="CLOSED">Encerrado e Validado</option>
                </select>
              </div>

              {(searchFilter ||
                severityFilter !== "ALL" ||
                statusFilter !== "ALL") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Limpar Filtros"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Tabela de Bugs */}
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Carregando catálogo de bugs...
            </div>
          ) : (
            <div className="space-y-3">
              <BugListTable
                bugs={paginatedBugs}
                onViewBug={(bug) => setViewingBug(bug)}
                onEditBug={(bug) => setEditingBug(bug)}
              />

              {/* Rodapé de Paginação e Contador de Resultados */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1 text-xs">
                <div className="text-muted-foreground font-medium text-xs">
                  {totalResults > 0 ? (
                    <span>
                      <strong className="text-foreground">
                        {startIndex + 1} - {endIndex}
                      </strong>{" "}
                      de{" "}
                      <strong className="text-foreground">
                        {totalResults}
                      </strong>{" "}
                      Resultados
                    </span>
                  ) : (
                    <span>0 - 0 de 0 Resultados</span>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={validPage === 1}
                      className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                      <span className="hidden sm:inline">Anterior</span>
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => {
                          // Show first, last, and around current page
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= validPage - 1 &&
                              pageNum <= validPage + 1)
                          ) {
                            return (
                              <Button
                                key={pageNum}
                                type="button"
                                variant={
                                  pageNum === validPage ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`h-8 w-8 p-0 text-xs font-mono font-semibold cursor-pointer ${
                                  pageNum === validPage
                                    ? "pointer-events-none"
                                    : ""
                                }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                          if (
                            (pageNum === 2 && validPage > 3) ||
                            (pageNum === totalPages - 1 &&
                              validPage < totalPages - 2)
                          ) {
                            return (
                              <span
                                key={`dots-${pageNum}`}
                                className="px-1 text-muted-foreground font-bold text-xs"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        },
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={validPage === totalPages}
                      className="h-8 px-2.5 text-xs gap-1 cursor-pointer"
                    >
                      <span className="hidden sm:inline">Próximo</span>
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes Completos (Sem Truncamento) */}
      <BugDetailModal
        bug={viewingBug}
        isOpen={Boolean(viewingBug)}
        onClose={() => setViewingBug(null)}
        onOpenEdit={(bug) => setEditingBug(bug)}
      />

      {/* Modal de Edição */}
      <BugDetailEditModal
        bug={editingBug}
        isOpen={Boolean(editingBug)}
        onClose={() => setEditingBug(null)}
        onSave={handleSaveBug}
        isLoading={isLoading}
      />

      <ManualViewer
        title="Catálogo & Gestão de Bugs Conhecidos"
        content={
          <div className="space-y-2">
            <p>
              <strong>Objetivo:</strong> Consultar, editar e exportar o catálogo
              unificado de causas-raiz mapeadas pela engenharia e suporte.
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>
                Clique nos <strong>3 pontinhos</strong> ou na linha para
                visualizar a <strong>Descrição Completa</strong> e Soluções de
                Contorno sem limite de visualização.
              </li>
              <li>
                Utilize a opção <strong>Editar</strong> para atualizar título,
                descrição, solução de contorno, severidade e status.
              </li>
              <li>
                O <strong>Código do Bug</strong> e a{" "}
                <strong>Data de Cadastro</strong> são identificadores fixos
                protegidos contra alterações.
              </li>
              <li>
                A listagem é paginada em 10 itens por página com controle de
                navegação no rodapé.
              </li>
              <li>
                Utilize o botão <strong>Exportar Excel</strong> para extrair a
                lista filtrada em formato <code>.xlsx</code> para auditorias
                operacionais.
              </li>
            </ol>
          </div>
        }
      />
    </div>
  );
}
