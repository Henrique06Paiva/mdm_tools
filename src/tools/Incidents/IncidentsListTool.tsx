import { useState, useMemo } from "react";
import { useIncidents } from "./useIncidents";
import { IncidentListTable } from "./IncidentListTable";
import { IncidentDetailModal } from "./IncidentDetailModal";
import type { BugIncident, IncidentStatus, IncidentComment } from "../../types/incidents";
import { formatIncidentStatus } from "../../types/incidents";
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { ManualViewer } from "../../components/ManualViewer";
import * as XLSX from "xlsx";

const PAGE_SIZE = 10;

export function IncidentsListTool() {
  const { incidents, knownBugs, isLoading, changeStatus, addComment } =
    useIncidents();
  const [selectedIncident, setSelectedIncident] = useState<BugIncident | null>(
    null
  );
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [envFilter, setEnvFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (val: string) => {
    setSearchFilter(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleEnvChange = (val: string) => {
    setEnvFilter(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchFilter("");
    setStatusFilter("ALL");
    setEnvFilter("ALL");
    setCurrentPage(1);
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      const term = searchFilter.toLowerCase().trim();
      const matchesSearch =
        !term ||
        inc.ticket_number?.toLowerCase().includes(term) ||
        inc.title?.toLowerCase().includes(term) ||
        inc.corporation_name?.toLowerCase().includes(term) ||
        inc.corporation_id?.toLowerCase().includes(term) ||
        inc.environment?.toLowerCase().includes(term) ||
        inc.observed_behavior?.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "ALL" || (inc.status || "OPEN") === statusFilter;

      const matchesEnv =
        envFilter === "ALL" || inc.environment === envFilter;

      return matchesSearch && matchesStatus && matchesEnv;
    });
  }, [incidents, searchFilter, statusFilter, envFilter]);

  // Pagination calculation
  const totalResults = filteredIncidents.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalResults);
  const paginatedIncidents = useMemo(() => {
    return filteredIncidents.slice(startIndex, endIndex);
  }, [filteredIncidents, startIndex, endIndex]);

  const handleExportExcel = () => {
    if (filteredIncidents.length === 0) return;

    const dataToExport = filteredIncidents.map((inc) => {
      const bug = knownBugs.find((b) => b.id === inc.bug_id);
      return {
        "Número do Ticket": inc.ticket_number,
        Título: inc.title || "",
        Ambiente: inc.environment,
        Status: formatIncidentStatus(inc.status),
        "ID Corporação": inc.corporation_id,
        "Nome Corporação": inc.corporation_name,
        Solicitante: inc.reporter_contact || "",
        "Bug Vinculado": bug ? `[${bug.bug_code}] ${bug.title}` : "Sem Vínculo",
        "Data do Report": new Date(inc.reported_at).toLocaleString("pt-BR"),
        "Comportamento Observado": inc.observed_behavior,
        "Comportamento Esperado": inc.expected_behavior,
        "Aparelhos Afetados": inc.affected_devices_count || 1,
        "Qtd Comentários (Jira)": (inc.comments || []).length,
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(wb, ws, "Chamados e Atividades");

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `relatorio_chamados_mdm_${dateStr}.xlsx`);
  };

  const handleChangeStatus = async (
    id: string,
    newStatus: IncidentStatus,
    author: string,
    currentComments: IncidentComment[],
    oldStatus?: IncidentStatus
  ) => {
    const updated = await changeStatus(
      id,
      newStatus,
      author,
      currentComments,
      oldStatus
    );
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident(updated);
    }
  };

  const handleAddComment = async (
    id: string,
    comment: Omit<IncidentComment, "id" | "created_at">,
    currentComments: IncidentComment[]
  ) => {
    const updated = await addComment(id, comment, currentComments);
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident(updated);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-muted/10 py-3.5 px-5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-foreground text-xs font-bold tracking-wider uppercase">
              Lista & Atividades de Chamados
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Acompanhe o ciclo de vida dos chamados, transições de status, discussões técnicas estilo Jira e relatórios.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {filteredIncidents.length > 0 && (
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
                placeholder="Buscar por ticket, título, cliente ou erro..."
                className="h-9 pl-9 text-xs font-sans"
                value={searchFilter}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <div className="flex-1 space-y-0.5">
                <select
                  className="flex h-9 w-full rounded-lg border border-border bg-input px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="OPEN">Aberto</option>
                  <option value="IN_ANALYSIS">Em Análise</option>
                  <option value="DEV_TEAM">Time de Desenvolvimento</option>
                  <option value="RESOLVED">Resolvido</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>

              <div className="flex-1 space-y-0.5">
                <select
                  className="flex h-9 w-full rounded-lg border border-border bg-input px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={envFilter}
                  onChange={(e) => handleEnvChange(e.target.value)}
                >
                  <option value="ALL">Todos os Ambientes</option>
                  <option value="PRODUCTION">Produção</option>
                  <option value="STAGING">Homologação / Staging</option>
                  <option value="DEVELOPMENT">Desenvolvimento</option>
                </select>
              </div>

              {(searchFilter || statusFilter !== "ALL" || envFilter !== "ALL") && (
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

          {/* Tabela de Chamados */}
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Carregando chamados...
            </div>
          ) : (
            <div className="space-y-3">
              <IncidentListTable
                incidents={paginatedIncidents}
                knownBugs={knownBugs}
                onViewIncident={(incident) => setSelectedIncident(incident)}
                onChangeStatus={handleChangeStatus}
              />

              {/* Rodapé de Paginação e Contador */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1 text-xs">
                <div className="text-muted-foreground font-medium text-xs">
                  {totalResults > 0 ? (
                    <span>
                      <strong className="text-foreground">
                        {startIndex + 1} - {endIndex}
                      </strong>{" "}
                      de{" "}
                      <strong className="text-foreground">{totalResults}</strong>{" "}
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
                        }
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

      {/* Modal no estilo Jira com Status, Detalhes e Atividades */}
      <IncidentDetailModal
        incident={selectedIncident}
        knownBugs={knownBugs}
        onClose={() => setSelectedIncident(null)}
        onChangeStatus={handleChangeStatus}
        onAddComment={handleAddComment}
      />

      <ManualViewer
        title="Gestão de Chamados & Atividades"
        content={
          <div className="space-y-2">
            <p>
              <strong>Objetivo:</strong> Acompanhar chamados reportados, registrar atualizações de status e interagir via comentários no estilo Jira.
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>
                Clique nos <strong>3 pontinhos</strong> ou em qualquer chamado para abrir a visão expandida e o feed de atividades.
              </li>
              <li>
                Altere o status para <strong>Aberto</strong>, <strong>Em Análise</strong>, <strong>Time de Desenvolvimento</strong>, <strong>Resolvido</strong> ou <strong>Cancelado</strong>.
              </li>
              <li>
                Na aba <strong>Atividades & Jira</strong>, adicione comentários técnicos, anexe fotos, vídeos, links externos e use <code>@</code> para mencionar colegas.
              </li>
              <li>
                Utilize o botão <strong>Exportar Excel</strong> para extrair relatórios completos com histórico de interações.
              </li>
            </ol>
          </div>
        }
      />
    </div>
  );
}
