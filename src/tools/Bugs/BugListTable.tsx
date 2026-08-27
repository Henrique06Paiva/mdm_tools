import React from "react";
import type { KnownBug, BugSeverity, BugStatus } from "../../types/bugs";

interface BugListTableProps {
  bugs: KnownBug[];
}

export const BugListTable: React.FC<BugListTableProps> = ({ bugs }) => {
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
          Nenhum bug conhecido cadastrado até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-lg border border-border/40 bg-card shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/40 border-b border-border/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3.5 py-2.5">Código</th>
            <th className="px-3.5 py-2.5">Título do Bug</th>
            <th className="px-3.5 py-2.5">Severidade</th>
            <th className="px-3.5 py-2.5">Status</th>
            <th className="px-3.5 py-2.5">Descrição / Workaround</th>
            <th className="px-3.5 py-2.5">Data Cadastro</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30 font-sans">
          {bugs.map((bug) => (
            <tr key={bug.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-3.5 py-2.5 font-mono font-bold text-primary text-xs">
                {bug.bug_code}
              </td>
              <td className="px-3.5 py-2.5 font-medium text-foreground text-xs">
                {bug.title}
              </td>
              <td className="px-3.5 py-2.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getSeverityBadge(
                    bug.severity
                  )}`}
                >
                  {bug.severity}
                </span>
              </td>
              <td className="px-3.5 py-2.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(
                    bug.status
                  )}`}
                >
                  {bug.status}
                </span>
              </td>
              <td className="px-3.5 py-2.5 max-w-xs truncate text-muted-foreground text-xs">
                {bug.workaround_instructions || bug.description}
              </td>
              <td className="px-3.5 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                {new Date(bug.created_at).toLocaleDateString("pt-BR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
