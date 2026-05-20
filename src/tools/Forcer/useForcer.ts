import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { api, CONFIG } from "../../api";

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

            setSerials(parsedSerials);
            setStats({
              total: parsedSerials.length,
              done: 0,
              fail: 0,
              skip: 0,
            });
            setTableRows([]);
            addLog(
              `${parsedSerials.length} seriais carregados para envio de Force Data.`,
              "ok",
            );
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
    setStats({ total: serials.length, done: 0, fail: 0, skip: 0 });
    setTableRows([]);
    addLog(
      `Iniciando envio de Force Data para ${serials.length} seriais.`,
      "info",
    );

    let done = 0;
    let fail = 0;
    let skip = 0;
    const concurrency = 5;

    const processBatch = async (batch: string[]) => {
      const promises = batch.map(async (serial) => {
        const queryTime = new Date().toLocaleTimeString();
        let statusBadge: "badge-done" | "badge-err" | "badge-warn";
        let detailText: string;

        if (!serial) {
          statusBadge = "badge-warn";
          detailText = "Serial vazio";
          skip++;
          const row: TableRow = {
            serial: "Vazio",
            statusBadge,
            detailText,
            time: queryTime,
          };
          setTableRows((prev) => [...prev, row]);
          setStats((s) => ({ ...s, skip }));
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
          done++;
          addLog(`Force Data enviado para o terminal: ${serial}`, "ok");
        } catch (error: unknown) {
          statusBadge = "badge-err";
          detailText = error instanceof Error ? error.message : "Erro desconhecido";
          fail++;
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
        setTableRows((prev) => [...prev, row]);
        setStats((s) => ({ ...s, done, fail }));
      });

      await Promise.all(promises);
    };

    for (let i = 0; i < serials.length; i += concurrency) {
      const batch = serials.slice(i, i + concurrency);
      await processBatch(batch);
    }

    setIsProcessing(false);
    addLog("Processo de envio de Force Data em massa finalizado.", "ok");
  }, [serials, addLog]);

  return {
    serials,
    isProcessing,
    logs,
    stats,
    tableRows,
    fileInputRef,
    handleFile,
    startProcess,
  };
}
