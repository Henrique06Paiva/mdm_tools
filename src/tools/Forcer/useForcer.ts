import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { api, CONFIG } from "../../api";
import { logAudit } from "../../utils/audit";

export interface Log {
  id: number;
  message: string;
  type: "info" | "warn" | "err" | "ok";
  time: string;
}

export interface ForcerStats {
  total: number;
  done: number;
  fail: number;
  skip: number;
}

export interface TableRow {
  serial: string;
  statusBadge: "badge-done" | "badge-err" | "badge-warn";
  detailText: string;
  time: string;
}

export function useForcer() {
  const [serials, setSerials] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const currentIndexRef = useRef(0);
  const doneRef = useRef(0);
  const failRef = useRef(0);
  const skipRef = useRef(0);
  const resultsAccumulatorRef = useRef<TableRow[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<ForcerStats>({
    total: 0,
    done: 0,
    fail: 0,
    skip: 0,
  });
  const [tableRows, setTableRows] = useState<TableRow[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logIdRef = useRef(0);

  const addLog = useCallback(
    (message: string, type: "info" | "warn" | "err" | "ok" = "info") => {
      setLogs((prev) => [
        {
          id: logIdRef.current++,
          message,
          type,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    },
    [],
  );

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = ev.target?.result;
        if (data) {
          try {
            const wb = XLSX.read(data, { type: "binary" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 });

            if (json.length < 2) {
              addLog("Planilha vazia ou sem dados.", "err");
              return;
            }

            const parsedSerials = json
              .slice(1)
              .map((row) => String(row[0] ?? "").trim())
              .filter(
                (serial) => serial && serial !== "undefined" && serial !== "",
              );

            const totalParsed = parsedSerials.length;
            const wasTruncated = totalParsed > 10000;
            const finalSerials = wasTruncated ? parsedSerials.slice(0, 10000) : parsedSerials;

            setSerials(finalSerials);
            setStats({
              total: finalSerials.length,
              done: 0,
              fail: 0,
              skip: 0,
            });
            setTableRows([]);

            if (wasTruncated) {
              addLog(
                `Aviso: A planilha contém ${totalParsed} terminais. Apenas os primeiros 10.000 serão processados por limitação técnica.`,
                "warn",
              );
            } else {
              addLog(
                `${finalSerials.length} seriais carregados para envio de Force Data.`,
                "ok",
              );
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            addLog(`Erro ao ler arquivo: ${msg}`, "err");
          }
        }
      };
      reader.readAsBinaryString(file);
    },
    [addLog],
  );

  const runLoop = useCallback(async () => {
    const concurrency = 5;

    const processBatch = async (batch: string[]) => {
      const promises = batch.map(async (serial) => {
        const queryTime = new Date().toLocaleTimeString();
        let statusBadge: "badge-done" | "badge-err" | "badge-warn";
        let detailText: string;

        if (!serial) {
          statusBadge = "badge-warn";
          detailText = "Serial vazio";
          skipRef.current++;
          const row: TableRow = {
            serial: "Vazio",
            statusBadge,
            detailText,
            time: queryTime,
          };
          resultsAccumulatorRef.current.push(row);
          setTableRows((prev) => [...prev, row]);
          setStats((s) => ({ ...s, skip: skipRef.current }));
          return;
        }

        try {
          // Enviar requisição POST direta ao endpoint de force-data
          await api.fetch(
            `${CONFIG.BASE_URL}/api-eqp/device-data/device/${encodeURIComponent(serial)}/force-data`,
            {
              method: "POST",
              headers: {
                accept: "application/json, text/plain, */*",
              },
            },
          );

          statusBadge = "badge-done";
          detailText = "Comando de Force Data enviado com sucesso";
          doneRef.current++;
          addLog(`Force Data enviado para o terminal: ${serial}`, "ok");
        } catch (error: unknown) {
          statusBadge = "badge-err";
          detailText =
            error instanceof Error ? error.message : "Erro desconhecido";
          failRef.current++;
          addLog(
            `Falha ao enviar Force Data para o terminal ${serial}: ${detailText}`,
            "err",
          );
        }

        const row: TableRow = {
          serial,
          statusBadge,
          detailText,
          time: queryTime,
        };
        resultsAccumulatorRef.current.push(row);
        setTableRows((prev) => [...prev, row]);
        setStats((s) => ({
          ...s,
          done: doneRef.current,
          fail: failRef.current,
        }));
      });

      await Promise.all(promises);
    };

    while (currentIndexRef.current < serials.length) {
      if (isPausedRef.current) {
        break;
      }
      const nextIndex = Math.min(
        currentIndexRef.current + concurrency,
        serials.length,
      );
      const batch = serials.slice(currentIndexRef.current, nextIndex);
      currentIndexRef.current = nextIndex;
      await processBatch(batch);
    }

    if (currentIndexRef.current >= serials.length) {
      setIsProcessing(false);
      setIsPaused(false);
      addLog("Processo de envio de Force Data em massa finalizado.", "ok");

      logAudit("FORCER_FINISH", api.getRestrictions()?.defaultCorpId || "N/A", {
        total: serials.length,
        done: doneRef.current,
        fail: failRef.current,
        skip: skipRef.current,
        rows: resultsAccumulatorRef.current,
      });
    }
  }, [serials, addLog, setTableRows, setStats, setIsProcessing, setIsPaused]);

  const startProcess = useCallback(async () => {
    if (!api.hasToken()) {
      addLog("Autenticação necessária antes de prosseguir.", "err");
      return;
    }

    if (serials.length === 0) {
      addLog("Nenhum serial disponível para processamento.", "warn");
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    isPausedRef.current = false;
    currentIndexRef.current = 0;
    doneRef.current = 0;
    failRef.current = 0;
    skipRef.current = 0;
    resultsAccumulatorRef.current = [];

    setStats({ total: serials.length, done: 0, fail: 0, skip: 0 });
    setTableRows([]);
    addLog(
      `Iniciando envio de Force Data para ${serials.length} seriais.`,
      "info",
    );

    logAudit("FORCER_START", api.getRestrictions()?.defaultCorpId || "N/A", {
      total: serials.length,
    });

    await runLoop();
  }, [serials.length, addLog, runLoop]);

  const resumeProcess = useCallback(async () => {
    if (!api.hasToken()) {
      addLog("Autenticação necessária antes de prosseguir.", "err");
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    isPausedRef.current = false;
    addLog("Retomando envio de Force Data...", "info");

    logAudit("FORCER_RESUME", api.getRestrictions()?.defaultCorpId || "N/A", {
      total: serials.length,
      currentIndex: currentIndexRef.current,
    });

    await runLoop();
  }, [addLog, runLoop, serials.length]);

  const pauseProcess = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
    addLog("Processo pausado pelo usuário.", "warn");

    logAudit("FORCER_PAUSE", api.getRestrictions()?.defaultCorpId || "N/A", {
      total: serials.length,
      currentIndex: currentIndexRef.current,
      done: doneRef.current,
      fail: failRef.current,
      skip: skipRef.current,
    });
  }, [addLog, serials.length]);

  const stopProcess = useCallback(() => {
    setIsProcessing(false);
    setIsPaused(false);
    isPausedRef.current = false;

    logAudit("FORCER_STOP", api.getRestrictions()?.defaultCorpId || "N/A", {
      total: serials.length,
      currentIndex: currentIndexRef.current,
      done: doneRef.current,
      fail: failRef.current,
      skip: skipRef.current,
      rows: resultsAccumulatorRef.current,
    });

    currentIndexRef.current = 0;
    doneRef.current = 0;
    failRef.current = 0;
    skipRef.current = 0;
    resultsAccumulatorRef.current = [];
    addLog("Processo interrompido pelo usuário.", "warn");
  }, [addLog, serials.length]);

  const resetProcess = useCallback(() => {
    setTableRows([]);
    setStats({ total: serials.length, done: 0, fail: 0, skip: 0 });
    setLogs([]);
    currentIndexRef.current = 0;
    doneRef.current = 0;
    failRef.current = 0;
    skipRef.current = 0;
    logIdRef.current = 0;
  }, [serials.length]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    logIdRef.current = 0;
  }, []);

  return {
    serials,
    isProcessing,
    isPaused,
    logs,
    stats,
    tableRows,
    fileInputRef,
    handleFile,
    startProcess,
    resumeProcess,
    pauseProcess,
    stopProcess,
    resetProcess,
    clearLogs,
  };
}
