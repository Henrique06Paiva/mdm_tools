import { useState, useEffect } from 'react';
import type { BugIncident, CreateIncidentPayload } from '../../types/incidents';
import type { KnownBug } from '../../types/bugs';
import { fetchIncidents, createIncident } from '../../utils/incidentsService';
import { fetchKnownBugs } from '../../utils/bugsService';

export function useIncidents() {
  const [incidents, setIncidents] = useState<BugIncident[]>([]);
  const [knownBugs, setKnownBugs] = useState<KnownBug[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [incidentsData, bugsData] = await Promise.all([
        fetchIncidents().catch(() => []),
        fetchKnownBugs().catch(() => []),
      ]);
      setIncidents(incidentsData);
      setKnownBugs(bugsData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar chamado.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateIncident = async (payload: CreateIncidentPayload) => {
    setIsLoading(true);
    try {
      const newInc = await createIncident(payload);
      setIncidents((prev) => [newInc, ...prev]);
    } catch (err: any) {
      alert('Erro ao salvar incidente no Supabase. Verifique se as tabelas foram criadas.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    incidents,
    knownBugs,
    isLoading,
    error,
    reload: loadData,
    createIncident: handleCreateIncident,
  };
}
