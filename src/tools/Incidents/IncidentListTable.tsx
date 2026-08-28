import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { BugIncident, IncidentStatus, IncidentComment } from "../../types/incidents";
import { formatIncidentStatus, getIncidentStatusBadge } from "../../types/incidents";
import type { KnownBug } from "../../types/bugs";
import { MoreHorizontal, Eye, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/button";

interface IncidentListTableProps {
  incidents: BugIncident[];
  knownBugs: KnownBug[];
  onViewIncident?: (incident: BugIncident) => void;
  onChangeStatus?: (
    id: string,
    newStatus: IncidentStatus,
    author: string,
    currentComments: IncidentComment[],
    oldStatus?: IncidentStatus
  ) => Promise<BugIncident | void>;
  currentUsername?: string | null;
}

interface MenuPosition {
  incident: BugIncident;
  top: number;
  left: number;
}

export const IncidentListTable: React.FC<IncidentListTableProps> = ({
  incidents,
  knownBugs,
  onViewIncident,
  onChangeStatus,
  currentUsername = "Analista de Suporte",
}) => {
  const [activeMenu, setActiveMenu] = useState<MenuPosition | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClose = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    const handleScrollOrResize = () => {
      setActiveMenu(null);
    };

    if (activeMenu) {
      document.addEventListener("mousedown", handleClose);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
    }

    return () => {
      document.removeEventListener("mousedown", handleClose);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [activeMenu]);

  const handleOpenMenu = (e: React.MouseEvent<HTMLButtonElement>, incident: BugIncident) => {
    e.stopPropagation();
    if (activeMenu?.incident.id === incident.id) {
      setActiveMenu(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 200;

    let left = rect.right - menuWidth;
    if (left < 10) left = 10;

    setActiveMenu({
      incident,
      top: rect.bottom + 4,
      left,
    });
  };

  const getBugCode = (bugId: string | null) => {
    if (!bugId) return "Sem Vínculo";
    const bug = knownBugs.find((b) => b.id === bugId);
    return bug ? `${bug.bug_code}` : "Bug Vinculado";
  };

  if (incidents.length === 0) {
    return (
      <div className="bg-card text-card-foreground border border-border/40 rounded-lg p-8 text-center">
        <p className="text-muted-foreground text-xs">
          Nenhum chamado encontrado com os filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-full overflow-x-auto scrollbar-none rounded-lg border border-border/40 bg-card shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/40 border-b border-border/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3.5 py-2.5 whitespace-nowrap w-[110px]">Ticket</th>
              <th className="px-3.5 py-2.5 min-w-[180px]">Título do Chamado</th>
              <th className="px-3.5 py-2.5 whitespace-nowrap w-[100px]">Ambiente</th>
              <th className="px-3.5 py-2.5 min-w-[150px]">Corporação / Cliente</th>
              <th className="px-3.5 py-2.5 whitespace-nowrap w-[150px]">Status</th>
              <th className="px-3.5 py-2.5 whitespace-nowrap w-[110px]">Bug (Corpo Único)</th>
              <th className="px-3.5 py-2.5 whitespace-nowrap w-[100px]">Data Report</th>
              <th className="px-3.5 py-2.5 text-center whitespace-nowrap w-[60px]">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 font-sans">
            {incidents.map((incident) => {
              const currentStatus: IncidentStatus = incident.status || "OPEN";

              return (
                <tr
                  key={incident.id}
                  onClick={() => onViewIncident?.(incident)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <td className="px-3.5 py-2.5 font-mono font-bold text-primary text-xs whitespace-nowrap">
                    {incident.ticket_number}
                  </td>
                  <td
                    className="px-3.5 py-2.5 font-medium text-foreground text-xs max-w-[220px] truncate"
                    title={incident.title || incident.observed_behavior}
                  >
                    {incident.title || incident.observed_behavior}
                  </td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border/40">
                      {incident.environment}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className="font-semibold text-foreground text-xs truncate max-w-[180px]">
                      {incident.corporation_name}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      ID: {incident.corporation_id}
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getIncidentStatusBadge(
                        currentStatus
                      )}`}
                    >
                      {formatIncidentStatus(currentStatus)}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/30">
                      {getBugCode(incident.bug_id)}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(incident.reported_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleOpenMenu(e, incident)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer mx-auto"
                      title="Mais Opções"
                    >
                      <MoreHorizontal size={15} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Menu Flutuante via React Portal */}
      {activeMenu &&
        createPortal(
          <div
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: `${activeMenu.top}px`,
              left: `${activeMenu.left}px`,
            }}
            className="z-50 min-w-[200px] bg-popover text-popover-foreground rounded-xl border border-border/70 shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => {
                const inc = activeMenu.incident;
                setActiveMenu(null);
                onViewIncident?.(inc);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg text-foreground hover:bg-muted font-medium transition-colors cursor-pointer text-left"
            >
              <Eye size={13} className="text-primary" />
              Ver Detalhes & Jira
            </button>

            {onChangeStatus && (
              <div className="border-t border-border/40 mt-1 pt-1 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-0.5 block flex items-center gap-1">
                  <RefreshCw size={10} /> Mudar Status
                </span>
                {(
                  [
                    "OPEN",
                    "IN_ANALYSIS",
                    "DEV_TEAM",
                    "RESOLVED",
                    "CANCELLED",
                  ] as IncidentStatus[]
                ).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      const inc = activeMenu.incident;
                      setActiveMenu(null);
                      onChangeStatus(
                        inc.id,
                        st,
                        currentUsername || "Analista de Suporte",
                        inc.comments || [],
                        inc.status || "OPEN"
                      );
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                      st === (activeMenu.incident.status || "OPEN")
                        ? "bg-primary/15 text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{formatIncidentStatus(st)}</span>
                    {st === (activeMenu.incident.status || "OPEN") && (
                      <CheckCircle2 size={12} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
};
