export type IncidentEnvironment = string;

export interface BugIncident {
  id: string;
  bug_id: string | null;
  ticket_number: string;
  title?: string;
  environment: IncidentEnvironment;
  corporation_id: string;
  corporation_name: string;
  reporter_contact: string;
  reported_at: string;
  observed_behavior: string;
  expected_behavior: string;
  evidence_urls: string[];
  affected_devices_count: number;
  affected_serials: string[];
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
