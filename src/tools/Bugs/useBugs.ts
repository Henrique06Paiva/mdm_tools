import { useState, useEffect, useCallback } from "react";
import type { KnownBug, CreateBugPayload } from "../../types/bugs";
import {
  fetchKnownBugs,
  createKnownBug,
  updateKnownBug,
} from "../../utils/bugsService";

export function useBugs() {
  const [bugs, setBugs] = useState<KnownBug[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBugs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchKnownBugs();
      setBugs(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao carregar bugs conhecidos.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchKnownBugs()
      .then((data) => {
        if (isMounted) {
          setBugs(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar bugs conhecidos.",
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateBug = async (
    payload: CreateBugPayload,
  ): Promise<KnownBug> => {
    setIsLoading(true);
    try {
      const newBug = await createKnownBug(payload);
      await loadBugs();
      return newBug;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao cadastrar o bug no Supabase.";
      alert(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBug = async (
    id: string,
    payload: Partial<KnownBug>,
  ): Promise<KnownBug> => {
    setIsLoading(true);
    try {
      const updated = await updateKnownBug(id, payload);
      await loadBugs();
      return updated;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao atualizar o bug no Supabase.";
      alert(message);
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
    updateBug: handleUpdateBug,
  };
}
