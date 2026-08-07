import { supabase } from "../supabase";
import type { BugIncident, CreateIncidentPayload } from "../types/incidents";

export async function fetchIncidents(): Promise<BugIncident[]> {
  const { data, error } = await supabase
    .from("bug_incidents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar chamado:", error);
    throw error;
  }
  return data || [];
}

export async function createIncident(
  payload: CreateIncidentPayload,
): Promise<BugIncident> {
  const { data, error } = await supabase
    .from("bug_incidents")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar incidente:", error);
    throw error;
  }
  return data;
}

export async function updateIncident(
  id: string,
  payload: Partial<BugIncident>,
): Promise<BugIncident> {
  const { data, error } = await supabase
    .from("bug_incidents")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar incidente:", error);
    throw error;
  }
  return data;
}
