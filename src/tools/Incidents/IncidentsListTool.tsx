import { useState } from "react";
import { useIncidents } from "./useIncidents";
import { IncidentListTable } from "./IncidentListTable";
import { IncidentDetailModal } from "./IncidentDetailModal";
import type { BugIncident } from "../../types/incidents";
import { Download, Search } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

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
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="bg-muted/10 py-3.5 px-5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-foreground text-xs font-bold tracking-wider uppercase">
              Lista & Relatórios de Chamados
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Consulte, filtre e exporte chamados registrados no sistema.
            </p>
          </div>

          {filteredIncidents.length > 0 && (
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 cursor-pointer shrink-0"
            >
              <Download size={13} />
              Exportar CSV
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Barra de Pesquisa */}
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por ticket, título, corporação ou erro..."
              className="h-9 pl-9 text-xs font-sans"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          {/* Tabela de Chamados */}
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              Carregando chamados...
            </div>
          ) : (
            <IncidentListTable
              incidents={filteredIncidents}
              knownBugs={knownBugs}
              onSelectIncident={(incident) => setSelectedIncident(incident)}
            />
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Chamado */}
      <IncidentDetailModal
        incident={selectedIncident}
        knownBugs={knownBugs}
        onClose={() => setSelectedIncident(null)}
      />
    </div>
  );
}
