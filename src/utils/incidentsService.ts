import { supabase } from "../supabase";
import type {
  BugIncident,
  CreateIncidentPayload,
  IncidentStatus,
  IncidentComment,
} from "../types/incidents";
import { formatIncidentStatus } from "../types/incidents";

export async function fetchIncidents(): Promise<BugIncident[]> {
  const { data, error } = await supabase
    .from("bug_incidents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar chamado:", error);
    throw error;
  }
  return (data || []).map((item) => ({
    ...item,
    status: item.status || "OPEN",
    comments: Array.isArray(item.comments) ? item.comments : [],
  }));
}

export async function createIncident(
  payload: CreateIncidentPayload
): Promise<BugIncident> {
  const payloadWithDefaults = {
    ...payload,
    status: payload.status || "OPEN",
    comments: payload.comments || [],
  };

  const { data, error } = await supabase
    .from("bug_incidents")
    .insert([payloadWithDefaults])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar incidente:", error);
    throw error;
  }
  return {
    ...data,
    status: data.status || "OPEN",
    comments: Array.isArray(data.comments) ? data.comments : [],
  };
}

export async function updateIncident(
  id: string,
  payload: Partial<BugIncident>
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
  return {
    ...data,
    status: data.status || "OPEN",
    comments: Array.isArray(data.comments) ? data.comments : [],
  };
}

export async function updateIncidentStatus(
  id: string,
  newStatus: IncidentStatus,
  author: string,
  currentComments: IncidentComment[] = [],
  oldStatus?: IncidentStatus
): Promise<BugIncident> {
  const systemComment: IncidentComment = {
    id: `sys-${Date.now()}`,
    author: author || "Sistema",
    content: oldStatus
      ? `Alterou o status de **${formatIncidentStatus(oldStatus)}** para **${formatIncidentStatus(newStatus)}**.`
      : `Status atualizado para **${formatIncidentStatus(newStatus)}**.`,
    created_at: new Date().toISOString(),
    is_system: true,
  };

  const updatedComments = [...currentComments, systemComment];

  return updateIncident(id, {
    status: newStatus,
    comments: updatedComments,
    updated_by: author || "Analista de Suporte",
  });
}

export async function addIncidentComment(
  id: string,
  comment: Omit<IncidentComment, "id" | "created_at">,
  currentComments: IncidentComment[] = []
): Promise<BugIncident> {
  const newComment: IncidentComment = {
    ...comment,
    id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    created_at: new Date().toISOString(),
  };

  const updatedComments = [...currentComments, newComment];

  return updateIncident(id, {
    comments: updatedComments,
    updated_by: comment.author || "Analista de Suporte",
  });
}
