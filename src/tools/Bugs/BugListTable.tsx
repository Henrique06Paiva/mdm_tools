import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { KnownBug, BugSeverity, BugStatus } from "../../types/bugs";
import { formatBugSeverity, formatBugStatus } from "../../types/bugs";
import { MoreHorizontal, Eye, Edit3 } from "lucide-react";
import { Button } from "../../components/ui/button";

interface BugListTableProps {
  bugs: KnownBug[];
  onViewBug?: (bug: KnownBug) => void;
  onEditBug?: (bug: KnownBug) => void;
}

interface MenuPosition {
  bug: KnownBug;
  top: number;
  left: number;
}

export const BugListTable: React.FC<BugListTableProps> = ({
  bugs,
  onViewBug,
  onEditBug,
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

  const handleOpenMenu = (
    e: React.MouseEvent<HTMLButtonElement>,
    bug: KnownBug,
  ) => {
    e.stopPropagation();
    if (activeMenu?.bug.id === bug.id) {
      setActiveMenu(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 175;

    // Position below button, align right edge with button
    let left = rect.right - menuWidth;
    if (left < 10) left = 10;

    setActiveMenu({
      bug,
      top: rect.bottom + 4,
      left,
    });
  };

  const getSeverityBadge = (severity: BugSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "HIGH":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "MEDIUM":
        return "bg-primary/10 text-primary border-primary/20";
      case "LOW":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadge = (status: BugStatus) => {
    switch (status) {
      case "INVESTIGATING":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "WORKAROUND_READY":
        return "bg-primary/10 text-primary border-primary/20";
      case "IN_DEVELOPMENT":
        return "bg-violet-500/10 text-violet-500 border-violet-500/20";
      case "RESOLVED":
      case "CLOSED":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (bugs.length === 0) {
    return (
      <div className="bg-card text-card-foreground border border-border/40 rounded-lg p-8 text-center">
        <p className="text-muted-foreground text-xs">
          Nenhum bug conhecido encontrado com os filtros aplicados.
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
              <th className="px-3.5 py-2.5 whitespace-nowrap w-[120px]">
                Código
              </th>
              <th className="px-3.5 py-2.5 min-w-[180px]">Título</th>
              <th className="px-3.5 py-2.5 whitespace-nowrap w-[100px]">
                Severidade
              </th>
              <th className="px-3.5 py-2.5 whitespace-nowrap w-[140px]">
                Status
              </th>
              <th className="px-3.5 py-2.5 min-w-[200px]">
                Descrição / Workaround
              </th>
              <th className="px-3.5 py-2.5 whitespace-nowrap w-[110px]">
                Data Cadastro
              </th>
              <th className="px-3.5 py-2.5 text-center whitespace-nowrap w-[60px]">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 font-sans">
            {bugs.map((bug) => (
              <tr
                key={bug.id}
                onClick={() => onViewBug?.(bug)}
                className="hover:bg-muted/30 transition-colors cursor-pointer group"
              >
                <td className="px-3.5 py-2.5 font-mono font-bold text-primary text-xs whitespace-nowrap">
                  {bug.bug_code}
                </td>
                <td
                  className="px-3.5 py-2.5 font-medium text-foreground text-xs max-w-[240px] truncate"
                  title={bug.title}
                >
                  {bug.title}
                </td>
                <td className="px-3.5 py-2.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getSeverityBadge(
                      bug.severity,
                    )}`}
                  >
                    {formatBugSeverity(bug.severity)}
                  </span>
                </td>
                <td className="px-3.5 py-2.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(
                      bug.status,
                    )}`}
                  >
                    {formatBugStatus(bug.status)}
                  </span>
                </td>
                <td
                  className="px-3.5 py-2.5 max-w-[280px] truncate text-muted-foreground text-xs"
                  title={bug.workaround_instructions || bug.description}
                >
                  {bug.workaround_instructions || bug.description}
                </td>
                <td className="px-3.5 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(bug.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleOpenMenu(e, bug)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg cursor-pointer mx-auto"
                    title="Mais Opções"
                  >
                    <MoreHorizontal size={15} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Menu Suspenso Flutuante via React Portal (Sobrepõe tudo sem gerar barras de rolagem) */}
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
            className="z-50 min-w-[175px] bg-popover text-popover-foreground rounded-xl border border-border/70 shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => {
                const b = activeMenu.bug;
                setActiveMenu(null);
                onViewBug?.(b);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg text-foreground hover:bg-muted font-medium transition-colors cursor-pointer text-left"
            >
              <Eye size={13} className="text-primary" />
              Ver Detalhes
            </button>

            <button
              type="button"
              onClick={() => {
                const b = activeMenu.bug;
                setActiveMenu(null);
                onEditBug?.(b);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg text-foreground hover:bg-muted font-medium transition-colors cursor-pointer text-left"
            >
              <Edit3 size={13} className="text-amber-500" />
              Editar Informações
            </button>
          </div>,
          document.body,
        )}
    </>
  );
};
