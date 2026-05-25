import { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { api, CONFIG } from "../../api";

export function useDeleter() {
  const [serials, setSerials] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const currentIndexRef = useRef(0);
  const doneRef = useRef(0);
  const failRef = useRef(0);
  const skipRef = useRef(0);
  const groupRef = useRef(0);
  const [logs, setLogs] = useState<
    { id: number; message: string; type: string; time: string }[]
  >([]);

  const [stats, setStats] = useState({
    total: 0,
    done: 0,
    fail: 0,
    skip: 0,
    group: 0,
  });
  const [tableRows, setTableRows] = useState<any[]>([]);

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
          const wb = XLSX.read(data, { type: "binary" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws, { header: 1 });

          const parsedSerials = json
            .slice(1)
            .map((row: any) => String(row[0]).trim())
            .filter((serial) => serial && serial !== "undefined");

          setSerials(parsedSerials);
          setStats((s) => ({ ...s, total: parsedSerials.length }));
          addLog(
            `${parsedSerials.length} seriais carregados para deleção.`,
            "ok",
          );
        }
      };
      reader.readAsBinaryString(file);
    },
    [addLog],
  );

  const runLoop = async () => {
    const concurrency = 5;

    const processBatch = async (batch: string[]) => {
      const promises = batch.map(async (serial) => {
        let statusBadge = "badge-err";
        let detailText = "Erro desconhecido";
        let eqId = "N/A";

        try {
          const search: any = await api.fetch(
            `${CONFIG.BASE_URL}/api-eqp/equipment?page=1&limit=10&key=${encodeURIComponent(serial)}`,
          );

          const items =
            search?.data ??
            search?.items ??
            (Array.isArray(search) ? search : []);

          let eq = null;
          const serialFields = [
            "serialNumber",
            "serial",
            "serialnumber",
            "imei",
          ];
          for (const item of items) {
            if (
              serialFields.some(
                (field) => String(item[field] || "").trim().toLowerCase() === serial.toLowerCase(),
              )
            ) {
              eq = item;
              break;
            }
          }
          if (!eq && items.length === 1) eq = items[0];

          if (!eq) {
            statusBadge = "badge-warn";
            detailText = "Não Encontrado";
            skipRef.current++;
          } else {
            eqId = eq.id;

            const eqGroup =
              eq.equipmentGroup?.name ||
              eq.group?.name ||
              eq.equipmentGroupName ||
              eq.groupName ||
              eq.grupo?.name ||
              (typeof eq.equipmentGroup === "string" && eq.equipmentGroup.trim() ? eq.equipmentGroup.trim() : "") ||
              (typeof eq.group === "string" && eq.group.trim() ? eq.group.trim() : "");

            const hasGroup =
              !!eqGroup ||
              !!eq.equipmentGroupId ||
              !!eq.groupId ||
              !!eq.grupoId ||
              (eq.equipmentGroup && typeof eq.equipmentGroup === "object" && Object.keys(eq.equipmentGroup).length > 0) ||
              (eq.group && typeof eq.group === "object" && Object.keys(eq.group).length > 0) ||
              (eq.grupo && typeof eq.grupo === "object" && Object.keys(eq.grupo).length > 0);

            if (hasGroup) {
              statusBadge = "badge-group";
              detailText = eqGroup ? `Vinculado ao grupo: ${eqGroup}` : "Vinculado a um grupo";
              addLog(`Terminal ${serial} está vinculado ao grupo${eqGroup ? `: ${eqGroup}` : ""}. Ignorando deleção.`, "err");
              groupRef.current++;
            } else {
              // Inactivate if active
              if (eq.status === 1) {
                const {
                  id,
                  companyId,
                  subsidiaryId,
                  equipmentTypeId,
                  corporationId,
                  name,
                } = eq;
                await api.fetch(`${CONFIG.BASE_URL}/api-eqp/equipment/${id}`, {
                  method: "PATCH",
                  body: JSON.stringify({
                    status: 0,
                    companyId,
                    subsidiaryId,
                    equipmentTypeId,
                    corporationId,
                    name,
                  }),
                });
              }

              // Delete
              const delRes: any = await api.fetch(
                `${CONFIG.BASE_URL}/api-eqp/equipment/${eq.id}`,
                { method: "DELETE" },
              );
              if (delRes && delRes.ok !== false) {
                statusBadge = "badge-done";
                detailText = "Deletado com sucesso";
                doneRef.current++;
              } else {
                throw new Error("Falha na resposta de deleção");
              }
            }
          }
        } catch (error: any) {
          statusBadge = "badge-err";
          detailText = `Erro: ${error.message}`;
          failRef.current++;
        }

        const row = { serial, eqId, statusBadge, detailText };
        setTableRows((prev) => [...prev, row]);
        setStats((s) => ({
          ...s,
          done: doneRef.current,
          fail: failRef.current,
          skip: skipRef.current,
          group: groupRef.current,
        }));
      });

      await Promise.all(promises);
    };

    while (currentIndexRef.current < serials.length) {
      if (isPausedRef.current) {
        break;
      }
      const nextIndex = Math.min(currentIndexRef.current + concurrency, serials.length);
      const batch = serials.slice(currentIndexRef.current, nextIndex);
      currentIndexRef.current = nextIndex;
      await processBatch(batch);
    }

    if (currentIndexRef.current >= serials.length) {
      setIsProcessing(false);
      setIsPaused(false);
      addLog("Processo de deleção em massa finalizado.", "ok");
    }
  };

  const startProcess = useCallback(async () => {
    if (!api.hasToken()) {
      addLog("Autenticação necessária antes de prosseguir.", "err");
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    isPausedRef.current = false;
    currentIndexRef.current = 0;
    doneRef.current = 0;
    failRef.current = 0;
    skipRef.current = 0;
    groupRef.current = 0;

    setStats({ total: serials.length, done: 0, fail: 0, skip: 0, group: 0 });
    setTableRows([]);
    addLog(
      `Iniciando processo de deleção para ${serials.length} seriais.`,
      "info",
    );

    await runLoop();
  }, [serials, addLog]);

  const resumeProcess = useCallback(async () => {
    if (!api.hasToken()) {
      addLog("Autenticação necessária antes de prosseguir.", "err");
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    isPausedRef.current = false;
    addLog("Retomando deleção em massa...", "info");

    await runLoop();
  }, [serials, addLog]);

  const pauseProcess = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
    addLog("Processo pausado pelo usuário.", "warn");
  }, [addLog]);

  const stopProcess = useCallback(() => {
    setIsProcessing(false);
    setIsPaused(false);
    isPausedRef.current = false;
    currentIndexRef.current = 0;
    doneRef.current = 0;
    failRef.current = 0;
    skipRef.current = 0;
    groupRef.current = 0;
    addLog("Processo interrompido pelo usuário.", "warn");
  }, [addLog]);

  const resetProcess = useCallback(() => {
    setTableRows([]);
    setStats({ total: serials.length, done: 0, fail: 0, skip: 0, group: 0 });
    setLogs([]);
    currentIndexRef.current = 0;
    doneRef.current = 0;
    failRef.current = 0;
    skipRef.current = 0;
    groupRef.current = 0;
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
