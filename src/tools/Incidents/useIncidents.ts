import { useState, useEffect, useCallback } from "react";
import type {
  BugIncident,
  CreateIncidentPayload,
  IncidentStatus,
  IncidentComment,
} from "../../types/incidents";
import type { KnownBug } from "../../types/bugs";
import {
  fetchIncidents,
  createIncident,
  updateIncidentStatus,
  addIncidentComment,
} from "../../utils/incidentsService";
import { fetchKnownBugs } from "../../utils/bugsService";

export function useIncidents() {
  const [incidents, setIncidents] = useState<BugIncident[]>([]);
  const [knownBugs, setKnownBugs] = useState<KnownBug[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [incidentsData, bugsData] = await Promise.all([
        fetchIncidents().catch(() => []),
        fetchKnownBugs().catch(() => []),
      ]);
      setIncidents(incidentsData);
      setKnownBugs(bugsData);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao carregar chamados.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchIncidents().catch(() => []),
      fetchKnownBugs().catch(() => []),
    ]).then(([incidentsData, bugsData]) => {
      if (isMounted) {
        setIncidents(incidentsData);
        setKnownBugs(bugsData);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateIncident = async (payload: CreateIncidentPayload) => {
    setIsLoading(true);
    try {
      const newInc = await createIncident(payload);
      setIncidents((prev) => [newInc, ...prev]);
      return newInc;
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Erro ao salvar incidente no Supabase.";
      alert(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeStatus = async (
    id: string,
    newStatus: IncidentStatus,
    author: string,
    currentComments: IncidentComment[] = [],
    oldStatus?: IncidentStatus
  ): Promise<BugIncident> => {
    try {
      const updated = await updateIncidentStatus(
        id,
        newStatus,
        author,
        currentComments,
        oldStatus
      );
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? updated : inc))
      );
      return updated;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao atualizar status.";
      alert(msg);
      throw err;
    }
  };

  const handleAddComment = async (
    id: string,
    comment: Omit<IncidentComment, "id" | "created_at">,
    currentComments: IncidentComment[] = []
  ): Promise<BugIncident> => {
    try {
      const updated = await addIncidentComment(id, comment, currentComments);
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? updated : inc))
      );
      return updated;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao adicionar comentário.";
      alert(msg);
      throw err;
    }
  };

  return {
    incidents,
    knownBugs,
    isLoading,
    error,
    reload: loadData,
    createIncident: handleCreateIncident,
    changeStatus: handleChangeStatus,
    addComment: handleAddComment,
  };
}
