export type BugStatus =
  | 'INVESTIGATING'
  | 'WORKAROUND_READY'
  | 'IN_DEVELOPMENT'
  | 'AWAITING_RELEASE'
  | 'RESOLVED'
  | 'CLOSED';

export type BugSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

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
  'id' | 'created_at' | 'updated_at' | 'dev_lead_time_hours'
>;
