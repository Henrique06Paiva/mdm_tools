import { useState, useEffect } from "react";
import type { KnownBug, CreateBugPayload } from "../../types/bugs";
import { fetchKnownBugs, createKnownBug } from "../../utils/bugsService";

export function useBugs() {
  const [bugs, setBugs] = useState<KnownBug[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBugs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchKnownBugs();
      setBugs(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar bugs conhecidos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBugs();
  }, []);

  const handleCreateBug = async (payload: CreateBugPayload) => {
    setIsLoading(true);
    try {
      await createKnownBug(payload);
      await loadBugs();
    } catch (err: any) {
      alert(err.message || "Erro ao cadastrar o bug no Supabase.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    bugs,
    isLoading,
    error,
    refreshBugs: loadBugs,
    createBug: handleCreateBug,
  };
}
