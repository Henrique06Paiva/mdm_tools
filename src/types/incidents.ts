export type IncidentEnvironment = string;

export type IncidentStatus =
  | 'OPEN'
  | 'IN_ANALYSIS'
  | 'DEV_TEAM'
  | 'RESOLVED'
  | 'CANCELLED';

export interface IncidentAttachment {
  id: string;
  type: 'image' | 'video' | 'link';
  url: string;
  name?: string;
}

export interface IncidentComment {
  id: string;
  author: string;
  content: string;
  created_at: string;
  attachments?: IncidentAttachment[];
  mentions?: string[];
  is_system?: boolean;
}

export interface BugIncident {
  id: string;
  bug_id: string | null;
  ticket_number: string;
  title?: string;
  environment: IncidentEnvironment;
  status?: IncidentStatus;
  corporation_id: string;
  corporation_name: string;
  reporter_contact: string;
  reported_at: string;
  observed_behavior: string;
  expected_behavior: string;
  evidence_urls: string[];
  affected_devices_count: number;
  affected_serials: string[];
  comments?: IncidentComment[];
  resolution_notes?: string;
  is_notified: boolean;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export type CreateIncidentPayload = Omit<
  BugIncident,
  'id' | 'created_at' | 'updated_at' | 'is_notified'
>;

export const BUG_INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  OPEN: 'Aberto',
  IN_ANALYSIS: 'Em Análise',
  DEV_TEAM: 'Time de Desenvolvimento',
  RESOLVED: 'Resolvido',
  CANCELLED: 'Cancelado',
};

export function formatIncidentStatus(status?: IncidentStatus | string | null): string {
  if (!status) return 'Aberto';
  return (
    BUG_INCIDENT_STATUS_LABELS[status as IncidentStatus] ||
    status
  );
}

export function getIncidentStatusBadge(status?: IncidentStatus | string | null): string {
  const norm = status || 'OPEN';
  switch (norm) {
    case 'OPEN':
      return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    case 'IN_ANALYSIS':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'DEV_TEAM':
      return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20';
    case 'RESOLVED':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'CANCELLED':
      return 'bg-muted text-muted-foreground border-border/40';
    default:
      return 'bg-muted text-muted-foreground border-border/40';
  }
}
