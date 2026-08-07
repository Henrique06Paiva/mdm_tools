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
      <div className="bg-card text-card-foreground border border-border/40 rounded-xl p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhum incidente cadastrado até o momento. Utilize o formulário acima para registrar.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-xl border border-border/40 bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 border-b border-border/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Ticket</th>
            <th className="px-4 py-3">Ambiente</th>
            <th className="px-4 py-3">Corporação / Cliente</th>
            <th className="px-4 py-3">Bug Vinculado (Corpo Único)</th>
            <th className="px-4 py-3">Comportamento Observado</th>
            <th className="px-4 py-3">Dispositivos</th>
            <th className="px-4 py-3">Data Report</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {incidents.map((incident) => (
            <tr
              key={incident.id}
              onClick={() => onSelectIncident && onSelectIncident(incident)}
              className="hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3">
                <div className="font-bold text-primary font-mono text-xs">{incident.ticket_number}</div>
                {incident.title && (
                  <div className="font-semibold text-foreground text-xs mt-0.5 truncate max-w-[220px]" title={incident.title}>
                    {incident.title}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    incident.environment === 'PRODUCTION'
                      ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                      : incident.environment === 'STAGING'
                      ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                      : 'bg-sky-500/15 text-sky-500 border-sky-500/30'
                  }`}
                >
                  {incident.environment}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium">{incident.corporation_name}</div>
                <div className="text-xs text-muted-foreground">{incident.corporation_id}</div>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs bg-secondary/80 px-2 py-1 rounded font-mono">
                  {getBugCode(incident.bug_id)}
                </span>
              </td>
              <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">
                {incident.observed_behavior}
              </td>
              <td className="px-4 py-3 font-mono text-xs">
                {incident.affected_devices_count} aparelho(s)
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
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
