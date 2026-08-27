import type { BugIncident } from '../../types/incidents';
import type { KnownBug } from '../../types/bugs';

interface IncidentListTableProps {
  incidents: BugIncident[];
  knownBugs: KnownBug[];
  onSelectIncident?: (incident: BugIncident) => void;
}

export const IncidentListTable: React.FC<IncidentListTableProps> = ({
  incidents,
  knownBugs,
  onSelectIncident,
}) => {
  const getBugCode = (bugId: string | null) => {
    if (!bugId) return 'Sem Bug Vinculado';
    const bug = knownBugs.find((b) => b.id === bugId);
    return bug ? `${bug.bug_code} - ${bug.title}` : 'Bug Desconhecido';
  };

  if (incidents.length === 0) {
    return (
      <div className="bg-card text-card-foreground border border-border/40 rounded-lg p-8 text-center">
        <p className="text-muted-foreground text-xs">
          Nenhum chamado registrado até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-lg border border-border/40 bg-card shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/40 border-b border-border/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-3.5 py-2.5">Ticket</th>
            <th className="px-3.5 py-2.5">Ambiente</th>
            <th className="px-3.5 py-2.5">Corporação / Cliente</th>
            <th className="px-3.5 py-2.5">Bug Vinculado (Corpo Único)</th>
            <th className="px-3.5 py-2.5">Comportamento Observado</th>
            <th className="px-3.5 py-2.5">Dispositivos</th>
            <th className="px-3.5 py-2.5">Data Report</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30 font-sans">
          {incidents.map((incident) => (
            <tr
              key={incident.id}
              onClick={() => onSelectIncident && onSelectIncident(incident)}
              className="hover:bg-muted/20 transition-colors cursor-pointer"
            >
              <td className="px-3.5 py-2.5">
                <div className="font-bold text-primary font-mono text-xs">{incident.ticket_number}</div>
                {incident.title && (
                  <div className="font-medium text-foreground text-xs mt-0.5 truncate max-w-[200px]" title={incident.title}>
                    {incident.title}
                  </div>
                )}
              </td>
              <td className="px-3.5 py-2.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    incident.environment === 'PRODUCTION'
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      : incident.environment === 'STAGING'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : 'bg-primary/10 text-primary border-primary/20'
                  }`}
                >
                  {incident.environment}
                </span>
              </td>
              <td className="px-3.5 py-2.5">
                <div className="font-medium text-foreground">{incident.corporation_name}</div>
                <div className="text-[11px] text-muted-foreground font-mono">ID: {incident.corporation_id}</div>
              </td>
              <td className="px-3.5 py-2.5">
                <span className="text-[11px] bg-muted/60 px-2 py-0.5 rounded font-mono text-muted-foreground border border-border/30">
                  {getBugCode(incident.bug_id)}
                </span>
              </td>
              <td className="px-3.5 py-2.5 max-w-xs truncate text-muted-foreground">
                {incident.observed_behavior}
              </td>
              <td className="px-3.5 py-2.5 font-mono text-xs text-foreground">
                {incident.affected_devices_count} aparelho(s)
              </td>
              <td className="px-3.5 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                {new Date(incident.reported_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
