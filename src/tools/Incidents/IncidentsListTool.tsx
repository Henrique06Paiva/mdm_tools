import { useState } from "react";
import { useIncidents } from "./useIncidents";
import { IncidentListTable } from "./IncidentListTable";
import { IncidentDetailModal } from "./IncidentDetailModal";
import type { BugIncident } from "../../types/incidents";
import { Download, Search } from "lucide-react";

export function IncidentsListTool() {
  const { incidents, knownBugs, isLoading } = useIncidents();
  const [selectedIncident, setSelectedIncident] = useState<BugIncident | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const filteredIncidents = incidents.filter((inc) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      inc.ticket_number?.toLowerCase().includes(term) ||
      inc.title?.toLowerCase().includes(term) ||
      inc.corporation_name?.toLowerCase().includes(term) ||
      inc.corporation_id?.toLowerCase().includes(term) ||
      inc.environment?.toLowerCase().includes(term) ||
      inc.observed_behavior?.toLowerCase().includes(term)
    );
  });

  const handleExportCSV = () => {
    if (!filteredIncidents || filteredIncidents.length === 0) return;

    const headers = [
      "Número do Ticket",
      "Título",
      "Ambiente",
      "ID Corporação",
      "Nome Corporação",
      "Solicitante",
      "Data do Report",
      "Comportamento Observado",
      "Comportamento Esperado",
      "Qtd Aparelhos",
    ];

    const rows = filteredIncidents.map((inc) => [
      `"${inc.ticket_number || ""}"`,
      `"${(inc.title || "").replace(/"/g, '""')}"`,
      `"${inc.environment || ""}"`,
      `"${inc.corporation_id || ""}"`,
      `"${(inc.corporation_name || "").replace(/"/g, '""')}"`,
      `"${(inc.reporter_contact || "").replace(/"/g, '""')}"`,
      `"${inc.reported_at || ""}"`,
      `"${(inc.observed_behavior || "").replace(/"/g, '""')}"`,
      `"${(inc.expected_behavior || "").replace(/"/g, '""')}"`,
      `"${inc.affected_devices_count || 1}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(";"), ...rows.map((e) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `relatorio_chamados_mdm_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-card text-card-foreground border border-border/40 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              Lista & Relatórios de Chamados
            </h3>
            <p className="text-sm text-muted-foreground">
              Consulte, pesquise, inspecione detalhes e exporte os relatórios dos chamados registrados.
            </p>
          </div>

          {filteredIncidents.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-secondary text-secondary-foreground font-semibold text-xs rounded-xl hover:bg-secondary/80 transition-colors flex items-center gap-2 cursor-pointer shadow-xs border border-border/40 shrink-0"
            >
              <Download size={15} />
              Exportar Relatório (CSV)
            </button>
          )}
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar por ticket, título, corporação, ambiente ou erro..."
            className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>

        {/* Tabela de Chamados */}
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Carregando chamados...
          </div>
        ) : (
          <IncidentListTable
            incidents={filteredIncidents}
            knownBugs={knownBugs}
            onSelectIncident={(incident) => setSelectedIncident(incident)}
          />
        )}
      </div>

      {/* Modal de Detalhes do Chamado */}
      <IncidentDetailModal
        incident={selectedIncident}
        knownBugs={knownBugs}
        onClose={() => setSelectedIncident(null)}
      />
    </div>
  );
}
