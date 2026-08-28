export type BugStatus =
  | "INVESTIGATING"
  | "WORKAROUND_READY"
  | "IN_DEVELOPMENT"
  | "AWAITING_RELEASE"
  | "RESOLVED"
  | "CLOSED";

export type BugSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface KnownBug {
  id: string;
  bug_code: string;
  title: string;
  description: string;
  symptoms: string[];
  workaround_instructions?: string;
  affected_components: string[];
  severity: BugSeverity;
  status: BugStatus;
  target_release_version?: string;
  dev_assigned_at?: string;
  dev_resolved_at?: string;
  dev_lead_time_hours?: number;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export type CreateBugPayload = Omit<
  KnownBug,
  "id" | "created_at" | "updated_at" | "dev_lead_time_hours"
>;

export const BUG_SEVERITY_LABELS: Record<BugSeverity, string> = {
  CRITICAL: "Crítica",
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

export const BUG_STATUS_LABELS: Record<BugStatus, string> = {
  INVESTIGATING: "Em Análise",
  WORKAROUND_READY: "Contorno Pronto",
  IN_DEVELOPMENT: "Em Correção",
  AWAITING_RELEASE: "Aguardando Deploy",
  RESOLVED: "Resolvido",
  CLOSED: "Encerrado",
};

export function formatBugSeverity(sev?: BugSeverity | null): string {
  if (!sev) return "";
  return BUG_SEVERITY_LABELS[sev] || sev;
}

export function formatBugStatus(status?: BugStatus | null): string {
  if (!status) return "";
  return BUG_STATUS_LABELS[status] || status;
}
