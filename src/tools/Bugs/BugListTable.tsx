import React from "react";
import type { KnownBug, BugSeverity, BugStatus } from "../../types/bugs";

interface BugListTableProps {
  bugs: KnownBug[];
}

export const BugListTable: React.FC<BugListTableProps> = ({ bugs }) => {
  const getSeverityBadge = (severity: BugSeverity) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-500/15 text-rose-500 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "MEDIUM":
        return "bg-sky-500/15 text-sky-500 border-sky-500/30";
      case "LOW":
        return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadge = (status: BugStatus) => {
    switch (status) {
      case "INVESTIGATING":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "WORKAROUND_READY":
        return "bg-sky-500/10 text-sky-500 border-sky-500/20";
      case "IN_DEVELOPMENT":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "RESOLVED":
      case "CLOSED":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (bugs.length === 0) {
    return (
      <div className="bg-card text-card-foreground border border-border/40 rounded-xl p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhum bug conhecido cadastrado até o momento. Cadastre a primeira falha no formulário acima.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-xl border border-border/40 bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 border-b border-border/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Título do Bug</th>
            <th className="px-4 py-3">Severidade</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Descrição / Workaround</th>
            <th className="px-4 py-3">Data Cadastro</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {bugs.map((bug) => (
            <tr key={bug.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-mono font-bold text-primary text-xs">
                {bug.bug_code}
              </td>
              <td className="px-4 py-3 font-semibold text-foreground">
                {bug.title}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityBadge(
                    bug.severity
                  )}`}
                >
                  {bug.severity}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                    bug.status
                  )}`}
                >
                  {bug.status}
                </span>
              </td>
              <td className="px-4 py-3 max-w-xs truncate text-muted-foreground text-xs">
                {bug.workaround_instructions || bug.description}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                {new Date(bug.created_at).toLocaleDateString("pt-BR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
